import React, { useState, useEffect } from 'react';
import { ActivePage, ServiceRequest } from '../types';
import { 
  Calendar, 
  Clock, 
  Shield, 
  Heart, 
  Eye, 
  ArrowRight, 
  UploadCloud, 
  CheckCircle2, 
  Calculator, 
  FileText, 
  Plus, 
  RotateCcw, 
  Download, 
  UserCheck, 
  ChevronRight,
  ShieldCheck,
  FileCheck,
  Sparkles,
  Trash2,
  Bell
} from 'lucide-react';

interface ClientPortalViewProps {
  setActivePage: (page: ActivePage) => void;
}

export default function ClientPortalView({ setActivePage }: ClientPortalViewProps) {
  // Bookings state synchronized from localStorage
  const [clientRequests, setClientRequests] = useState<ServiceRequest[]>([]);
  
  // Section states
  const [savedRules, setSavedRules] = useState<string>(() => {
    return localStorage.getItem('plh_saved_rules') || '1. Feed senior terrier Griffin twice daily. (1.5 cups dry morning + daily joint soft chew).\n2. Bring in packages and water hanging porch ferns on alternating days.\n3. Verify patio back gate deadbolt lock physically checked before sundown.';
  });
  const [emergencyContacts, setEmergencyContacts] = useState<string>(() => {
    return localStorage.getItem('plh_emergency_contacts') || 'Primary: Bob\'s Veterinary Clinic (605-555-0199) • Neighbor Bill (605-555-4422)';
  });
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(false);

  // Alteration and Notifications states
  const [alteringRequestId, setAlteringRequestId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // Uploader component local states
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; date: string }[]>([
    { name: 'Vet_Emergency_Contact_Sheet.pdf', size: '142 KB', date: 'Yesterday' }
  ]);

  // Invoice Calculator states
  const [calcServiceType, setCalcServiceType] = useState<'House Watch' | 'Drop-In Pet' | 'Combined Package'>('Combined Package');
  const [calcDays, setCalcDays] = useState<number>(7);
  const [calcVisitsPerDay, setCalcVisitsPerDay] = useState<number>(1);
  const [showReceipt, setShowReceipt] = useState<boolean>(true);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const handleConfirmAlteration = (id: string) => {
    const updated = clientRequests.map(r => {
      if (r.id === id) {
        return { ...r, status: 'Cancellation Pending' as const };
      }
      return r;
    });
    setClientRequests(updated);
    localStorage.setItem('plh_service_requests', JSON.stringify(updated));
    window.dispatchEvent(new Event('plh-requests-update'));

    // Create a localized alert
    const targetReq = clientRequests.find(r => r.id === id);
    const textStr = `⚠️ Cancellation notice logged for block: ${targetReq?.travelDates || 'Active Block'} by ${targetReq?.name || 'Client'}.`;
    
    const newNotif = {
      id: `notif-${Date.now()}`,
      text: textStr,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      portal: 'both'
    };

    const storedNotifs = localStorage.getItem('plh_notifications');
    let parsedNotifs = [];
    if (storedNotifs) {
      try { parsedNotifs = JSON.parse(storedNotifs); } catch (e) {}
    }
    localStorage.setItem('plh_notifications', JSON.stringify([newNotif, ...parsedNotifs]));
    window.dispatchEvent(new Event('plh-notifications-update'));

    setAlteringRequestId(null);
  };

  const handleMarkAllNotificationsAsRead = () => {
    const updated = notifications.map(n => {
      if (n.portal === 'client' || n.portal === 'both') {
        return { ...n, read: true };
      }
      return n;
    });
    setNotifications(updated);
    localStorage.setItem('plh_notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('plh-notifications-update'));
  };

  // Sync bookings and uploaded files from storage on mount & listen to real-time sync event
  useEffect(() => {
    const loadRequests = () => {
      const stored = localStorage.getItem('plh_service_requests');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setClientRequests(parsed);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };

    const loadUploadedFiles = () => {
      const stored = localStorage.getItem('plh_uploaded_files');
      if (stored) {
        try {
          setUploadedFiles(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      } else {
        const defaultDocs = [
          { name: 'Vet_Emergency_Contact_Sheet.pdf', size: '142 KB', date: 'Yesterday' }
        ];
        setUploadedFiles(defaultDocs);
        localStorage.setItem('plh_uploaded_files', JSON.stringify(defaultDocs));
      }
    };

    const loadSavedRulesAndContacts = () => {
      const storedRules = localStorage.getItem('plh_saved_rules');
      if (storedRules) setSavedRules(storedRules);
      const storedContacts = localStorage.getItem('plh_emergency_contacts');
      if (storedContacts) setEmergencyContacts(storedContacts);
    };

    const loadNotifications = () => {
      const stored = localStorage.getItem('plh_notifications');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setNotifications(parsed);
            return;
          }
        } catch (e) {}
      }
      const initialSeed = [
        {
          id: 'init-1',
          text: '🔔 Reminder: Upload your Vet Emergency Sheet to reach 100% Care Ready status.',
          timestamp: '10:15 AM',
          read: false,
          portal: 'client'
        },
        {
          id: 'init-2',
          text: '🔔 System Alert: New booking request received from a high-priority critical care pet.',
          timestamp: '09:30 AM',
          read: false,
          portal: 'admin'
        },
        {
          id: 'init-3',
          text: 'Welcome to Prairie Land Watch! Secure administrative protocols are active.',
          timestamp: 'Yesterday',
          read: true,
          portal: 'both'
        }
      ];
      localStorage.setItem('plh_notifications', JSON.stringify(initialSeed));
      setNotifications(initialSeed);
    };

    loadRequests();
    loadUploadedFiles();
    loadSavedRulesAndContacts();
    loadNotifications();

    const handleReqsUpdate = () => {
      loadRequests();
    };

    const handleStorageUpdate = () => {
      loadSavedRulesAndContacts();
    };

    const handleNotifsUpdate = () => {
      loadNotifications();
    };

    window.addEventListener('plh-requests-update', handleReqsUpdate);
    window.addEventListener('plh-storage-update', handleStorageUpdate);
    window.addEventListener('plh-notifications-update', handleNotifsUpdate);
    return () => {
      window.removeEventListener('plh-requests-update', handleReqsUpdate);
      window.removeEventListener('plh-storage-update', handleStorageUpdate);
      window.removeEventListener('plh-notifications-update', handleNotifsUpdate);
    };
  }, []);

  // Calculate pricing values based on business tier rules
  const pricingRules = {
    'House Watch': { rate: 40, label: 'Base House Watch Check Rate' },
    'Drop-In Pet': { rate: 25, label: 'Companion Drop-In Support Visit Rate' },
    'Combined Package': { rate: 60, label: 'Combined Package Rate (Watch + Pet)' }
  };

  const getSubtotal = () => {
    const selected = pricingRules[calcServiceType];
    const daysVal = isNaN(calcDays) || calcDays < 1 ? 1 : calcDays;
    if (calcServiceType === 'Drop-In Pet') {
      return selected.rate * daysVal * calcVisitsPerDay;
    }
    return selected.rate * daysVal;
  };

  const subtotal = getSubtotal();
  const taxRate = 0.065; // 6.5% Rapid City localized tax
  const taxVal = Number((subtotal * taxRate).toFixed(2));
  const grandTotal = Number((subtotal + taxVal).toFixed(2));

  // Sync grand total to localStorage for the Staff Admin Earnings Ledger
  useEffect(() => {
    localStorage.setItem('plh_calculator_draft_total', grandTotal.toString());
    window.dispatchEvent(new Event('plh-requests-update'));
  }, [grandTotal]);

  // Handle Drag Events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    setIsUploading(true);
    // Simulate secure scanning and encrypted upload latency of 1200ms
    setTimeout(() => {
      setIsUploading(false);
      const sizeKB = Math.round(file.size / 1024);
      const formattedSize = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;
      
      const newFile = { 
        name: file.name, 
        size: formattedSize, 
        date: 'Just Now' 
      };

      setUploadedFiles(prev => {
        const updated = [newFile, ...prev];
        localStorage.setItem('plh_uploaded_files', JSON.stringify(updated));
        return updated;
      });
    }, 1200);
  };

  // Mock receipt download builder
  const handleDownloadReceipt = () => {
    setDownloadSuccess(true);
    const textContent = `
========================================
 PEACE LOVE HOME & PET WATCH - RECEIPT
========================================
Rapid City & Black Hills Neighborhood Care
Jamie Giedd - Local Trusted Watch Sitter

SERVICE PERIOD DETAILS:
- Tier Level: ${pricingRules[calcServiceType].label}
- Calculation Range: ${calcDays} days ${calcServiceType === 'Drop-In Pet' ? `@ ${calcVisitsPerDay} visit(s)/day` : ''}

TRANSACTIONS LEDGER:
Subtotal: $${subtotal.toFixed(2)}
Rapid City Local Tax (6.5%): $${taxVal.toFixed(2)}
----------------------------------------
GRAND TOTAL: $${grandTotal.toFixed(2)}
========================================
Thank you for entrusting your home and companions
with us! Staged & Secure for your travel peace of mind.
    `.trim();

    const element = document.createElement("a");
    const file = new Blob([textContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `PLH_Invoice_Quote_${calcDays}Days.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setTimeout(() => {
      setDownloadSuccess(false);
    }, 2800);
  };

  // Profile save helper
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('plh_saved_rules', savedRules);
    window.dispatchEvent(new Event('plh-storage-update'));
    setProfileSuccessMsg(true);
    setTimeout(() => {
      setProfileSuccessMsg(false);
    }, 3000);
  };

  // Onboarding progress calculations
  const hasHomeRules = savedRules && savedRules.trim().length > 15;
  const hasDocs = uploadedFiles && uploadedFiles.length > 0;
  const hasEmergency = emergencyContacts && emergencyContacts.trim().length > 10;

  let onboardingProgress = 0;
  if (hasHomeRules) onboardingProgress += 33;
  if (hasDocs) onboardingProgress += 34;
  if (hasEmergency) onboardingProgress += 33;
  if (hasHomeRules && hasDocs && hasEmergency) {
    onboardingProgress = 100;
  }

  return (
    <div id="client-portal-view" className="bg-[#1a0b2e] text-[#D6C9DF] min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Sleek Horizontal Onboarding Progress Tracking Bar */}
        <div id="client-onboarding-progress" className="bg-[#25143a]/90 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-lg space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-left">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Sparkles className={`w-4 h-4 ${onboardingProgress === 100 ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
                AUTOMATED ONBOARDING: Profile Care Readiness Status
              </h3>
              <p className="text-[11px] text-[#D6C9DF]/80">
                Complete your profile tasks so Jamie has certified parameters locked in during travel windows.
              </p>
            </div>
            <span className={`text-[11px] font-black uppercase px-3 py-1 rounded-full text-center shrink-0 ${
              onboardingProgress === 100 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {onboardingProgress === 100 ? '🎉 100% Care Ready' : `📋 Profile ${onboardingProgress}% Complete`}
            </span>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full bg-[#150724] h-3 rounded-full overflow-hidden border border-white/5 relative">
            <div 
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                onboardingProgress === 100 
                  ? 'bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]' 
                  : 'bg-gradient-to-r from-amber-500 to-orange-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
              }`}
              style={{ width: `${onboardingProgress}%` }}
            />
          </div>

          {/* Tasks Indicators Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[10px] font-bold text-left">
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${hasHomeRules ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-red-500/40 animate-pulse'}`} />
              <span className={hasHomeRules ? 'text-emerald-400' : 'text-[#D6C9DF]/60'}>
                Home Rules Archive {hasHomeRules ? '✓' : '(Missing details)'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${hasDocs ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-red-500/40 animate-pulse'}`} />
              <span className={hasDocs ? 'text-emerald-400' : 'text-[#D6C9DF]/60'}>
                Secure Document Vault {hasDocs ? '✓' : '(Upload at least 1 PDF)'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${hasEmergency ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-red-500/40 animate-pulse'}`} />
              <span className={hasEmergency ? 'text-emerald-400' : 'text-[#D6C9DF]/60'}>
                Emergency Contacts listed {hasEmergency ? '✓' : '(Please enter details)'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Portal Header Block */}
        <section className="bg-[#25143a]/90 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-white/10 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
          {/* Subtle decoration pink orb background bleed */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#b87d8d]/10 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="space-y-2 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#b87d8d]/20 rounded-full text-[11px] font-bold text-[#D6C9DF] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#b87d8d]" /> Encrypted Client Vault
            </span>
            <h1 className="font-extrabold text-3xl sm:text-4xl text-white tracking-tight leading-tight">
              Neighbor Care Portal
            </h1>
            <p className="text-sm text-[#D6C9DF] font-medium max-w-xl">
              Welcome back, neighbor! Check active travel locks, update your pet routines secure document vault, and simulate invoice tiers for upcoming travels.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-14">
            {/* Notification Bell Dropdown Matrix */}
            <div className="relative" id="client-notification-bell-container">
              <button
                type="button"
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#D6C9DF] hover:text-white transition-all cursor-pointer relative active:scale-95 flex items-center justify-center"
                title="Toggle Reminders"
              >
                <Bell className="w-4 h-4 text-[#D6C9DF]" />
                {notifications.filter(n => !n.read && (n.portal === 'client' || n.portal === 'both')).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E54B86] text-white rounded-full text-[8px] font-black flex items-center justify-center animate-bounce shadow-md">
                    {notifications.filter(n => !n.read && (n.portal === 'client' || n.portal === 'both')).length}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-3.5 w-72 sm:w-80 bg-[#150724] border border-white/15 rounded-2xl shadow-xl p-4 space-y-3 z-50 animate-in fade-in slide-in-from-top-3 duration-250 text-left">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-[11px] font-black uppercase text-white tracking-widest flex items-center gap-1.5 font-sans">
                      🔔 Active Board Alerts
                    </span>
                    <button
                      type="button"
                      onClick={handleMarkAllNotificationsAsRead}
                      className="text-[9px] font-black uppercase text-[#b87d8d] hover:text-pink-300 transition-colors cursor-pointer"
                    >
                      Clear/Mark Read
                    </button>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {notifications.filter(n => n.portal === 'client' || n.portal === 'both').length === 0 ? (
                      <p className="text-[10px] text-[#D6C9DF]/50 text-center py-4 font-semibold">
                        No alerts or reminders logged.
                      </p>
                    ) : (
                      notifications
                        .filter(n => n.portal === 'client' || n.portal === 'both')
                        .map((notif) => (
                          <div 
                            key={notif.id} 
                            className={`p-2.5 rounded-xl border text-[10px] font-semibold leading-relaxed transition-all relative ${
                              notif.read 
                                ? 'bg-[#1a0b2e]/35 border-white/5 text-[#D6C9DF]/55' 
                                : 'bg-[#1a0b2e] border-[#b87d8d]/30 text-white shadow-[inset_0_1px_5px_rgba(255,255,255,0.05)]'
                            }`}
                          >
                            {!notif.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#E54B86] absolute top-3 right-3 animate-pulse" />
                            )}
                            <p className="pr-2">{notif.text}</p>
                            <span className="text-[8px] font-mono text-[#D6C9DF]/40 block mt-1.5">{notif.timestamp}</span>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setActivePage('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-5 py-2.5 rounded-full border-2 border-[#b87d8d] text-white bg-transparent hover:bg-[#b87d8d]/10 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95"
            >
              Back to Web
            </button>
            <button
              onClick={() => {
                setActivePage('request');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-5 py-2.5 rounded-full bg-[#b87d8d] text-white hover:bg-[#a66c7c] hover:scale-[1.02] hover:shadow-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> New Booking Block
            </button>
          </div>
        </section>

        {/* Part 1: Grid Layout with Three Premium Overview Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Upcoming Bookings Widget */}
          <div className="bg-[#25143a]/90 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg flex flex-col justify-between space-y-5 h-full">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#b87d8d]" />
                  Upcoming Bookings
                </h3>
                <span className="text-[10px] font-extrabold text-[#b87d8d] uppercase tracking-widest bg-[#b87d8d]/25 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
              <p className="text-xs text-[#D6C9DF]/80 font-medium pb-2 border-b border-white/5">
                Active approved vacation blocks synchronized from the system scheduler:
              </p>
            </div>

            {/* List of active blocks */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-48 pr-1">
              {clientRequests.length === 0 ? (
                <div className="text-center py-6 bg-[#1a0b2e]/60 rounded-xl border border-white/5 space-y-1">
                  <p className="text-xs font-bold text-white/50">No Bookings Recorded Yet</p>
                  <p className="text-[10px] text-[#D6C9DF]/60 max-w-[150px] mx-auto leading-relaxed">
                    Once you submit Jamie's request form, status will stream live here.
                  </p>
                </div>
              ) : (
                clientRequests.map((req, idx) => {
                  // Determine status badge colors
                  const isConfirmed = req.status === 'Confirmed';
                  const isPendingCancel = req.status === 'Cancellation Pending';
                  const statusColors = isConfirmed 
                    ? { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', text: 'Confirmed', dot: 'bg-emerald-400' }
                    : isPendingCancel
                      ? { bg: 'bg-rose-500/10 text-rose-450 border-rose-500/20', text: 'Cancelling...', dot: 'bg-rose-500' }
                      : { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', text: 'Staged', dot: 'bg-amber-400' };
                  
                  const isCritical = (() => {
                    if (!req.specialPetInstructions) return false;
                    const keywords = ['insulin', 'medication', 'seizures', 'allergies', 'meds', 'rx', 'allergy', 'seizure', 'diabetic', 'chronic'];
                    const lower = req.specialPetInstructions.toLowerCase();
                    return keywords.some(k => lower.includes(k));
                  })();
                  
                  return (
                    <div id={`booking-card-${req.id || idx}`} key={req.id || idx} className={`p-3 bg-[#1a0b2e]/60 border rounded-xl transition-all flex flex-col gap-1.5 shadow-2xs text-[#D6C9DF] relative overflow-hidden ${
                      isCritical ? 'border-pink-500/50 pt-7' : 'border-white/10 hover:border-[#b87d8d]/30'
                    }`}>
                      {isCritical && (
                        <div className="absolute top-0 left-0 right-0 bg-pink-600 text-white text-[8px] font-black uppercase tracking-widest text-center py-0.5 animate-pulse flex items-center justify-center gap-1">
                          ⚠️ CRITICAL CARE REQUIREMENT
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-white truncate max-w-[120px]">{req.travelDates}</span>
                        <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusColors.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
                          {statusColors.text}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#D6C9DF]/80 font-semibold">
                        <span>{req.neighborhood}</span>
                        <span className="text-[#b87d8d] font-bold">{req.serviceNeeded.replace('Both House Watch And Pet Care', 'Full Watch+Pet Pack')}</span>
                      </div>

                      {/* Request Stay Alteration buttons/micro-workflow */}
                      {!isPendingCancel ? (
                        <>
                          {alteringRequestId === req.id ? (
                            <div className="mt-1.5 p-2 bg-[#150724] rounded-lg border border-pink-500/30 text-left space-y-1.5 shadow-md">
                              <p className="text-[9px] font-bold text-[#D6C9DF] leading-snug">
                                ⚠️ Cancel or alter this block? Blocked dates release back as 'Open' on the admin calendar, & value subtracts from real-time pipeline ledgers.
                              </p>
                              <div className="flex gap-1.5 pt-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleConfirmAlteration(req.id)}
                                  className="py-1 bg-pink-600 hover:bg-pink-700 text-[8px] font-black uppercase text-white rounded transition-all cursor-pointer flex-1 text-center"
                                >
                                  Yes, Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setAlteringRequestId(null)}
                                  className="py-1 bg-white/10 hover:bg-white/15 text-[8px] font-black uppercase text-white rounded transition-all cursor-pointer flex-1 text-center"
                                >
                                  Keep
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setAlteringRequestId(req.id)}
                              className="mt-1 w-full text-center py-1 bg-white/5 hover:bg-pink-500/10 text-[9px] font-extrabold text-[#D6C9DF] hover:text-pink-400 border border-white/5 hover:border-pink-500/20 rounded-md transition-all cursor-pointer"
                            >
                              Request Stay Alteration
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="mt-1 text-[9px] font-extrabold text-pink-300 text-center bg-[#b87d8d]/10 border border-[#b87d8d]/20 rounded-md py-1 px-1.5 animate-pulse">
                          ⏳ Cancellation pending Jamie's review
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="pt-3 border-t border-white/5 text-center">
              <span className="text-[10px] font-semibold text-[#D6C9DF]/65">
                ⭐ Staged checkouts undergo site locking processes
              </span>
            </div>
          </div>

          {/* Card 2: Quick Actions Widget */}
          <div className="bg-[#25143a]/90 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg flex flex-col justify-between space-y-4 h-full">
            <div className="space-y-3">
              <h3 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#b87d8d]" />
                Direct Quick Actions
              </h3>
              <p className="text-xs text-[#D6C9DF]/80 font-medium">
                Activate navigation routes or trigger calendar checks directly in the app:
              </p>
            </div>

            <div className="space-y-3 flex-1 flex flex-col justify-center">
              {/* Check Availability Trigger */}
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-availability-check'));
                  setActivePage('home');
                }}
                className="w-full text-left p-3.5 bg-[#1a0b2e]/60 hover:bg-white/5 rounded-xl border border-white/10 transition-all group flex items-center justify-between cursor-pointer"
              >
                <div>
                  <h4 className="text-xs font-black text-white group-hover:text-[#b87d8d] transition-colors">
                    🔍 Run Availability Check
                  </h4>
                  <p className="text-[10px] text-[#D6C9DF]/65 mt-0.5">Validate specific vacation gaps in real-time.</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#b87d8d] group-hover:translate-x-1 duration-150" />
              </button>

              {/* Submit Review request */}
              <button
                onClick={() => {
                  setActivePage('request');
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="w-full text-left p-3.5 bg-[#1a0b2e]/60 hover:bg-white/5 rounded-xl border border-white/10 transition-all group flex items-center justify-between cursor-pointer"
              >
                <div>
                  <h4 className="text-xs font-black text-white group-hover:text-[#b87d8d] transition-colors">
                    📝 Request New Block Form
                  </h4>
                  <p className="text-[10px] text-[#D6C9DF]/65 mt-0.5">Open the vacation specification fields.</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#D6C9DF]/40 group-hover:translate-x-1 duration-150" />
              </button>

              <button
                onClick={() => {
                  setActivePage('home');
                  setTimeout(() => {
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }, 200);
                }}
                className="w-full text-left p-3.5 bg-[#1a0b2e]/60 hover:bg-white/5 rounded-xl border border-white/10 transition-all group flex items-center justify-between cursor-pointer"
              >
                <div>
                  <h4 className="text-xs font-black text-white group-hover:text-[#b87d8d] transition-colors">
                    🌱 Sitting Methodology
                  </h4>
                  <p className="text-[10px] text-[#D6C9DF]/65 mt-0.5">Review Jamie's checklist & security values.</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#D6C9DF]/40 group-hover:translate-x-1 duration-150" />
              </button>
            </div>

            <div className="pt-3 border-t border-white/5 text-center">
              <span className="text-[10px] font-semibold text-[#b87d8d] bg-[#b87d8d]/10 px-2 py-0.5 rounded-full">
                Active Client Environment
              </span>
            </div>
          </div>

          {/* Card 3: Your Profile & Vault Widget */}
          <div className="bg-[#25143a]/90 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg flex flex-col justify-between space-y-4 h-full">
            <div className="space-y-3">
              <h3 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#b87d8d]" />
                Profile &amp; Home Rules Archive
              </h3>
              <p className="text-xs text-[#D6C9DF]/80 font-medium pb-1 border-b border-white/5">
                Saved instructions, codes, and notes that sitters follow:
              </p>
            </div>

             <form onSubmit={(e) => {
               e.preventDefault();
               localStorage.setItem('plh_saved_rules', savedRules);
               localStorage.setItem('plh_emergency_contacts', emergencyContacts);
               window.dispatchEvent(new Event('plh-storage-update'));
               setProfileSuccessMsg(true);
               setTimeout(() => {
                 setProfileSuccessMsg(false);
               }, 3000);
             }} className="space-y-4 flex-1 flex flex-col justify-between">
               <div className="space-y-3">
                 <div className="space-y-1">
                   <label className="text-[10px] uppercase font-black tracking-wider text-[#b87d8d] block text-left">
                     🏠 Active Home Rules Details
                   </label>
                   <textarea
                     value={savedRules}
                     onChange={(e) => setSavedRules(e.target.value)}
                     rows={3}
                     className="w-full text-xs font-sans bg-[#150724] border border-white/10 rounded-xl p-3 leading-relaxed text-white focus:outline-none focus:ring-2 focus:ring-[#b87d8d]/30 focus:border-[#b87d8d]"
                     placeholder="List private details for Jamie to access..."
                   />
                 </div>

                 <div className="space-y-1">
                   <label className="text-[10px] uppercase font-black tracking-wider text-[#b87d8d] block text-left">
                     🚑 Emergency Contacts Checklist
                   </label>
                   <input
                     type="text"
                     value={emergencyContacts}
                     onChange={(e) => setEmergencyContacts(e.target.value)}
                     className="w-full text-xs font-sans bg-[#150724] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#b87d8d]/30 focus:border-[#b87d8d]"
                     placeholder="e.g. Bob's Vet Clinic (605-555-0199)"
                   />
                 </div>
               </div>

               {profileSuccessMsg ? (
                 <p className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg text-center animate-pulse">
                   ✓ Client Profile & Emergency Contacts updated!
                 </p>
               ) : (
                 <button
                   type="submit"
                   className="w-full py-2.5 bg-[#b87d8d] hover:bg-[#a66c7c] hover:scale-[1.02] hover:shadow-md text-[10px] font-black text-white uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                 >
                   Save Profile & Contacts
                 </button>
               )}
             </form>

            <div className="text-center text-[10px] font-semibold text-[#D6C9DF]/50">
              Only verified care sitters access this encrypted ledger
            </div>
          </div>

        </div>

        {/* Part 2: Secure Document Uploader & Part 3: Invoice Builder Double column with increased spacing */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-6 sm:pt-8">
          
          {/* Left Column: Secure Drag-and-Drop File Uploader */}
          <div className="lg:col-span-6 space-y-5">
            <div className="bg-[#25143a]/90 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/10 shadow-lg space-y-6">
              
              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-white tracking-tight">
                  Secure Document Vault &amp; Medical Records
                </h3>
                <p className="text-xs text-[#D6C9DF]/85 font-medium">
                  Upload gate keys, vaccination sheets, emergency pet clinic directives, or secure house files directly.
                </p>
              </div>

              {/* Secure Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 relative ${
                  isDragging 
                    ? 'border-[#b87d8d] bg-[#b87d8d]/10 scale-[1.01]' 
                    : 'border-white/10 bg-[#150724] hover:border-[#b87d8d]/40 group'
                }`}
              >
                {/* File Input fallback */}
                <input 
                  type="file" 
                  id="secure-vault-input" 
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer animate-none" 
                  accept=".pdf,.png,.jpg,.jpeg"
                  disabled={isUploading}
                />

                <div className="space-y-4 flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-[#b87d8d]/10 text-[#b87d8d] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  
                  <div className="space-y-1.5 max-w-xs mx-auto text-center">
                    <p className="text-sm font-bold text-white group-hover:text-[#b87d8d] transition-colors leading-none">
                      Drag &amp; Drop Client Records
                    </p>
                    <p className="text-[11px] text-[#D6C9DF]/75 font-semibold leading-normal">
                      Or click here to browse files. Accepts PDF, JPG, or PNG up to 12MB.
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          // Create a mock File object
                          const mockFile = new File([new ArrayBuffer(1024 * 342)], "Vet_RapidCity_Emergency_Clinic_Consent.pdf", { type: "application/pdf" });
                          processSelectedFile(mockFile);
                        }}
                        className="relative z-30 px-3.5 py-1.5 rounded-lg bg-[#b87d8d]/20 hover:bg-[#b87d8d]/45 text-white text-[10px] font-black uppercase tracking-wider transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-95 border-0 focus:ring-0"
                      >
                        ⚡ Simulate Mock Drop
                      </button>
                    </div>
                  </div>
                </div>

                {isUploading && (
                  <div className="absolute inset-0 bg-[#25143a]/95 rounded-xl flex flex-col items-center justify-center space-y-3 z-20">
                    {/* CSS loader spinner */}
                    <div className="w-8 h-8 border-4 border-[#b87d8d]/20 border-t-[#b87d8d] rounded-full animate-spin" />
                    <p className="text-xs font-extrabold text-[#b87d8d] uppercase tracking-wider">
                      Analyzing &amp; Encrypting File Safely...
                    </p>
                  </div>
                )}
              </div>

              {/* Local Success Display and Upload History */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[#D6C9DF]/60">
                  Documents Pending Sitter Review
                </h4>
                
                <div className="space-y-2">
                  {uploadedFiles.map((doc, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-3.5 bg-[#150724] hover:bg-white/5 rounded-xl border border-white/10 animate-in slide-in-from-bottom-2 duration-150"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-lg">
                          <FileCheck className="w-4 h-4" />
                        </div>
                        <div className="truncate text-left">
                          <p className="text-xs font-extrabold text-white truncate">{doc.name}</p>
                          <p className="text-[10px] text-[#b87d8d] font-bold">📄 Securely Uploaded &amp; Scanned • {doc.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-extrabold bg-[#b87d8d]/20 text-[#D6C9DF] px-2 py-0.5 rounded-full select-none whitespace-nowrap">
                          {doc.date}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = uploadedFiles.filter((_, i) => i !== idx);
                            setUploadedFiles(updated);
                            localStorage.setItem('plh_uploaded_files', JSON.stringify(updated));
                          }}
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-450 hover:text-rose-400 transition-colors cursor-pointer active:scale-95"
                          title="Remove file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Invoice Builder & Receipt Layout */}
          <div className="lg:col-span-6 space-y-5">
            <div className="bg-[#25143a]/90 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/10 shadow-lg space-y-6">
              
              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-white tracking-tight">
                  Tiered Fee Calculator
                </h3>
                <p className="text-xs text-[#D6C9DF]/85 font-medium">
                  Review transparent local service check rates or run a customized estimate block prior to locking dates.
                </p>
              </div>

              {/* Calculator Settings Form */}
              <div className="space-y-4 bg-[#150724] p-4.5 rounded-xl border border-white/10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Package Option */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#D6C9DF]/80">
                      Select Service Tier:
                    </label>
                    <select
                      value={calcServiceType}
                      onChange={(e) => setCalcServiceType(e.target.value as any)}
                      className="w-full text-xs font-extrabold h-11 py-2 px-3.5 rounded-xl border border-white/10 bg-[#150724] text-white shadow-2xs outline-none focus:ring-2 focus:ring-[#b87d8d]/30 focus:border-[#b87d8d] cursor-pointer"
                    >
                      <option value="Combined Package">🥇 Combined Sanctuary Pack... (Watch + Pet)</option>
                      <option value="House Watch">🏠 Standard House Watch ($40/day)</option>
                      <option value="Drop-In Pet">🐈 Companion Drop-In ($25/visit)</option>
                    </select>
                  </div>

                  {/* Quantity Days */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#D6C9DF]/80">
                      Number of Nights Needed:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={calcDays}
                      onChange={(e) => setCalcDays(Math.max(1, Number(e.target.value)))}
                      className="w-full text-xs font-extrabold h-11 py-2 px-3.5 rounded-xl border border-white/10 bg-[#150724] text-white shadow-2xs outline-none focus:ring-2 focus:ring-[#b87d8d]/30 focus:border-[#b87d8d]"
                    />
                  </div>

                </div>

                {/* Companion visits condition */}
                {calcServiceType === 'Drop-In Pet' && (
                  <div className="space-y-1.5 text-left pt-2 border-t border-white/5 animate-in slide-in-from-top-1 duration-150">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#b87d8d]">
                      Visits Per Day:
                    </label>
                    <div className="flex items-center gap-4">
                      {[1, 2, 3].map((vNum) => (
                        <button
                          type="button"
                          key={vNum}
                          onClick={() => setCalcVisitsPerDay(vNum)}
                          className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                            calcVisitsPerDay === vNum
                              ? 'bg-[#b87d8d] text-white border-transparent'
                              : 'bg-[#1a0b2e] text-[#D6C9DF] border-white/10 hover:border-[#b87d8d]/30'
                          }`}
                        >
                          {vNum} Visit{vNum > 1 ? 's' : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Digital Receipt Item Display */}
              {showReceipt && (
                <div className="border border-white/10 rounded-xl overflow-hidden shadow-2xs animate-in fade-in duration-200">
                  
                  {/* Digital Ledger Header */}
                  <div className="bg-[#150724] border-b border-white/5 text-white p-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-[#b87d8d] tracking-widest uppercase">Invoice Estimated Draft</p>
                      <p className="text-[11px] font-bold">Jamie Giedd Sitting Care</p>
                    </div>
                    <span className="text-[10px] font-bold bg-[#b87d8d] px-2.5 py-1 rounded-full text-white">Staged</span>
                  </div>

                  {/* Line Items Table */}
                  <div className="p-4 space-y-4 font-sans text-xs">
                    <div className="flex items-start justify-between pb-3 border-b border-white/5">
                      <div className="space-y-0.5 text-left">
                        <p className="font-extrabold text-white">{pricingRules[calcServiceType].label}</p>
                        <p className="text-[10px] text-[#D6C9DF]/70 font-semibold">
                          ${pricingRules[calcServiceType].rate} / {calcServiceType === 'Drop-In Pet' ? 'visit' : 'day'} basis unit index
                        </p>
                      </div>
                      <span className="font-bold text-white shrink-0">
                        {calcDays} {calcServiceType === 'Drop-In Pet' ? `days × ${calcVisitsPerDay} visits` : 'days'}
                      </span>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-2 pt-1 text-[#D6C9DF]/80">
                      <div className="flex justify-between font-semibold">
                        <span>Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Rapid City Surtax (6.5%):</span>
                        <span>${taxVal.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Grand Total - Highlighted inside dusty rose borders & bg */}
                    <div className="flex items-center justify-between bg-[#150724] border border-[#b87d8d]/30 text-white p-4.5 rounded-xl">
                      <div className="text-left">
                        <p className="text-[10px] font-black tracking-wider uppercase text-[#b87d8d]">Total Draft Value</p>
                        <p className="text-[11px] font-medium text-[#D6C9DF]/80">Staged on schedule confirmation</p>
                      </div>
                      <span className="text-lg font-black text-white bg-[#b87d8d] px-4 py-2 rounded-lg leading-none shadow-xs">
                        ${grandTotal.toFixed(2)}
                      </span>
                    </div>

                    {/* Receipt Downloader */}
                    <div className="flex items-center justify-between gap-3 pt-2">
                      <button
                        onClick={handleDownloadReceipt}
                        className="flex-1 py-3 px-4 bg-[#b87d8d] hover:bg-[#a66c7c] hover:scale-[1.02] text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5 text-white" />
                        {downloadSuccess ? '✓ Receipt Downloaded!' : 'Download Receipt PDF'}
                      </button>
                    </div>

                  </div>

                </div>
              )}

            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
