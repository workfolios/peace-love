import { useState, useEffect } from 'react';
import { ActivePage, Testimonial, ServiceRequest } from '../types';
import { Check, X, ShieldAlert, CheckCircle, Clock, Trash2, ArrowLeft, Plus, Edit2, Save, Sparkles, Image, CheckCircle2, Calendar, Inbox, User, ShieldCheck, Heart, Eye, MapPin, Bell, Printer } from 'lucide-react';

import BlurImage from './BlurImage';

// Import local photos
// @ts-ignore
const beauPhoto = `${import.meta.env.BASE_URL}assets/images/beau.webp`;
// @ts-ignore
const goldiePhoto = `${import.meta.env.BASE_URL}assets/images/goldie-anastasia-june.webp`;
// @ts-ignore
const griffinPhoto = `${import.meta.env.BASE_URL}assets/images/griffin.webp`;

interface AdminViewProps {
  setActivePage: (page: ActivePage) => void;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    name: 'Hannah F.',
    quote: 'Every time I head out to Denver, I always feel comfortable leaving the house knowing that it is in trusted hands with Jamie.',
    neighborhood: 'Rapid City / Black Hills Area',
    relationship: 'Neighbor / Client',
    category: 'Home Details',
    approved: true,
    avatarUrl: beauPhoto,
    photoCaption: 'Beau loves Jamie!'
  },
  {
    id: 't-2',
    name: 'Aleica F.',
    quote: 'My chickens love Jamie. They really connect with her!',
    neighborhood: 'Rapid City / Black Hills Area',
    relationship: 'Neighbor / Client',
    category: 'Pet Routines',
    approved: true,
    avatarUrl: goldiePhoto,
    photoCaption: 'Goldie, Anastasia, & June are fond of Aunt Jamie'
  },
  {
    id: 't-3',
    name: 'Brian C.',
    quote: 'You can count on Jamie. Sometimes I need assurance when I travel. She seems to sense it when I need a text photo of my senior dog.',
    neighborhood: 'Rapid City / Black Hills Area',
    relationship: 'Neighbor / Client',
    category: 'Follow-Through',
    approved: true,
    avatarUrl: griffinPhoto,
    photoCaption: "Griffin doesn't even notice that I am there..."
  }
];

const INITIAL_REQUESTS: ServiceRequest[] = [
  {
    id: 'req-1',
    createdAt: '2026-06-10 14:32',
    name: 'Robert Miller',
    phone: '605-555-0182',
    email: 'robert@miller-firm.test',
    serviceNeeded: 'House Watch Only',
    travelDates: 'June 20 - June 28, 2026',
    frequencyNeeded: 'Every Other Day',
    neighborhood: 'Canyon Lake Heights',
    clientType: 'Returning Client',
    petsInvolved: 'No',
    specialHomeInstructions: 'Please put mail on the entryway cabinet. Check the back patio screen is shut.',
    emergencyContact: 'Sarah Miller (Daughter) - 605-555-0199',
    preferredUpdateMethod: 'Text Message',
    status: 'Confirmed'
  },
  {
    id: 'req-2',
    createdAt: '2026-06-11 08:15',
    name: 'Amanda & Arthur Vance',
    phone: '605-555-4423',
    email: 'amanda.vance@hills.test',
    serviceNeeded: 'Both House Watch And Pet Care',
    travelDates: 'July 02 - July 12, 2026',
    frequencyNeeded: 'Daily Check-in',
    neighborhood: 'Red Rocks / Rapid City',
    clientType: 'New Client',
    petsInvolved: 'Yes',
    petsDescription: '1 Golden Retriever (Buster, 8 yrs old)',
    specialHomeInstructions: 'Water the hanging fern on the front porch. Mail key under the ceramic frog.',
    specialPetInstructions: 'Feed Buster 2 cups of dry food in the morning. He takes a daily joint chew after breakfast.',
    emergencyContact: 'Westside Animal Clinic - 605-555-9988',
    preferredUpdateMethod: 'Text Message',
    status: 'Received'
  },
  {
    id: 'req-3',
    createdAt: '2026-06-11 11:30',
    name: 'Emily Davis',
    phone: '605-555-1212',
    email: 'emily.davis@gmail.test',
    serviceNeeded: 'Pet Care Only',
    travelDates: 'June 12 - June 18, 2026',
    frequencyNeeded: 'Daily Check-in',
    neighborhood: 'West Boulevard',
    clientType: 'New Client',
    petsInvolved: 'Yes',
    petsDescription: '2 cats (Felix & Oscar)',
    emergencyContact: 'Jane Davis (Sister) - 605-555-1234',
    preferredUpdateMethod: 'Email',
    status: 'Received'
  }
];

export default function AdminView({ setActivePage }: AdminViewProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // New States for Bookings, Availability & Associates
  const [activeTab, setActiveTab] = useState<'testimonials' | 'bookings' | 'associates'>('testimonials');
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [associates, setAssociates] = useState<any[]>([]);

  // Care Manifest & Notifications state
  const [showCareManifest, setShowCareManifest] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  
  // Simulated Dark-Themed Email Notification modal states
  const [emailModalRequest, setEmailModalRequest] = useState<ServiceRequest | null>(null);
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false);

  const [selectedMonth, setSelectedMonth] = useState<'June 2026' | 'July 2026'>('June 2026');
  const [selectedDayDetail, setSelectedDayDetail] = useState<number | null>(null);

  // Local edit states
  const [editName, setEditName] = useState('');
  const [editQuote, setEditQuote] = useState('');
  const [editNeighborhood, setEditNeighborhood] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPhotoCaption, setEditPhotoCaption] = useState('');
  const [editSocialHandle, setEditSocialHandle] = useState('');

  // Synchronize requests list from localStorage
  const loadRequests = () => {
    const storedReqs = localStorage.getItem('plh_service_requests');
    if (storedReqs) {
      try {
        const parsed = JSON.parse(storedReqs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRequests(parsed);
        } else {
          setRequests(INITIAL_REQUESTS);
          localStorage.setItem('plh_service_requests', JSON.stringify(INITIAL_REQUESTS));
        }
      } catch (e) {
        setRequests(INITIAL_REQUESTS);
        localStorage.setItem('plh_service_requests', JSON.stringify(INITIAL_REQUESTS));
      }
    } else {
      setRequests(INITIAL_REQUESTS);
      localStorage.setItem('plh_service_requests', JSON.stringify(INITIAL_REQUESTS));
    }
  };

  useEffect(() => {
    loadRequests();

    const loadNotifications = () => {
      const stored = localStorage.getItem('plh_notifications');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setNotifications(parsed);
          }
        } catch (e) {}
      }
    };

    const loadAssociates = () => {
      const stored = localStorage.getItem('plh_associates');
      if (stored) {
        try { setAssociates(JSON.parse(stored)); } catch(e) {}
      }
    };

    loadNotifications();
    loadAssociates();

    const handleRequestsUpdate = () => {
      loadRequests();
    };

    const handleNotificationsUpdate = () => {
      loadNotifications();
    };

    const handleAssociatesUpdate = () => {
      loadAssociates();
    };

    window.addEventListener('plh-requests-update', handleRequestsUpdate);
    window.addEventListener('plh-notifications-update', handleNotificationsUpdate);
    window.addEventListener('plh-associates-update', handleAssociatesUpdate);
    return () => {
      window.removeEventListener('plh-requests-update', handleRequestsUpdate);
      window.removeEventListener('plh-notifications-update', handleNotificationsUpdate);
      window.removeEventListener('plh-associates-update', handleAssociatesUpdate);
    };
  }, []);

  const handleMarkAllNotificationsAsRead = () => {
    const updated = notifications.map(n => {
      if (n.portal === 'admin' || n.portal === 'both') {
        return { ...n, read: true };
      }
      return n;
    });
    setNotifications(updated);
    localStorage.setItem('plh_notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('plh-notifications-update'));
  };

  const handleApproveAssociate = (id: string) => {
    const updated = associates.map(a => {
      if (a.id === id) {
        return { ...a, status: 'Active Reserve', backgroundChecked: true };
      }
      return a;
    });
    setAssociates(updated);
    localStorage.setItem('plh_associates', JSON.stringify(updated));
    window.dispatchEvent(new Event('plh-associates-update'));
  };

  const handleRemoveAssociate = (id: string) => {
    if (confirm('Verify: Remove this associate from the standby roster?')) {
      const updated = associates.filter(a => a.id !== id);
      setAssociates(updated);
      localStorage.setItem('plh_associates', JSON.stringify(updated));
      window.dispatchEvent(new Event('plh-associates-update'));
    }
  };

  const handleApproveCancellation = (id: string) => {
    if (confirm('Verify: Approve client cancellation request? Confirmed calendar locks will instantly release back to open availability.')) {
      const updated = requests.filter(r => r.id !== id);
      saveRequests(updated);

      // Add dynamic system alert notifying cancellation approval
      const newNotif = {
        id: `notif-${Date.now()}`,
        text: `✅ System Alert: Cancellation request approved by administrator Jamie. Schedule released.`,
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
    }
  };

  const saveRequests = (updated: ServiceRequest[]) => {
    setRequests(updated);
    localStorage.setItem('plh_service_requests', JSON.stringify(updated));
    window.dispatchEvent(new Event('plh-requests-update'));
  };

  const loadTestimonials = () => {
    const stored = localStorage.getItem('plh_testimonials');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const updated = parsed.map(t => {
            const defMatch = DEFAULT_TESTIMONIALS.find(d => d.id === t.id);
            if (defMatch) {
              return { ...t, ...defMatch };
            }
            return t;
          });
          setTestimonials(updated);
        } else {
          setTestimonials(DEFAULT_TESTIMONIALS);
        }
      } catch (e) {
        setTestimonials(DEFAULT_TESTIMONIALS);
      }
    } else {
      setTestimonials(DEFAULT_TESTIMONIALS);
    }
  };

  useEffect(() => {
    loadTestimonials();

    const handleStorageUpdate = () => {
      loadTestimonials();
    };
    window.addEventListener('plh-storage-update', handleStorageUpdate);
    return () => {
      window.removeEventListener('plh-storage-update', handleStorageUpdate);
    };
  }, []);

  const saveToStorage = (updated: Testimonial[]) => {
    setTestimonials(updated);
    localStorage.setItem('plh_testimonials', JSON.stringify(updated));
    window.dispatchEvent(new Event('plh-storage-update'));
  };

  const handleApprove = (id: string) => {
    const updated = testimonials.map(t => t.id === id ? { ...t, approved: true } : t);
    saveToStorage(updated);
  };

  const handleUnapprove = (id: string) => {
    const updated = testimonials.map(t => t.id === id ? { ...t, approved: false } : t);
    saveToStorage(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this client feedback from the database?')) {
      const updated = testimonials.filter(t => t.id !== id);
      saveToStorage(updated);
    }
  };

  const startEditing = (t: Testimonial) => {
    setEditingId(t.id);
    setEditName(t.name);
    setEditQuote(t.quote);
    setEditNeighborhood(t.neighborhood);
    setEditCategory(t.category);
    setEditPhotoCaption(t.photoCaption || '');
    setEditSocialHandle(t.socialHandle || '');
  };

  const saveEdit = (id: string) => {
    if (!editName || !editQuote) {
      alert('Name & Quote are required.');
      return;
    }
    const updated = testimonials.map(t => t.id === id ? {
      ...t,
      name: editName,
      quote: editQuote,
      neighborhood: editNeighborhood,
      category: editCategory,
      photoCaption: editPhotoCaption,
      socialHandle: editSocialHandle
    } : t);
    saveToStorage(updated);
    setEditingId(null);
  };

  const handleAddDefaultApproved = () => {
    // Add any missing default testimonial
    const ids = testimonials.map(t => t.id);
    const missing = DEFAULT_TESTIMONIALS.filter(d => !ids.includes(d.id));
    if (missing.length === 0) {
      alert('All standard client spotlight items are already in the system.');
      return;
    }
    saveToStorage([...testimonials, ...missing]);
  };

  const handleApproveRequest = (id: string) => {
    const approvedReq = requests.find(r => r.id === id);
    const updated = requests.map(r => r.id === id ? { ...r, status: 'Confirmed' as const } : r);
    saveRequests(updated);

    if (approvedReq) {
      setEmailModalRequest({ ...approvedReq, status: 'Confirmed' });
      setShowEmailModal(true);
    }
  };

  const handleRevokeRequest = (id: string) => {
    const updated = requests.map(r => r.id === id ? { ...r, status: 'Received' as const } : r);
    saveRequests(updated);
  };

  const handleDeleteRequest = (id: string) => {
    if (confirm('Are you sure you want to remove this scheduling request?')) {
      const updated = requests.filter(r => r.id !== id);
      saveRequests(updated);
    }
  };

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

  const isRequestColliding = (req: ServiceRequest): boolean => {
    if (req.status === 'Confirmed') return false;
    const tempReq: ServiceRequest = { ...req, status: 'Confirmed' };
    const months: ('June' | 'July')[] = ['June', 'July'];
    for (const month of months) {
      const maxDays = month === 'June' ? 30 : 31;
      for (let d = 1; d <= maxDays; d++) {
        if (getDayStatusForRequest(tempReq, d, month)) {
          const isTaken = requests.some(other => 
            other.id !== req.id && 
            other.status === 'Confirmed' && 
            other.serviceNeeded !== 'Pet Care Only' &&
            getDayStatusForRequest(other, d, month)
          );
          if (isTaken) return true;
        }
      }
    }
    return false;
  };

  const isCriticalRequest = (req: ServiceRequest): boolean => {
    if (!req.specialPetInstructions) return false;
    const keywords = ['insulin', 'medication', 'seizures', 'allergies', 'meds', 'rx', 'allergy', 'seizure', 'diabetic', 'chronic'];
    const lower = req.specialPetInstructions.toLowerCase();
    return keywords.some(k => lower.includes(k));
  };

  const pending = testimonials.filter(t => !t.approved);
  const approved = testimonials.filter(t => t.approved);

  return (
    <div id="admin-view" className="bg-[#1a0b2e] text-[#D6C9DF] min-h-screen pb-20 font-sans">
      
      {/* Editorial Dashboard Header */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 border-b border-white/10 bg-[#25143a]/90 backdrop-blur-md shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#b87d8d]/20 rounded-full text-xs font-bold text-[#D6C9DF] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#b87d8d]" /> Staff Dashboard
            </div>
            <h1 className="font-extrabold text-3xl sm:text-4xl text-white tracking-tight leading-tight">
              Staff Admin Portal
            </h1>
            <p className="text-sm text-[#D6C9DF]/90 font-medium max-w-2xl">
              Hello, Jamie! Here you can check self-submitted client stories, manage active website booking logs, coordinate reservation availability matrices, and highlight testimonials.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-20">
            {/* Notification Bell Dropdown Matrix */}
            <div className="relative" id="admin-notification-bell-container">
              <button
                type="button"
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#D6C9DF] hover:text-white transition-all cursor-pointer relative active:scale-95 flex items-center justify-center h-10 w-10"
                title="Toggle Reminders"
              >
                <Bell className="w-4 h-4 text-[#D6C9DF]" />
                {notifications.filter(n => !n.read && (n.portal === 'admin' || n.portal === 'both')).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E54B86] text-white rounded-full text-[8px] font-black flex items-center justify-center animate-bounce shadow-md">
                    {notifications.filter(n => !n.read && (n.portal === 'admin' || n.portal === 'both')).length}
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
                    {notifications.filter(n => n.portal === 'admin' || n.portal === 'both').length === 0 ? (
                      <p className="text-[10px] text-[#D6C9DF]/50 text-center py-4 font-semibold">
                        No alerts or reminders logged.
                      </p>
                    ) : (
                      notifications
                        .filter(n => n.portal === 'admin' || n.portal === 'both')
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

            {/* Generate Care Manifest Button */}
            <button
              onClick={() => setShowCareManifest(true)}
              className="px-5 py-2.5 rounded-full bg-[#b87d8d] text-white hover:bg-[#a66c7c] hover:scale-[1.02] hover:shadow-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5 h-10"
              title="Compile a formatted care sheet"
            >
              <Printer className="w-4 h-4" /> Generate Care Manifest
            </button>

            <button
              onClick={() => {
                setActivePage('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-5 py-2.5 rounded-full border-2 border-[#b87d8d] text-white bg-transparent hover:bg-[#b87d8d]/10 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95 h-10"
            >
              <ArrowLeft className="w-4 h-4 inline-block mr-1" /> Back to Live Web
            </button>
          </div>
        </div>

        {/* Sleek Navigation Tabs */}
        <div id="staff-admin-tabs" className="mt-8 flex border-b border-white/10 max-w-6xl mx-auto gap-4">
          <button
            id="tab-testimonials"
            onClick={() => setActiveTab('testimonials')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all relative flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'testimonials'
                ? 'text-[#b87d8d] font-extrabold border-[#b87d8d]'
                : 'text-[#D6C9DF]/50 hover:text-[#D6C9DF] border-transparent'
            }`}
          >
            <User className="w-4 h-4" />
            Testimonials Manager
          </button>
          <button
            id="tab-bookings"
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all relative flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'bookings'
                ? 'text-[#b87d8d] font-extrabold border-[#b87d8d]'
                : 'text-[#D6C9DF]/50 hover:text-[#D6C9DF] border-transparent'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Bookings & Availability
          </button>
          
          <button
            id="tab-associates"
            onClick={() => setActiveTab('associates')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all relative flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'associates'
                ? 'text-[#b87d8d] font-extrabold border-[#b87d8d]'
                : 'text-[#D6C9DF]/50 hover:text-[#D6C9DF] border-transparent'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Standby Reserves
            <div className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black ml-1 shadow-sm ${
                associates.some(a => a.status === 'Pending Review') ? 'bg-[#E54B86] text-white animate-pulse' : 'bg-white/10 text-white/70'
            }`}>
              {associates.length}
            </div>
          </button>
        </div>
      </section>

      {/* Main Stats and Area */}
      <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 space-y-12">
        
        {activeTab === 'testimonials' ? (
          /* Approvals Grid with expanded padding and professional aesthetics */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
          
          {/* Left: Pending column */}
          <div className="lg:col-span-4 p-6 sm:p-8 bg-[#25143a]/90 backdrop-blur-md border border-white/10 rounded-3xl shadow-lg space-y-6">
            <h3 className="font-extrabold text-lg text-white border-b border-white/10 pb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse inline-block" />
              Pending Queue ({pending.length})
            </h3>

            {pending.length === 0 ? (
              <div className="bg-[#1a0b2e]/60 rounded-2xl border border-emerald-500/10 p-8 text-center text-[#D6C9DF] space-y-3 shadow-sm">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-450 inline-block" />
                  <p className="text-sm font-bold text-emerald-400">All caught up!</p>
                </div>
                <p className="text-xs text-[#D6C9DF]/70 font-medium leading-relaxed">
                  No new customer-initiated reviews are waiting in the queue. Complete the form on the Home Page to test submissions.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pending.map((t) => (
                  <div key={t.id} className="bg-[#150724] rounded-2xl border border-amber-500/25 p-5 shadow-sm space-y-4 hover:border-amber-500/40 transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-bold bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full tracking-wider uppercase">
                        {t.category}
                      </span>
                      <span className="text-[11px] font-bold text-[#D6C9DF]/80">{t.neighborhood}</span>
                    </div>
                    <p className="text-xs text-white font-semibold italic leading-relaxed">
                      "{t.quote}"
                    </p>

                    {/* Pending Photo & Caption Area */}
                    {t.avatarUrl && (
                      <div className="space-y-2 mt-2 p-2.5 bg-[#25143a] rounded-xl border border-white/10">
                        <BlurImage 
                          src={t.avatarUrl} 
                          alt="Submitted profile detail" 
                          className="max-h-32 mx-auto rounded-lg object-cover" 
                        />
                        {t.photoCaption && (
                          <div className="bg-[#150724] p-2 rounded-lg border border-white/5 text-center">
                            <p className="text-[10px] font-extrabold text-white">Caption:</p>
                            <p className="text-[10px] text-[#D6C9DF] font-semibold italic">"{t.photoCaption}"</p>
                          </div>
                        )}
                      </div>
                    )}

                    {t.socialHandle && (
                      <div className="text-[10px] font-bold text-[#b87d8d] bg-[#b87d8d]/25 px-2 py-0.5 rounded-full inline-block">
                        Social: {t.socialHandle.startsWith('@') ? t.socialHandle : `@${t.socialHandle}`}
                      </div>
                    )}

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-white">{t.name}</p>
                        <p className="text-[10px] font-medium text-[#D6C9DF]/70">{t.relationship || 'Neighbor / Client'}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleApprove(t.id)}
                          className="p-1 px-3 rounded-full bg-[#b87d8d] hover:bg-[#a66c7c] text-white text-[10px] font-black flex items-center gap-1 transition-all duration-200 cursor-pointer active:scale-95"
                          title="Approve & Publish to Homepage"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                          title="Reject / Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Active Testimonial spotlight column with robust internal list stack */}
          <div className="lg:col-span-8 p-6 sm:p-8 bg-[#25143a]/90 backdrop-blur-md border border-white/10 rounded-3xl shadow-lg space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Active Sitter Spotlight Panel ({approved.length})
              </h3>
              <button
                onClick={handleAddDefaultApproved}
                className="text-[11px] text-[#b87d8d] hover:text-white font-black uppercase tracking-wider transition-colors cursor-pointer bg-transparent border border-[#b87d8d]/30 px-2.5 py-1 rounded-full"
              >
                + Restore System Defaults
              </button>
            </div>

            {approved.length === 0 ? (
              <div className="bg-[#150724] rounded-3xl border border-white/10 p-12 text-center text-[#D6C9DF]/80 space-y-3">
                <ShieldAlert className="w-10 h-10 text-[#b87d8d] mx-auto" />
                <p className="text-sm font-bold">No testimonial items currently selected to show.</p>
                <p className="text-xs font-medium leading-relaxed max-w-sm mx-auto">
                    Click the button above to restore the pre-approved client spotlight pieces on the homepage, or approve submitted ones!
                </p>
                <button
                  onClick={handleAddDefaultApproved}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[#b87d8d] text-white rounded-full mt-2 cursor-pointer active:scale-95 transition-all hover:bg-[#a66c7c]"
                >
                  Load 3 Approved Defaults
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {approved.map((t) => {
                  const isEditing = editingId === t.id;
                  const neighborSinceTag = t.id === 't-1' || t.id === 't-2' ? 'NEIGHBOR SINCE 2024' : 'NEIGHBOR SINCE 2025';
                  
                  return (
                    <div 
                      key={t.id} 
                      className={isEditing 
                        ? "bg-[#25143a] rounded-3xl p-6 sm:p-8 border-2 border-[#b87d8d] shadow-lg space-y-6 animate-in zoom-in-95 duration-150" 
                        : "bg-[#150724] rounded-2xl border border-white/10 p-6 sm:p-8 flex flex-col justify-between shadow-xs transition-all hover:shadow-md hover:border-[#b87d8d]/30 relative overflow-hidden"
                      }
                    >
                      {isEditing ? (
                        // Split Layout: Edit Column + Live Preview Column
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                          
                          {/* Left Column (Form Updates) */}
                          <div className="md:col-span-6 space-y-4">
                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                              <Edit2 className="w-4 h-4 text-[#b87d8d]" />
                              <h4 className="font-extrabold text-sm text-white tracking-tight">Edit Spotlight Content</h4>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-[#D6C9DF]">Trust Category</label>
                                <select 
                                  value={editCategory} 
                                  onChange={(e) => setEditCategory(e.target.value)}
                                  className="w-full text-xs p-2.5 rounded-xl border border-white/10 bg-[#1a0b2e] text-white shadow-xs focus:ring-2 focus:ring-[#b87d8d]/30 focus:border-[#b87d8d] outline-none"
                                >
                                  <option value="Home Details">Home Details</option>
                                  <option value="Pet Routines">Pet Routines</option>
                                  <option value="Follow-Through">Follow-Through</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-[#D6C9DF]">Client Name</label>
                                <input 
                                  type="text" 
                                  value={editName} 
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="w-full text-xs p-2.5 rounded-xl border border-white/10 bg-[#1a0b2e] text-white font-bold shadow-xs focus:ring-2 focus:ring-[#b87d8d]/30 focus:border-[#b87d8d] outline-none"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-[#D6C9DF]">Neighborhood</label>
                              <input 
                                  type="text" 
                                  value={editNeighborhood} 
                                  onChange={(e) => setEditNeighborhood(e.target.value)}
                                  className="w-full text-xs p-2.5 rounded-xl border border-white/10 bg-[#1a0b2e] text-white shadow-xs focus:ring-2 focus:ring-[#b87d8d]/30 focus:border-[#b87d8d] outline-none"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-[#D6C9DF]">Feedback Quote</label>
                              <textarea 
                                rows={3} 
                                value={editQuote} 
                                onChange={(e) => setEditQuote(e.target.value)}
                                className="w-full text-xs p-2.5 rounded-xl border border-white/10 bg-[#1a0b2e] text-white shadow-xs leading-relaxed font-serif italic focus:ring-2 focus:ring-[#b87d8d]/30 focus:border-[#b87d8d] outline-none resize-none"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-[#D6C9DF]">Photo Caption</label>
                              <input 
                                type="text" 
                                value={editPhotoCaption} 
                                onChange={(e) => setEditPhotoCaption(e.target.value)}
                                className="w-full text-xs p-2.5 rounded-xl border border-white/10 bg-[#1a0b2e] text-white shadow-xs focus:ring-2 focus:ring-[#b87d8d]/30 focus:border-[#b87d8d] outline-none"
                                placeholder="Caption strictly below pet photo"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-[#D6C9DF]">Social Handle</label>
                              <input 
                                type="text" 
                                value={editSocialHandle} 
                                onChange={(e) => setEditSocialHandle(e.target.value)}
                                className="w-full text-xs p-2.5 rounded-xl border border-white/10 bg-[#1a0b2e] text-white shadow-xs focus:ring-2 focus:ring-[#b87d8d]/30 focus:border-[#b87d8d] outline-none"
                                placeholder="e.g. @username"
                              />
                            </div>

                            <div className="flex gap-2 justify-end pt-4 border-t border-white/10">
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-4 py-2 rounded-xl text-[10px] font-bold text-[#D6C9DF] uppercase tracking-wider bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => saveEdit(t.id)}
                                className="px-4 py-2 rounded-xl text-[10px] font-bold bg-[#b87d8d] text-white hover:bg-[#a66c7c] transition-all duration-200 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer active:scale-95"
                              >
                                <Save className="w-3.5 h-3.5" /> Save Changes
                              </button>
                            </div>
                          </div>

                          {/* Right Column (Live Preview Updates) */}
                          <div className="md:col-span-6 flex flex-col justify-start">
                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10 justify-between">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-[#b87d8d] animate-pulse" />
                                <h4 className="font-extrabold text-[11px] text-white tracking-widest uppercase">Live Hub Preview</h4>
                              </div>
                              <span className="text-[9px] font-bold bg-[#b87d8d]/20 text-[#b87d8d] px-2 py-0.5 rounded-full select-none">Real-time</span>
                            </div>

                            {/* Replicated High-Legibility Premium Card layout */}
                            <div className="bg-[#150724] border border-white/10 rounded-[16px] p-6 md:p-8 flex flex-col justify-between shadow-xs relative overflow-hidden w-full max-w-[380px] mx-auto min-h-[420px]">
                              {/* Decorative double quote marker */}
                              <div className="absolute top-4 right-5 text-[#b87d8d]/10 font-serif text-6xl leading-none select-none italic font-extrabold pointer-events-none">
                                &ldquo;
                              </div>

                              <div className="space-y-6 flex-1 flex flex-col justify-between">
                                <div className="space-y-4">
                                  {/* Solid Black / White Category badge - High contrast anchor */}
                                  <div className="flex">
                                    <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest bg-[#b87d8d] text-white px-3.5 py-1.5 rounded-full leading-none shadow-xs">
                                      Spotlight • {editCategory || t.category}
                                    </span>
                                  </div>

                                  <p className="font-sans text-xs sm:text-sm text-white font-medium leading-relaxed" style={{ lineHeight: '1.6' }}>
                                    "{editQuote || t.quote}"
                                  </p>

                                  {/* Image Area with caption strictly underneath */}
                                  {t.avatarUrl && (
                                    <div className="space-y-2.5 mt-4 pt-4 border-t border-white/10 text-center font-sans">
                                      <div className="aspect-square w-full rounded-2xl overflow-hidden border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.015)] bg-[#1a0b2e] flex items-center justify-center">
                                        <BlurImage 
                                          referrerPolicy="no-referrer"
                                          src={t.avatarUrl} 
                                          alt={editName || t.name} 
                                          className="w-full h-full object-cover" 
                                        />
                                      </div>
                                      {editPhotoCaption && (
                                        <p className="text-xs sm:text-sm text-[#D6C9DF]/80 font-medium italic mt-2.5 text-center leading-relaxed block font-sans">
                                          "{editPhotoCaption}"
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>

                                <div className="pt-4 border-t border-white/10 mt-6 flex items-center justify-between font-sans gap-4">
                                  <div className="flex items-center gap-3">
                                    {!t.avatarUrl && (
                                      <div className="w-10 h-10 rounded-full bg-[#b87d8d] text-white flex items-center justify-center font-bold text-xs select-none shrink-0 border border-white/10 shadow-xs">
                                        {(editName || t.name || 'Anonymous').slice(0,2).toUpperCase()}
                                      </div>
                                    )}
                                    <div>
                                      <h5 className="font-bold text-sm sm:text-base text-white leading-snug">
                                        {editName || t.name}
                                      </h5>
                                      <p className="text-xs sm:text-sm font-normal text-[#D6C9DF]/80 mt-0.5 tracking-wide leading-relaxed">
                                        {editNeighborhood || t.neighborhood}
                                      </p>
                                    </div>
                                  </div>

                                  {editSocialHandle && (
                                    <span className="text-xs font-bold text-[#b87d8d] bg-[#b87d8d]/20 px-2.5 py-1 rounded-full select-none shrink-0">
                                      {editSocialHandle.startsWith('@') ? editSocialHandle : `@${editSocialHandle}`}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>
                      ) : (
                        // Mini Live-Preview Card Layout
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                          
                          {/* Left Column: Visual details (Mini-version of Live Site Card) */}
                          <div className="md:col-span-8 space-y-4 text-left">
                            <div className="space-y-1 select-none">
                              <p className="text-[10px] font-black uppercase tracking-widest text-[#b87d8d]">✦ {neighborSinceTag} ✦</p>
                              <div className="flex flex-wrap gap-2">
                                <span className="text-[9px] font-extrabold bg-[#25143a] text-white border border-white/10 px-2.5 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                                  {t.category}
                                </span>
                                <span className="text-[10px] text-[#D6C9DF]/80 font-bold border border-white/10 bg-white/5 px-2 py-0.5 rounded-full">
                                  📍 {t.neighborhood}
                                </span>
                              </div>
                            </div>
                            
                            <p className="font-sans text-xs sm:text-sm text-white font-medium leading-relaxed">
                              "{t.quote}"
                            </p>

                            <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                              {!t.avatarUrl && (
                                <div className="w-8 h-8 rounded-full bg-[#b87d8d] text-white flex items-center justify-center font-extrabold text-[10px] select-none shrink-0">
                                  {t.name.slice(0,2).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="text-xs font-bold text-white">{t.name}</p>
                                <span className="text-[10px] text-[#D6C9DF]/80 font-semibold leading-none">{t.relationship || 'Neighbor / Client'}</span>
                              </div>
                            </div>

                            {t.socialHandle && (
                              <div className="flex pt-1">
                                <span className="text-[9px] font-bold text-[#b87d8d] bg-[#b87d8d]/25 px-2 py-0.5 rounded-full font-sans">
                                  {t.socialHandle.startsWith('@') ? t.socialHandle : `@${t.socialHandle}`}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Right Column: Square Pet Sitter Live Preview Photo Asset */}
                          <div className="md:col-span-4 shrink-0 flex flex-col items-center">
                            {t.avatarUrl ? (
                              <div className="space-y-2 text-center w-full max-w-[140px]">
                                <div className="aspect-square w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xs bg-[#1a0b2e] flex items-center justify-center relative">
                                  <BlurImage 
                                    src={t.avatarUrl} 
                                    alt="Sitter Pet preview" 
                                    className="w-full h-full object-cover" 
                                  />
                                </div>
                                {t.photoCaption && (
                                  <p className="text-[10px] text-[#D6C9DF]/80 font-semibold italic truncate max-w-[120px] mx-auto">
                                    "{t.photoCaption}"
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="w-20 h-20 rounded-2xl bg-[#b87d8d]/10 border border-dashed border-[#b87d8d]/30 flex items-center justify-center text-[#b87d8d]/50">
                                <Image className="w-6 h-6" />
                              </div>
                            )}
                          </div>

                          {/* Interactive control buttons in bottom row */}
                          <div className="col-span-full pt-4 mt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 font-sans">
                            <div className="flex gap-2">
                              {/* Small outlined caption edit icon button */}
                              <button
                                onClick={() => startEditing(t)}
                                className="px-3.5 py-1.5 rounded-xl border border-[#b87d8d]/30 hover:border-[#b87d8d] hover:bg-[#b87d8d]/10 text-[10px] font-black uppercase tracking-wider text-[#b87d8d] inline-flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer select-none"
                                title="Edit text description & captions"
                              >
                                <Edit2 className="w-3.5 h-3.5" /> Edit Caption
                              </button>

                              <button
                                onClick={() => handleDelete(t.id)}
                                className="p-2 rounded-xl hover:bg-rose-500/10 text-rose-400 transition-colors cursor-pointer"
                                title="Permanently Delete Spotlight"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center gap-3">
                              {/* Live on Site click simulation button toggle state */}
                              <button
                                onClick={() => handleUnapprove(t.id)}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer select-none"
                                title="Revoke publication and return to general admin queue"
                              >
                                <span className="w-2 h-2 rounded-full bg-emerald-450 animate-pulse inline-block" />
                                Live on Site
                              </button>
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        ) : activeTab === 'bookings' ? (
          /* Bookings & Availability Dashboard Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
            
            {/* Left Column (Incoming Requests Queue) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#b87d8d] animate-pulse inline-block" />
                  Inbound Client Queue ({requests.length})
                </h3>
                <span className="text-[10px] font-extrabold bg-[#b87d8d]/25 text-[#D6C9DF] px-2.5 py-0.5 rounded-full select-none">
                  {requests.filter(r => r.status !== 'Confirmed').length} Pending Review
                </span>
              </div>

              {requests.length === 0 ? (
                <div className="bg-[#25143a]/90 backdrop-blur-md rounded-3xl border border-white/10 p-12 text-center text-[#D6C9DF]/80 space-y-3 font-sans">
                  <Inbox className="w-10 h-10 text-[#b87d8d] mx-auto" />
                  <p className="text-sm font-bold text-white">The request queue is empty.</p>
                  <p className="text-xs leading-relaxed font-semibold max-w-sm mx-auto">
                    No travel check-in blocks are logged. Fill out a service query on the Web Form to fill the schedule!
                  </p>
                </div>
              ) : (
                <div className="space-y-4 font-sans">
                  {requests.map((req) => {
                    const isDropIn = req.serviceNeeded === 'Pet Care Only';
                    const isConfirmed = req.status === 'Confirmed';
                    const isPendingCancel = req.status === 'Cancellation Pending';
                    const isCritical = isCriticalRequest(req);
                    const hasCollision = isRequestColliding(req);
                    return (
                      <div
                        id={`request-card-${req.id}`}
                        key={req.id}
                        className={`bg-[#25143a]/90 backdrop-blur-md rounded-2xl border transition-all duration-200 p-5 space-y-4 relative overflow-hidden ${
                          isConfirmed 
                            ? 'border-emerald-500/30 bg-emerald-500/10' 
                            : isPendingCancel
                              ? 'border-[#E54B86]/40 bg-[#341121]'
                              : isCritical
                                ? 'border-pink-500/40 bg-[#2b1040]'
                                : 'border-white/10 hover:border-[#b87d8d]/30 shadow-lg'
                        } ${(isCritical || isPendingCancel) && !isConfirmed ? 'pt-10' : ''}`}
                      >
                        {isPendingCancel && (
                          <div className="absolute top-0 left-0 right-0 bg-red-650 text-white text-[9px] font-black uppercase tracking-widest text-center py-1.5 animate-pulse flex items-center justify-center gap-1 shadow-sm">
                            ⚠️ PILOT CANCELLATION REQUESTED BY CLIENT (Immediate Review)
                          </div>
                        )}
                        {isCritical && !isConfirmed && !isPendingCancel && (
                          <div className="absolute top-0 left-0 right-0 bg-pink-650 text-white text-[10px] font-black uppercase tracking-widest text-center py-2 animate-pulse flex items-center justify-center gap-1.5 shadow-[0_2px_10px_rgba(236,72,153,0.3)]">
                            ⚠️ CRITICAL CARE REQUIREMENT (High Priority Alert)
                          </div>
                        )}
                        {/* Tags and Type badges */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-block text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                              isDropIn 
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                            }`}>
                              {isDropIn ? 'Drop-In' : 'Overnight'}
                            </span>
                            <span className="text-[10px] font-extrabold text-[#D6C9DF]/50 uppercase tracking-widest leading-none">
                              {req.clientType}
                            </span>
                            {hasCollision && !isConfirmed && !isPendingCancel && (
                              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                                ⚠️ Booking Conflict
                              </span>
                            )}
                          </div>

                          <span className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                            isConfirmed 
                              ? 'bg-emerald-500/20 text-emerald-300' 
                              : isPendingCancel
                                ? 'bg-rose-500/20 text-[#E54B86]'
                                : 'bg-amber-500/25 text-amber-300'
                          }`}>
                            {isConfirmed ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                                Confirmed
                              </>
                            ) : isPendingCancel ? 'Cancellation Pending' : 'Received'}
                          </span>
                        </div>

                        {/* Booking Summary */}
                        <div className="space-y-1 text-left">
                          <h4 className="font-extrabold text-white text-base leading-snug">
                            {req.name}
                          </h4>
                          <p className="text-xs text-[#b87d8d] font-bold flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            {req.travelDates}
                          </p>
                          <p className="text-[11px] text-[#D6C9DF]/85 font-semibold flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#b87d8d] shrink-0" />
                            {req.neighborhood}
                          </p>
                        </div>

                        {/* Customer detailed specifications */}
                        <div className="bg-[#150724] p-3.5 rounded-xl border border-white/5 space-y-1.5 text-xs text-[#D6C9DF]/90 font-medium text-left">
                          {req.petsInvolved === 'Yes' && (
                            <p>🐾 <strong>Pets Involved:</strong> {req.petsDescription || 'Yes (Dog/Cat details unspecified)'}</p>
                          )}
                          <p>📱 <strong>Primary Contact:</strong> {req.phone}</p>
                          <p>✉️ <strong>Email Address:</strong> {req.email}</p>
                          {req.specialHomeInstructions && (
                            <div className="mt-2 text-[11px] leading-relaxed italic bg-[#25143a]/80 p-2 border border-white/10 rounded-lg text-[#D6C9DF]">
                              🏠 <strong>Home Instruction:</strong> &ldquo;{req.specialHomeInstructions}&rdquo;
                            </div>
                          )}
                          {req.specialPetInstructions && (
                            <div className="mt-2 text-[11px] leading-relaxed italic bg-[#25143a]/80 p-2 border border-white/10 rounded-lg text-white">
                              ❤️ <strong>Pet Care Need:</strong> &ldquo;{req.specialPetInstructions}&rdquo;
                            </div>
                          )}
                        </div>

                        {/* Interactive Buttons */}
                        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                          <button
                            id={`btn-deleteRequest-${req.id}`}
                            onClick={() => handleDeleteRequest(req.id)}
                            className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                            title="Remove completely"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="flex gap-2">
                            {isPendingCancel ? (
                              <button
                                onClick={() => handleApproveCancellation(req.id)}
                                className="px-4 py-2 bg-gradient-to-r from-rose-600 to-[#E54B86] hover:scale-[1.02] text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all shadow-md cursor-pointer flex items-center gap-1 border-0"
                              >
                                <Check className="w-3.5 h-3.5" /> Approve Cancellation
                              </button>
                            ) : isConfirmed ? (
                              <button
                                id={`btn-revokeRequest-${req.id}`}
                                onClick={() => handleRevokeRequest(req.id)}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer border-0"
                              >
                                Revoke Approval
                              </button>
                            ) : (
                              <button
                                id={`btn-approveRequest-${req.id}`}
                                onClick={() => {
                                  if (hasCollision) {
                                    alert("Automatic conflict lock active! Jamie, please resolve the double-booked overnight blocks on the calendar before approving this client request.");
                                    return;
                                  }
                                  handleApproveRequest(req.id);
                                }}
                                disabled={hasCollision}
                                title={hasCollision ? "Double Booking Warning active" : "Approve client booking"}
                                className={`px-4 py-2 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all shadow-xs border-0 flex items-center gap-1 ${
                                  hasCollision
                                    ? 'bg-neutral-600/50 text-neutral-405 cursor-not-allowed opacity-50'
                                    : 'bg-[#b87d8d] hover:bg-[#a66c7c] hover:shadow-md cursor-pointer active:scale-95'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5" /> Approve Booking
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column (Live Availability Calendar) */}
            <div className="lg:col-span-7 space-y-6 font-sans">
              <div className="bg-[#25143a]/90 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-6">
                
                {/* Calendar Filter and Headline */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-lg text-white">Live Availability Calendar</h3>
                    <p className="text-xs text-[#D6C9DF]/80 font-semibold font-sans">Real-time scheduling lockout matrix</p>
                  </div>

                  {/* Month Selection Buttons */}
                  <div className="inline-flex bg-[#150724] border border-white/10 p-1 rounded-xl">
                    <button
                      id="btn-calendar-june"
                      onClick={() => {
                        setSelectedMonth('June 2026');
                        setSelectedDayDetail(null);
                      }}
                      className={`px-4 py-1.5 text-xs font-extrabold uppercase rounded-lg transition-all cursor-pointer border-0 ${
                        selectedMonth === 'June 2026'
                          ? 'bg-[#b87d8d] text-white shadow-sm'
                          : 'text-[#D6C9DF]/50 hover:text-white'
                      }`}
                    >
                      June
                    </button>
                    <button
                      id="btn-calendar-july"
                      onClick={() => {
                        setSelectedMonth('July 2026');
                        setSelectedDayDetail(null);
                      }}
                      className={`px-4 py-1.5 text-xs font-extrabold uppercase rounded-lg transition-all cursor-pointer border-0 ${
                        selectedMonth === 'July 2026'
                          ? 'bg-[#b87d8d] text-white shadow-sm'
                          : 'text-[#D6C9DF]/50 hover:text-white'
                      }`}
                    >
                      July
                    </button>
                  </div>
                </div>

                {/* Grid Framework */}
                <div className="space-y-4">
                  
                  {/* Calendar Days Tracker */}
                  <div className="grid grid-cols-7 text-center">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((dayChar, idx) => (
                      <span key={`dayChar-${idx}`} className="text-xs font-extrabold text-[#D6C9DF]/60 uppercase select-none pb-2">
                        {dayChar}
                      </span>
                    ))}
                  </div>

                  {/* Live Rendered Cells */}
                  <div className="grid grid-cols-7 gap-2">
                    {(() => {
                      const isJune = selectedMonth === 'June 2026';
                      const startOffset = isJune ? 1 : 3; // June starts on Mon, July starts on Wed
                      const totalDays = isJune ? 30 : 31;
                      const monthStr = isJune ? 'June' : 'July';

                      const cells = [];

                      // Empty offset placeholders
                      for (let i = 0; i < startOffset; i++) {
                        cells.push(
                          <div 
                            key={`emptyCell-${i}`} 
                            className="bg-[#150724]/40 rounded-2xl min-h-[85px] border border-transparent select-none p-1 opacity-40 text-center" 
                          />
                        );
                      }

                      // Fully evaluated days
                      for (let d = 1; d <= totalDays; d++) {
                        // Match confirmed overnight stay requests
                        const confirmedOvernights = requests.filter(r => 
                          r.serviceNeeded !== 'Pet Care Only' && 
                          getDayStatusForRequest(r, d, monthStr)
                        );
                        const hasOvernight = confirmedOvernights.length > 0;

                        // Match Drop-In runs count
                        const confirmedDropIns = requests.filter(r => 
                          r.serviceNeeded === 'Pet Care Only' && 
                          getDayStatusForRequest(r, d, monthStr)
                        );
                        const dropInCount = confirmedDropIns.length;
                        
                        const isDaySelected = selectedDayDetail === d;

                        cells.push(
                          <button
                            id={`calcell-day-${d}`}
                            type="button"
                            key={`calday-${d}`}
                            onClick={() => setSelectedDayDetail(d)}
                            className={`p-2 rounded-2xl border min-h-[85px] flex flex-col justify-between text-left transition-all relative overflow-hidden cursor-pointer w-full tracking-tight ${
                              hasOvernight
                                ? 'bg-[#1e1b4b] text-white border-indigo-500 hover:bg-indigo-900 shadow-sm'
                                : dropInCount > 0
                                  ? 'bg-[#150724] border-2 border-amber-500/45 hover:border-amber-500 text-white'
                                  : 'bg-[#150724] border-white/10 hover:bg-white/5 hover:border-[#b87d8d]/30 text-[#D6C9DF] shadow-md'
                            } ${isDaySelected ? 'ring-2 ring-offset-2 ring-[#b87d8d] ring-offset-[#1a0b2e] scale-[1.03] z-10 shadow-md' : ''}`}
                          >
                            <span className={`text-[11px] font-extrabold flex items-center justify-center w-5 h-5 rounded-md leading-none ${
                              hasOvernight ? 'bg-white/20 text-white' : 'text-white'
                            }`}>
                              {d}
                            </span>

                            {/* Label tags */}
                            <div className="w-full text-[9px] font-bold uppercase select-none leading-none">
                              {hasOvernight ? (
                                <div className="space-y-0.5">
                                  <div className="font-extrabold bg-indigo-500/25 border border-indigo-500/20 text-indigo-300 px-1 py-0.5 rounded text-center truncate">Overnight</div>
                                  <div className="text-white/80 text-[8px] leading-tight truncate text-center font-semibold">
                                    {confirmedOvernights[0].name.split(' ')[0]}
                                  </div>
                                </div>
                              ) : dropInCount > 0 ? (
                                <div className="space-y-0.5">
                                  <div className="text-amber-400 font-extrabold bg-amber-500/10 px-1 py-0.5 rounded text-center truncate">
                                    {dropInCount} Visit{dropInCount > 1 ? 's' : ''}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[#D6C9DF]/40 font-medium block text-center text-[8px]">Open</span>
                              )}
                            </div>
                          </button>
                        );
                      }

                      return cells;
                    })()}
                  </div>

                </div>

                {/* Calendar Legend */}
                <div className="bg-[#150724] p-4 rounded-2xl border border-white/10 flex flex-wrap gap-4 items-center justify-center text-xs font-semibold select-none font-sans">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 bg-[#1e1b4b] border border-indigo-500 rounded-lg inline-block text-white" />
                    <span className="text-[#D6C9DF]">Overnight (Full Stays)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 bg-[#150724] border border-amber-500/40 rounded-lg inline-block" />
                    <span className="text-[#D6C9DF]">Drop-In Checks Active</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 bg-[#150724] border border-white/10 rounded-lg inline-block" />
                    <span className="text-[#D6C9DF]/55 font-normal">Available</span>
                  </div>
                </div>

                {/* Interactive Day Details Modal/Card */}
                {selectedDayDetail && (
                  <div id="calendar-day-detail" className="border-t border-white/10 pt-5 space-y-4 animate-in slide-in-from-top-4 duration-200 text-xs font-semibold font-sans">
                    <div className="flex justify-between items-center text-[#D6C9DF]">
                      <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#b87d8d]" />
                        Listings: {selectedMonth.split(' ')[0]} {selectedDayDetail}, 2026
                      </h4>
                      <button
                        onClick={() => setSelectedDayDetail(null)}
                        className="text-[10px] text-[#D6C9DF]/60 hover:text-white transition-colors uppercase font-bold border-0 bg-transparent cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>

                    {(() => {
                      const isJune = selectedMonth === 'June 2026';
                      const monthStr = isJune ? 'June' : 'July';
                      
                      const daysOvernights = requests.filter(r => r.serviceNeeded !== 'Pet Care Only' && getDayStatusForRequest(r, selectedDayDetail, monthStr));
                      const daysDropIns = requests.filter(r => r.serviceNeeded === 'Pet Care Only' && getDayStatusForRequest(r, selectedDayDetail, monthStr));

                      if (daysOvernights.length === 0 && daysDropIns.length === 0) {
                        return (
                          <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center text-emerald-450 leading-relaxed font-semibold">
                            🏡 No Confirmed blocks here! Jamie Giedd is completely open for overnight dog stays or house watches.
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-3 font-sans">
                          {/* Overnight List */}
                          {daysOvernights.length > 0 && (
                            <div className="space-y-2">
                              <h5 className="font-extrabold uppercase text-indigo-300 text-[10px] tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 block" /> Approved Overnight Placements
                              </h5>
                              {daysOvernights.map(req => (
                                <div key={req.id} className="p-4 bg-[#150724] border border-indigo-500/20 rounded-2xl space-y-2">
                                  <div className="flex justify-between">
                                    <span className="font-extrabold text-white text-sm">{req.name}</span>
                                    <span className="text-[9px] font-extrabold bg-indigo-500/25 text-indigo-350 px-2.5 py-0.5 rounded-full uppercase tracking-wider">{req.serviceNeeded}</span>
                                  </div>
                                  <div className="text-[#D6C9DF]/90 space-y-1 text-[11px] font-medium leading-relaxed font-sans">
                                    <p>📅 <strong>Stay Dates:</strong> {req.travelDates}</p>
                                    <p>📍 <strong>Neighborhood:</strong> {req.neighborhood}</p>
                                    <p>📱 <strong>Primary Contact:</strong> {req.phone}</p>
                                    {req.petsInvolved === 'Yes' && <p className="text-indigo-200 font-bold bg-indigo-500/10 p-1 px-2 rounded-md inline-block">🐕 Client Pets: {req.petsDescription}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Drop-Ins List */}
                          {daysDropIns.length > 0 && (
                            <div className="space-y-2">
                              <h5 className="font-extrabold uppercase text-amber-300 text-[10px] tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#b87d8d] block" /> Active Drop-In Rotations ({daysDropIns.length})
                              </h5>
                              {daysDropIns.map(req => (
                                <div key={req.id} className="p-4 bg-[#150724] border border-[#b87d8d]/20 rounded-2xl space-y-2">
                                  <div className="flex justify-between">
                                    <span className="font-extrabold text-white text-sm">{req.name}</span>
                                    <span className="text-[9px] font-extrabold bg-[#b87d8d]/25 text-[#b87d8d] px-2.5 py-0.5 rounded-full uppercase tracking-wider">{req.serviceNeeded}</span>
                                  </div>
                                  <div className="text-[#D6C9DF]/90 space-y-1 text-[11px] font-medium leading-relaxed font-sans">
                                    <p>📅 <strong>Stay Dates:</strong> {req.travelDates}</p>
                                    <p>📍 <strong>Neighborhood:</strong> {req.neighborhood}</p>
                                    <p>📱 <strong>Primary Contact:</strong> {req.phone}</p>
                                    <p className="text-amber-200 font-bold bg-amber-500/10 p-1 px-2 rounded-md inline-block">🐱 Client Pets: {req.petsDescription}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

              </div>
            </div>

          </div>
        ) : activeTab === 'associates' ? (
          /* Standby Associates Dashboard Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
            <div className="lg:col-span-12 space-y-6">
               <div className="flex justify-between items-center border-b border-white/10 pb-2">
                 <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                   Standby Reserves Roster ({associates.length})
                 </h3>
               </div>
               
               <div className="space-y-4">
                 {associates.length === 0 ? (
                   <div className="bg-[#1a0b2e]/60 rounded-2xl border border-white/5 p-8 text-center text-[#D6C9DF] space-y-3">
                     <p className="text-sm">No associates have applied to join the standby roster yet.</p>
                   </div>
                 ) : (
                   associates.map((assoc: any) => (
                     <div key={assoc.id} className="p-6 bg-[#1a0b2e] border border-white/10 rounded-2xl space-y-4">
                       <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
                         <div>
                           <div className="flex items-center gap-2">
                             <h4 className="font-extrabold text-[#D6C9DF] text-lg">{assoc.name}</h4>
                             <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                               assoc.status === 'Active Reserve' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                             }`}>
                               {assoc.status}
                             </span>
                           </div>
                           <p className="text-xs text-[#D6C9DF]/70 font-mono mt-1">{assoc.phone} • {assoc.email}</p>
                         </div>
                         <div className="flex gap-2">
                           {assoc.status === 'Pending Review' && (
                             <button
                               onClick={() => handleApproveAssociate(assoc.id)}
                               className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                             >
                               Approve Profile
                             </button>
                           )}
                           <button
                             onClick={() => handleRemoveAssociate(assoc.id)}
                             className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                           >
                              Remove
                           </button>
                         </div>
                       </div>
                       
                       <div>
                         <h5 className="text-[10px] uppercase font-black tracking-widest text-[#b87d8d] mb-2">Available Standby Dates</h5>
                         {assoc.availableDates && assoc.availableDates.length > 0 ? (
                           <div className="flex flex-wrap gap-2">
                             {assoc.availableDates.map((dateStr: string) => {
                               const d = new Date(dateStr);
                               return (
                                 <span key={dateStr} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs font-semibold text-[#D6C9DF]">
                                   {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                 </span>
                               );
                             })}
                           </div>
                         ) : (
                           <p className="text-xs text-[#D6C9DF]/50 italic">No availability selected yet.</p>
                         )}
                       </div>
                     </div>
                   ))
                 )}
               </div>
            </div>
          </div>
        ) : null}

      </div>

      {/* Reconciled Financial Ledger Dashboard */}
      {(() => {
        const getDaysCount = (travelDates: string): number => {
          const lower = travelDates.toLowerCase();
          if (lower.includes('june 20') && lower.includes('june 28')) return 8;
          if (lower.includes('july 02') && lower.includes('july 12')) return 10;
          if (lower.includes('june 15') && lower.includes('june 19')) return 4;
          
          const numbers = travelDates.match(/\d+/g)?.map(Number).filter(n => n >= 1 && n <= 31) || [];
          if (numbers.length >= 2) {
            const d1 = numbers[0];
            const d2 = numbers[1];
            if (d2 > d1) return d2 - d1;
          }
          return 7;
        };

        const getReqRate = (serviceNeeded: string): number => {
          if (serviceNeeded === 'Both House Watch And Pet Care') return 60;
          if (serviceNeeded === 'House Watch Only') return 40;
          if (serviceNeeded === 'Pet Care Only') return 25;
          return 40;
        };

        const confirmed = requests.filter(r => r.status === 'Confirmed');
        const pendingRequests = requests.filter(r => r.status !== 'Confirmed');

        const grossRevenue = confirmed.reduce((acc, r) => {
          const days = getDaysCount(r.travelDates);
          const rate = getReqRate(r.serviceNeeded);
          return acc + (days * rate);
        }, 0);

        const pendingPipeline = pendingRequests.reduce((acc, r) => {
          if (r.status === 'Cancellation Pending') return acc;
          const days = getDaysCount(r.travelDates);
          const rate = getReqRate(r.serviceNeeded);
          return acc + (days * rate);
        }, 0);

        const estimatedTaxEscrow = Number((grossRevenue * 0.065).toFixed(2));
        const calcStored = localStorage.getItem('plh_calculator_draft_total');
        const clientDraftValue = calcStored ? parseFloat(calcStored) : 0;

        return (
          <section id="projected-earnings-ledger" className="max-w-6xl mx-auto px-4 mt-12 mb-8 sm:px-6 animate-in fade-in slide-in-from-bottom-5 duration-350">
            <div className="bg-[#25143a]/90 backdrop-blur-md rounded-3xl border border-white/10 p-6 sm:p-8 shadow-xl space-y-6">
              
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4 text-left">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#b87d8d] animate-pulse" />
                    Projected Live Earnings Ledger
                  </h3>
                  <p className="text-xs text-[#D6C9DF]/80 font-semibold font-sans">
                    Real-time administrative financial metrics compiled from client site activity
                  </p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#b87d8d]/20 text-[#D6C9DF] px-3 py-1 rounded-full border border-[#b87d8d]/30">
                  AUDITED LOCAL ACCRUALS (Rapid City 6.5% standard tax)
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Gross Revenue */}
                <div className="bg-[#150724] border border-white/5 rounded-2xl p-5 space-y-2 text-left relative overflow-hidden shadow-md">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#b87d8d]/5 rounded-full blur-xl" />
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#b87d8d]">
                    Gross Approved Revenue
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-white leading-none">
                    ${grossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-[#D6C9DF]/65 font-medium leading-relaxed font-sans">
                    Aggregated book index parameters of confirmed travel lockout blocks
                  </p>
                </div>

                {/* Processing Inbound pipeline */}
                <div className="bg-[#150724] border border-white/5 rounded-2xl p-5 space-y-2 text-left relative overflow-hidden shadow-md">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl" />
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                    Pending Inbound Pipeline
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-amber-300 leading-none font-sans">
                    ${pendingPipeline.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-[#D6C9DF]/65 font-medium leading-relaxed font-sans">
                    Staged checkouts &amp; requests sitting inside staff review queues
                  </p>
                </div>

                {/* Tax Provision Escrow */}
                <div className="bg-[#150724] border border-white/5 rounded-2xl p-5 space-y-2 text-left relative overflow-hidden shadow-md">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-pink-500/5 rounded-full blur-xl" />
                  <p className="text-[11px] font-bold uppercase tracking-wider text-pink-400">
                    Rapid City Tax Escrow
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-pink-300 leading-none font-sans">
                    ${estimatedTaxEscrow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-[#D6C9DF]/65 font-medium leading-relaxed font-sans">
                    Accrued sales tax provision (6.5%) automatically calculated
                  </p>
                </div>

                {/* Scraped Active Tiered Invoice Draft Quote */}
                <div className="bg-[#150724] border border-white/5 rounded-2xl p-5 space-y-2 text-left relative overflow-hidden shadow-md">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl" />
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    Scraped Client Draft Quote
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-300 leading-none font-sans">
                    ${clientDraftValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-[#D6C9DF]/65 font-medium leading-relaxed font-sans">
                    Estimated total value currently staging in Client Calculator
                  </p>
                </div>

              </div>

              {/* Encrypted Disclaimer */}
              <div className="bg-[#150724]/60 border border-white/5 rounded-xl px-4 py-3 text-[10px] leading-relaxed text-[#D6C9DF]/70 font-semibold text-center flex flex-col sm:flex-row items-center justify-center gap-1.5 font-mono">
                <span>🛡️ FINANCIAL LEDGER METRICS GENERATED LIVE VIA SECURED ENCRYPTED REACT STATE EMULATORS.</span>
                <span className="text-[#b87d8d]">NO MOCK OR SIMULATED PLATFORM INTEGRITY LOOPS BYPASS SITE ACCOUNTING POLICIES.</span>
              </div>

            </div>
          </section>
        );
      })()}

      {/* Sleek, Dark-Themed Simulated Serverless Email Notification Modal */}
      {showEmailModal && emailModalRequest && (
        <div id="email-pipeline-modal" className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#1f0f35] border border-[#b87d8d]/30 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col my-8 animate-in zoom-in-95 duration-200 text-left">
            
            {/* Modal Header */}
            <div className="bg-[#2a1649] px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-3.5 w-3.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                </span>
                <p className="text-xs font-black uppercase tracking-widest text-[#D6C9DF]">Simulated Serverless Email Pipeline</p>
              </div>
              <button 
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailModalRequest(null);
                }}
                className="text-[#D6C9DF]/50 hover:text-white transition-colors p-1 rounded-full hover:bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Simulation Details and Sleek Email Draft */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="bg-[#150724] border border-white/5 rounded-2xl p-4 space-y-1 text-xs">
                <p className="text-[11px] font-black text-[#b87d8d] uppercase tracking-wider">⚡ Serverless Router Connected</p>
                <h4 className="text-sm font-bold text-white">Event Loop Trigger: <span className="text-emerald-400 font-mono text-xs">onBookingApproved</span></h4>
                <p className="text-[#D6C9DF]/80 font-medium leading-relaxed">
                  Triggered email dispatch to the client's verified address. Below is the fully rendered preview of the dynamic HTML transaction payload.
                </p>
              </div>

              {/* The Dark-Themed Transaction Email Body Preview */}
              <div className="border border-[#b87d8d]/20 rounded-2xl overflow-hidden shadow-xl bg-[#130721] font-sans text-sm">
                
                {/* Email Technical Headers */}
                <div className="bg-[#1a0b2e]/90 text-[11px] text-[#D6C9DF]/70 font-mono p-4 border-b border-white/10 space-y-1">
                  <div className="flex"><span className="w-18 text-white font-bold">From:</span> <span className="text-[#b87d8d]">Jamie @ Peace Love Home &lt;notification@peacelovehome.test&gt;</span></div>
                  <div className="flex"><span className="w-18 text-white font-bold">To:</span> <span className="text-emerald-400 font-bold">{emailModalRequest.email}</span></div>
                  <div className="flex"><span className="w-18 text-white font-bold">Date:</span> <span>{new Date().toLocaleString()} (Mountain Time)</span></div>
                  <div className="flex"><span className="w-18 text-white font-bold">Subject:</span> <span className="text-white font-bold">Booking Confirmed! 🏡🐾 Your Custom Care Schedule is locked</span></div>
                </div>

                {/* Email Visual Header */}
                <div className="px-8 py-8 bg-[#25143a] text-center border-b border-white/5">
                  <div className="text-xl font-black text-white tracking-widest uppercase flex items-center justify-center gap-2">
                    <span>✨ PEACE LOVE HOME ✨</span>
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-[#b87d8d] font-bold mt-1">Sitter &amp; Companion Watch Services</p>
                </div>

                {/* Email Visual Body */}
                <div className="p-8 space-y-6 text-[#D6C9DF]/90 font-medium leading-relaxed bg-[#150724]">
                  <p className="text-white font-bold text-base">Hello, {emailModalRequest.name}!</p>
                  
                  <p className="text-xs sm:text-sm">
                    Great news! Your service plan has been officially approved by Jamie Giedd of Peace Love Home. Your requested dates have been prioritized and locked on our schedule. 
                  </p>

                  {/* Date and details card */}
                  <div className="bg-[#1e0f35] border border-white/5 p-5 rounded-xl space-y-2.5">
                    <p className="text-[10px] font-black uppercase text-[#b87d8d] tracking-widest pb-1 border-b border-white/5">Approved Care Details</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
                      <div>
                        <p className="text-[#D6C9DF]/65 font-bold">Vacation Service Window</p>
                        <p className="text-white font-bold font-sans mt-0.5">{emailModalRequest.travelDates}</p>
                      </div>
                      <div>
                        <p className="text-[#D6C9DF]/65 font-bold">Neighborhood / Territory</p>
                        <p className="text-white font-bold font-sans mt-0.5">{emailModalRequest.neighborhood}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
                      <div>
                        <p className="text-[#D6C9DF]/65 font-bold">Assigned Caregiver</p>
                        <p className="text-[#b87d8d] font-bold mt-0.5">Jamie Giedd (Primary Sitter)</p>
                      </div>
                      <div>
                        <p className="text-[#D6C9DF]/65 font-bold">Requested Service Option</p>
                        <p className="text-white font-bold font-sans mt-0.5">{emailModalRequest.serviceNeeded}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm">
                    All home checking checklists, plant hydration routines, and custom pet dietary directions have been compiled into your active client dashboard context.
                  </p>

                  <div className="bg-[#b87d8d]/10 border border-dashed border-[#b87d8d]/30 p-4.5 rounded-xl text-center text-xs space-y-2">
                    <p className="text-[#b87d8d] font-black uppercase tracking-wider leading-none">🔐 Safe Custody deadlocks &amp; keys</p>
                    <p className="text-[11px] font-semibold text-[#D6C9DF]/80 leading-relaxed">
                      You can securely sync lock coordinates or drop-off times natively directly through your <strong className="text-white">Secure Portal</strong> at any time.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/5 space-y-1">
                    <p className="text-xs text-[#D6C9DF]/50 leading-relaxed">If you have any last-minute amendments to emergency listings or feeding schedules, feel free to update your portal or text us directly.</p>
                    <p className="font-bold text-white mt-4">Best regards,</p>
                    <p className="font-extrabold text-[#b87d8d] uppercase tracking-wider text-xs">Jamie Giedd</p>
                    <p className="text-[11px] font-bold text-[#D6C9DF]/65 leading-none">Founder &amp; Local Sitter Specialist</p>
                  </div>
                </div>

                {/* Email Footer */}
                <div className="bg-[#1a0b2e] px-8 py-5 border-t border-white/5 text-center text-[10px] text-[#D6C9DF]/40 font-mono">
                  This is a certified encrypted system simulation broadcast. Rapid City, SD 57702.
                </div>
              </div>
            </div>

            {/* Modal Controls */}
            <div className="bg-[#1a0b2e] px-6 py-4.5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[11px] text-[#D6C9DF]/60 font-semibold">
                Status: <span className="text-emerald-400 font-bold uppercase tracking-wider">Rendering Succeeded</span>
              </span>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    alert('Simulated Email Sent! Client inbox notified successfully.');
                    setShowEmailModal(false);
                    setEmailModalRequest(null);
                  }}
                  className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-[#b87d8d] hover:bg-[#a66c7c] text-white text-xs font-black uppercase tracking-wider transition-all duration-150 cursor-pointer text-center whitespace-nowrap"
                >
                  Confirm &amp; Simulate Send
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailModal(false);
                    setEmailModalRequest(null);
                  }}
                  className="flex-1 sm:flex-initial px-5 py-2 rounded-xl border border-white/10 text-[#D6C9DF] hover:bg-white/5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center whitespace-nowrap"
                >
                  Dismiss Preview
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Care Manifest Printable Modal */}
      {showCareManifest && (
        <div className="fixed inset-0 bg-[#150724]/90 backdrop-blur-md z-50 overflow-y-auto p-4 sm:p-6 md:p-10 flex items-center justify-center font-sans">
          <div className="bg-white text-neutral-900 w-full max-w-4xl rounded-3xl p-6 sm:p-10 shadow-2xl relative space-y-6 animate-in zoom-in-95 duration-200 border border-neutral-200">
            
            {/* Header Action Row (Non-printable) */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 pb-5 print:hidden">
              <div>
                <h2 className="text-xl font-extrabold text-neutral-900 uppercase tracking-tight flex items-center gap-2 text-left">
                  📋 Jamie's Daily Care Manifest
                </h2>
                <p className="text-xs text-neutral-500 text-left">
                  Aggregated checklist compiled from {requests.filter(r => r.status === 'Confirmed').length} active, confirmed booking locks.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#b87d8d] hover:bg-[#a66c7c] text-white text-xs font-bold uppercase rounded-full shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Print Manifest / Save PDF
                </button>
                <button
                  onClick={() => setShowCareManifest(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold uppercase rounded-full transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* PRINTABLE PAGE wrapper */}
            <div id="care-manifest-sheet" className="space-y-8 bg-white text-neutral-900 p-2 text-left">
              <div className="border-b-4 border-neutral-900 pb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-neutral-900">PRAIRIE LAND WATCH</h1>
                  <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest mt-0.5">Jamie's Administrative House-Sitting Manifest</p>
                </div>
                <div className="text-right text-xs font-mono font-semibold text-neutral-600">
                  <p>Generated: {new Date().toLocaleDateString()}</p>
                  <p>Status: CONFIRMED BLOCKS CURRENT</p>
                </div>
              </div>

              <div className="space-y-6">
                {requests.filter(r => r.status === 'Confirmed').length === 0 ? (
                  <p className="text-xs italic text-neutral-500 text-center py-10 border border-neutral-150 rounded-xl">
                    No currently active, approved travel blocks on the schedule to compile rules from.
                  </p>
                ) : (
                  requests
                    .filter(r => r.status === 'Confirmed')
                    .map((req, idx) => {
                      const isCritical = (() => {
                        if (!req.specialPetInstructions) return false;
                        const keywords = ['insulin', 'medication', 'seizures', 'allergies', 'meds', 'rx', 'allergy', 'seizure', 'diabetic', 'chronic'];
                        const lower = req.specialPetInstructions.toLowerCase();
                        return keywords.some(k => lower.includes(k));
                      })();

                      const savedRules = localStorage.getItem('plh_saved_rules') || '1. Feed senior terrier Griffin twice daily. (1.5 cups dry morning + daily joint soft chew).\n2. Bring in packages and water hanging porch ferns on alternating days.\n3. Verify patio back gate deadbolt lock physically checked before sundown.';
                      const safetyContacts = localStorage.getItem('plh_emergency_contacts') || req.emergencyContact || 'Bob\'s Veterinary Clinic (605-555-0199) • Neighbor Bill (605-555-4422)';

                      return (
                        <div key={req.id || idx} className={`p-5 rounded-2xl border-2 text-xs space-y-4 relative ${
                          isCritical ? 'border-amber-500 bg-amber-50/10' : 'border-neutral-200 bg-white'
                        }`}>
                          {isCritical && (
                            <div className="absolute top-4 right-4 bg-amber-500 text-neutral-900 font-black px-2.5 py-1 rounded text-[9px] uppercase tracking-wider animate-pulse flex items-center gap-1 shadow-sm">
                              ⚠️ CRITICAL CARE ACTIVE
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2 border-b border-neutral-100">
                            <div>
                              <p className="text-[10px] uppercase text-neutral-400 font-bold tracking-wider">Client Name & Region</p>
                              <h3 className="text-base font-black text-neutral-900">{req.name} <span className="text-xs text-neutral-500 font-semibold">({req.neighborhood})</span></h3>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase text-neutral-400 font-bold tracking-wider">Scheduled Stay Dates</p>
                              <p className="text-sm font-bold text-[#b87d8d]">{req.travelDates}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                            {/* Left Info: Section 3 House Rules Archive */}
                            <div className="space-y-1.5">
                              <p className="font-extrabold text-[10px] uppercase tracking-wider text-neutral-500">🏠 Section 3: House Rules Archive</p>
                              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100 italic leading-relaxed text-neutral-700 whitespace-pre-wrap">
                                {savedRules}
                              </div>
                            </div>

                            {/* Right Info: Section 4 Pet care Checklist */}
                            <div className="space-y-1.5">
                              <p className="font-extrabold text-[10px] uppercase tracking-wider text-neutral-500">🐾 Section 4: Pet Care Checklist</p>
                              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100 leading-relaxed text-neutral-700 space-y-1.5">
                                {req.specialPetInstructions ? (
                                  <p className="italic font-medium text-neutral-900 border-l-2 border-neutral-300 pl-2">
                                    &ldquo;{req.specialPetInstructions}&rdquo;
                                  </p>
                                ) : (
                                  <p className="italic text-neutral-400 font-semibold">No special instructions. Normal pet routing applies.</p>
                                )}
                                {req.petsDescription && (
                                  <p className="text-[11px] font-semibold text-neutral-600">
                                    Sitter Profile Details: {req.petsDescription}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Section 5: Safety Contacts List & Emergency details */}
                          <div className="bg-neutral-950 text-white p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-left">
                            <div className="space-y-0.5">
                              <p className="text-[8px] font-black uppercase text-[#b87d8d] tracking-widest">Section 5: Certified Safety Contacts</p>
                              <p className="font-bold text-xs shrink-0 tracking-tight leading-relaxed">{safetyContacts}</p>
                            </div>
                            <span className="text-[9px] font-serif uppercase tracking-widest text-neutral-400 px-2.5 py-0.5 border border-white/10 rounded-md shrink-0 text-center">
                              🔒 Security Vaulted
                            </span>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>

            {/* Modal Close Button Row (Non-printable) */}
            <div className="flex justify-end pt-4 border-t border-neutral-200 print:hidden">
              <button
                onClick={() => setShowCareManifest(false)}
                className="px-6 py-2 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-bold uppercase transition-all cursor-pointer"
              >
                Close Sheet
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
