import { ActivePage, ServiceRequest } from '../types';
import { Shield, Home as HomeIcon, Eye, Heart, CalendarPlus, Menu, X, ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

interface HeaderProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
}

export default function Header({ activePage, setActivePage }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Availability Dropdown States
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [startDate, setStartDate] = useState<number | null>(null);
  const [endDate, setEndDate] = useState<number | null>(null);
  const [serviceType, setServiceType] = useState<'Overnight' | 'Drop-In'>('Overnight');
  const [requests, setRequests] = useState<ServiceRequest[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync / refresh requests on open or change
  useEffect(() => {
    const loadRequests = () => {
      const stored = localStorage.getItem('plh_service_requests');
      if (stored) {
        try {
          setRequests(JSON.parse(stored));
        } catch (e) {
          console.error('Error fetching plh_service_requests in Header', e);
        }
      }
    };
    loadRequests();
    if (availabilityOpen) {
      loadRequests();
    }
  }, [availabilityOpen]);

  // Handle triggered custom event from Footer or other widgets
  useEffect(() => {
    const handleOpenAvailability = () => {
      setAvailabilityOpen(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('open-availability-check', handleOpenAvailability);
    return () => {
      window.removeEventListener('open-availability-check', handleOpenAvailability);
    };
  }, []);

  const navItems = [
    { id: 'house-watch' as ActivePage, label: 'House Watch', icon: Eye },
    { id: 'pet-care' as ActivePage, label: 'Drop-In Pet Care', icon: Heart },
    { id: 'client-portal' as ActivePage, label: 'Client Portal', icon: Shield },
  ];

  const handleNavClick = (page: ActivePage) => {
    setActivePage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Replicate Admin booking review logic for accurate overnight reservation calculations
  const getDayStatusForRequest = (req: ServiceRequest, day: number, currentMonth: 'June' | 'July'): boolean => {
    if (req.status !== 'Confirmed') return false;
    
    const datesLower = req.travelDates ? req.travelDates.toLowerCase() : '';
    
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

  const checkConflictsInRange = (start: number | null, end: number | null): boolean => {
    if (!start || !end) return false;
    for (let d = start; d <= end; d++) {
      const isBooked = requests.some(r => 
        r.status === 'Confirmed' && 
        r.serviceNeeded !== 'Pet Care Only' && 
        getDayStatusForRequest(r, d, 'June')
      );
      if (isBooked) return true;
    }
    return false;
  };

  const handleNavClickWithClose = (page: ActivePage) => {
    setAvailabilityOpen(false);
    handleNavClick(page);
  };

  return (
    <header 
      id="app-header" 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-md border-b border-brand-plum/10 shadow-sm' 
          : 'bg-white/95 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Brand Name */}
          <div 
            onClick={() => handleNavClickWithClose('home')} 
            className="flex flex-col cursor-pointer group select-none pr-4"
          >
            <span className="font-extrabold text-sm sm:text-base md:text-lg tracking-normal leading-tight group-hover:opacity-90 transition-opacity duration-150">
              <span className="inline-flex items-center gap-1.5 sm:gap-2">
                <span className="text-[#100720]">Peace</span>
                <span className="text-[#9C5B7F]">Love</span>
                <span className="text-[#100720]">Home</span>
                <span className="text-[#9C5B7F] select-none inline-flex items-center justify-center font-extrabold">+</span>
                <span className="text-[#100720]">Pet</span>
                <span className="text-[#100720]">Watch</span>
              </span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2 lg:space-x-4">
            {/* CHECK AVAILABILITY interactive premium helper button */}
            <button
              id="header-check-availability-btn"
              onClick={() => setAvailabilityOpen(!availabilityOpen)}
              className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 border-2 select-none cursor-pointer ${
                availabilityOpen
                  ? 'bg-brand-plum border-brand-plum text-white shadow-md'
                  : 'border-brand-plum/45 text-brand-plum hover:border-brand-plum hover:bg-brand-plum/5'
              }`}
            >
              <CalendarPlus className="w-3.5 h-3.5 text-brand-pink" />
              CHECK AVAILABILITY
            </button>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  id={`nav-item-${item.id}`}
                  key={item.id}
                  onClick={() => handleNavClickWithClose(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 border-b-2 ${
                    isActive
                      ? 'border-brand-plum text-brand-plum'
                      : 'border-transparent text-brand-plum/80 hover:text-brand-plum hover:border-brand-plum/30'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-plum' : 'text-brand-pink'}`} />
                  {item.label}
                </button>
              );
            })}
            
            <button
              id="desktop-cta-btn"
              onClick={() => handleNavClickWithClose('request')}
              className="ml-2 flex items-center justify-center px-6 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#100720] hover:bg-brand-plum-hover text-white shadow-md duration-150 cursor-pointer border-0"
            >
              Say Hello
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-brand-text/90 hover:bg-brand-stone/50 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Reservation time check interactive drop-down calendar panel */}
      {availabilityOpen && (
        <div 
          id="reservation-availability-dropdown"
          className="absolute top-20 left-0 right-0 z-40 bg-[#160a28]/95 backdrop-blur-md shadow-2xl border-b border-[#9C5B7F]/30 text-white animate-in slide-in-from-top-4 duration-300 ease-out origin-top border-t border-white/5 py-8 px-4 sm:px-6 lg:px-8 font-sans max-h-[85vh] overflow-y-auto"
        >
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Calendar Widget Context (Left Column) */}
            <div className="lg:col-span-7 space-y-4 w-full max-w-xl lg:max-w-none mx-auto">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                    <CalendarPlus className="w-5 h-5 text-[#b06f92]" /> 
                    Reservation Time Check
                  </h3>
                  <p className="text-xs text-[#D6C9DF]/80 font-medium">
                    June 2026 Scheduling Calendar
                  </p>
                </div>
                {/* Reset helper */}
                {(startDate || endDate) && (
                  <button 
                    onClick={() => { setStartDate(null); setEndDate(null); }}
                    className="text-[10px] uppercase tracking-wider font-extrabold text-[#D6C9DF] hover:text-white transition-colors border border-white/15 px-2.5 py-1 rounded-md bg-white/5 cursor-pointer"
                  >
                    Reset Dates
                  </button>
                )}
              </div>

              {/* Day Headings Row */}
              <div className="grid grid-cols-7 text-center text-xs font-black text-[#D6C9DF]/50 truncate select-none border-b border-white/5 pb-2 gap-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                  <span key={`dropdown-h-${idx}`}>{day}</span>
                ))}
              </div>

              {/* Day Cells Grid */}
              <div className="grid grid-cols-7 gap-2">
                {(() => {
                  const cells = [];
                  const startOffset = 1; // Mon
                  const totalDays = 30;

                  for (let i = 0; i < startOffset; i++) {
                    cells.push(
                      <div 
                        key={`drop-empty-${i}`} 
                        className="aspect-square bg-white/2 opacity-20 rounded-lg select-none" 
                      />
                    );
                  }

                  for (let d = 1; d <= totalDays; d++) {
                    const isBookedOvernight = requests.some(r => 
                      r.serviceNeeded !== 'Pet Care Only' && 
                      getDayStatusForRequest(r, d, 'June')
                    );

                    const isSelected = d === startDate || d === endDate;
                    const inRange = startDate !== null && endDate !== null && d > startDate && d < endDate;

                    cells.push(
                      <button
                        key={`drop-day-${d}`}
                        onClick={() => {
                          if (startDate === null || endDate !== null) {
                            setStartDate(d);
                            setEndDate(null);
                          } else {
                            if (d < startDate) {
                              setStartDate(d);
                            } else {
                              setEndDate(d);
                            }
                          }
                        }}
                        className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold relative transition-all duration-200 border cursor-pointer ${
                          isSelected 
                            ? 'bg-brand-pink border-transparent text-white scale-[1.05] shadow-md z-10 font-black'
                            : inRange
                              ? 'bg-[#9C5B7F]/35 text-white border-[#9C5B7F]/40'
                              : isBookedOvernight
                                ? 'bg-purple-950/40 text-[#D6C9DF]/30 border-purple-900/40'
                                : 'bg-white/5 border-white/5 hover:border-[#D6C9DF]/50 text-[#D6C9DF]'
                        }`}
                      >
                        <span className="leading-none z-10">{d}</span>
                        {isBookedOvernight && (
                          <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelected || inRange ? 'bg-white' : 'bg-[#9C5B7F]'} block`} />
                        )}
                      </button>
                    );
                  }
                  return cells;
                })()}
              </div>

              {/* Grid Legend labels */}
              <div className="flex flex-wrap gap-4 items-center justify-start text-[10px] text-[#D6C9DF]/65 font-semibold select-none pt-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-purple-950/40 border border-purple-900/40" /> Booked Overnight Slot
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#100720] border border-white/5" /> Open Date
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-brand-pink" /> Your Selection Range
                </span>
              </div>
            </div>

            {/* Verification Console Module (Right Column) */}
            <div className="lg:col-span-5 space-y-6 bg-[#1a0b32]/50 border border-[#9C5B7F]/20 p-6 sm:p-8 rounded-2xl max-w-xl lg:max-w-none mx-auto w-full">
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider">
                  Parameters & Live Status
                </h4>
                <p className="text-xs text-[#D6C9DF]/80 font-medium">
                  Select your travel details to validate openings.
                </p>
              </div>

              {/* Service Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#D6C9DF] uppercase tracking-wider">
                  Service Level Type:
                </label>
                <div className="relative w-full">
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value as 'Overnight' | 'Drop-In')}
                    className="w-full bg-[#100720]/85 border border-[#9C5B7F]/25 rounded-xl pl-4 pr-10 py-3 text-xs text-white focus:outline-none focus:border-[#9C5B7F] cursor-pointer font-extrabold appearance-none select-none"
                  >
                    <option value="Overnight" className="bg-[#1a0b32] text-white">☀️ Overnight Home & Pet Watch</option>
                    <option value="Drop-In" className="bg-[#1a0b32] text-white">🐈 Daytime Drop-In Pet Support Only</option>
                  </select>
                  <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-white/70">
                    <ChevronDown className="w-4 h-4 text-[#b06f92]" strokeWidth={2.5} />
                  </div>
                </div>
              </div>

              {/* Booking Target display */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#D6C9DF] uppercase tracking-wider">
                  Reservation Dates:
                </label>
                <div className="bg-[#100720]/90 rounded-xl p-3.5 border border-white/5 text-center">
                  {startDate ? (
                    <span className="text-xs font-black text-[#FDF8FB]">
                      June {startDate} {endDate ? `– June ${endDate}, 2026` : ' (Please pick End Date)'}
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-[#D6C9DF]/40 italic">
                      Tap calendar cells to build date span
                    </span>
                  )}
                </div>
              </div>

              {/* Interactive validations output */}
              <div className="pt-2">
                {(() => {
                  if (startDate && endDate) {
                    const hasConflict = checkConflictsInRange(startDate, endDate) && serviceType === 'Overnight';

                    if (hasConflict) {
                      return (
                        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-4 animate-in fade-in slide-in-from-bottom-1 duration-200">
                          <div className="space-y-1">
                            <h5 className="text-[11px] font-black text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
                              ⚠️ Overnight Blocked
                            </h5>
                            <p className="text-xs font-semibold text-amber-100/90 leading-relaxed">
                              One or more of these dates conflict with a reserved overnight block. However, we have full availability for Daytime Drop-In Pet Support!
                            </p>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-2 pt-1">
                            <button
                              onClick={() => setServiceType('Drop-In')}
                              className="flex-1 text-[10px] font-black uppercase py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-[#100720] rounded-lg transition-all border-0 cursor-pointer"
                            >
                              Check Drop-In
                            </button>
                            <button
                              onClick={() => {
                                handleNavClick('pet-care');
                                setAvailabilityOpen(false);
                              }}
                              className="flex-1 text-[10px] font-black uppercase py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/10 cursor-pointer"
                            >
                              View Drop-In Rules
                            </button>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl space-y-4 animate-in fade-in slide-in-from-bottom-1 duration-200">
                          <div className="space-y-1">
                            <h5 className="text-[11px] font-black text-emerald-300 uppercase tracking-widest flex items-center gap-1.5">
                              ✅ Slot is Clear!
                            </h5>
                            <p className="text-xs font-semibold text-emerald-100/90 leading-relaxed">
                              June {startDate} – {endDate} is fully open for your custom <strong>{serviceType}</strong> service.
                            </p>
                          </div>

                          <button
                            onClick={() => {
                              localStorage.setItem('plh_preselected_dates', `June ${startDate} - June ${endDate}, 2026`);
                              localStorage.setItem('plh_preselected_service', serviceType);
                              handleNavClick('request');
                              setAvailabilityOpen(false);
                            }}
                            className="w-full text-center py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-[#100720] text-xs font-black uppercase tracking-wider rounded-lg transition-all shadow-md border-0 cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            Secure Block Now <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    }
                  } else if (startDate) {
                    return (
                      <div className="text-center p-3.5 border border-white/5 bg-[#100720]/40 rounded-xl">
                        <p className="text-[11px] font-semibold text-[#D6C9DF]/80">
                          Now select an <strong>End Date</strong> on the calendar grid to validate available blocks.
                        </p>
                      </div>
                    );
                  } else {
                    return (
                      <div className="text-center p-3.5 border border-white/5 bg-[#100720]/40 rounded-xl">
                        <p className="text-[11px] font-semibold text-[#D6C9DF]/80">
                          Select first date and second date to review reservation status.
                        </p>
                      </div>
                    );
                  }
                })()}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div 
          id="mobile-navigation-drawer" 
          className="absolute top-20 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-md border-b-0 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 ease-out origin-top"
        >
          <div className="px-4 pt-3 pb-8 space-y-1 sm:px-6">
            {/* Mobile CHECK AVAILABILITY item */}
            <button
              id="mobile-nav-check-availability"
              onClick={() => {
                setAvailabilityOpen(!availabilityOpen);
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-3.5 w-full px-4 py-3 rounded-xl text-left text-sm font-bold uppercase tracking-wider transition-all duration-150 border-l-4 ${
                availabilityOpen
                  ? 'bg-[#9C5B7F]/10 text-brand-plum font-extrabold border-[#9C5B7F]'
                  : 'text-brand-plum hover:bg-[#100720]/2 hover:text-brand-plum border-transparent'
              }`}
            >
              <CalendarPlus className="w-4 h-4 text-brand-pink" />
              CHECK AVAILABILITY
            </button>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  id={`mobile-nav-${item.id}`}
                  key={item.id}
                  onClick={() => handleNavClickWithClose(item.id)}
                  className={`flex items-center gap-3.5 w-full px-4 py-3 rounded-xl text-left text-sm font-bold uppercase tracking-wider transition-all duration-150 border-l-4 ${
                    isActive
                      ? 'bg-[#100720]/5 text-brand-plum border-brand-plum font-extrabold'
                      : 'text-brand-plum hover:bg-[#100720]/2 hover:text-brand-plum border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 text-brand-pink" />
                  {item.label}
                </button>
              );
            })}
            <div className="pt-4 px-4 border-t border-brand-plum/10 mt-4 flex justify-center">
              <button
                id="mobile-cta-btn"
                onClick={() => handleNavClickWithClose('request')}
                className="flex items-center justify-center w-full max-w-[280px] py-3.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#100720] hover:bg-brand-plum-hover text-white shadow-md cursor-pointer border-0 transition-all duration-200 active:scale-95 active:translate-y-0"
              >
                Say Hello
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
