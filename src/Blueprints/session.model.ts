import  { Schema, model, Document } from "mongoose";
import { thirtyDaysFromNow } from "../utils/date.js";

export interface sessionDocument extends Document {
  userId: Schema.Types.ObjectId;
  userAgent?: string;
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
  createdAt: {
    type: Date,
    required: true,
    Default: Date.now,
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
