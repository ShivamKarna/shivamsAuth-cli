import { Schema, model, Document, Types } from "mongoose";
import { thirtyDaysFromNow } from "../utils/date.js";

export interface sessionDocument extends Document {
  userId: Types.ObjectId;
  userAgent?: string;
  // Parsed user agent details
  browser?: {
    name?: string;
    version?: string;
  };
  os?: {
    name?: string;
    version?: string;
  };
  device?: {
    type?: string;
    vendor?: string;
    model?: string;
  };
  ipAddress?: string;
  createdAt: Date;
  expiresAt: Date;
}

const sessionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    index: true,
  },
  userAgent: {
    type: String,
  },
  browser: {
    name: { type: String },
    version: { type: String },
  },
  os: {
    name: { type: String },
    version: { type: String },
  },
  device: {
    type: { type: String },
    vendor: { type: String },
    model: { type: String },
  },
  ipAddress: {
    type: String,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: thirtyDaysFromNow,
  },
});

export const SessionModel = model<sessionDocument>(
  "SessionModel",
  sessionSchema
);
