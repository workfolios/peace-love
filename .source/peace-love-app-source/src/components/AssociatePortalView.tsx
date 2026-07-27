import { useState, useEffect } from 'react';
import { ActivePage, Associate } from '../types';
import { ArrowLeft, CheckCircle2, ShieldCheck, Calendar, Clock, Contact2, Bell, Check, Plus, Trash2 } from 'lucide-react';

interface AssociatePortalViewProps {
  setActivePage: (page: ActivePage) => void;
}

export default function AssociatePortalView({ setActivePage }: AssociatePortalViewProps) {
  const [activeAssociateUser, setActiveAssociateUser] = useState<Associate | null>(null);
  
  // Application Form States
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [bgCheckConsent, setBgCheckConsent] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');

  // Dashboard state
  const [selectedMonth, setSelectedMonth] = useState('2026-06');
  
  useEffect(() => {
    // Check if we have a simulated logged in associate session
    const session = localStorage.getItem('plh_associate_session');
    if (session) {
      const stored = localStorage.getItem('plh_associates');
      if (stored) {
        try {
          const associates: Associate[] = JSON.parse(stored);
          const user = associates.find(a => a.id === session);
          if (user) setActiveAssociateUser(user);
        } catch(e) {}
      }
    }
  }, []);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formPhone || !bgCheckConsent) {
      alert("Please complete all fields and consent to the background check.");
      return;
    }

    const newAssociate: Associate = {
      id: `assoc-${Date.now()}`,
      name: formName,
      email: formEmail,
      phone: formPhone,
      status: 'Pending Review',
      backgroundChecked: false,
      joinedAt: new Date().toISOString().split('T')[0],
      availableDates: []
    };

    const stored = localStorage.getItem('plh_associates');
    let associates: Associate[] = [];
    if (stored) {
      try { associates = JSON.parse(stored); } catch(e) {}
    }
    
    associates.push(newAssociate);
    localStorage.setItem('plh_associates', JSON.stringify(associates));
    localStorage.setItem('plh_associate_session', newAssociate.id);
    setActiveAssociateUser(newAssociate);
    window.dispatchEvent(new Event('plh-associates-update'));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const stored = localStorage.getItem('plh_associates');
    if (stored) {
      try {
        const associates: Associate[] = JSON.parse(stored);
        const user = associates.find(a => a.email.toLowerCase() === loginEmail.toLowerCase());
        if (user) {
          localStorage.setItem('plh_associate_session', user.id);
          setActiveAssociateUser(user);
          window.dispatchEvent(new Event('plh-associates-update'));
        } else {
          alert('No associated account found for this email. Please apply first.');
        }
      } catch(e) {}
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('plh_associate_session');
    setActiveAssociateUser(null);
  };

  const handleToggleDate = (dateStr: string) => {
    if (!activeAssociateUser) return;
    
    const updatedUser = { ...activeAssociateUser };
    if (updatedUser.availableDates.includes(dateStr)) {
      updatedUser.availableDates = updatedUser.availableDates.filter(d => d !== dateStr);
    } else {
      updatedUser.availableDates.push(dateStr);
    }
    
    setActiveAssociateUser(updatedUser);

    // Save to global list
    const stored = localStorage.getItem('plh_associates');
    if (stored) {
      try {
        let associates: Associate[] = JSON.parse(stored);
        associates = associates.map(a => a.id === updatedUser.id ? updatedUser : a);
        localStorage.setItem('plh_associates', JSON.stringify(associates));
        window.dispatchEvent(new Event('plh-associates-update'));
      } catch(e) {}
    }
  };

  const generateDaysInMonth = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = String(i + 1).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });
  };

  return (
    <div className="bg-[#150724] min-h-screen pt-4 pb-20 font-sans">
      
      {/* Top Banner */}
      <div className="px-4 py-8 border-b border-white/10 text-center relative max-w-4xl mx-auto space-y-4">
        <div className="flex justify-center items-center gap-2 text-[#9C5B7F] mb-4">
          <Contact2 className="w-8 h-8" />
          <h2 className="text-xl font-extrabold uppercase tracking-widest text-[#D6C9DF]">Associate Reserves</h2>
        </div>
        {!activeAssociateUser ? (
          <>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Join the Network</h1>
            <p className="text-sm text-[#D6C9DF]/80 font-medium max-w-lg mx-auto leading-relaxed">
              Become a verified standby associate. Set your own availability and help provide emergency overflow care to pets across Rapid City.
            </p>
          </>
        ) : (
          <>
             <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Reserve Dashboard</h1>
             <p className="text-sm text-[#D6C9DF]/80 font-medium max-w-lg mx-auto leading-relaxed">
               Welcome back, {activeAssociateUser.name.split(' ')[0]}. Manage your standby availability below.
             </p>
          </>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        <button
          onClick={() => setActivePage('home')}
          className="mb-8 px-4 py-2 rounded-full border border-[#9C5B7F] text-[#9C5B7F] bg-transparent hover:bg-[#9C5B7F]/10 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        {!activeAssociateUser ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Apply Form */}
            <div className="bg-[#1a0b2e]/60 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
               <h3 className="text-xl font-black text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                 <Plus className="w-5 h-5 text-[#E54B86]" /> Apply Now
               </h3>
               <form onSubmit={handleApply} className="space-y-4">
                 <div>
                    <label className="block text-[10px] font-black uppercase text-[#D6C9DF] tracking-widest mb-1.5">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-[#150724] border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-pink-500 transition-colors"
                      placeholder="Jane Doe"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black uppercase text-[#D6C9DF] tracking-widest mb-1.5">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full bg-[#150724] border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-pink-500 transition-colors"
                      placeholder="jane@example.com"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black uppercase text-[#D6C9DF] tracking-widest mb-1.5">Mobile Phone</label>
                    <input 
                      type="tel" 
                      required
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full bg-[#150724] border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-pink-500 transition-colors"
                      placeholder="605-555-1234"
                    />
                 </div>
                 <div className="pt-2">
                   <label className="flex items-start gap-3 cursor-pointer group">
                     <div className="relative flex items-center justify-center mt-0.5">
                       <input 
                          type="checkbox" 
                          required
                          checked={bgCheckConsent}
                          onChange={(e) => setBgCheckConsent(e.target.checked)}
                          className="appearance-none w-5 h-5 border-2 border-white/20 rounded bg-[#150724] checked:bg-[#E54B86] checked:border-[#E54B86] transition-all"
                       />
                       {bgCheckConsent && <Check className="w-3.5 h-3.5 text-white absolute pointer-events-none" strokeWidth={3} />}
                     </div>
                     <span className="text-xs text-[#D6C9DF] leading-relaxed group-hover:text-white transition-colors">
                       I agree to a mandatory preliminary background check to assure the safety and security of all client homes and pets.
                     </span>
                   </label>
                 </div>
                 
                 <div className="pt-6">
                   <button 
                      type="submit"
                      className="w-full py-4 bg-gradient-to-r from-pink-600 to-[#E54B86] hover:scale-[1.02] text-white text-sm font-black uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer"
                    >
                     Submit Application
                   </button>
                 </div>
               </form>
            </div>

            {/* Login Form */}
            <div className="bg-[#1a0b2e]/30 border border-white/5 rounded-3xl p-6 sm:p-8 shadow-md">
               <h3 className="text-xl font-black text-[#D6C9DF] mb-6 uppercase tracking-wider">Returning Associates</h3>
               <form onSubmit={handleLogin} className="space-y-4">
                 <div>
                    <label className="block text-[10px] font-black uppercase text-[#D6C9DF]/70 tracking-widest mb-1.5">Simulate Login (Email)</label>
                    <input 
                      type="email" 
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full bg-[#150724] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-pink-500 transition-colors"
                      placeholder="Enter verified email"
                    />
                 </div>
                 <div className="pt-4">
                   <button 
                      type="submit"
                      className="w-full py-3 bg-white/10 hover:bg-white/15 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-sm cursor-pointer border border-white/10"
                    >
                     Access Dashboard
                   </button>
                 </div>
               </form>
               <div className="mt-8 space-y-4 border-t border-white/10 pt-8">
                 <div className="flex items-center gap-3 text-sm text-[#D6C9DF]/70">
                   <ShieldCheck className="w-5 h-5 text-[#9C5B7F]" />
                   <span>Trusted and fully vetted members only</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm text-[#D6C9DF]/70">
                   <Clock className="w-5 h-5 text-[#9C5B7F]" />
                   <span>Flexible standby coverage routing</span>
                 </div>
               </div>
            </div>

          </div>
        ) : (
          <div className="space-y-8">
             
            {/* Status Panel */}
            <div className={`p-4 sm:p-6 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              activeAssociateUser.status === 'Active Reserve' 
                ? 'bg-emerald-500/10 border-emerald-500/30' 
                : 'bg-amber-500/10 border-amber-500/30'
            }`}>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#D6C9DF]">Current Account Status</p>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${
                    activeAssociateUser.status === 'Active Reserve' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {activeAssociateUser.status}
                  </span>
                  {activeAssociateUser.status === 'Active Reserve' && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  )}
                </div>
                {activeAssociateUser.status === 'Pending Review' && (
                  <p className="text-xs text-amber-500/80 font-medium">
                    Your background check and profile review are in progress. You can pre-set your availability while you wait.
                  </p>
                )}
              </div>
              <div className="shrink-0 flex gap-4">
                 <button 
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-full border border-white/10 text-[#D6C9DF] hover:text-white hover:bg-white/5 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                 >
                   Sign Out
                 </button>
              </div>
            </div>

            {/* Availability Calendar */}
            <div className="bg-[#1a0b2e]/60 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-[#9C5B7F]" /> Standby Availability Roster
                  </h3>
                  <p className="text-sm text-[#D6C9DF]/70 mt-1 font-medium">Select the individual days you are guaranteed available to work.</p>
                </div>
                <div className="shrink-0">
                  <select 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-[#150724] border border-white/20 text-white rounded-xl px-4 py-2 font-bold text-sm focus:outline-none focus:border-pink-500 cursor-pointer"
                  >
                    <option value="2026-06">June 2026</option>
                    <option value="2026-07">July 2026</option>
                    <option value="2026-08">August 2026</option>
                  </select>
                </div>
              </div>

              {/* Grid representation */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 sm:gap-3">
                {generateDaysInMonth(selectedMonth).map((dateStr) => {
                   const isSelected = activeAssociateUser.availableDates.includes(dateStr);
                   const dateObj = new Date(dateStr);
                   const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                   const dayNum = dateObj.getDate();

                   return (
                     <button
                       key={dateStr}
                       onClick={() => handleToggleDate(dateStr)}
                       className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all cursor-pointer h-20 sm:h-24 select-none ${
                         isSelected 
                           ? 'bg-pink-600/20 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.15)] scale-[1.02]' 
                           : 'bg-[#150724] border-white/5 hover:border-white/20 hover:bg-white/5'
                       }`}
                     >
                       <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-pink-300' : 'text-[#D6C9DF]/50'}`}>
                         {dayOfWeek}
                       </span>
                       <span className={`text-xl sm:text-2xl font-black mt-1 ${isSelected ? 'text-white' : 'text-[#D6C9DF]'}`}>
                         {dayNum}
                       </span>
                       {isSelected && (
                         <span className="text-[8px] font-bold text-pink-300 uppercase mt-auto tracking-wider">
                           Available
                         </span>
                       )}
                     </button>
                   );
                })}
              </div>

            </div>

          </div>
        )}
      </div>

    </div>
  );
}
