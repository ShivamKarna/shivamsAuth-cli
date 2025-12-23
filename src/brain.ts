#!/usr/bin/env node
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { fileURLToPath } from "url";

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the package root (go up from dist to root)
const packageRoot = path.join(__dirname, "..");
const srcDir = path.join(packageRoot, "src");

// Helper function to read blueprint files from src
const readBlueprint = (filePath: string): string => {
  try {
    const fullPath = path.join(srcDir, filePath);
    const content = fs.readFileSync(fullPath, "utf-8");
    if (!content || content.trim() === "") {
      console.error(chalk.yellow(`Warning: ${filePath} is empty`));
    }
    return content;
  } catch (error) {
    console.error(chalk.red(`Error reading ${filePath}:`));
    console.error(chalk.red(`Tried path: ${path.join(srcDir, filePath)}`));
    return "";
  }
};

// Helper function to update import paths in file content
const updateImportPaths = (
  content: string,
  pathMap: Record<string, string>
): string => {
  let updatedContent = content;

  Object.entries(pathMap).forEach(([oldPath, newPath]) => {
    // Match both .js and .ts extensions in imports
    const regex = new RegExp(`from ["']${oldPath}(\\.js|\\.ts)?["']`, "g");
    updatedContent = updatedContent.replace(regex, `from "${newPath}"`);
  });

  return updatedContent;
};

const envFile = `PORT=5000
MONGODB_URI="mongodb://localhost:27017/your_db"
JWT_SECRET="super_secret_key_123"
JWT_REFRESH_SECRET="refresh_secret_key_456"
NODE_ENV="development"
`;

// --- The Logic ---

async function init() {
  const root = process.cwd();
  const src = path.join(root, "src");

  console.log(chalk.cyan.bold("\n✨ ShivamsAuth: Initializing project...\n"));

  try {
    // Create organized folder structure
    console.log(chalk.blue("📁 Creating folder structure..."));

    await fs.ensureDir(path.join(src, "models", "auth"));
    await fs.ensureDir(path.join(src, "controllers", "auth"));
    await fs.ensureDir(path.join(src, "services", "auth"));
    await fs.ensureDir(path.join(src, "routes", "auth"));
    await fs.ensureDir(path.join(src, "middlewares", "auth"));
    await fs.ensureDir(path.join(src, "middlewares"));
    await fs.ensureDir(path.join(src, "utils", "authUtils"));

    // Read blueprint files
    console.log(chalk.blue("📖 Reading blueprint files..."));

    // Models
    const userModel = readBlueprint("Blueprints/user.models.ts");
    const sessionModel = readBlueprint("Blueprints/session.model.ts");

    // Services
    const authServices = readBlueprint("Blueprints/auth.services.ts");

    // Controllers
    const authController = readBlueprint("Blueprints/auth.controller.ts");

    // Routes
    const authRoutes = readBlueprint("Blueprints/user.routes.ts");

    // Middlewares
    const asyncHandler = readBlueprint("Blueprints/AsyncHandler.ts");
    const zodValidation = readBlueprint("Blueprints/zod.validation.ts");
    const authenticate = readBlueprint("middleware/authenticate.ts");

    // Utils
    const appAssert = readBlueprint("utils/appAssert.ts");
    const appError = readBlueprint("utils/AppError.ts");
    const bcrypt = readBlueprint("utils/bcrypt.ts");
    const date = readBlueprint("utils/date.ts");
    const env = readBlueprint("utils/env.ts");
    const http = readBlueprint("utils/http.ts");
    const jwt = readBlueprint("utils/jwt.ts");
    const userAgent = readBlueprint("utils/userAgent.ts");

    console.log(chalk.blue("✏️  Updating import paths..."));

    // Update import paths for models
    const updatedUserModel = updateImportPaths(userModel, {
      "../utils/bcrypt": "../../utils/authUtils/bcrypt",
    });

    const updatedSessionModel = updateImportPaths(sessionModel, {
      "../utils/date": "../../utils/authUtils/date",
    });

    // Update import paths for services
    const updatedAuthServices = updateImportPaths(authServices, {
      "./user.models": "../models/auth/user.models",
      "./session.model": "../models/auth/session.model",
      "../utils/date": "../../utils/authUtils/date",
      "../utils/appAssert": "../../utils/authUtils/appAssert",
      "../utils/userAgent": "../../utils/authUtils/userAgent",
      "../utils/jwt": "../../utils/authUtils/jwt",
      "../utils/http": "../../utils/authUtils/http",
    });

    // Update import paths for controllers
    const updatedAuthController = updateImportPaths(authController, {
      "./auth.services": "../../services/auth/auth.services",
      "../utils/http": "../../utils/authUtils/http",
      "../utils/appAssert": "../../utils/authUtils/appAssert",
      "../utils/userAgent": "../../utils/authUtils/userAgent",
    });

    // Update import paths for routes
    const updatedAuthRoutes = updateImportPaths(authRoutes, {
      "./AsyncHandler": "../../middlewares/auth/AsyncHandler",
      "./auth.controller": "../../controllers/auth/auth.controller",
      "./zod.validation": "../../middlewares/auth/zod.validation",
      "./auth.services": "../../services/auth/auth.services",
      "../middleware/authenticate": "../../middlewares/authenticate",
    });

    // Update import paths for middlewares
    const updatedZodValidation = updateImportPaths(zodValidation, {
      "../utils/http": "../../utils/authUtils/http",
    });

    const updatedAuthenticate = updateImportPaths(authenticate, {
      "../utils/jwt": "../utils/authUtils/jwt",
      "../utils/http": "../utils/authUtils/http",
      "../utils/appAssert": "../utils/authUtils/appAssert",
    });

    // Update import paths for utils
    const updatedAppAssert = updateImportPaths(appAssert, {
      "./AppError": "./AppError",
    });

    const updatedBcrypt = updateImportPaths(bcrypt, {});
    const updatedDate = updateImportPaths(date, {});
    const updatedEnv = updateImportPaths(env, {});
    const updatedHttp = updateImportPaths(http, {});
    const updatedJwt = updateImportPaths(jwt, {
      "./env": "./env",
    });
    const updatedUserAgent = updateImportPaths(userAgent, {});

    console.log(chalk.blue("Writing files..."));

    // Write model files
    fs.writeFileSync(
      path.join(src, "models", "auth", "user.models.ts"),
      updatedUserModel
    );
    fs.writeFileSync(
      path.join(src, "models", "auth", "session.model.ts"),
      updatedSessionModel
    );

    // Write service files
    fs.writeFileSync(
      path.join(src, "services", "auth", "auth.services.ts"),
      updatedAuthServices
    );

    // Write controller files
    fs.writeFileSync(
      path.join(src, "controllers", "auth", "auth.controller.ts"),
      updatedAuthController
    );

    // Write route files
    fs.writeFileSync(
      path.join(src, "routes", "auth", "auth.routes.ts"),
      updatedAuthRoutes
    );

    // Write middleware files
    fs.writeFileSync(
      path.join(src, "middlewares", "auth", "AsyncHandler.ts"),
      asyncHandler
    );
    fs.writeFileSync(
      path.join(src, "middlewares", "auth", "zod.validation.ts"),
      updatedZodValidation
    );
    fs.writeFileSync(
      path.join(src, "middlewares", "authenticate.ts"),
      updatedAuthenticate
    );

    // Write util files
    fs.writeFileSync(
      path.join(src, "utils", "authUtils", "appAssert.ts"),
      updatedAppAssert
    );
    fs.writeFileSync(
      path.join(src, "utils", "authUtils", "AppError.ts"),
      appError
    );
    fs.writeFileSync(
      path.join(src, "utils", "authUtils", "bcrypt.ts"),
      updatedBcrypt
    );
    fs.writeFileSync(
      path.join(src, "utils", "authUtils", "date.ts"),
      updatedDate
    );
    fs.writeFileSync(
      path.join(src, "utils", "authUtils", "env.ts"),
      updatedEnv
    );
    fs.writeFileSync(
      path.join(src, "utils", "authUtils", "http.ts"),
      updatedHttp
    );
    fs.writeFileSync(
      path.join(src, "utils", "authUtils", "jwt.ts"),
      updatedJwt
    );
    fs.writeFileSync(
      path.join(src, "utils", "authUtils", "userAgent.ts"),
      updatedUserAgent
    );

    // Write .env file
    fs.writeFileSync(path.join(root, ".env"), envFile.trim());

    console.log(chalk.green("\n✓ Models created"));
    console.log(chalk.green("✓ Controllers created"));
    console.log(chalk.green("✓ Services created"));
    console.log(chalk.green("✓ Routes created"));
    console.log(chalk.green("✓ Middlewares created"));
    console.log(chalk.green("✓ Utils created"));
    console.log(chalk.green("✓ Environment file created"));

    console.log(chalk.green.bold("\n🎉 Success! Auth structure created.\n"));
    console.log(chalk.yellow("Next steps:\n"));
    console.log(
      "  1. Run: " +
        chalk.white(
          "npm install mongoose express zod bcryptjs jsonwebtoken ua-parser-js cookie-parser"
        )
    );
    console.log(
      "  2. Run: " +
        chalk.white(
          "npm install -D @types/express @types/bcryptjs @types/jsonwebtoken @types/cookie-parser @types/ua-parser-js"
        )
    );
    console.log("  3. Configure your MongoDB URI in " + chalk.cyan(".env"));
    console.log(
      "  4. Import and use " + chalk.cyan("authRoutes") + " in your Express app"
    );
    console.log("\n" + chalk.blue(" Project structure created:") + "\n");
    console.log(chalk.dim("  src/"));
    console.log(chalk.dim("  ├── models/auth/"));
    console.log(chalk.dim("  │   ├── user.models.ts"));
    console.log(chalk.dim("  │   └── session.model.ts"));
    console.log(chalk.dim("  ├── controllers/auth/"));
    console.log(chalk.dim("  │   └── auth.controller.ts"));
    console.log(chalk.dim("  ├── services/auth/"));
    console.log(chalk.dim("  │   └── auth.services.ts"));
    console.log(chalk.dim("  ├── routes/auth/"));
    console.log(chalk.dim("  │   └── auth.routes.ts"));
    console.log(chalk.dim("  ├── middlewares/"));
    console.log(chalk.dim("  │   ├── auth/"));
    console.log(chalk.dim("  │   │   ├── AsyncHandler.ts"));
    console.log(chalk.dim("  │   │   └── zod.validation.ts"));
    console.log(chalk.dim("  │   └── authenticate.ts"));
    console.log(chalk.dim("  └── utils/authUtils/"));
    console.log(chalk.dim("      ├── appAssert.ts"));
    console.log(chalk.dim("      ├── AppError.ts"));
    console.log(chalk.dim("      ├── bcrypt.ts"));
    console.log(chalk.dim("      ├── date.ts"));
    console.log(chalk.dim("      ├── env.ts"));
    console.log(chalk.dim("      ├── http.ts"));
    console.log(chalk.dim("      ├── jwt.ts"));
    console.log(chalk.dim("      └── userAgent.ts"));
  } catch (err) {
    console.error(chalk.red("\n❌ Error:"), err);
  }
}

init();
