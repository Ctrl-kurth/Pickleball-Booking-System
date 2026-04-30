import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Booking } from "@/models/Booking";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const expectedParams = await params;
    await dbConnect();
    const body = await req.json();
    const updatedBooking = await Booking.findByIdAndUpdate(expectedParams.id, body, { new: true });
    
    if (!updatedBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    
    return NextResponse.json(updatedBooking);
  } catch {
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const expectedParams = await params;
    await dbConnect();
    const deletedBooking = await Booking.findByIdAndDelete(expectedParams.id);
    
    if (!deletedBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 });
  }
}
