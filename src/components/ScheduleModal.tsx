"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, addDays, isBefore, startOfDay } from 'date-fns';
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';

interface Booking {
  startTime: string;
  endTime: string;
  status: string;
}

import { motion, AnimatePresence } from 'framer-motion';

export default function ScheduleModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [bookedSlots, setBookedSlots] = useState<{ startTime: string, endTime: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [mounted, setMounted] = useState(false);

  const [showMobileSlots, setShowMobileSlots] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      fetchBookings();
      setShowMobileSlots(false); // Reset on open
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (Array.isArray(data)) {
        const active = data.filter((b: Booking) => b.status !== 'cancelled');
        setBookedSlots(active.map((b: Booking) => ({
          startTime: b.startTime,
          endTime: b.endTime
        })));
      }
    } catch (error) {
      console.error("Failed to fetch bookings", error);
    } finally {
      setIsLoading(false);
    }
  };

  const availableTimes = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  const checkSlotBooked = (dateString: string, timeString: string, durationInHours: number = 1) => {
    if (!dateString) return false;
    const start = new Date(`${dateString} ${timeString}`);
    const end = new Date(start.getTime() + durationInHours * 60 * 60 * 1000);

    return bookedSlots.some(booking => {
      const bStart = new Date(booking.startTime);
      const bEnd = new Date(booking.endTime);
      return start < bEnd && end > bStart;
    });
  };

  const isDayFullyBooked = (dateString: string) => {
    return availableTimes.every(time => checkSlotBooked(dateString, time, 1));
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const rows = [];
  let days = [];
  let day = startDate;
  const today = startOfDay(new Date());

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = day;
      const formattedDate = format(cloneDay, "d");
      const isPast = isBefore(day, today);
      const dayString = format(cloneDay, 'yyyy-MM-dd');
      const isSelected = selectedDate === dayString;
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isFullyBooked = !isPast && isDayFullyBooked(dayString);

      days.push(
        <button
          key={day.toString()}
          onClick={() => {
            if (!isPast && isCurrentMonth) {
              setSelectedDate(dayString);
              setShowMobileSlots(true);
            }
          }}
          disabled={isPast || !isCurrentMonth}
          className={`relative flex flex-col items-center justify-center w-full aspect-square rounded-2xl text-sm font-black transition-all duration-300 ${!isCurrentMonth ? 'text-zinc-800 pointer-events-none opacity-0' :
              isPast ? 'text-zinc-700 pointer-events-none' :
                isSelected ? 'bg-green-400 text-black shadow-[0_0_30px_rgba(74,222,128,0.4)] scale-105 z-10 italic' :
                  isFullyBooked ? 'bg-red-500/5 text-red-500/50 hover:bg-red-500/10' :
                    'text-zinc-300 hover:bg-zinc-800/80 hover:text-white border border-transparent hover:border-zinc-700'
            }`}
        >
          <span>{formattedDate}</span>
          {isCurrentMonth && !isPast && (
            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 transition-colors ${isFullyBooked ? 'bg-red-500/50' : isSelected ? 'bg-black' : 'bg-green-400'}`} />
          )}
        </button>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-4" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

  const selectedDateObj = new Date(selectedDate);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="schedule-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-6 md:p-12 overflow-hidden"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xl"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="relative w-full max-w-5xl bg-black border border-zinc-800/80 rounded-2xl sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
          >
            {/* Subtle glow background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-green-500/10 blur-[100px] rounded-full pointer-events-none" />

            {/* Header */}
            <div className="relative flex items-center justify-between p-4 sm:p-6 border-b border-zinc-800/80 bg-zinc-950/50">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 md:p-4 bg-green-400/10 rounded-xl sm:rounded-2xl border border-green-400/20 shadow-[0_0_30px_rgba(74,222,128,0.15)]">
                  <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-4xl font-black text-white uppercase tracking-tighter italic leading-none mb-1">
                    Coach Marvin&apos;s Schedule
                  </h2>
                  <p className="text-[8px] sm:text-[10px] md:text-xs text-green-400 font-bold tracking-[0.2em] uppercase">
                    Real-Time Court Availability
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="relative z-50 cursor-pointer p-2 sm:p-3 bg-zinc-900 hover:bg-white text-zinc-400 hover:text-black rounded-full transition-all duration-300 shadow-xl"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="relative flex flex-col md:flex-row flex-1 bg-zinc-950/50">
              {/* Calendar Side */}
              <div className="w-full md:w-[55%] flex-shrink-0 p-4 sm:p-6 border-r border-zinc-800/80">
                <div className="flex justify-between items-center mb-4 sm:mb-6 bg-zinc-900/50 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-zinc-800">
                  <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="min-h-[36px] min-w-[36px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center rounded-lg sm:rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <div className="text-white font-black uppercase tracking-widest text-xs sm:text-sm md:text-base italic">
                    {format(currentMonth, "MMMM yyyy")}
                  </div>
                  <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="min-h-[36px] min-w-[36px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center rounded-lg sm:rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="text-center text-[8px] sm:text-[10px] font-black text-zinc-500 uppercase tracking-widest">{d}</div>
                  ))}
                </div>

                <div>{rows}</div>

                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-zinc-800/50 flex flex-col gap-6">
                  <div className="flex items-center justify-center gap-4 sm:gap-8 text-[8px] sm:text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                      Available
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500/50" />
                      Booked
                    </div>
                  </div>

                  <a
                    href="#booking"
                    onClick={onClose}
                    className="w-full flex items-center justify-center px-6 py-4 bg-green-400 text-black rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] hover:bg-green-300 transition-all shadow-[0_0_20px_rgba(74,222,128,0.2)] hover:shadow-[0_0_30px_rgba(74,222,128,0.4)] active:scale-95"
                  >
                    Book a Session
                  </a>
                </div>
              </div>

              {/* Slots Side Overlay on Mobile / Side-by-Side on Desktop */}
              <div className={`absolute md:relative inset-0 md:inset-auto w-full md:w-[45%] md:flex-1 bg-zinc-950 md:bg-black/20 transition-transform duration-500 ease-in-out z-20 ${showMobileSlots ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
                <div className="flex items-center gap-3 p-4 sm:p-6 sticky top-0 bg-zinc-950/95 backdrop-blur-xl z-10 border-b border-zinc-800/80">
                  <button
                    onClick={() => setShowMobileSlots(false)}
                    className="md:hidden flex items-center justify-center min-h-[36px] min-w-[36px] bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tighter italic flex items-center gap-2 sm:gap-3">
                    <Clock className="hidden sm:block w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                    {format(selectedDateObj, "EEEE, MMMM d")}
                  </h3>
                </div>

                <div className="p-4 sm:p-6">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-40 sm:h-64 space-y-4 sm:space-y-6">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-green-400/20 border-t-green-400 rounded-full animate-spin" />
                      <p className="text-green-400 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Syncing Database...</p>
                    </div>
                  ) : (
                    <motion.div
                      key={selectedDate}
                      initial="hidden"
                      animate="show"
                      variants={{
                        hidden: { opacity: 0 },
                        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
                      }}
                      className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3"
                    >
                      {availableTimes.map((time) => {
                        const isBooked = checkSlotBooked(selectedDate, time, 1);
                        return (
                          <motion.div
                            variants={{
                              hidden: { opacity: 0, x: 20 },
                              show: { opacity: 1, x: 0 }
                            }}
                            key={time}
                            className={`group flex items-center justify-between p-3 rounded-xl sm:rounded-2xl border transition-all duration-300 ${isBooked
                                ? 'bg-red-500/5 border-red-500/10'
                                : 'bg-zinc-900/40 border-zinc-800 hover:border-green-400 hover:bg-green-400/5 hover:shadow-[0_0_30px_rgba(74,222,128,0.15)] cursor-default'
                              }`}
                          >
                            <span className={`text-sm sm:text-base font-black tracking-tight ${isBooked ? 'text-zinc-600 line-through' : 'text-zinc-200 group-hover:text-white transition-colors'}`}>
                              {time}
                            </span>

                            {isBooked ? (
                              <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-red-500/10 text-red-500 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                                Unavailable
                              </span>
                            ) : (
                              <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-green-400/10 text-green-400 border border-green-400/20 group-hover:border-green-400 group-hover:bg-green-400 text-[8px] sm:text-[10px] group-hover:text-black font-black uppercase tracking-[0.2em] rounded-full transition-all duration-300">
                                Available
                              </span>
                            )}
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </div>

                <div className="md:hidden sticky bottom-0 p-4 border-t border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl z-10">
                  <a
                    href="#booking"
                    onClick={onClose}
                    className="w-full flex items-center justify-center px-6 py-4 bg-green-400 text-black rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-green-300 transition-all shadow-[0_0_20px_rgba(74,222,128,0.2)] active:scale-95"
                  >
                    Book a Session
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
