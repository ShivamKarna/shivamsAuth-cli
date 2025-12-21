import mongoose, { Schema, model, Document } from "mongoose";
import { hashValue, compareValue } from "../utils/bcrypt.js";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number; // to keep track of versioningof document
  comparePassword(val: string): Promise<boolean>;
  omitPassword(): Omit<IUser, "password" | "comparePassword" | "omitPassword">;
}
export const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is requiredj"],
    },
    email: {
      type: String,
      unique: [true, "Email is required"],
      required: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await hashValue(this.password);
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return compareValue(candidatePassword, this.password);
};

userSchema.methods.omitPassword = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = model<IUser>("User", userSchema);
