
import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import { UserRole } from '../items_mongo/UserMongo';

const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.DEVELOPER }
});

export default userSchema
