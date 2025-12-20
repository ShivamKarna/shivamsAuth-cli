#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
// --- Templates ---
const userModel = `
import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

export const User = model<IUser>('User', userSchema);
`;
const authController = `
import { Request, Response } from 'express';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });
    res.status(201).json({ message: "User created", id: user._id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.json({ token, messsage:"User Login Success" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
`;
const authRoutes = `
import { Router } from 'express';
import { login, register } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);

export default router;
`;
const envFile = `
PORT=5000
MONGODB_URI="mongodb://localhost:27017/your_db"
JWT_SECRET="super_secret_key_123"
`;
// --- The Logic ---
async function init() {
    const root = process.cwd();
    const src = path.join(root, 'src');
    console.log(chalk.cyan.bold('\n ShivamsAuth: Initializing project...'));
    try {
        // Create folders
        await fs.ensureDir(path.join(src, 'models'));
        await fs.ensureDir(path.join(src, 'controllers'));
        await fs.ensureDir(path.join(src, 'routes'));
        // Write files
        await fs.writeFileSync(path.join(src, 'models', 'User.ts'), userModel.trim());
        await fs.writeFileSync(path.join(src, 'controllers', 'authController.ts'), authController.trim());
        await fs.writeFileSync(path.join(src, 'routes', 'authRoutes.ts'), authRoutes.trim());
        await fs.writeFileSync(path.join(root, '.env'), envFile.trim());
        console.log(chalk.green('\nSuccess! Structure created.'));
        console.log(chalk.yellow('\nNext steps:'));
        console.log('1. Run: ' + chalk.white('npm install mongoose jsonwebtoken bcryptjs'));
        console.log('2. Run: ' + chalk.white('npm install -D @types/jsonwebtoken @types/bcryptjs'));
        console.log('3. Add your MongoDB URI to ' + chalk.cyan('.env'));
    }
    catch (err) {
        console.error(chalk.red('Error:'), err);
    }
}
init();
