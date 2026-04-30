import { NextResponse } from "next/server";
import { askAssistant } from "@/lib/gemini";
import dbConnect from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { Coach } from "@/models/Coach";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    await dbConnect();

    // RAG: Fetch relevant context for the assistant
    // 1. Fetch Coach Marvin's details (mocking search for now)
    const coach = await Coach.findOne({ name: /Marvin/i });
    
    // 2. Fetch recent/upcoming bookings to answer availability questions
    const upcomingBookings = await Booking.find({
      startTime: { $gte: new Date() },
      status: { $ne: "cancelled" }
    })
    .limit(10)
    .sort({ startTime: 1 })
    .populate("coachId", "name");

    // 3. Identify low-traffic slots (from our analytics pipeline)
    const lowTrafficSlots = await Booking.aggregate([
      { $project: { dayOfWeek: { $dayOfWeek: "$startTime" }, hour: { $hour: "$startTime" } } },
      { $group: { _id: { dayOfWeek: "$dayOfWeek", hour: "$hour" }, count: { $sum: 1 } } },
      { $sort: { count: 1 } },
      { $limit: 3 }
    ]);

    const context = `
      CURRENT COACH: ${coach ? `${coach.name} (Specialties: ${coach.specialties.join(", ")}, Rate: $${coach.hourlyRate}/hr)` : "Generic Coach"}
      UPCOMING BOOKED SLOTS: ${upcomingBookings.map(b => `${b.startTime.toLocaleString()} - ${b.endTime.toLocaleString()}`).join(", ")}
      LOW TRAFFIC SLOTS (GOOD FOR PROMOS): ${lowTrafficSlots.map(s => `Day ${s._id.dayOfWeek} at Hour ${s._id.hour}:00`).join(", ")}
      
      INSTRUCTION: If the user asks for availability, compare their request against the BOOKED SLOTS. 
      If they ask for discounts/promos, suggest the LOW TRAFFIC SLOTS.
    `;

    const aiResponse = await askAssistant(message, context);

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json({ error: "Intelligence core offline. Try again later, bro." }, { status: 500 });
  }
}
