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

    let coachInfo = "";
    let bookingsContext = "";
    let statsContext = "";

    try {
      await dbConnect();

      // Fetch coach info
      const coach: any = await Coach.findOne({ name: /Marvin/i });
      if (coach) {
        coachInfo = `Coach Profile: ${coach.name} | Specialties: ${coach.specialties?.join(", ") || "Pickleball, Tennis"} | Rate in DB: $${coach.hourlyRate}/hr`;
      }

      // Fetch ALL active bookings (not just upcoming) for full schedule awareness
      const allActiveBookings = await Booking.find({
        status: { $ne: "cancelled" }
      })
      .sort({ startTime: 1 })
      .populate("coachId", "name");

      const now = new Date();
      const upcomingBookings = allActiveBookings.filter(b => new Date(b.startTime) >= now);
      const pastBookings = allActiveBookings.filter(b => new Date(b.startTime) < now);

      if (upcomingBookings.length > 0) {
        bookingsContext += `\nUPCOMING BOOKED SLOTS (${upcomingBookings.length} total):\n`;
        upcomingBookings.forEach(b => {
          const start = new Date(b.startTime);
          const end = new Date(b.endTime);
          const dateStr = start.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Manila' });
          const startTime = start.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Manila' });
          const endTime = end.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Manila' });
          bookingsContext += `  - ${dateStr}: ${startTime} to ${endTime} (Status: ${b.status}) [Client: ${b.clientName || 'N/A'}]\n`;
        });
      } else {
        bookingsContext += "\nUPCOMING BOOKED SLOTS: None — all slots are currently open!\n";
      }

      // Stats
      statsContext = `\nBOOKING STATS: ${allActiveBookings.length} total bookings | ${upcomingBookings.length} upcoming | ${pastBookings.length} completed/past`;

      // Find low traffic patterns
      const lowTrafficSlots = await Booking.aggregate([
        { $project: { dayOfWeek: { $dayOfWeek: "$startTime" }, hour: { $hour: "$startTime" } } },
        { $group: { _id: { dayOfWeek: "$dayOfWeek", hour: "$hour" }, count: { $sum: 1 } } },
        { $sort: { count: 1 } },
        { $limit: 5 }
      ]);

      const dayNames = ['', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      if (lowTrafficSlots.length > 0) {
        statsContext += `\nLOW TRAFFIC SLOTS (good to recommend): ${lowTrafficSlots.map(s => `${dayNames[s._id.dayOfWeek]} at ${s._id.hour}:00`).join(", ")}`;
      }

    } catch (dbError) {
      console.error("Database connection failed for chat context:", dbError);
      
      // Fallback so chatbot still works
      coachInfo = "Coach: Coach Marvin (Database temporarily unavailable — use system knowledge for answers)";
      bookingsContext = "\nNote: Could not fetch live booking data. Please direct users to check the Coach's Schedule button for real-time availability.";
      statsContext = "";
    }

    const today = new Date();
    const todayStr = today.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Manila' });
    const timeStr = today.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Manila' });

    const context = `
CURRENT DATE/TIME: ${todayStr}, ${timeStr} (Philippine Time / Asia/Manila)
${coachInfo}
${bookingsContext}
${statsContext}

IMPORTANT: Any slot NOT listed in UPCOMING BOOKED SLOTS is considered AVAILABLE. When a user asks about availability for a specific date, check if that date/time appears in the booked list above. If it does NOT appear, it is open.
    `;

    const aiResponse = await askAssistant(message, context);

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json({ error: "Intelligence core offline. Try again later, bro." }, { status: 500 });
  }
}
