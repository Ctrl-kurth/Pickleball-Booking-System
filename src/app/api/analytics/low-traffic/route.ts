import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Booking } from "@/models/Booking";

/**
 * @api {get} /api/analytics/low-traffic Find low-traffic time slots for promo generation
 */
export async function GET() {
  try {
    await dbConnect();

    // Aggregation: Find slots (hour of day/day of week) with the fewest bookings
    // This pipeline groups by Day of Week and Hour, then sorts by booking count.
    const lowTrafficSlots = await Booking.aggregate([
      {
        $project: {
          dayOfWeek: { $dayOfWeek: "$startTime" },
          hour: { $hour: "$startTime" },
        },
      },
      {
        $group: {
          _id: { dayOfWeek: "$dayOfWeek", hour: "$hour" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: 1 }, // Ascending: show low traffic first
      },
      {
        $limit: 10,
      },
    ]);

    return NextResponse.json({
      success: true,
      data: lowTrafficSlots,
      message: "Low-traffic slots identified for automated promos.",
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: "Failed to analyze booking patterns" }, { status: 500 });
  }
}
