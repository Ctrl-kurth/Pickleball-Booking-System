"use client";

import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { Calendar, Clock, Star, Award, Users, Mail, Phone, Zap, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import Navbar from '@/components/Navbar';

export default function App() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [sessionType, setSessionType] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'success' | string>('idle');
  const [statusEmail, setStatusEmail] = useState('');
  const [checkingResult, setCheckingResult] = useState<any[] | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const availableTimes = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  const sessionTypes = [
    { name: 'Private Lesson', duration: 'Hourly Rate', price: '$75/hr', rawPrice: 75, icon: Users },
    { name: 'Group Session', duration: 'Hourly Rate', price: '$40/hr', rawPrice: 40, icon: Users },
    { name: 'Beginner Package', duration: '4 sessions', price: '$260', rawPrice: 260, icon: TrendingUp },
  ];

  const stats = [
    { label: 'Students Coached', value: '200+' },
    { label: 'Years Experience', value: '10+' },
    { label: 'Success Rate', value: '98%' },
  ];

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setBookingStatus('idle');

    try {
      const mockCoachId = "60d5ecb862b80a1c1c8e8e8e"; 
      const startTime = new Date(`${selectedDate} ${selectedTime}`);
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

  const checkStatus = async () => {
    if (!statusEmail) return;
    setIsChecking(true);
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const allBookings = await res.json();
        const userBookings = allBookings.filter((b: any) => b.clientEmail.toLowerCase() === statusEmail.toLowerCase());
        setCheckingResult(userBookings);
      }
    } catch (error) {
      console.error("Checking failed", error);
    } finally {
      setIsChecking(false);
    }
  };

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
          <p className="text-gray-400 leading-relaxed font-medium">We've received your booking request. Coach Marvin is reviewing the schedule. You will see an update in the status tracker once it is officially locked in.</p>
          <button 
            onClick={() => {
              setBookingStatus('idle');
              setSessionType('');
              setSelectedDate('');
              setSelectedTime('');
            }}
            className="w-full bg-green-400 text-black py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-green-300 transition-all hover:scale-[1.02]"
          >
            Back to Court
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="size-full overflow-auto bg-black selection:bg-green-400 selection:text-black">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-screen w-full overflow-hidden">
        <ImageWithFallback
          src="/pb1.jpg"
          alt="Pickleball collective"
          className="w-full h-full object-cover opacity-70 brightness-[1.05] contrast-[1.1] transition-opacity duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/10 to-black flex items-center">
          <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
            <div className="inline-flex items-center gap-2 mb-6 px-5 py-2 rounded-full border border-green-400/20 bg-green-400/5 backdrop-blur-sm">
              <Award className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-xs font-black tracking-[0.2em] uppercase">USAPA Certified Pro</span>
            </div>
            <h1 className="text-8xl md:text-[10rem] font-black text-white mb-6 tracking-tighter leading-[0.85]">
              COACH<br/>
              <span className="text-green-400 italic">MARVIN</span>
            </h1>
            <p className="text-2xl md:text-3xl text-gray-400 mb-12 max-w-2xl font-medium tracking-tight">
              Master the court with personalized training from a championship coach.
            </p>
            <div className="flex flex-wrap gap-12 mb-16">
              {stats.map((stat) => (
                <div key={stat.label} className="group">
                  <div className="text-5xl font-black text-green-400 mb-1 tracking-tighter italic">{stat.value}</div>
                  <div className="text-xs text-gray-500 uppercase font-black tracking-[0.3em]">{stat.label}</div>
                  <div className="h-0.5 w-0 group-hover:w-full bg-green-400 transition-all duration-300 mt-1" />
                </div>
              ))}
            </div>
            <a
              href="#booking"
              className="inline-flex items-center gap-3 px-10 py-5 bg-green-400 text-black rounded-full text-xl font-black tracking-widest uppercase hover:bg-green-300 transition-all hover:scale-110 shadow-[0_0_50px_rgba(74,222,128,0.3)] hover:shadow-[0_0_70px_rgba(74,222,128,0.5)] active:scale-95"
            >
              <Zap className="w-6 h-6 fill-current" />
              Book Session
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-32" id="booking">
        {/* Session Types */}
        <div className="mb-32">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-6xl md:text-7xl font-black text-white tracking-tighter">CHOOSE YOUR PATH</h2>
            <p className="text-xl text-zinc-500 font-medium italic">Tailored training programs for every skill level.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sessionTypes.map((session) => {
              const Icon = session.icon;
              return (
                <button
                  key={session.name}
                  onClick={() => setSessionType(session.name)}
                  className={`group relative p-10 rounded-3xl transition-all duration-500 overflow-hidden ${
                    sessionType === session.name
                      ? 'bg-gradient-to-br from-green-400/20 to-green-400/5 border-2 border-green-400 shadow-[0_0_50px_rgba(74,222,128,0.15)]'
                      : 'bg-zinc-900/40 border border-zinc-800 hover:border-green-400/40 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-8 transition-all duration-500 ${
                    sessionType === session.name
                      ? 'bg-green-400 text-black scale-110 rotate-3'
                      : 'bg-zinc-800/50 text-green-400 group-hover:bg-green-400 group-hover:text-black group-hover:scale-110'
                  }`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className={`text-2xl font-black mb-2 tracking-tight transition-colors ${sessionType === session.name ? 'text-white' : 'text-zinc-200'}`}>{session.name}</h3>
                  <p className="text-zinc-500 font-bold text-sm mb-6 uppercase tracking-widest">{session.duration}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-green-400 tracking-tighter italic">{session.price}</span>
                  </div>
                  
                  {sessionType === session.name && (
                    <div className="absolute top-6 right-6">
                      <div className="w-8 h-8 rounded-full bg-green-400 flex items-center justify-center shadow-[0_0_20px_rgba(74,222,128,0.5)]">
                        <CheckCircle2 className="w-5 h-5 text-black" strokeWidth={3} />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          {/* Left Column - About & Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-10 backdrop-blur-sm hover:border-zinc-700 transition-colors">
              <h2 className="text-3xl font-black mb-8 text-white tracking-tighter italic">THE PROFILE</h2>
              <div className="relative group overflow-hidden rounded-2xl mb-8">
                <ImageWithFallback
                  src="/pb3.jpg"
                  alt="Coach Marvin Profile"
                  className="w-full h-80 object-cover transform transition-transform duration-[2s] group-hover:scale-110 opacity-90 brightness-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
              </div>
              <p className="text-zinc-400 mb-10 leading-relaxed font-medium text-lg italic">
                &quot;With over 10 years of competitive experience, I don&apos;t just teach the game; I teach the winning mindset.&quot;
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-5 p-5 rounded-2xl bg-zinc-800/20 border border-zinc-800/50 hover:bg-zinc-800/40 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-green-400/10 flex items-center justify-center flex-shrink-0 text-green-400 shadow-inner">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-black text-white text-xs uppercase tracking-[0.2em] mb-1">Elite Status</div>
                    <div className="text-sm text-zinc-400 font-bold">USAPA Level II, PTR Professional</div>
                  </div>
                </div>
                <div className="flex items-start gap-5 p-5 rounded-2xl bg-zinc-800/20 border border-zinc-800/50 hover:bg-zinc-800/40 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-green-400/10 flex items-center justify-center flex-shrink-0 text-green-400 shadow-inner">
                    <Star className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-black text-white text-xs uppercase tracking-[0.2em] mb-1">Core Mastery</div>
                    <div className="text-sm text-zinc-400 font-bold">Dinking, Serves, Mental Fortitude</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-10 backdrop-blur-sm">
              <h3 className="text-2xl font-black mb-8 text-white tracking-tighter">CONNECT</h3>
              <div className="space-y-4">
                <a href="mailto:coach@marvin.com" className="flex items-center gap-5 p-5 rounded-2xl bg-zinc-800/20 hover:bg-green-400 hover:text-black transition-all group font-bold">
                  <div className="w-12 h-12 rounded-xl bg-green-400/10 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                    <Mail className="w-6 h-6 text-green-400 group-hover:text-black" />
                  </div>
                  <span className="tracking-tight">coach@marvin.com</span>
                </a>
                <a href="tel:+15551234567" className="flex items-center gap-5 p-5 rounded-2xl bg-zinc-800/20 hover:bg-green-400 hover:text-black transition-all group font-bold">
                  <div className="w-12 h-12 rounded-xl bg-green-400/10 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                    <Phone className="w-6 h-6 text-green-400 group-hover:text-black" />
                  </div>
                  <span className="tracking-tight">(555) 123-4567</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Booking */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-10 backdrop-blur-sm shadow-2xl">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 rounded-2xl bg-green-400/10 flex items-center justify-center shadow-inner">
                  <Calendar className="w-7 h-7 text-green-400" />
                </div>
                <h2 className="text-4xl font-black text-white tracking-tighter italic text-shadow-glow">AVAILABILITY</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <label className="block text-xs font-black text-zinc-500 uppercase tracking-[0.3em] mb-4">Pick a Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-6 py-5 bg-zinc-800/40 border border-zinc-800 text-white text-xl font-black rounded-2xl focus:ring-4 focus:ring-green-400/20 focus:border-green-400 transition-all outline-none"
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-black text-zinc-500 uppercase tracking-[0.3em] mb-4">Select Slot</label>
                  <div className="grid grid-cols-2 gap-3">
                    {availableTimes.map((time) => (
                      <button
                        type="button"
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-4 px-6 rounded-2xl font-black transition-all duration-300 transform ${
                          selectedTime === time
                            ? 'bg-green-400 text-black shadow-[0_0_30px_rgba(74,222,128,0.4)] scale-105 italic'
                            : 'bg-zinc-800/30 border border-zinc-800 text-zinc-400 hover:border-green-400/40 hover:bg-zinc-800'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Duration Picker */}
                <div className="md:col-span-2 space-y-4 pt-6 border-t border-zinc-800/50 mt-4">
                  <label className="block text-xs font-black text-zinc-500 uppercase tracking-[0.3em] mb-4">Select Duration {sessionType && !sessionType.includes('Package') && '(Hours)'}</label>
                  {!sessionType ? (
                     <div className="py-4 px-6 rounded-2xl bg-zinc-800/20 border border-zinc-800 text-zinc-500 font-bold text-center">
                       Select a Session Type to unlock duration formatting
                     </div>
                  ) : sessionType.includes('Package') ? (
                    <div className="py-4 px-6 rounded-2xl bg-zinc-800/20 border border-zinc-800 text-green-400/80 font-bold text-center border-dashed">
                      Duration is pre-configured for the Package Path
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {[1, 1.5, 2, 2.5, 3].map((dur) => (
                        <button
                          type="button"
                          key={dur}
                          onClick={() => setSelectedDuration(dur)}
                          className={`flex-1 py-4 px-4 rounded-2xl font-black transition-all duration-300 transform ${
                            selectedDuration === dur
                              ? 'bg-green-400 text-black shadow-[0_0_30px_rgba(74,222,128,0.4)] scale-105 italic'
                              : 'bg-zinc-800/30 border border-zinc-800 text-zinc-400 hover:border-green-400/40 hover:bg-zinc-800'
                          }`}
                        >
                          {dur} {dur === 1 ? 'hr' : 'hrs'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-10 backdrop-blur-sm">
              <h2 className="text-3xl font-black mb-10 text-white tracking-tighter">SECURE YOUR SPOT</h2>
              <form onSubmit={handleBooking} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-xs font-black text-zinc-500 uppercase tracking-[0.3em]">Player First Name</label>
                    <input
                      required
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-6 py-5 bg-zinc-800/30 border border-zinc-800 text-white rounded-2xl focus:ring-4 focus:ring-green-400/20 focus:border-green-400 outline-none transition-all placeholder:text-zinc-700 font-bold"
                      placeholder="JOHN"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-xs font-black text-zinc-500 uppercase tracking-[0.3em]">Player Last Name</label>
                    <input
                      required
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-6 py-5 bg-zinc-800/30 border border-zinc-800 text-white rounded-2xl focus:ring-4 focus:ring-green-400/20 focus:border-green-400 outline-none transition-all placeholder:text-zinc-700 font-bold"
                      placeholder="DOE"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <label className="block text-xs font-black text-zinc-500 uppercase tracking-[0.3em]">Contact Email</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-6 py-5 bg-zinc-800/30 border border-zinc-800 text-white rounded-2xl focus:ring-4 focus:ring-green-400/20 focus:border-green-400 outline-none transition-all placeholder:text-zinc-700 font-bold"
                    placeholder="CHAMP@PRO.COM"
                  />
                </div>

                <div className="space-y-4 pt-10 border-t border-zinc-800">
                  {bookingStatus !== 'idle' && bookingStatus !== 'success' && (
                    <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-xl text-red-400 text-sm font-black uppercase tracking-widest text-center">
                      ERROR: {bookingStatus}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={!sessionType || !selectedDate || !selectedTime || isSubmitting}
                    className="group relative w-full overflow-hidden bg-green-400 text-black py-6 rounded-2xl font-black uppercase tracking-[0.4em] hover:bg-green-300 transition-all disabled:opacity-5 disabled:cursor-not-allowed text-xl shadow-[0_0_50px_rgba(74,222,128,0.2)] active:scale-95"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      <Zap className="w-6 h-6 fill-current" />
                      {isSubmitting ? 'INITIATING...' : 'CONFIRM RESERVATION'}
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                  </button>
                  <p className="text-center text-zinc-600 font-black text-[10px] uppercase tracking-[0.3em]">
                    By clicking you agree to championship terms & conditions.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Status Checker Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-32 border-t border-zinc-900">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-5xl font-black text-white tracking-tighter mb-6 uppercase italic">Track Your Status</h2>
            <p className="text-zinc-500 text-lg font-medium leading-relaxed max-w-md">
              Enter your registration email to view your booking status and any system messages from Coach Marvin.
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl space-y-6">
            <div className="flex gap-4">
              <input 
                type="email"
                value={statusEmail}
                onChange={(e) => setStatusEmail(e.target.value)}
                placeholder="YOUR REGISTRATION EMAIL"
                className="flex-1 px-6 py-4 bg-black border border-zinc-800 rounded-2xl text-white font-bold outline-none focus:border-green-400 transition-colors"
              />
              <button 
                onClick={checkStatus}
                disabled={isChecking}
                className="px-8 bg-zinc-800 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-green-400 hover:text-black transition-all"
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
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-black py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-zinc-500 text-sm font-bold">
            © 2026 CMA Pickleball. All rights reserved.
          </div>
          <div className="flex gap-8">
            <a href="/login" className="text-zinc-800 hover:text-zinc-600 text-[10px] font-black uppercase tracking-widest transition-colors">
              Admin Login
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
