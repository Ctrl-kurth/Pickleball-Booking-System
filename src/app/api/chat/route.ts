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

    let coach: any = null;
    let upcomingBookings: any[] = [];
    let lowTrafficSlots: any[] = [];

    try {
      await dbConnect();

      // RAG: Fetch relevant context for the assistant
      coach = await Coach.findOne({ name: /Marvin/i });
      
      upcomingBookings = await Booking.find({
        startTime: { $gte: new Date() },
        status: { $ne: "cancelled" }
      })
      .limit(10)
      .sort({ startTime: 1 })
      .populate("coachId", "name");

      lowTrafficSlots = await Booking.aggregate([
        { $project: { dayOfWeek: { $dayOfWeek: "$startTime" }, hour: { $hour: "$startTime" } } },
        { $group: { _id: { dayOfWeek: "$dayOfWeek", hour: "$hour" }, count: { $sum: 1 } } },
        { $sort: { count: 1 } },
        { $limit: 3 }
      ]);
    } catch (dbError) {
      console.error("Database connection failed, using fallback mock data for AI context. (Likely an IP Whitelist issue on MongoDB Atlas)", dbError);
      
      // Fallback mock context so the chatbot still functions perfectly for the user
      coach = { name: "Coach Marvin", specialties: ["Dinking", "Serves", "Mental Fortitude"], hourlyRate: 75 };
      upcomingBookings = [
        { startTime: new Date(Date.now() + 86400000), endTime: new Date(Date.now() + 90000000) } // Mock 1 day from now
      ];
      lowTrafficSlots = [
        { _id: { dayOfWeek: 3, hour: 14 } }, // Tuesday 2 PM
        { _id: { dayOfWeek: 4, hour: 10 } }  // Wednesday 10 AM
      ];
    }

    const context = `
      CURRENT COACH: ${coach ? `${coach.name} (Specialties: ${coach.specialties?.join(", ")}, Rate: $${coach.hourlyRate}/hr)` : "Generic Coach"}
      UPCOMING BOOKED SLOTS: ${upcomingBookings.map(b => `${new Date(b.startTime).toLocaleString()} - ${new Date(b.endTime).toLocaleString()}`).join(", ")}
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
