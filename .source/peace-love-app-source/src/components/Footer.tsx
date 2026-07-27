import { useEffect, useState } from 'react';
import { ActivePage, ServiceRequest } from '../types';

interface FooterProps {
  setActivePage: (page: ActivePage) => void;
}

export default function Footer({ setActivePage }: FooterProps) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);

  useEffect(() => {
    // Dynamically retrieve current scheduling bookings from Admin Portal's synchronization container
    const stored = localStorage.getItem('plh_service_requests');
    if (stored) {
      try {
        setRequests(JSON.parse(stored));
      } catch (e) {
        console.error('Error fetching plh_service_requests inside Footer calendar', e);
      }
    }
  }, []);

  const handleNavClick = (page: ActivePage) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Replicate Admin booking review logic for accurate overnight reservation calculations
  const getDayStatusForRequest = (req: ServiceRequest, day: number, currentMonth: 'June' | 'July'): boolean => {
    if (req.status !== 'Confirmed') return false;
    
    const datesLower = req.travelDates.toLowerCase();
    
    // Ensure the month matches
    const monthMentioned = datesLower.includes(currentMonth.toLowerCase());
    if (!monthMentioned) return false;
    
    const hasJune = datesLower.includes('june');
    const hasJuly = datesLower.includes('july');
    
    const numbers = datesLower.match(/\d+/g)?.map(Number) || [];
    const dayNumbers = numbers.filter(n => n >= 1 && n <= 31);
    if (dayNumbers.length === 0) return false;
    
    // Single month scenario
    if (!(hasJune && hasJuly)) {
      const startDay = dayNumbers[0];
      const endDay = dayNumbers.length >= 2 ? dayNumbers[1] : startDay;
      return day >= startDay && day <= endDay;
    }
    
    // Multi-month scenario (such as "June 28 - July 5")
    const parts = datesLower.split('-');
    if (parts.length === 2) {
      const startPart = parts[0];
      const endPart = parts[1];
      
      const startNums = startPart.match(/\d+/g)?.map(Number).filter(n => n >= 1 && n <= 31) || [];
      const endNums = endPart.match(/\d+/g)?.map(Number).filter(n => n >= 1 && n <= 31) || [];
      
      if (startNums.length > 0 && endNums.length > 0) {
        const startDay = startNums[0];
        const endDay = endNums[0];
        
        if (currentMonth === 'June' && startPart.includes('june')) {
          return day >= startDay;
        }
        if (currentMonth === 'July' && endPart.includes('july')) {
          return day <= endDay;
        }
      }
    }
    
    const startDay = dayNumbers[0];
    const endDay = dayNumbers.length >= 2 ? dayNumbers[1] : startDay;
    return day >= startDay && day <= endDay;
  };

  // June 2026 Starts on a Monday (Offset: 1 cell because Sunday is index 0)
  const totalDays = 30;
  const startOffset = 1;

  const renderCalendarCells = () => {
    const cells = [];
    
    // Empty cells offset at the start of the week
    for (let i = 0; i < startOffset; i++) {
      cells.push(
        <div 
          key={`footer-empty-${i}`} 
          className="w-6 h-6 sm:w-7 sm:h-7 opacity-30 select-none bg-[#100720]/10 rounded" 
        />
      );
    }
    
    // Evaluate and construct active calendar days 
    for (let d = 1; d <= totalDays; d++) {
      // Overnight block confirmed lookup matching the Admin's booking configuration matrix
      const isOvernight = requests.some(r => 
        r.serviceNeeded !== 'Pet Care Only' && 
        getDayStatusForRequest(r, d, 'June')
      );

      cells.push(
        <div
          id={`footer-calcell-day-${d}`}
          key={`footer-day-${d}`}
          title={isOvernight ? "Reserved Overnight Stay" : "Available / Open Booking Block"}
          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md flex flex-col items-center justify-center text-[9px] font-bold transition-all select-none border relative ${
            isOvernight
              ? 'bg-[#9C5B7F] text-white border-transparent shadow-xs font-black'
              : 'border-white/10 text-[#D6C9DF] hover:border-[#D6C9DF]/50 bg-white/5'
          }`}
        >
          <span>{d}</span>
          {isOvernight && (
            <span className="absolute bottom-[2px] w-[3px] h-[3px] rounded-full bg-white block animate-pulse" />
          )}
        </div>
      );
    }
    return cells;
  };

  return (
    <footer id="app-footer" className="bg-[#1a0b2e] text-white border-t border-white/10 font-sans">
      <div className="max-w-7xl mx-auto px-8 py-16 sm:py-20 sm:px-10 lg:px-12">
        
        {/* Responsive Layout Grid - perfectly aligned top edges (items-start) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16 items-start">
          
          {/* Column 1 Layer: Stacked as custom flex on tablet, behaves as direct grid cells on desktop */}
          <div className="flex flex-col gap-6 lg:contents">
            
            {/* Column 1: Brand & Consolidated Value Statement (Left Side) */}
            <div id="footer-col-brand" className="space-y-6 flex flex-col justify-start items-start">
              <h3 className="font-extrabold text-white text-base md:text-lg select-none leading-none tracking-normal">
                <span className="inline-flex items-center gap-1.5 sm:gap-2">
                  <span className="text-white">Peace</span>
                  <span className="text-[#9C5B7F]">Love</span>
                  <span className="text-white">Home</span>
                  <span className="text-[#9C5B7F] select-none inline-flex items-center justify-center font-extrabold text-lg" aria-hidden="true">+</span>
                  <span className="text-white">Pet</span>
                  <span className="text-white">Watch</span>
                </span>
              </h3>
              
              <p className="text-sm leading-relaxed max-w-sm font-medium text-[#D6C9DF]">
                Locally owned, bonded, and trusted. Helping homeowners travel with a little more peace of mind by providing reliable property check-ins and premium companion animal sitting in Rapid City and the Black Hills.
              </p>
            </div>

            {/* Column 2: Quick Links Navigation (Center) */}
            <div id="footer-col-links" className="space-y-5 flex flex-col justify-start items-start">
              <h4 className="text-xs md:text-sm font-extrabold text-white uppercase tracking-wider select-none">
                QUICK LINKS
              </h4>
              <div className="flex flex-col space-y-3">
                {[
                  { id: 'home' as ActivePage, label: 'Home / Overview' },
                  { id: 'house-watch' as ActivePage, label: 'House Watch' },
                  { id: 'pet-care' as ActivePage, label: 'Drop-In Pet Care' },
                  { id: 'request' as ActivePage, label: 'Vacation Block' },
                ].map((link) => (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className="text-left group cursor-pointer text-sm font-medium tracking-wide transition-colors border-0 bg-transparent p-0 leading-tight"
                  >
                    <span className="text-[#D6C9DF] group-hover:text-white transition-colors">
                      {link.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Column 3: Live Reservation Availability Calendar (Right Side) */}
          <div id="footer-col-calendar" className="space-y-5 flex flex-col justify-start items-start">
            <h4 className="text-xs md:text-sm font-extrabold text-white uppercase tracking-wider select-none">
              LIVE AVAILABILITY
            </h4>
            
            {/* Live Availability Mini-Widget framed beautifully in the new Dark Purple aesthetics */}
            <div className="bg-[#100720]/45 p-3.5 rounded-2xl border border-white/5 space-y-3 w-full max-w-[240px]">
              <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-[#D6C9DF]">
                <span>June 2026</span>
                <span className="text-[9px] bg-[#9C5B7F]/20 text-[#D6C9DF] rounded px-1.5 py-0.5 font-extrabold tracking-wide select-none">
                  Live View
                </span>
              </div>
              
              {/* Day Abbreviations */}
              <div className="grid grid-cols-7 text-center text-[9px] font-extrabold text-white/30 truncate select-none border-b border-white/5 pb-1 gap-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                  <span key={`f-heading-${idx}`}>{day}</span>
                ))}
              </div>
              
              {/* Loaded Day Grid */}
              <div className="grid grid-cols-7 gap-1">
                {renderCalendarCells()}
              </div>
              
              {/* Tiny Calendar Legend */}
              <div className="flex justify-between items-center text-[9px] text-[#D6C9DF]/60 font-semibold select-none pt-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-xs bg-[#9C5B7F]" /> Booked Stay
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-xs border border-white/10 bg-white/5" /> Open
                </span>
              </div>
            </div>

            {/* Premium navigation pill action linking smoothly to the Vacation Block form */}
            <button
              id="btn-footer-check-dates"
              onClick={() => {
                setActivePage('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('open-availability-check'));
                }, 150);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#9C5B7F] hover:bg-[#b06f92] px-4 py-2 rounded-full transition-all shadow-xs hover:shadow-md cursor-pointer border-0 select-none animate-pulse hover:animate-none"
            >
              Check Your Dates →
            </button>
          </div>

        </div>

        {/* Separated centered Copyright & Compliance banner */}
        <div id="footer-compliance-row" className="mt-16 pt-8 border-t border-white/10 text-center bg-transparent">
          <p className="text-xs text-white/55 leading-relaxed font-semibold bg-transparent select-none">
            © 2026 Peace Love Home + Pet Watch operates under The Giedd Group LLC. All rights reserved.
          </p>
          <div className="flex justify-center mt-2.5">
            <button
              onClick={() => handleNavClick('admin')}
              className="text-[10px] text-white/20 hover:text-[#9C5B7F] font-bold uppercase tracking-wider transition-colors cursor-pointer select-none bg-transparent border-0 p-0"
              title="Staff Administration Access"
            >
              Jamie's Portal
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
