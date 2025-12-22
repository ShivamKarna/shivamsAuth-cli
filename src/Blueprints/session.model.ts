import { Schema, model, Document, Types } from "mongoose";
import { thirtyDaysFromNow } from "../utils/date.js";

export interface sessionDocument extends Document {
  userId: Types.ObjectId;
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
