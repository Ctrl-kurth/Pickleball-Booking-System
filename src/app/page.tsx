"use client";

import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Zap, CheckCircle2, ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, addDays, isBefore, startOfDay, getDay } from 'date-fns';
import Navbar from '@/components/Navbar';
import Stepper, { Step } from '@/components/Stepper';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

const Paddle3D = dynamic(() => import('../components/Paddle3D'), { ssr: false });
import CircularGallery from '../components/CircularGallery';

interface Booking {
  _id: string;
  clientName: string;
  clientEmail: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  totalPrice: number;
  systemMessage?: string;
  location?: string;
}

// Helper for cross-browser date parsing (especially Safari on iOS)
const createDateFromStrings = (dateString: string, timeString: string): Date => {
  if (!dateString || !timeString) return new Date(NaN);
  const [year, month, day] = dateString.split('-').map(Number);
  const [time, period] = timeString.split(' ');
  const [hoursStr, minutesStr] = time.split(':');
  let hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  
  if (period === 'PM' && hours !== 12) hours += 12;
  else if (period === 'AM' && hours === 12) hours = 0;
  
  return new Date(year, month - 1, day, hours, minutes);
};

// Static data — hoisted outside component to prevent recreation on every render
const AVAILABLE_TIMES = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
];

const SESSION_TYPES = [
  { name: 'Solo Session (Taguig)', duration: '+ Ballboy Required', price: '₱850/hr', priceAmount: '₱850', priceDetails: ['Per Hour'], rawPrice: 850 },
  { name: 'Solo Session (QC/Parañaque)', duration: '+ Ballboy Required', price: '₱1000/hr', priceAmount: '₱1000', priceDetails: ['Per Hour'], rawPrice: 1000 },
  { name: '2-3 Pax Group', duration: '+ Ballboy Required', price: '₱500/hd/hr', priceAmount: '₱500', priceDetails: ['Per Head', 'Per Hour'], rawPrice: 500 },
  { name: '4-5 Pax Group', duration: 'Free Ballboy (if 5 pax)', price: '₱400/hd/hr', priceAmount: '₱400', priceDetails: ['Per Head', 'Per Hour'], rawPrice: 400 },
  { name: '6-7 Pax Group', duration: 'Free Ballboy', price: '₱350/hd/hr', priceAmount: '₱350', priceDetails: ['Per Head', 'Per Hour'], rawPrice: 350 },
  { name: '8-10 Pax Group', duration: 'Free Ballboy', price: '₱300/hd/hr', priceAmount: '₱300', priceDetails: ['Per Head', 'Per Hour'], rawPrice: 300 },
  { name: 'Corporate', duration: 'Hourly Rate', price: '₱2500/hr', priceAmount: '₱2500', priceDetails: ['Per Hour'], rawPrice: 2500 },
  { name: 'Saturday Group Session', duration: '2 Hours • All In • Dragonsmash court taguig only', price: '₱1000/hd/2hr', priceAmount: '₱1000', priceDetails: ['Per Head', 'Per 2 Hours'], rawPrice: 1000 },
];

// Static stats — hoisted to module level to prevent recreation on every render
const STATS = [
  { label: 'Students Coached', value: '300+' },
  { label: 'Development Focus', value: 'Youth' },
  { label: 'Training Style', value: 'Game-Based' },
];

// ─── Isolated component: typing only re-renders this, never the whole page ───
function TrackStatus() {
  const [statusEmail, setStatusEmail] = useState('');
  const [checkingResult, setCheckingResult] = useState<Booking[] | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = async () => {
    if (!statusEmail) return;
    setIsChecking(true);
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const allBookings = await res.json();
        const userBookings = allBookings.filter(
          (b: Booking) => b.clientEmail.toLowerCase() === statusEmail.toLowerCase()
        );
        setCheckingResult(userBookings);
      }
    } catch (error) {
      console.error('Checking failed', error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-32 border-t border-zinc-900">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div>
          <h2 className="text-5xl font-black text-white tracking-tighter mb-6 uppercase italic">Track Your Status</h2>
          <p className="text-zinc-500 text-lg font-medium leading-relaxed max-w-md">
            Enter your registration email to view your booking status and any system messages from Coach Marvin.
          </p>
        </div>
        <form autoComplete="off" onSubmit={(e) => { e.preventDefault(); checkStatus(); }} className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              inputMode="email"
              value={statusEmail}
              onChange={(e) => setStatusEmail(e.target.value)}
              placeholder="YOUR REGISTRATION EMAIL"
              className="w-full sm:flex-1 min-h-[44px] px-6 py-4 bg-black border border-zinc-800 rounded-2xl text-white font-bold outline-none focus:border-green-400 transition-colors text-sm sm:text-base"
              id="trk_search"
              name="trk_search"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={checkStatus}
              disabled={isChecking}
              className="w-full sm:w-auto min-h-[44px] px-8 py-4 bg-zinc-800 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-green-400 hover:text-black transition-all"
            >
              {isChecking ? '...' : 'CHECK'}
            </button>
          </div>

          {checkingResult && (
            <div className="space-y-4 pt-6">
              {checkingResult.length === 0 ? (
                <p className="text-zinc-500 text-center font-bold uppercase tracking-widest text-xs">No active bookings found for this email.</p>
              ) : (
                checkingResult.map((b) => (
                  <div key={b._id} className="p-6 bg-black rounded-2xl border border-zinc-800">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-xs font-black text-zinc-600 uppercase tracking-widest">Status</div>
                        <div className={`text-sm font-black uppercase ${b.status === 'confirmed' ? 'text-green-400' : 'text-yellow-400'}`}>
                          {b.status}
                        </div>
                      </div>
                      <div className="text-right text-xs font-black text-zinc-500 uppercase">
                        {new Date(b.startTime).toLocaleDateString()}
                      </div>
                    </div>

                    {b.systemMessage && (
                      <div className="mt-4 p-4 bg-green-400/5 border border-green-400/10 rounded-xl">
                        <p className="text-green-400/90 text-sm italic font-medium">
                          &quot;{b.systemMessage}&quot;
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [sessionType, setSessionType] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(2);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'success' | string>('idle');
  const [currentStep, setCurrentStep] = useState(1);
  const [isPaddleExploded, setIsPaddleExploded] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookedSlots, setBookedSlots] = useState<{ startTime: string, endTime: string, location?: string }[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const [showMobileSlots, setShowMobileSlots] = useState(false);
  const [showMobileDuration, setShowMobileDuration] = useState(false);
  const [showMobileBookingModal, setShowMobileBookingModal] = useState(false);
  const [showMobileLocationModal, setShowMobileLocationModal] = useState(false);

  const isInitialMount = useRef(true);
  const stepperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setTimeout(() => {
      const el = stepperRef.current;
      if (el) {
        const offset = 80; // small padding so step indicators stay visible
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }, 50);
  }, [currentStep]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolledPastHero(window.scrollY > 300);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const checkMobile = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setIsMobile(window.innerWidth < 1024), 150);
    };
    setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => { window.removeEventListener('resize', checkMobile); clearTimeout(timer); };
  }, []);

  useEffect(() => {
    if (isMobile && currentStep === 2) {
      setShowMobileBookingModal(true);
    }
  }, [currentStep, isMobile]);

  useEffect(() => {
    if (isMobile && currentStep === 1 && ['2-3 Pax Group', '4-5 Pax Group', '6-7 Pax Group', '8-10 Pax Group'].includes(sessionType) && !selectedLocation) {
      setShowMobileLocationModal(true);
    }
  }, [currentStep, isMobile, sessionType, selectedLocation]);

  const fetchBookings = useCallback(() => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const active = data.filter((b: Booking) => b.status !== 'cancelled');
          setBookedSlots(active.map((b: Booking) => ({
            startTime: b.startTime,
            endTime: b.endTime,
            location: b.location
          })));
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 10000);
    return () => clearInterval(interval);
  }, [fetchBookings]);

  // Lock scroll when paddle is exploded
  useEffect(() => {
    if (isPaddleExploded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isPaddleExploded]);

  const availableTimes = AVAILABLE_TIMES;

  const checkSlotStatus = useCallback((dateString: string, timeString: string, durationInHours: number) => {
    if (!dateString) return 'available';
    const start = createDateFromStrings(dateString, timeString);
    if (isNaN(start.getTime())) return 'available';
    const end = new Date(start.getTime() + durationInHours * 60 * 60 * 1000);
    
    let intendedLocation = selectedLocation;
    if (sessionType === 'Solo Session (Taguig)' || sessionType === 'Saturday Group Session') intendedLocation = 'Taguig';
    else if (sessionType === 'Solo Session (QC/Parañaque)') intendedLocation = 'QC / Parañaque';

    return bookedSlots.reduce<'available' | 'booked' | 'travel'>((acc, booking) => {
      if (acc === 'booked') return acc;
      
      const bStart = new Date(booking.startTime);
      const bEnd = new Date(booking.endTime);
      
      if (start < bEnd && end > bStart) {
        return 'booked';
      }
      
      if (intendedLocation && booking.location && booking.location !== intendedLocation) {
        const paddedStart = new Date(bStart.getTime() - 60 * 60 * 1000);
        const paddedEnd = new Date(bEnd.getTime() + 60 * 60 * 1000);
        if (start < paddedEnd && end > paddedStart) {
          return 'travel';
        }
      }
      return acc;
    }, 'available');
  }, [bookedSlots, selectedLocation, sessionType]);

  const isDayFullyBooked = useCallback((dateString: string) => {
    return AVAILABLE_TIMES.every(time => checkSlotStatus(dateString, time, 1) === 'booked');
  }, [checkSlotStatus]);

  // Use module-level SESSION_TYPES constant — no recreation on re-render
  const sessionTypes = SESSION_TYPES;

  const handleBooking = async () => {
    setIsSubmitting(true);
    setBookingStatus('idle');

    try {
      const mockCoachId = "60d5ecb862b80a1c1c8e8e8e";
      const startTime = createDateFromStrings(selectedDate, selectedTime);
      const isPackage = sessionType.includes('Package');
      const durationMs = isPackage ? (60 * 60 * 1000) : (selectedDuration * 60 * 60 * 1000);
      const endTime = new Date(startTime.getTime() + durationMs);

      const basePrice = sessionTypes.find(s => s.name === sessionType)?.rawPrice || 0;
      const totalPrice = isPackage ? basePrice : (basePrice * selectedDuration);

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coachId: mockCoachId,
          userId: "user_pro_pickleballer",
          clientName: `${firstName} ${lastName}`.trim(),
          clientEmail: email,
          startTime,
          endTime,
          totalPrice: totalPrice,
          location: selectedLocation,
        }),
      });

      if (response.ok) {
        setBookingStatus('success');
      } else {
        const data = await response.json().catch(() => ({}));
        setBookingStatus(data.error || data.details || 'Connection failed to the booking server.');
      }
    } catch {
      setBookingStatus('Network Error: Could not reach the server.');
    } finally {
      setIsSubmitting(false);
    }
  };



  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    const today = startOfDay(new Date());

    const isSaturdaySession = sessionType === 'Saturday Group Session';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const isPast = isBefore(day, today);
        const dayString = format(cloneDay, 'yyyy-MM-dd');
        const isSelected = selectedDate === dayString;
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isFullyBooked = !isPast && isDayFullyBooked(dayString);
        const isNotSaturday = isSaturdaySession && getDay(cloneDay) !== 6;

        days.push(
          <button
            type="button"
            key={day.toString()}
            onClick={() => {
              if (!isPast && isCurrentMonth && !isFullyBooked && !isNotSaturday) {
                setSelectedDate(dayString);
                setSelectedTime('');
                setShowMobileSlots(true);
                setShowMobileDuration(false);
              }
            }}
            disabled={isPast || !isCurrentMonth || isNotSaturday}
            className={`relative flex flex-col items-center justify-center w-full aspect-square rounded-2xl text-sm font-black transition-all duration-300 ${!isCurrentMonth ? 'text-zinc-800 pointer-events-none opacity-0' :
                isPast ? 'text-zinc-700 pointer-events-none' :
                  isNotSaturday ? 'text-zinc-800 pointer-events-none opacity-30' :
                  isSelected ? 'bg-green-400 text-black shadow-[0_0_30px_rgba(74,222,128,0.4)] scale-105 z-10 italic' :
                    isFullyBooked ? 'bg-red-500/5 text-red-500/50 hover:bg-red-500/10' :
                      'text-zinc-300 hover:bg-zinc-800/80 hover:text-white border border-transparent hover:border-zinc-700'
              }`}
          >
            <span>{formattedDate}</span>
            {isCurrentMonth && !isPast && !isNotSaturday && (
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

    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-4 sm:mb-6 bg-zinc-900/50 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-zinc-800">
          <button type="button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="min-h-[36px] min-w-[36px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center rounded-lg sm:rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="text-white font-black uppercase tracking-widest text-xs sm:text-sm md:text-base italic">
            {format(currentMonth, "MMMM yyyy")}
          </div>
          <button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="min-h-[36px] min-w-[36px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center rounded-lg sm:rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[8px] sm:text-[10px] font-black text-zinc-500 uppercase tracking-widest">{d}</div>
          ))}
        </div>

        <div>{rows}</div>
      </div>
    );
  };

  const renderBookingUI = () => (
    <div className={`relative flex flex-col md:flex-row overflow-hidden bg-black border border-zinc-800/80 rounded-2xl sm:rounded-[1.5rem] shadow-2xl md:min-h-[400px] ${isMobile ? 'h-full w-full rounded-none border-none shadow-none' : ''}`}>
      {/* Calendar Side */}
      <div className={`w-full md:w-[55%] flex-shrink-0 p-3 sm:p-4 md:border-r border-zinc-800/80 bg-zinc-950/50 flex flex-col ${isMobile ? 'h-full overflow-y-auto' : ''}`}>
        <div className="flex-1">
          {renderCalendar()}
        </div>
      </div>

      {/* Slots Side Overlay on Mobile / Side-by-Side on Desktop */}
      <div className={`absolute md:relative inset-0 md:inset-auto w-full md:w-[45%] md:flex-1 bg-zinc-950 md:bg-black/20 transition-transform duration-300 ease-in-out z-20 overflow-hidden md:overflow-visible will-change-transform ${showMobileSlots ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        
        {/* SLOTS PANEL */}
        <div className={`absolute md:relative inset-0 md:inset-auto w-full h-full md:h-auto flex flex-col transition-transform duration-300 will-change-transform ${showMobileDuration ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
          <div className="flex items-center gap-3 p-3 sm:p-4 sticky top-0 bg-zinc-950/95 md:bg-transparent backdrop-blur-xl z-10 border-b border-zinc-800/80 md:border-none md:pb-1">
            <button
              onClick={() => {
                setShowMobileSlots(false);
                setShowMobileDuration(false);
              }}
              className="md:hidden flex items-center justify-center min-h-[36px] min-w-[36px] bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tighter italic flex items-center gap-2 sm:gap-3">
              <Clock className="hidden sm:block w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
              {selectedDate ? format(new Date(selectedDate), "EEEE, MMMM d") : "Select a Date"}
            </h3>
          </div>

          <div className="p-3 sm:p-4 md:pt-1 overflow-y-auto h-[calc(100%-80px)] md:h-auto">
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2">Select Slot</label>
              
              {(() => {
                if (!selectedDate) return null;
                const locationsToday = Array.from(new Set(bookedSlots.filter(b => {
                  if (!b.location) return false;
                  const bDate = format(new Date(b.startTime), 'yyyy-MM-dd');
                  return bDate === selectedDate;
                }).map(b => b.location)));

                if (locationsToday.length === 0) return null;
                
                let intendedLocation = selectedLocation;
                if (sessionType === 'Solo Session (Taguig)' || sessionType === 'Saturday Group Session') intendedLocation = 'Taguig';
                else if (sessionType === 'Solo Session (QC/Parañaque)') intendedLocation = 'QC / Parañaque';
                
                const hasDifferentLocation = intendedLocation 
                  ? locationsToday.some(loc => loc !== intendedLocation)
                  : true;

                if (!hasDifferentLocation) return null;

                return (
                  <div className="mb-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 flex items-start gap-2">
                    <div className="mt-0.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-[10px] leading-relaxed uppercase font-bold tracking-wider">
                      Coach Marvin has sessions in <span className="text-white">{locationsToday.join(' and ')}</span> today. Please note that booking in a different city will require a 1-hour travel buffer.
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-2 gap-2">
                {availableTimes.map((time) => {
                  const durationToUse = sessionType.includes('Package') ? 1 : selectedDuration;
                  const slotStatus = selectedDate ? checkSlotStatus(selectedDate, time, durationToUse) : 'available';
                  const isBooked = slotStatus === 'booked';
                  const isTravel = slotStatus === 'travel';
                  const isUnavailable = isBooked || isTravel;
                  
                  return (
                    <button
                      type="button"
                      key={time}
                      disabled={isUnavailable || !selectedDate}
                      onClick={() => {
                        setSelectedTime(time);
                        setShowMobileDuration(true);
                      }}
                      className={`min-h-[44px] py-3 px-2 rounded-xl font-black transition-all duration-300 transform text-xs ${isUnavailable
                        ? 'bg-zinc-800/20 border border-zinc-800 text-zinc-600 opacity-50 cursor-not-allowed line-through flex flex-col items-center justify-center'
                        : selectedTime === time
                          ? 'bg-green-400 text-black shadow-[0_0_30px_rgba(74,222,128,0.4)] scale-105 italic flex flex-col items-center justify-center'
                          : 'bg-zinc-800/30 border border-zinc-800 text-zinc-400 hover:border-green-400/40 hover:bg-zinc-800 flex flex-col items-center justify-center'
                        }`}
                    >
                      <span>{time}</span>
                      {isTravel && <span className="text-[8px] text-yellow-500/80 leading-none mt-1">1HR TRAVEL</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* DURATION PANEL */}
        <div className={`absolute md:relative inset-0 md:inset-auto w-full h-full md:h-auto flex flex-col transition-transform duration-500 bg-zinc-950 md:bg-transparent ${showMobileDuration ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
          <div className="flex md:hidden items-center gap-3 p-3 sm:p-4 sticky top-0 bg-zinc-950/95 backdrop-blur-xl z-10 border-b border-zinc-800/80">
            <button
              onClick={() => setShowMobileDuration(false)}
              className="md:hidden flex items-center justify-center min-h-[36px] min-w-[36px] bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tighter italic flex items-center gap-2 sm:gap-3">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 hidden sm:block" />
              Duration for {selectedTime}
            </h3>
          </div>

          <div className="p-3 sm:p-4 md:pt-4 overflow-y-auto h-[calc(100%-80px)] md:h-auto border-t border-transparent md:border-zinc-800/50">
            <div className="space-y-3 pb-10 md:pb-0">
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2">Select Duration {sessionType && !sessionType.includes('Package') && sessionType !== 'Saturday Group Session' && '(Hours)'}</label>
               {!sessionType ? (
                <div className="py-3 px-5 rounded-xl bg-zinc-800/20 border border-zinc-800 text-zinc-500 text-sm font-bold text-center flex items-center justify-center min-h-[100px]">
                  Select a Session Type to unlock duration formatting
                </div>
              ) : sessionType.includes('Package') ? (
                <div className="py-3 px-5 rounded-xl bg-zinc-800/20 border border-zinc-800 text-green-400/80 text-sm font-bold text-center border-dashed flex items-center justify-center min-h-[100px]">
                  Duration is pre-configured for this option
                </div>
              ) : sessionType === 'Saturday Group Session' ? (
                <div className="py-3 px-5 rounded-xl bg-zinc-800/20 border border-zinc-800 text-green-400/80 text-sm font-bold text-center border-dashed flex items-center justify-center min-h-[100px]">
                  <div className="space-y-1">
                    <div className="text-green-400 font-black text-lg">2 Hours</div>
                    <div className="text-zinc-500 text-[10px] uppercase tracking-widest">Fixed duration • Saturdays only</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
                  {[2, 4, 6].map((dur) => {
                    const isDurValid = selectedDate && selectedTime ? checkSlotStatus(selectedDate, selectedTime, dur) !== 'booked' && checkSlotStatus(selectedDate, selectedTime, dur) !== 'travel' : true;
                    return (
                      <button
                        type="button"
                        key={dur}
                        disabled={!isDurValid}
                        onClick={() => setSelectedDuration(dur)}
                        className={`min-h-[44px] py-3 px-2 rounded-xl font-black transition-all duration-300 transform text-xs md:text-sm ${!isDurValid
                          ? 'bg-zinc-800/20 border border-zinc-800 text-zinc-600 opacity-50 cursor-not-allowed line-through flex flex-col items-center justify-center'
                          : selectedDuration === dur
                          ? 'bg-green-400 text-black shadow-[0_0_30px_rgba(74,222,128,0.4)] scale-105 italic flex flex-col items-center justify-center'
                          : 'bg-zinc-800/30 border border-zinc-800 text-zinc-400 hover:border-green-400/40 hover:bg-zinc-800 flex flex-col items-center justify-center'
                          }`}
                      >
                        {dur} {dur === 1 ? 'hr' : 'hrs'}
                      </button>
                    );
                  })}
                </div>
              )}
              {isMobile && selectedTime && (
                <div className="mt-8 pt-4">
                  <button onClick={() => {
                    setShowMobileBookingModal(false);
                    setCurrentStep(3);
                  }} className="w-full bg-green-400 text-black py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(74,222,128,0.3)]">
                    Continue to Details
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  if (bookingStatus === 'success') {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="bg-zinc-900 border border-zinc-800 p-12 rounded-3xl text-center max-w-md w-full space-y-6 shadow-2xl shadow-green-400/10">
          <div className="flex justify-center">
            <div className="bg-green-400/20 p-6 rounded-full">
              <CheckCircle2 className="w-20 h-20 text-green-400 animate-pulse" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">Request Received</h1>
          <p className="text-gray-400 leading-relaxed font-medium">We&apos;ve received your booking request. Coach Marvin is reviewing the schedule. You will see an update in the status tracker once it is officially locked in.</p>
          <button
            onClick={() => {
              setBookingStatus('idle');
              setSessionType('');
              setSelectedDate('');
              setSelectedTime('');
              setSelectedDuration(1);
              setFirstName('');
              setLastName('');
              setEmail('');
              setCurrentStep(1);
            }}
            className="w-full bg-green-400 text-black py-5 min-h-[44px] rounded-2xl font-black uppercase tracking-widest hover:bg-green-300 transition-all hover:scale-[1.02]"
          >
            Back to Court
          </button>
        </div>
      </main>
    );
  }

  const buttonText = currentStep === 3 ? (isSubmitting ? 'INITIATING...' : 'SECURE SPOT') : 'CONTINUE';
  
  const isSlotValid = selectedDate && selectedTime ? checkSlotStatus(selectedDate, selectedTime, sessionType.includes('Package') ? 1 : selectedDuration) === 'available' : false;

  const isNextDisabled = Boolean(
    isSubmitting ||
    (currentStep === 1 && (!sessionType || (['2-3 Pax Group', '4-5 Pax Group', '6-7 Pax Group', '8-10 Pax Group'].includes(sessionType) && !selectedLocation))) ||
    (currentStep === 2 && (!sessionType || !selectedDate || !selectedTime || !isSlotValid)) ||
    (currentStep === 3 && (!sessionType || !selectedDate || !selectedTime || !firstName || !lastName || !email || !isSlotValid))
  );

  return (
    <div className="size-full overflow-auto bg-black selection:bg-green-400 selection:text-black relative">
      {/* Neon Net Background Overlay - Lightened and Brightened */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.5]" style={{
        backgroundImage: `
          repeating-linear-gradient(45deg, rgba(187, 247, 208, 0.4) 0px, rgba(187, 247, 208, 0.4) 1px, transparent 1px, transparent 40px),
          repeating-linear-gradient(-45deg, rgba(187, 247, 208, 0.4) 0px, rgba(187, 247, 208, 0.4) 1px, transparent 1px, transparent 40px)
        `,
        backgroundSize: '56.56px 56.56px',
        maskImage: 'linear-gradient(to bottom, transparent, transparent 40%, black 70%, black 90%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, transparent 40%, black 70%, black 90%, transparent)'
      }} />

      {/* Background Animated Blinking Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden mix-blend-screen">
        <div className="absolute top-[10%] -left-[10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-green-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[10%] -right-[10%] w-[60vw] h-[60vw] max-w-[900px] max-h-[900px] bg-emerald-500/15 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '7s' }} />
      </div>

      {/* Global Fixed 3D Paddle Overlay - Desktop Exclusive */}
      {!isMobile && (
        <div className={`fixed inset-0 pointer-events-none group hidden lg:flex items-center justify-center z-[100]`}>
          <AnimatePresence>
            {isPaddleExploded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-2xl pointer-events-none"
              />
            )}
          </AnimatePresence>

          <motion.div
            animate={isPaddleExploded ? {
              x: 0,
              y: 0,
              width: "80vw",
              height: "80vh",
            } : {
              x: "35vw",
              y: "-5vh",
              width: "550px",
              height: "65vh",
            }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="relative pointer-events-auto flex items-center justify-center"
          >
            {/* Circular Glow Background */}
            <motion.div
              animate={{
                scale: isPaddleExploded ? 1.8 : 1,
                opacity: isPaddleExploded ? 0.5 : 0.8,
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-green-400/40 rounded-full blur-[120px] pointer-events-none"
            />

            {/* Technical Specs Panel */}
            <AnimatePresence>
              {isPaddleExploded && (
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-80 pr-10 hidden xl:flex flex-col gap-6"
                >
                  {[
                    { title: "Edge Guard", desc: "Industrial-grade bumper protecting the core from high-impact ground strikes." },
                    { title: "Carbon Face", desc: "T700 Unidirectional Fiber for maximum grit and explosive spin mechanics." },
                    { title: "Polymer Core", desc: "16mm Honeycomb structure engineered for vibration damping and power." },
                    { title: "Ebony Grip", desc: "Premium walnut-finished scales for ergonomic torque and moisture control." },
                  ].map((spec, i) => (
                    <motion.div
                      key={spec.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + (i * 0.1) }}
                      className="border-r-2 border-green-400/30 pr-6 text-right"
                    >
                      <h4 className="text-green-400 font-black text-xs uppercase tracking-[0.3em] mb-2 italic">
                        {spec.title}
                      </h4>
                      <p className="text-zinc-500 text-[11px] font-medium leading-relaxed italic">
                        {spec.desc}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <Paddle3D
              isExploded={isPaddleExploded}
              onExplodeChange={setIsPaddleExploded}
            />
            <AnimatePresence>
              {isPaddleExploded && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setIsPaddleExploded(false)}
                  className="absolute top-0 right-0 md:-top-10 md:-right-10 bg-white/10 hover:bg-white/20 text-white border border-white/20 min-h-[44px] px-8 py-4 rounded-full font-black uppercase tracking-widest transition-all z-50 backdrop-blur-md"
                >
                  Close View
                </motion.button>
              )}
            </AnimatePresence>

            {!isPaddleExploded && (
              <>
                <div className="absolute top-1/4 right-32 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-green-400/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <span className="text-[10px] text-green-400 font-black uppercase tracking-widest">DRAG TO ROTATE 360°</span>
                </div>

                <motion.div
                  animate={{
                    opacity: isScrolledPastHero ? 0 : 1,
                    y: isScrolledPastHero ? 20 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="absolute -bottom-[5%] left-1/2 -translate-x-1/2 flex flex-col items-center text-center gap-3 w-80 pointer-events-none"
                >
                  <h2 className="text-2xl font-black text-white tracking-tighter italic uppercase drop-shadow-xl">Performance Paddle</h2>
                  <p className="text-zinc-400 font-medium text-[11px] leading-relaxed italic drop-shadow-lg">
                    Explore the anatomy of a high-performance pickleball paddle. Click or tap the paddle to rotate and explore the prototype in 3D.
                  </p>
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      )}

      <div className="relative z-10">
        <Navbar />
        {/* Hero Section */}
        <div id="home" className="relative h-screen w-full overflow-hidden">
          <ImageWithFallback
            src="/pb1.jpg"
            alt="Pickleball collective"
            className="w-full h-full object-cover opacity-85 brightness-[1.15] contrast-[1.1] transition-opacity duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-black flex items-center pt-32">
            <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-2 lg:items-center">
              {/* Left Side: Hero Text */}
              <div className="relative z-10 w-full text-left">
                <h1 className="text-[clamp(3rem,10vw,9rem)] font-black text-white mb-6 tracking-tighter leading-[0.85]">
                  COACH<br />
                  <span className="text-green-400 italic">MARVIN</span>
                </h1>
                <div className="flex flex-col gap-4 mb-12 max-w-2xl">
                  {[
                    "Building Competitive Players from the Ground Up",
                    "Developing Future Competitive Players",
                    "From Beginner to Competitive – One Session at a Time"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 group">
                      <div className="mt-1 flex-shrink-0">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-green-400 opacity-80 group-hover:opacity-100 group-hover:rotate-90 transition-all duration-500">
                          <circle cx="12" cy="12" r="10" />
                          <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
                          <circle cx="16" cy="8" r="1.5" fill="currentColor" stroke="none" />
                          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
                          <circle cx="8" cy="16" r="1.5" fill="currentColor" stroke="none" />
                          <circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none" />
                        </svg>
                      </div>
                      <span className="text-lg md:text-xl text-zinc-200 group-hover:text-white font-medium tracking-tight transition-colors">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4 md:flex md:flex-wrap items-start md:gap-10 mb-16">
                  {STATS.map((stat) => (
                    <div key={stat.label} className="group min-w-[80px]">
                      <div className="text-2xl md:text-4xl font-black text-green-400 mb-1 tracking-tighter italic whitespace-nowrap">{stat.value}</div>
                      <div className="text-[9px] md:text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] whitespace-nowrap">{stat.label}</div>
                      <div className="h-0.5 w-0 group-hover:w-full bg-green-400 transition-all duration-300 mt-1" />
                    </div>
                  ))}
                </div>
                <a
                  href="#booking"
                  className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] gap-3 px-8 py-4 md:px-10 md:py-5 bg-green-400 text-black rounded-full text-lg md:text-xl font-black tracking-widest uppercase hover:bg-green-300 transition-all hover:scale-105 shadow-[0_0_50px_rgba(74,222,128,0.3)] hover:shadow-[0_0_70px_rgba(74,222,128,0.5)] active:scale-95"
                >
                  < Zap className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                  Book Session
                </a>
              </div>
              {/* Empty Right side for the fixed 3D Paddle */}
              <div className="hidden lg:block h-1" />
            </div>
          </div>
          {/* Bottom Deep Fade to blend the image into the background net */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
        </div>

        {/* Mobile Exclusive 3D Paddle Section - Coming Soon */}
        {isMobile && (
          <div className="w-full px-6 py-20 flex flex-col items-center bg-black border-b border-zinc-900 block lg:hidden">
            <div className="text-center mb-8 space-y-3">
              <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">Performance Paddle</h2>
              <p className="text-zinc-500 font-medium text-sm max-w-sm mx-auto">
                Explore the anatomy of a high-performance pickleball paddle. Tap to rotate and explore the prototype in 3D.
              </p>
            </div>

            <div className="w-full max-w-sm h-[450px] relative rounded-3xl bg-zinc-900/40 border border-zinc-800 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
              {/* Circular Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] bg-green-400/20 rounded-full blur-[80px] pointer-events-none" />

              <Paddle3D
                isExploded={isPaddleExploded}
                onExplodeChange={setIsPaddleExploded}
              />

              <AnimatePresence>
                {isPaddleExploded && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setIsPaddleExploded(false)}
                    className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white border border-white/20 min-h-[44px] min-w-[44px] px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all z-50 backdrop-blur-md"
                  >
                    Close
                  </motion.button>
                )}
              </AnimatePresence>

              {!isPaddleExploded && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-green-400/20 pointer-events-none">
                  <span className="text-[10px] text-green-400 font-black uppercase tracking-widest">DRAG TO ROTATE 360°</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div id="about" className="max-w-7xl mx-auto px-6 md:px-12 py-32 scroll-mt-20">
          {/* Profile Header (Moved above stepper) */}
          <div className="flex flex-col gap-12 mb-20 items-center">
            <div className="w-full max-w-5xl bg-zinc-900/40 border border-zinc-800 rounded-3xl p-10 backdrop-blur-sm hover:border-zinc-700 transition-colors">
              <h2 className="text-3xl font-black mb-8 text-white tracking-tighter italic uppercase">The Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
                <div className="relative group overflow-hidden rounded-2xl h-[300px] md:h-auto flex items-center justify-center bg-black">
                  <ImageWithFallback
                    src="/pb3.jpg"
                    alt="Coach Marvin Profile"
                    className="w-full h-full object-cover object-center transform transition-transform duration-[2s] group-hover:scale-110 opacity-90 brightness-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                </div>

                <div className="space-y-6 text-zinc-400 leading-relaxed font-medium text-lg flex flex-col justify-center">
                  <p>
                    I’m <span className="text-white font-bold">Coach Marvin</span>, a tennis and pickleball trainer focused on developing players from beginner to competitive level. Known for a unique, <span className="text-green-400 font-bold">game-based coaching style</span> that helps players improve faster and play smarter.
                  </p>
                  <p>
                    With over <span className="text-white font-bold">300+ students</span> coached, my mission is to help players build strong fundamentals and real match confidence. It’s incredibly rewarding to see athletes like <span className="text-white font-bold italic">Ohliber and James</span> already stepping up and showing serious competitive potential.
                  </p>
                  <div className="p-5 mt-4 border-l-4 border-green-400 bg-green-400/5 rounded-r-2xl">
                    <p className="text-green-400 font-bold italic text-base">
                      Due to high demand, this website is for easier booking and scheduling of sessions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Circular Gallery Landscape */}
            <div className="w-full max-w-5xl flex flex-col gap-8 mt-10">
              <div className="text-center space-y-4">
                <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter italic uppercase">Players Coached</h3>
                <div className="h-1 w-16 bg-green-400 mx-auto rounded-full" />
                <p className="text-zinc-400 font-medium max-w-2xl mx-auto text-sm md:text-base">
                  Every player brings a unique set of strengths to the court. My coaching philosophy is built on identifying those strengths, refining mechanics, and instilling the strategic mindset required to dominate at a competitive level.
                </p>
              </div>
              <div className="w-full h-[350px] md:h-[450px] relative rounded-3xl overflow-hidden bg-zinc-900/40 border border-zinc-800 backdrop-blur-sm hover:border-zinc-700 transition-colors shadow-2xl">
                <CircularGallery
                  bend={isMobile ? 0 : 1}
                  textColor="#ffffff"
                  borderRadius={0.05}
                  scrollSpeed={2}
                  scrollEase={0.025}
                  items={[
                    { image: '/scm1.jpg', text: '' },
                    { image: '/scm2.jpg', text: '' },
                    { image: '/scm3.jpg', text: '' },
                    { image: '/scm4.jpg', text: '' },
                    { image: '/scm5.jpg', text: '' },
                    { image: '/scm6.jpg', text: '' },
                    { image: '/scm7.jpg', text: '' },
                    { image: '/scm8.jpg', text: '' },
                    { image: '/scm9.jpg', text: '' },
                    { image: '/scm10.jpg', text: '' }
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Stepper Flow */}
          <div className="text-center mb-4 space-y-2 scroll-mt-20 md:scroll-mt-24" id="booking">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic">RESERVE YOUR COURT</h2>
            <p className="text-sm md:text-base text-zinc-500 font-medium italic">Three rapid steps to lock in your coaching session.</p>
          </div>

          <div ref={stepperRef}>
          <Stepper
            initialStep={1}
            step={currentStep}
            onStepChange={(step) => setCurrentStep(step)}
            onFinalStepCompleted={handleBooking}
            backButtonText="PREVIOUS"
            nextButtonText={buttonText}
            nextButtonProps={{ disabled: isNextDisabled }}
            disableStepIndicators={true}
          >
            <Step>
              <div className="space-y-4 py-1">
                <h3 className="text-xl font-black text-white tracking-tighter text-center mb-2">1. CHOOSE YOUR PATH</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {sessionTypes.map((session, idx) => {
                    const isSelected = sessionType === session.name;
                    return (
                      <button
                        key={session.name}
                        onClick={() => {
                          setSessionType(session.name);
                          setSelectedDate('');
                          setSelectedTime('');
                          setSelectedDuration(2);
                          setSelectedLocation('');
                        }}
                        className={`group relative p-3 sm:p-4 rounded-xl transition-all duration-500 text-left flex flex-col h-full overflow-hidden ${
                          isSelected
                            ? 'bg-zinc-900 border-2 border-green-400'
                            : 'bg-zinc-900/60 border border-zinc-800 hover:border-green-400/30'
                        }`}
                        style={isSelected ? {
                          boxShadow: '0 0 8px rgba(74,222,128,0.6), 0 0 20px rgba(74,222,128,0.35), 0 0 45px rgba(74,222,128,0.15)'
                        } : {}}
                      >
                        {/* Large number display */}
                        <div className="relative mb-3 overflow-hidden">
                          <span
                            className={`block font-black leading-none tracking-tighter select-none transition-all duration-500 ${
                              isSelected ? 'text-green-400' : 'text-zinc-700 group-hover:text-zinc-600'
                            }`}
                            style={{
                              fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                              fontFamily: 'var(--font-orbitron), monospace',
                              fontVariantNumeric: 'tabular-nums',
                              filter: isSelected
                                ? 'drop-shadow(0 0 3px rgba(74,222,128,0.6)) drop-shadow(0 0 8px rgba(74,222,128,0.3)) drop-shadow(0 0 16px rgba(74,222,128,0.12))'
                                : 'none',
                            }}
                          >
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          {/* Subtle bottom fade on the number */}
                          <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-zinc-900 to-transparent pointer-events-none" />
                        </div>

                        {/* Session name */}
                        <h4 className={`text-sm font-black mb-1 tracking-tight transition-colors leading-tight ${isSelected ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
                          {session.name}
                        </h4>

                        {/* Duration tag */}
                        <p className={`text-[9px] font-black uppercase tracking-widest mb-3 transition-colors ${isSelected ? 'text-green-400/70' : 'text-zinc-600'}`}>
                          {session.duration}
                        </p>

                        {/* Price */}
                        <div className="flex flex-col gap-0.5 mt-auto">
                          <span
                            className={`font-black tracking-tighter italic leading-none transition-all duration-500 ${isSelected ? 'text-green-400' : 'text-green-400/70'}`}
                            style={{ fontSize: 'clamp(1.25rem, 2vw, 1.6rem)' }}
                          >
                            {session.priceAmount}
                          </span>
                          {session.priceDetails.map((detail) => (
                            <span key={detail} className={`text-[9px] font-black uppercase tracking-widest leading-tight transition-colors ${isSelected ? 'text-zinc-400' : 'text-zinc-600'}`}>
                              — {detail}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                {/* Location Selection for Group Sessions */}
                {['2-3 Pax Group', '4-5 Pax Group', '6-7 Pax Group', '8-10 Pax Group'].includes(sessionType) && (
                  !isMobile ? (
                    <div className="mt-6 p-6 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-4">
                      <h4 className="text-sm font-black text-white uppercase tracking-widest text-center">Select Location</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {['Taguig', 'QC / Parañaque'].map((loc) => (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => setSelectedLocation(loc)}
                            className={`py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                              selectedLocation === loc
                                ? 'bg-green-400 text-black shadow-[0_0_20px_rgba(74,222,128,0.3)]'
                                : 'bg-zinc-800/50 border border-zinc-800 text-zinc-400 hover:border-green-400/40'
                            }`}
                          >
                            {loc}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 text-center space-y-4">
                      {selectedLocation ? (
                        <>
                          <div className="text-green-400 font-black text-2xl tracking-tighter italic uppercase">{selectedLocation}</div>
                        </>
                      ) : (
                        <div className="text-zinc-500 font-bold italic py-4">No location selected yet.</div>
                      )}
                      <button onClick={() => setShowMobileLocationModal(true)} className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-sm w-full transition-colors border border-zinc-700">
                        {selectedLocation ? "Change Location" : "Select Location"}
                      </button>
                    </div>
                  )
                )}
              </div>
            </Step>

            {/* STEP 2 */}
            <Step>
              <div className="space-y-4 py-1 w-full max-w-5xl mx-auto">
                <h3 className="text-xl font-black text-white tracking-tighter text-center mb-2">2. AVAILABILITY</h3>
                {!isMobile ? renderBookingUI() : (
                  <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 text-center space-y-4">
                    {selectedDate && selectedTime ? (
                      <>
                        <div className="text-green-400 font-black text-2xl tracking-tighter italic uppercase">{format(new Date(selectedDate), "MMM d, yyyy")} <br/> {selectedTime}</div>
                        <div className="text-zinc-400 font-bold text-sm">Duration: {selectedDuration} hr{selectedDuration > 1 ? 's' : ''}</div>
                      </>
                    ) : (
                      <div className="text-zinc-500 font-bold italic py-4">No schedule selected yet.</div>
                    )}
                    <button onClick={() => setShowMobileBookingModal(true)} className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-sm w-full transition-colors border border-zinc-700">
                      {selectedDate ? "Change Schedule" : "Open Calendar"}
                    </button>
                  </div>
                )}
              </div>
            </Step>

            {/* STEP 3 */}
            <Step>
              <div className="space-y-3 py-1 w-full max-w-3xl mx-auto">
                <h3 className="text-xl font-black text-white tracking-tighter text-center mb-2">3. SECURE YOUR SPOT</h3>
                <form autoComplete="off" onSubmit={(e) => e.preventDefault()} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 backdrop-blur-sm shadow-2xl space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="bk_fn" className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">First Name</label>
                      <input
                        required
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full min-h-[44px] px-4 py-3 bg-zinc-800/30 border border-zinc-800 text-white rounded-xl focus:ring-4 focus:ring-green-400/20 focus:border-green-400 outline-none transition-all placeholder:text-zinc-700 font-bold"
                        placeholder=""
                        id="bk_fn"
                        name="bk_fn"
                        autoComplete="off"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="bk_ln" className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Last Name</label>
                      <input
                        required
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full min-h-[44px] px-4 py-3 bg-zinc-800/30 border border-zinc-800 text-white rounded-xl focus:ring-4 focus:ring-green-400/20 focus:border-green-400 outline-none transition-all placeholder:text-zinc-700 font-bold"
                        placeholder=""
                        id="bk_ln"
                        name="bk_ln"
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="bk_em" className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Email</label>
                    <input
                      required
                      type="text"
                      inputMode="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full min-h-[44px] px-4 py-3 bg-zinc-800/30 border border-zinc-800 text-white rounded-xl focus:ring-4 focus:ring-green-400/20 focus:border-green-400 outline-none transition-all placeholder:text-zinc-700 font-bold"
                      placeholder=""
                      id="bk_em"
                      name="bk_em"
                      autoComplete="off"
                    />
                  </div>

                  {(!sessionType || !selectedDate || !selectedTime) && (
                    <div className="p-3 bg-red-400/10 border border-red-400/20 rounded-xl text-red-400 text-xs font-black uppercase tracking-widest text-center mt-2">
                      ERROR: MISSING PREVIOUS STEP SELECTIONS
                    </div>
                  )}

                  {bookingStatus !== 'idle' && bookingStatus !== 'success' && (
                    <div className="p-3 bg-red-400/10 border border-red-400/20 rounded-xl text-red-400 text-xs font-black uppercase tracking-widest text-center mt-2">
                      ERROR: {bookingStatus}
                    </div>
                  )}
                </form>
              </div>
            </Step>
          </Stepper>
          </div>
        </div>

        <TrackStatus />

        {/* Footer */}
        <footer className="border-t border-zinc-900 bg-black py-12">
          <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-zinc-500 text-sm font-bold">
              © 2026 CMPH Pickleball. All rights reserved.
            </div>
            <div className="flex gap-8">
              <a href="/login" className="text-zinc-800 hover:text-zinc-600 text-[10px] font-black uppercase tracking-widest transition-colors">
                Admin Login
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* MOBILE BOOKING MODAL */}
      <AnimatePresence>
        {isMobile && showMobileBookingModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowMobileBookingModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-[95%] max-w-lg max-h-[90vh] bg-black border border-zinc-800 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex justify-between items-center p-4 sm:p-6 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
                <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Select Schedule</h3>
                <button onClick={() => setShowMobileBookingModal(false)} className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                  <span className="font-black text-lg">✕</span>
                </button>
              </div>
              <div className="flex-1 overflow-hidden relative flex flex-col">
                 {renderBookingUI()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MOBILE LOCATION MODAL */}
      <AnimatePresence>
        {isMobile && showMobileLocationModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowMobileLocationModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-[95%] max-w-lg bg-black border border-zinc-800 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex justify-between items-center p-4 sm:p-6 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
                <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Select Location</h3>
                <button onClick={() => setShowMobileLocationModal(false)} className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                  <span className="font-black text-lg">✕</span>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {['Taguig', 'QC / Parañaque'].map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        setSelectedLocation(loc);
                        setShowMobileLocationModal(false);
                      }}
                      className={`py-6 px-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${
                        selectedLocation === loc
                          ? 'bg-green-400 text-black shadow-[0_0_20px_rgba(74,222,128,0.3)]'
                          : 'bg-zinc-800/50 border border-zinc-800 text-zinc-400 hover:border-green-400/40'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
