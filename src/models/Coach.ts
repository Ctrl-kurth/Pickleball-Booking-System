import { Schema, model, models } from "mongoose";

export interface ICoach {
  name: string;
  email: string;
  bio: string;
  specialties: string[];
  hourlyRate: number;
  rating: number;
  image?: string;
}

const CoachSchema = new Schema<ICoach>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    bio: { type: String, required: true },
    specialties: [{ type: String }],
    hourlyRate: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    image: { type: String },
  },
  { timestamps: true }
);

export const Coach = models.Coach || model<ICoach>("Coach", CoachSchema);
