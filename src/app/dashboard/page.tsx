"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Calendar, Clock, DollarSign, User, ShieldCheck, Mail, CheckCircle, XCircle, Trash2, Search, Filter } from "lucide-react";
import Link from "next/link";

interface Booking {
  _id: string;
  clientName: string;
  clientEmail: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  totalPrice: number;
  systemMessage?: string;
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMessage, setActiveMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBookings = bookings.filter(b =>
    b.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b._id.includes(searchQuery)
  );

  const fetchBookings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings");
      if (res.ok) {
        const data = await res.json();
        const sorted = data.sort((a: Booking, b: Booking) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
        setBookings(sorted);
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.details || "Database connection issue");
      }
    } catch (err: any) {
      console.error("Failed to fetch bookings", err);
      setError(err.message);
      // Auto-retry once after 3 seconds if it's the first failure
      if (retryCount < 1) {
        setRetryCount(prev => prev + 1);
        setTimeout(fetchBookings, 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBookings();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b._id === id ? { ...b, status: status as Booking["status"] } : b));

        // Logic: If confirming, generate a confirmation message for the client side
        if (status === "confirmed") {
          const booking = bookings.find(b => b._id === id);
          if (booking) {
            setIsGenerating(true);
            // Simulate generation delay for feedback
            setTimeout(() => {
              const dateStr = format(new Date(booking.startTime), "EEEE, MMMM do");
              const timeStr = format(new Date(booking.startTime), "h:mm a");
              const msg = `Hi ${booking.clientName}! 🎾 Your session for ${dateStr} at ${timeStr} has been officially confirmed. We've reserved the court for you. See you on the courts! - Coach Marvin`;
              setActiveMessage(msg);
              setIsGenerating(false);
            }, 800);
          }
        }
      }
    } catch (error) {
      console.error("Update failed", error);
      setIsGenerating(false);
    }
  };

  const handleConfirm = async (id: string) => {
    const booking = bookings.find(b => b._id === id);
    if (!booking) return;

    const dateStr = format(new Date(booking.startTime), "EEEE, MMMM do");
    const timeStr = format(new Date(booking.startTime), "h:mm a");
    const message = `Hi ${booking.clientName}! 🎾 Your session for ${dateStr} at ${timeStr} has been officially confirmed. See you on the courts! - Coach Marvin`;

    setIsGenerating(true);

    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "confirmed",
          systemMessage: message
        })
      });

      if (res.ok) {
        setBookings(prev => prev.map(b => b._id === id ? { ...b, status: "confirmed", systemMessage: message } : b));

        // Success feedback delay
        setTimeout(() => {
          setActiveMessage(message);
          setIsGenerating(false);
        }, 800);
      }
    } catch (error) {
      console.error("Confirmation failed", error);
      setIsGenerating(false);
    }
  };

  const deleteBooking = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this booking?")) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBookings(prev => prev.filter(b => b._id !== id));
      }
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "text-green-400 bg-green-400/10 border-green-400/20";
      case "pending": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "cancelled": return "text-red-400 bg-red-400/10 border-red-400/20";
      default: return "text-zinc-400 bg-zinc-800 border-zinc-700";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="relative h-16 w-16 overflow-hidden rounded-xl border border-white/10 hover:border-green-400/50 transition-colors">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/pb4_clean.png?v=4" alt="PB4 Logo" className="w-full h-full object-contain" />
          </Link>
          <div>
            <h1 className="text-4xl font-black tracking-tighter italic flex items-center gap-3 uppercase">
              ADMIN BOOKING MANAGEMENT
            </h1>
          </div>
        </div>
        <div className="relative group hover:scale-105 transition-transform duration-500">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-emerald-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
          <div className="relative flex items-center gap-5 px-6 py-4 bg-zinc-900 border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-green-400/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <div className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">Total Bookings</div>
              <div className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-400">
                {bookings.length}
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-green-400/10 blur-xl rounded-full" />
          </div>
        </div>
      </div>

      <div className="mb-6 flex gap-3 w-full max-w-4xl">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-5 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white outline-none focus:border-zinc-600 placeholder:text-zinc-600 font-medium text-sm transition-all"
        />
        <button className="flex items-center gap-2 px-6 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors">
          <Filter className="w-4 h-4 text-green-400" />
          <span className="text-white text-sm font-bold">Filter</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-xl">
        {isLoading ? (
          <div className="p-24 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-zinc-500 font-black uppercase tracking-widest text-xs animate-pulse">
              {retryCount > 0 ? "Waking up Database Clusters..." : "Syncing Booking Data..."}
            </div>
          </div>
        ) : error ? (
          <div className="p-24 text-center space-y-6">
            <div className="text-red-400/50 font-black uppercase tracking-widest text-xs">Sync Failed: {error}</div>
            <button
              onClick={() => { setRetryCount(0); fetchBookings(); }}
              className="px-8 py-3 bg-zinc-800 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-zinc-700 transition-all"
            >
              Force Reconnect
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-24 text-center text-zinc-500 font-bold uppercase tracking-widest">No bookings found. Time to hit the courts yourself.</div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-24 text-center text-zinc-500 font-bold uppercase tracking-widest">No results for "{searchQuery}"</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-800 text-xs font-black text-zinc-500 uppercase tracking-widest">
                  <th className="p-6">Client Info</th>
                  <th className="p-6">Schedule</th>
                  <th className="p-6">Revenue</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-zinc-800/20 transition-colors">
                    {/* Client */}
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-white">{booking.clientName || "Unknown Client"}</div>
                          <div className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                            <Mail className="w-3 h-3" />
                            {booking.clientEmail || "No Email Provided"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Schedule */}
                    <td className="p-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm font-bold text-zinc-300">
                          <Calendar className="w-4 h-4 text-green-400" />
                          {format(new Date(booking.startTime), "MMM d, yyyy")}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                          <Clock className="w-3 h-3" />
                          {format(new Date(booking.startTime), "h:mm a")} - {format(new Date(booking.endTime), "h:mm a")}
                        </div>
                      </div>
                    </td>

                    {/* Revenue */}
                    <td className="p-6">
                      <div className="flex items-center gap-1 font-black text-lg italic text-white">
                        <DollarSign className="w-5 h-5 text-green-400" />
                        {booking.totalPrice}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-6">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-6">
                      <div className="flex items-center justify-end gap-2">
                        {booking.status !== "confirmed" && (
                          <button
                            onClick={() => handleConfirm(booking._id)}
                            className="p-2 rounded-xl bg-green-400/10 text-green-400 hover:bg-green-400 hover:text-black transition-colors tooltip-trigger"
                            title="Confirm & Message"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        {booking.status !== "cancelled" && (
                          <button
                            onClick={() => updateStatus(booking._id, "cancelled")}
                            className="p-2 rounded-xl bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400 hover:text-black transition-colors tooltip-trigger"
                            title="Cancel"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteBooking(booking._id)}
                          className="p-2 rounded-xl bg-red-400/10 text-red-400 hover:bg-red-400 hover:text-black transition-colors tooltip-trigger"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Message Generation Overlay */}
      {(isGenerating || activeMessage) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-zinc-900 border border-green-400/30 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-400/10 blur-3xl rounded-full" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-green-400/10 flex items-center justify-center">
                  <Mail className="text-green-400 w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-xl font-black italic uppercase tracking-tighter">Confirmation System</h3>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Client Direct Message</p>
                </div>
              </div>

              {isGenerating ? (
                <div className="space-y-4">
                  <div className="h-4 bg-zinc-800 rounded-full w-full animate-pulse" />
                  <div className="h-4 bg-zinc-800 rounded-full w-5/6 animate-pulse" />
                  <div className="h-4 bg-zinc-800 rounded-full w-4/6 animate-pulse" />
                  <p className="text-center text-zinc-500 text-xs font-black uppercase tracking-widest mt-6 animate-pulse">Drafting automated response...</p>
                </div>
              ) : (
                <>
                  <div className="bg-black/50 border border-zinc-800 rounded-2xl p-6 mb-8 relative">
                    <p className="text-zinc-300 leading-relaxed font-medium italic">
                      "{activeMessage}"
                    </p>
                    <div className="absolute top-2 right-2 flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(activeMessage || "");
                        alert("Message copied to clipboard!");
                      }}
                      className="flex-1 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-green-400 transition-all active:scale-95"
                    >
                      Copy Message
                    </button>
                    <button
                      onClick={() => setActiveMessage(null)}
                      className="px-8 py-4 bg-zinc-800 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-zinc-700 transition-all active:scale-95"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
