import mongoose, { Schema, model, models } from "mongoose";

export interface IBooking {
  coachId: mongoose.Types.ObjectId;
  userId: string;
  clientName: string;
  clientEmail: string;
  startTime: Date;
  endTime: Date;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  totalPrice: number;
  paymentStatus: "unpaid" | "paid" | "refunded";
  notes?: string;
  systemMessage?: string;
}

const BookingSchema = new Schema<IBooking>(
  {
    coachId: { type: Schema.Types.ObjectId, ref: "Coach", required: true },
    userId: { type: String, required: true },
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    totalPrice: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    notes: { type: String },
    systemMessage: { type: String },
  },
  { timestamps: true }
);

// CRITICAL: Double-booking prevention at DB layer
// This index ensures a coach cannot have two confirmed/pending bookings starting at the same time.
// Note: In production, we'd also check for overlapping intervals in the API layer.
BookingSchema.index({ coachId: 1, startTime: 1 }, { unique: true });

export const Booking = models.Booking || model<IBooking>("Booking", BookingSchema);
