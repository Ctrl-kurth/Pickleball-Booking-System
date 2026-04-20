import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import "@/models/Coach"; // Initialize Coach schema for population
import mongoose from "mongoose";

/**
 * @api {post} /api/bookings Create a new booking with concurrency protection
 */
export async function POST(req: Request) {
  try {
    const { coachId, userId, clientName, clientEmail, startTime, endTime, totalPrice } = await req.json();

    if (!coachId || !userId || !clientName || !clientEmail || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    const start = new Date(startTime);
    const end = new Date(endTime);

    // 1. Check for overlapping bookings using a specialized query
    // An overlap exists if: (ExistingStart < NewEnd) AND (ExistingEnd > NewStart)
    const existingBooking = await Booking.findOne({
      coachId: new mongoose.Types.ObjectId(coachId),
      status: { $ne: "cancelled" },
      $and: [
        { startTime: { $lt: end } },
        { endTime: { $gt: start } }
      ]
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "This time slot is already reserved or overlaps with an existing booking." },
        { status: 409 }
      );
    }

    // 2. Create the booking
    // The unique index on (coachId, startTime) acts as a secondary safety net
    const newBooking = await Booking.create({
      coachId,
      userId,
      clientName,
      clientEmail,
      startTime: start,
      endTime: end,
      totalPrice,
      status: "pending", 
      paymentStatus: "unpaid",
    });

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error: any) {
    console.error("Booking API Error:", error);
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      return NextResponse.json({ error: "Double-booking detected (Race condition prevented)." }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

/**
 * @api {get} /api/bookings Get all bookings (e.g. for the RAG context)
 */
export async function GET() {
  try {
    await dbConnect();
    const bookings = await Booking.find({}).populate("coachId", "name");
    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error("GET Bookings Error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings", details: error.message }, { status: 500 });
  }
}
