import React, { useState, useEffect } from 'react';
import { ActivePage, ServiceRequest } from '../types';
import { Mail, Phone, Calendar, MapPin, ClipboardList, Info, HelpCircle, Eye, Heart, Layers, CircleCheck, CheckCircle2, ClipboardCheck, ArrowRight, CornerDownRight, Inbox, Trash } from 'lucide-react';

interface RequestViewProps {
  setActivePage: (page: ActivePage) => void;
}

// Initial mock requests so the prototype doesn't look empty when looking at the requests box
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
  }
];

export default function RequestView({ setActivePage }: RequestViewProps) {
  const [requests, setRequests] = useState<ServiceRequest[]>(() => {
    const stored = localStorage.getItem('plh_service_requests');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // Fallback below
      }
    }
    return INITIAL_REQUESTS;
  });

  useEffect(() => {
    localStorage.setItem('plh_service_requests', JSON.stringify(requests));
  }, [requests]);

  const [submitted, setSubmitted] = useState(false);
  const [showInquiryLog, setShowInquiryLog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form Field State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [serviceNeeded, setServiceNeeded] = useState<'House Watch Only' | 'Pet Care Only' | 'Both House Watch And Pet Care' | 'Not Sure Yet'>('Both House Watch And Pet Care');
  const [travelDates, setTravelDates] = useState('');
  const [frequencyNeeded, setFrequencyNeeded] = useState('Daily Check-in');
  const [neighborhood, setNeighborhood] = useState('');
  const [clientType, setClientType] = useState<'New Client' | 'Returning Client'>('New Client');
  const [petsInvolved, setPetsInvolved] = useState<'Yes' | 'No'>('Yes');
  const [petsDescription, setPetsDescription] = useState('');
  const [specialHomeInstructions, setSpecialHomeInstructions] = useState('');
  const [specialPetInstructions, setSpecialPetInstructions] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [preferredUpdateMethod, setPreferredUpdateMethod] = useState<'Text Message' | 'Email' | 'Phone Call'>('Text Message');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Consume pre-selected calendar reservation check parameters
  useEffect(() => {
    const preselectedDates = localStorage.getItem('plh_preselected_dates');
    if (preselectedDates) {
      setTravelDates(preselectedDates);
      localStorage.removeItem('plh_preselected_dates');
    }
    const preselectedService = localStorage.getItem('plh_preselected_service');
    if (preselectedService) {
      if (preselectedService === 'Overnight') {
        setServiceNeeded('Both House Watch And Pet Care');
      } else if (preselectedService === 'Drop-In') {
        setServiceNeeded('Pet Care Only');
      }
      localStorage.removeItem('plh_preselected_service');
    }
  }, []);

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !phone || !email || !travelDates || !neighborhood) {
      alert('Please fill out all required basic contact fields (Name, Phone, Email, Dates, and Neighborhood) to proceed.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const requestPayload = {
      _subject: 'New Peace Love Home + Pet Watch inquiry',
      name,
      phone,
      email,
      serviceNeeded,
      travelDates,
      frequencyNeeded,
      neighborhood,
      clientType,
      petsInvolved: serviceNeeded === 'Pet Care Only' || serviceNeeded === 'Both House Watch And Pet Care' ? 'Yes' : petsInvolved,
      petsDescription: serviceNeeded === 'House Watch Only' ? '' : petsDescription,
      specialHomeInstructions: serviceNeeded === 'Pet Care Only' ? '' : specialHomeInstructions,
      specialPetInstructions: serviceNeeded === 'House Watch Only' ? '' : specialPetInstructions,
      emergencyContact,
      preferredUpdateMethod,
      additionalNotes
    };

    try {
      const response = await fetch('https://formspree.io/f/mqervbwa', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        let errorMessage = 'Your request could not be delivered. Please review your details and try again.';
        try {
          const result = await response.json() as {
            error?: string;
            errors?: Array<{ message?: string }>;
          };
          const providerMessage = result.errors
            ?.map((item) => item.message)
            .filter(Boolean)
            .join(' ');
          if (providerMessage) errorMessage = providerMessage;
          else if (result.error) errorMessage = result.error;
        } catch {
          // Preserve the safe fallback when Formspree does not return JSON.
        }
        throw new Error(errorMessage);
      }

      setSubmitted(true);
    } catch (error) {
      console.error('Formspree submission failed', error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Your request could not be delivered. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setTravelDates('');
    setNeighborhood('');
    setPetsDescription('');
    setSpecialHomeInstructions('');
    setSpecialPetInstructions('');
    setEmergencyContact('');
    setAdditionalNotes('');
    setSubmitError(null);
    setSubmitting(false);
    setSubmitted(false);
  };

  const removeRequest = (id: string) => {
    setRequests(requests.filter(r => r.id !== id));
  };

  return (
    <div id="request-view" className="bg-brand-stone min-h-screen pb-16 font-sans">
      
      {/* Header */}
      <section id="request-header" className="px-4 py-16 sm:px-6 lg:px-8 bg-brand-stone border-b border-brand-plum/10">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl text-brand-plum tracking-tight leading-tight">
            Say Hello
          </h1>
        </div>
      </section>

      {/* Main Form Area */}
      <section id="form-container" className="max-w-3xl mx-auto px-4 py-12 sm:px-6">
        
        {!submitted ? (
          <form id="booking-intake-form" onSubmit={handleSubmit} className="bg-white rounded-3xl border border-brand-pink/15 p-6 sm:p-8 space-y-8 shadow-sm">

            {/* Step 1: Base Contact Details */}
            <div id="form-sec-contact" className="space-y-4">
              <h3 className="text-sm font-bold text-brand-plum border-b-2 border-brand-plum/10 pb-1">
                1. Your Contact Details
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="input-name" className="text-xs font-bold uppercase text-brand-plum tracking-wider block">
                    Full Name <span className="text-brand-pink-dark font-bold">*</span>
                  </label>
                  <input
                    id="input-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Amanda Vance"
                    className="w-full text-xs font-semibold px-3.5 py-2.5 bg-white border border-brand-pink/30 rounded-xl text-brand-plum focus:bg-white focus:border-brand-plum focus:ring-1 focus:ring-brand-plum focus:outline-none transition-colors"
                  />
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="input-phone" className="text-xs font-bold uppercase text-brand-plum tracking-wider block">
                    Phone Number <span className="text-brand-pink-dark font-bold">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-3.5 h-3.5 text-brand-plum/60" />
                    <input
                      id="input-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 605-555-1234"
                      className="w-full text-xs font-semibold pl-10 pr-3.5 py-2.5 bg-white border border-brand-pink/30 rounded-xl text-brand-plum focus:bg-white focus:border-brand-plum focus:ring-1 focus:ring-brand-plum focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="input-email" className="text-xs font-bold uppercase text-brand-plum tracking-wider block">
                    Email Address <span className="text-brand-pink-dark font-bold">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-3.5 h-3.5 text-brand-plum/60" />
                    <input
                      id="input-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. amanda@vance.test"
                      className="w-full text-xs font-semibold pl-10 pr-3.5 py-2.5 bg-white border border-brand-pink/30 rounded-xl text-brand-plum focus:bg-white focus:border-brand-plum focus:ring-1 focus:ring-brand-plum focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="input-client-type" className="text-xs font-bold uppercase text-brand-plum tracking-wider block">
                    Have We Coordinated Before? <span className="text-brand-pink-dark font-bold">*</span>
                  </label>
                  <select
                    id="input-client-type"
                    value={clientType}
                    onChange={(e) => setClientType(e.target.value as any)}
                    className="w-full text-xs font-semibold px-3.5 py-2.5 bg-white border border-brand-pink/30 rounded-xl text-brand-plum focus:bg-white focus:outline-none focus:border-brand-plum focus:ring-1 focus:ring-brand-plum transition-colors"
                  >
                    <option value="New Client">No, I am a new client / referral</option>
                    <option value="Returning Client">Yes, I am a returning client</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Service Pathway and Dates */}
            <div id="form-sec-dates" className="space-y-4">
              <h3 className="text-sm font-bold text-brand-plum border-b border-brand-plum/10 pb-1">
                2. Your Support Type & Travel Dates
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-brand-plum tracking-wider block">
                  Select Required Service Path <span className="text-brand-pink-dark font-bold">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {[
                    { id: 'House Watch Only', label: 'House Watch Only', icon: Eye },
                    { id: 'Pet Care Only', label: 'Pet Care Only', icon: Heart },
                    { id: 'Both House Watch And Pet Care', label: 'Both Home & Pet', icon: Layers },
                    { id: 'Not Sure Yet', label: 'Not Sure Yet', icon: HelpCircle }
                  ].map((option) => {
                    const Icon = option.icon;
                    const isSelected = serviceNeeded === option.id;
                    return (
                      <button
                        type="button"
                        id={`btn-pathOption-${option.id.replace(/\s+/g, '')}`}
                        key={option.id}
                        onClick={() => {
                          setServiceNeeded(option.id as any);
                          if (option.id === 'House Watch Only') setPetsInvolved('No');
                          if (option.id === 'Pet Care Only') setPetsInvolved('Yes');
                        }}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-brand-pink-light/30 border-brand-plum text-brand-plum font-bold'
                            : 'bg-white border-brand-pink/15 text-brand-plum/80 hover:bg-brand-pink-light/20 shadow-sm'
                        }`}
                      >
                        <Icon className="w-5 h-5 mb-1.5 shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-tight block">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="input-dates" className="text-xs font-bold uppercase text-brand-plum tracking-wider block">
                    Travel Dates <span className="text-brand-pink-dark font-bold">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3 w-3.5 h-3.5 text-brand-plum/60" />
                    <input
                      id="input-dates"
                      type="text"
                      required
                      value={travelDates}
                      onChange={(e) => setTravelDates(e.target.value)}
                      placeholder="e.g. July 2 - July 12, 2026"
                      className="w-full text-xs font-semibold pl-10 pr-3.5 py-2.5 bg-white border border-brand-pink/30 rounded-xl text-brand-plum focus:bg-white focus:border-brand-plum focus:ring-1 focus:ring-brand-plum focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="input-location" className="text-xs font-bold uppercase text-brand-plum tracking-wider block">
                    Home Location / Neighborhood <span className="text-brand-pink-dark font-bold">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-3.5 h-3.5 text-brand-plum/60" />
                    <input
                      id="input-location"
                      type="text"
                      required
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="e.g. Canyon Lake / West Rapid"
                      className="w-full text-xs font-semibold pl-10 pr-3.5 py-2.5 bg-white border border-brand-pink/30 rounded-xl text-brand-plum focus:bg-white focus:border-brand-plum focus:ring-1 focus:ring-brand-plum focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="input-frequency" className="text-xs font-bold uppercase text-brand-plum tracking-wider block">
                    How Often Is Check-In Needed? <span className="text-brand-pink-dark font-bold">*</span>
                  </label>
                  <select
                    id="input-frequency"
                    value={frequencyNeeded}
                    onChange={(e) => setFrequencyNeeded(e.target.value)}
                    className="w-full text-xs font-semibold px-3.5 py-2.5 bg-white border border-brand-pink/30 rounded-xl text-brand-plum focus:bg-white focus:border-brand-plum focus:ring-1 focus:ring-brand-plum focus:outline-none transition-colors"
                  >
                    <option value="Daily Check-in">Daily Check-in visits</option>
                    <option value="Every Other Day">Every Other Day check-ins</option>
                    <option value="Twice a Week">Twice a Week visits</option>
                    <option value="Overnights Sitting">Overnight In-Home Sitting slot</option>
                    <option value="Other">Other / custom (details below)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="input-update-method" className="text-xs font-bold uppercase text-brand-plum tracking-wider block">
                    How Do You Prefer Updates? <span className="text-brand-pink-dark font-bold">*</span>
                  </label>
                  <select
                    id="input-update-method"
                    value={preferredUpdateMethod}
                    onChange={(e) => setPreferredUpdateMethod(e.target.value as any)}
                    className="w-full text-xs font-semibold px-3.5 py-2.5 bg-white border border-brand-pink/30 rounded-xl text-brand-plum focus:bg-white focus:border-brand-plum focus:ring-1 focus:ring-brand-plum focus:outline-none transition-colors"
                  >
                    <option value="Text Message">Text Messages (photo check-ins)</option>
                    <option value="Email">Email Summaries</option>
                    <option value="Phone Call">Phone Calls</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Conditional Core Logic Fields */}
            
            {/* CONDITIONAL: HOUSE WATCH DETAILS (Matches 'House Watch Only' or 'Both') */}
            {(serviceNeeded === 'House Watch Only' || serviceNeeded === 'Both House Watch And Pet Care') && (
              <div id="conditional-house-fields" className="space-y-4 animate-in fade-in slide-in-from-top-3 duration-250">
                <h3 className="text-sm font-bold text-brand-plum border-b border-brand-plum/10 pb-1 flex items-center gap-1.5 select-none font-sans">
                  <CornerDownRight className="w-4 h-4 text-brand-pink-dark" />
                  House-Watch Check Lists Details
                </h3>

                <div className="space-y-1">
                  <label htmlFor="input-home-instructions" className="text-xs font-bold uppercase text-brand-plum tracking-wider block">
                    Special Home Instructions
                  </label>
                  <textarea
                    id="input-home-instructions"
                    rows={5}
                    value={specialHomeInstructions}
                    onChange={(e) => setSpecialHomeInstructions(e.target.value)}
                    placeholder="Mail, plants, keys, blinds, access notes, or other home details."
                    className="w-full text-xs font-semibold px-3.5 py-2.5 bg-white border border-brand-pink/30 rounded-xl text-brand-plum focus:bg-white focus:border-brand-plum focus:ring-1 focus:ring-brand-plum focus:outline-none transition-colors min-h-[120px]"
                  />
                </div>
              </div>
            )}

            {/* CONDITIONAL: PET CARE DETAILS (Matches 'Pet Care Only' or 'Both') */}
            {(serviceNeeded === 'Pet Care Only' || serviceNeeded === 'Both House Watch And Pet Care') && (
              <div id="conditional-pet-fields" className="space-y-4 animate-in fade-in slide-in-from-top-3 duration-250">
                <h3 className="text-sm font-bold text-brand-plum border-b border-brand-plum/10 pb-1 flex items-center gap-1.5 select-none font-sans">
                  <CornerDownRight className="w-4 h-4 text-brand-pink-dark" />
                  Pet Care Check Lists Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="input-pets-desc" className="text-xs font-bold uppercase text-brand-plum tracking-wider block">
                      Number and Type of Pets <span className="text-brand-pink-dark font-bold">*</span>
                    </label>
                    <input
                      id="input-pets-desc"
                      type="text"
                      required={serviceNeeded === 'Pet Care Only' || serviceNeeded === 'Both House Watch And Pet Care'}
                      value={petsDescription}
                      onChange={(e) => setPetsDescription(e.target.value)}
                      placeholder="e.g. 1 Golden Retriever (Buster, 8 yrs)"
                      className="w-full text-xs font-semibold px-3.5 py-2.5 bg-white border border-brand-pink/30 rounded-xl text-brand-plum focus:bg-white focus:border-brand-plum focus:ring-1 focus:ring-brand-plum focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="input-pet-safety" className="text-xs font-bold uppercase text-brand-plum tracking-wider block">
                      Are Your Pets Inside or Outside?
                    </label>
                    <select
                      id="input-pet-safety"
                      className="w-full text-xs font-semibold px-3.5 py-2.5 bg-white border border-brand-pink/30 rounded-xl text-brand-plum focus:bg-white focus:border-brand-plum focus:ring-1 focus:ring-brand-plum focus:outline-none transition-colors"
                    >
                      <option>Strictly Indoors</option>
                      <option>Indoors with Backyard Access</option>
                      <option>Strictly Outdoors (With Kennel/Barn)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="input-pet-instructions" className="text-xs font-bold uppercase text-brand-plum tracking-wider block">
                    Special Pet Instructions
                  </label>
                  <textarea
                    id="input-pet-instructions"
                    rows={5}
                    value={specialPetInstructions}
                    onChange={(e) => setSpecialPetInstructions(e.target.value)}
                    placeholder="Food, water, litter, medications list, routines, or pet comfort notes."
                    className="w-full text-xs font-semibold px-3.5 py-2.5 bg-white border border-brand-pink/30 rounded-xl text-brand-plum focus:bg-white focus:border-brand-plum focus:ring-1 focus:ring-brand-plum focus:outline-none transition-colors min-h-[120px]"
                  />
                  {/* Real-time Critical Care Flag Warning */}
                  {(() => {
                    const keywords = ['insulin', 'medication', 'seizures', 'allergies', 'meds', 'rx', 'allergy', 'seizure', 'diabetic', 'chronic'];
                    const lower = specialPetInstructions.toLowerCase();
                    const isCritical = keywords.some(k => lower.includes(k));
                    if (!isCritical) return null;
                    return (
                      <div className="mt-2 text-[11px] font-black uppercase tracking-wider text-pink-600 bg-pink-50 border border-pink-200 p-2.5 rounded-lg flex items-center gap-1.5 animate-pulse shadow-2xs text-left">
                        <span>⚠️ CRITICAL CARE ACTIVE:</span>
                        <span className="font-semibold text-[10px] text-pink-500 normal-case">This care detail will be included in your request for Jamie's review.</span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* CONDITIONAL: NOT SURE YET (General details section) */}
            {serviceNeeded === 'Not Sure Yet' && (
              <div id="conditional-notsure-fields" className="space-y-4 animate-in fade-in slide-in-from-top-3 duration-250">
                <h3 className="text-xs uppercase font-bold text-brand-plum tracking-widest border-b-2 border-brand-plum/10 pb-1 flex items-center gap-1.5 select-none">
                  <CornerDownRight className="w-4 h-4 text-brand-pink-dark" />
                  General Schedule Review
                </h3>
                <p className="text-xs text-brand-plum/85 font-medium">
                  Please let me know a few general thoughts about your travel goals. Are pets involved? Does the house need mail collected? We will sort the exact details on our call!
                </p>
              </div>
            )}

            {/* Step 4: Emergency Contacts & Notes */}
            <div id="form-sec-emergency" className="space-y-4">
              <h3 className="text-sm font-bold text-brand-plum border-b border-brand-plum/10 pb-1">
                3. Safety Contacts & Additional Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="input-emergency" className="text-xs font-bold uppercase text-brand-plum tracking-wider block">
                    Emergency Contact Name & Phone <span className="text-brand-pink-dark font-bold">*</span>
                  </label>
                  <input
                    id="input-emergency"
                    type="text"
                    required
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="e.g. Sarah Miller (Daughter) - 605-555-0199"
                    className="w-full text-xs font-semibold px-3.5 py-2.5 bg-white border border-brand-pink/30 rounded-xl text-brand-plum focus:bg-white focus:border-brand-plum focus:ring-1 focus:ring-brand-plum focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="input-notes" className="text-xs font-bold uppercase text-brand-plum tracking-wider block">
                    Anything else I should know?
                  </label>
                  <textarea
                    id="input-notes"
                    rows={3}
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="e.g. Garage door code or details, lockboxes, keypad instructions, or extra notes."
                    className="w-full text-xs font-semibold px-3.5 py-2.5 bg-white border border-brand-pink/30 rounded-xl text-brand-plum focus:bg-white focus:border-brand-plum focus:ring-1 focus:ring-brand-plum focus:outline-none transition-colors min-h-[80px]"
                  />
                </div>
              </div>
            </div>

            {/* Submission CTAs and Disclaimer */}
            <div id="submit-action-div" className="pt-4 border-t border-brand-plum/10 space-y-4">
              
              {/* COMPLIANCE DISCLAIMER */}
              <div className="rounded-xl bg-brand-pink-light/30 border border-brand-pink/15 p-4">
                <p id="submission-disclaimer" className="text-xs text-brand-plum leading-relaxed font-semibold">
                  Submitting this form does not confirm booking, availability, pricing, or final service terms. I will follow up to confirm details directly.
                </p>
              </div>

              {submitError && (
                <div
                  id="form-submission-error"
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold leading-relaxed text-red-800"
                >
                  {submitError}
                </div>
              )}

              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  id="submit-form-button"
                  disabled={submitting}
                  aria-busy={submitting}
                  className={`w-full sm:w-auto px-8 py-3.5 bg-[#100720] hover:bg-brand-plum-hover text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md border-0 flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-70 disabled:hover:bg-[#100720] ${submitting ? 'cursor-wait' : 'cursor-pointer'}`}
                >
                  <ClipboardCheck className="w-4 h-4 text-white" />
                  <span>{submitting ? 'Sending Your Request...' : 'Save Your Vacation Block'}</span>
                </button>
              </div>
            </div>

          </form>
        ) : (
          /* SUCCESS SCREEN */
          <div id="form-success-box" className="bg-[#FDF8FB] rounded-3xl border border-brand-pink/20 p-8 sm:p-10 text-center space-y-8 shadow-md relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            {/* Inline CSS styling block dedicated for high fidelity success screen micro interactions */}
            <style>{`
              @keyframes confetti-pop-1 {
                0% { transform: translate(0, 0) scale(0) rotate(0deg); opacity: 0; }
                20% { opacity: 1; }
                100% { transform: translate(-100px, -70px) scale(1) rotate(45deg); opacity: 0; }
              }
              @keyframes confetti-pop-2 {
                0% { transform: translate(0, 0) scale(0) rotate(0deg); opacity: 0; }
                20% { opacity: 1; }
                100% { transform: translate(110px, -85px) scale(0.9) rotate(-35deg); opacity: 0; }
              }
              @keyframes confetti-pop-3 {
                0% { transform: translate(0, 0) scale(0) rotate(0deg); opacity: 0; }
                20% { opacity: 1; }
                100% { transform: translate(-110px, 50px) scale(0.8) rotate(120deg); opacity: 0; }
              }
              @keyframes confetti-pop-4 {
                0% { transform: translate(0, 0) scale(0) rotate(0deg); opacity: 0; }
                20% { opacity: 1; }
                100% { transform: translate(105px, 60px) scale(1.1) rotate(-110deg); opacity: 0; }
              }
              @keyframes confetti-pop-5 {
                0% { transform: translate(0, 0) scale(0) rotate(0deg); opacity: 0; }
                20% { opacity: 1; }
                100% { transform: translate(0px, -120px) scale(0.9) rotate(20deg); opacity: 0; }
              }
              @keyframes confetti-pop-6 {
                0% { transform: translate(0, 0) scale(0) rotate(0deg); opacity: 0; }
                20% { opacity: 1; }
                100% { transform: translate(-40px, -110px) scale(1) rotate(-80deg); opacity: 0; }
              }
              @keyframes confetti-pop-7 {
                0% { transform: translate(0, 0) scale(0) rotate(0deg); opacity: 0; }
                20% { opacity: 1; }
                100% { transform: translate(50px, -100px) scale(0.8) rotate(90deg); opacity: 0; }
              }
              @keyframes ring-pulse-wave {
                0% { transform: scale(0.7); opacity: 0.8; }
                100% { transform: scale(1.8); opacity: 0; }
              }
              .animate-pop-1 { animation: confetti-pop-1 1.6s cubic-bezier(0.1, 0.8, 0.25, 1) infinite; }
              .animate-pop-2 { animation: confetti-pop-2 1.6s cubic-bezier(0.1, 0.8, 0.25, 1) infinite; animation-delay: 0.1s; }
              .animate-pop-3 { animation: confetti-pop-3 1.6s cubic-bezier(0.1, 0.8, 0.25, 1) infinite; animation-delay: 0.05s; }
              .animate-pop-4 { animation: confetti-pop-4 1.6s cubic-bezier(0.1, 0.8, 0.25, 1) infinite; animation-delay: 0.15s; }
              .animate-pop-5 { animation: confetti-pop-5 1.6s cubic-bezier(0.1, 0.8, 0.25, 1) infinite; }
              .animate-pop-6 { animation: confetti-pop-6 1.6s cubic-bezier(0.1, 0.8, 0.25, 1) infinite; animation-delay: 0.2s; }
              .animate-pop-7 { animation: confetti-pop-7 1.6s cubic-bezier(0.1, 0.8, 0.25, 1) infinite; animation-delay: 0.08s; }
              .pulse-wave-1 { animation: ring-pulse-wave 2s cubic-bezier(0.16, 1, 0.3, 1) infinite; }
              .pulse-wave-2 { animation: ring-pulse-wave 2s cubic-bezier(0.16, 1, 0.3, 1) infinite; animation-delay: 0.6s; }
            `}</style>

            {/* Bouncing checkmark nested under active outward pulsing waves & colorful micro bursts */}
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
              {/* Outward Ambient Rings */}
              <div className="absolute inset-2 rounded-full border-2 border-brand-pink/20 pulse-wave-1" />
              <div className="absolute inset-2 rounded-full border-2 border-brand-pink/10 pulse-wave-2" />

              {/* Burst Confetti Particles */}
              <div className="absolute w-2.5 h-2.5 rounded-full bg-rose-500 animate-pop-1" />
              <div className="absolute w-3 h-1.5 bg-amber-400 rounded-sm animate-pop-2" />
              <div className="absolute w-2 h-2 rounded-full bg-emerald-400 animate-pop-3" />
              <div className="absolute w-2.5 h-2.5 bg-indigo-400 rotate-45 animate-pop-4" />
              <div className="absolute w-1.5 h-3 bg-cyan-400 rounded-full animate-pop-5" />
              <div className="absolute w-2.5 h-2.5 rounded-full bg-pink-500 animate-pop-6" />
              <div className="absolute w-2 h-2 bg-purple-500 rotate-12 animate-pop-7" />

              {/* Main Checkmark Shield container */}
              <div className="relative z-10 w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                <CircleCheck className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
            </div>
            
            <div className="space-y-4 max-w-2xl mx-auto">
              {/* Requested Custom Complete Vacation Header and text */}
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-plum">
                🎉 Your Vacation Block is Staging!
              </h2>
              <p className="text-sm font-semibold leading-relaxed text-brand-plum/85 max-w-xl mx-auto font-sans">
                Thank you! Jamie has received your complete pet care and home security profile request. A copy of your details has been logged, and Jamie will follow up directly within 24 hours to confirm your final booking reservation terms.
              </p>
            </div>

            {/* Detail Summary Card */}
            <div className="bg-white border border-brand-pink/15 rounded-2xl p-6 text-xs text-brand-plum text-left space-y-2 max-w-sm mx-auto shadow-xs font-semibold">
              <p className="font-extrabold border-b border-brand-plum/10 pb-2 mb-2 text-center text-brand-pink uppercase tracking-wider text-[10px]">Logged Block Details</p>
              <p className="flex justify-between"><span>Client:</span> <span className="font-bold text-[#100720]">{name}</span></p>
              <p className="flex justify-between"><span>Requested Service:</span> <span className="font-bold text-[#100720]">{serviceNeeded}</span></p>
              <p className="flex justify-between"><span>Dates:</span> <span className="font-bold text-[#100720]">{travelDates}</span></p>
              <p className="flex justify-between"><span>Location Area:</span> <span className="font-bold text-[#100720]">{neighborhood}</span></p>
              {petsDescription && <p className="flex justify-between"><span>Pets to Watch:</span> <span className="font-bold text-[#100720]">{petsDescription}</span></p>}
            </div>

            <div className="pt-2 flex items-center justify-center">
              <button
                id="reset-form-btn"
                onClick={resetForm}
                className="px-8 py-3 bg-[#100720] hover:bg-brand-plum-hover text-white text-xs font-extrabold uppercase tracking-wider rounded-full shadow-md cursor-pointer border-0 transition-all duration-150 active:scale-95"
              >
                Submit A New Request
              </button>
            </div>
          </div>
        )}

      </section>

    </div>
  );
}
