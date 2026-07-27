import { ActivePage, Testimonial } from '../types';
import { Eye, Heart, CalendarPlus, HelpCircle, ArrowRight, ShieldCheck, ShieldAlert, Sparkles, Mail, Check, AlertTriangle, Layers, X, MapPin, Image, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import BlurImage from './BlurImage';
// @ts-ignore
const jamiePortrait = `${import.meta.env.BASE_URL}assets/images/jamie-giedd.webp`;

// Import local photos
// @ts-ignore
const beauPhoto = `${import.meta.env.BASE_URL}assets/images/beau.webp`;
// @ts-ignore
const goldiePhoto = `${import.meta.env.BASE_URL}assets/images/goldie-anastasia-june.webp`;
// @ts-ignore
const griffinPhoto = `${import.meta.env.BASE_URL}assets/images/griffin.webp`;

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

// Soft, warm, bold SVG fallback if image is missing, but also pointing to '/assets/jamie_portrait.jpg'
interface HomeViewProps {
  setActivePage: (page: ActivePage) => void;
}

export default function HomeView({ setActivePage }: HomeViewProps) {
  const [imageError, setImageError] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [activeTestimonialId, setActiveTestimonialId] = useState<string | null>(null);
  const [timelineActive, setTimelineActive] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    const el = document.getElementById('how-it-works');
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimelineActive(true);
      }
    }, { threshold: 0.15 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const track = document.getElementById('testimonial-carousel-track');
    if (!track) return;

    const handleScroll = () => {
      const trackRect = track.getBoundingClientRect();
      const trackCenter = trackRect.left + trackRect.width / 2;

      const cards = track.querySelectorAll('[id^="testimonial-spotlight-"]');
      let closestId: string | null = null;
      let minDistance = Infinity;

      cards.forEach((card) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(cardCenter - trackCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestId = card.id.replace('testimonial-spotlight-', '');
        }
      });

      if (closestId) {
        setActiveTestimonialId(closestId);
      }
    };

    track.addEventListener('scroll', handleScroll, { passive: true });

    // Initial estimation helper
    const approvedList = testimonials.filter(t => t.approved);
    if (approvedList.length > 0 && !activeTestimonialId) {
      setActiveTestimonialId(approvedList[0].id);
    }

    const timer = setTimeout(handleScroll, 150);

    return () => {
      track.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [testimonials]);

  const [isTypeformOpen, setIsTypeformOpen] = useState(false);
  
  // Custom Typeform states
  const [formStep, setFormStep] = useState(1);
  const [formName, setFormName] = useState('');
  const [formNeighborhood, setFormNeighborhood] = useState('');
  const [formCategory, setFormCategory] = useState('Home Details');
  const [formQuote, setFormQuote] = useState('');
  const [formAvatar, setFormAvatar] = useState<string | null>(null);
  const [formPhotoCaption, setFormPhotoCaption] = useState('');
  const [includeSocial, setIncludeSocial] = useState(false);
  const [formSocialHandle, setFormSocialHandle] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const syncTestimonials = () => {
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

    syncTestimonials();

    const handlePlhStorageUpdate = () => {
      syncTestimonials();
    };

    window.addEventListener('plh-storage-update', handlePlhStorageUpdate);
    return () => {
      window.removeEventListener('plh-storage-update', handlePlhStorageUpdate);
    };
  }, [isTypeformOpen]);

  const pathways = [
    {
      title: 'House Watch Only',
      icon: Eye,
      description: 'Practical check-ins for mail, plants, packages, and the little things that matter while you’re gone.'
    },
    {
      title: 'Pet Care Only',
      icon: Heart,
      description: 'Drop-in care or in-home sitting for pets who do better with familiar, comfortable routines.'
    },
    {
      title: 'Both Home + Pet',
      icon: Layers,
      description: 'Support for both the house and the animals when both need attention while you are away.'
    },
    {
      title: 'Not Sure Yet',
      icon: HelpCircle,
      description: 'Send us the basics, and we can help clarify what makes sense for your travel plans.'
    }
  ];

  const steps = [
    { number: '1', title: 'Say Hello', desc: 'Share your travel dates and some quick notes using our simple request form.' },
    { number: '2', title: 'Confirm Details', desc: 'Go over house instructions, keys, plants, and pet routines.' },
    { number: '3', title: 'Lock In Service', desc: 'We review your notes and confirm schedule availability.' },
    { number: '4', title: 'Travel Peacefully', desc: 'Receive simple updates while away so you can enjoy your trip.' }
  ];

  const handleNavClick = (page: ActivePage) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="home-view" className="bg-white min-h-screen">
      
      {/* 1. Hero Section (Deep Maroon Purple Background, White Typography) */}
      <section id="hero-section" className="relative px-4 py-20 sm:py-28 sm:px-6 lg:px-8 bg-brand-plum border-b border-white/10 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">

          {/* Locked Headline and Subcopy */}
          <h1 id="hero-headline" className="font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white tracking-tight leading-[1.1] max-w-3xl mx-auto">
            Travel with a <span className="text-white">little more</span> <span className="text-[#9C5B7F]">peace</span> of mind.
          </h1>
          
          <p id="hero-subcopy" className="text-lg sm:text-xl md:text-[22px] text-white/95 leading-relaxed max-w-2xl mx-auto font-sans font-medium text-balance">
            Helping homeowners travel with a little more peace of mind by keeping an eye on the house, checking the details, and caring for pets.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <div className="relative inline-block w-full sm:w-auto overflow-visible group">
              {/* Sleek Hover Pulse Ring Layer matching button's accent color that dissolves */}
              <div className="absolute inset-0 rounded-full bg-[#9C5B7F] opacity-0 group-hover:scale-110 group-hover:opacity-35 transition-all duration-500 ease-out group-hover:animate-ping pointer-events-none" />
              
              <button
                id="hero-primary-cta"
                onClick={() => handleNavClick('request')}
                className="relative z-10 w-full sm:w-auto px-8 py-4 rounded-full bg-[#9C5B7F] hover:bg-[#B36C94] text-white font-bold text-sm uppercase tracking-wider shadow-md border-0 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] active:translate-y-0 cursor-pointer"
              >
                Save Your Vacation Block
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Trust Markers Row (Soft Blush Background) */}
      <section id="hero-trust-markers" className="bg-white py-12 px-6 sm:px-8 lg:px-12 border-b border-[#100720]/10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 text-center">
            
            <div 
              id="trust-card-house"
              className="bg-[#FDF8FC] rounded-2xl p-8 space-y-4 flex flex-col items-center text-center transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-md group cursor-default border border-transparent hover:border-[#9C5B7F]/15"
            >
              <div className="w-14 h-14 rounded-full bg-[#9C5B7F]/10 border border-[#9C5B7F]/20 text-[#9C5B7F] flex items-center justify-center shadow-xs transition-all duration-300 group-hover:scale-110 group-hover:bg-[#9C5B7F]/20 group-hover:border-[#9C5B7F]/30">
                <Eye className="w-6 h-6 text-[#9C5B7F]" strokeWidth={2.5} />
              </div>
              <div className="space-y-2">
                <h4 className="font-extrabold text-lg md:text-xl text-[#100720] tracking-wide uppercase transition-colors duration-300 group-hover:text-[#9C5B7F]">
                  House Watch First
                </h4>
                <p className="text-base text-[#1F1F1F]/90 font-medium leading-relaxed font-sans text-balance">
                  Visual check-ins, package awareness, plants, and home details while you travel.
                </p>
              </div>
            </div>

            <div 
              id="trust-card-pet"
              className="bg-[#FDF8FC] rounded-2xl p-8 space-y-4 flex flex-col items-center text-center transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-md group cursor-default border border-transparent hover:border-[#9C5B7F]/15"
            >
              <div className="w-14 h-14 rounded-full bg-[#9C5B7F]/10 border border-[#9C5B7F]/20 text-[#9C5B7F] flex items-center justify-center shadow-xs transition-all duration-300 group-hover:scale-110 group-hover:bg-[#9C5B7F]/20 group-hover:border-[#9C5B7F]/30">
                <Heart className="w-6 h-6 text-[#9C5B7F]" strokeWidth={2.5} />
              </div>
              <div className="space-y-2">
                <h4 className="font-extrabold text-lg md:text-xl text-[#100720] tracking-wide uppercase transition-colors duration-300 group-hover:text-[#9C5B7F]">
                  Drop-In Pet Support
                </h4>
                <p className="text-base text-[#1F1F1F]/90 font-medium leading-relaxed font-sans text-balance">
                  Attentive in-home care that keeps familiar routines close.
                </p>
              </div>
            </div>

            <div 
              id="trust-card-location"
              className="bg-[#FDF8FC] rounded-2xl p-8 space-y-4 flex flex-col items-center text-center transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-md group cursor-default border border-transparent hover:border-[#9C5B7F]/15"
            >
              <div className="w-14 h-14 rounded-full bg-[#9C5B7F]/10 border border-[#9C5B7F]/20 text-[#9C5B7F] flex items-center justify-center shadow-xs transition-all duration-300 group-hover:scale-110 group-hover:bg-[#9C5B7F]/20 group-hover:border-[#9C5B7F]/30">
                <MapPin className="w-6 h-6 text-[#9C5B7F]" strokeWidth={2.5} />
              </div>
              <div className="space-y-2">
                <h4 className="font-extrabold text-lg md:text-xl text-[#100720] tracking-wide uppercase transition-colors duration-300 group-hover:text-[#9C5B7F]">
                  Rapid City & Black Hills
                </h4>
                <p className="text-base text-[#1F1F1F]/90 font-medium leading-relaxed font-sans text-balance">
                  Local support for Rapid City and nearby Black Hills neighborhoods.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Meet Jamie Section (Soft Blush Background, Perfect Symmetrical Circle Frame with expanded breathing room) */}
      <section id="meet-jamie-section" className="px-4 py-36 sm:px-6 lg:px-8 bg-[#FDF8FB] text-[#100720] border-b border-brand-plum/10">
        <div className="max-w-5xl mx-auto font-sans">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
            
            {/* Portrait Image Block */}
            <div id="jamie-portrait-block" className="md:col-span-5 flex justify-center items-center">
              <div className="relative group w-64 h-64 sm:w-72 sm:h-72 shrink-0">
                
                {/* Owner Image container using perfect symmetrical circle layout */}
                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-[#9C5B7F]/20 shadow-lg bg-brand-stone z-10">
                  {!imageError ? (
                    <BlurImage
                      src={jamiePortrait}
                      alt="Jamie Giedd, owner of Peace Love Home + Pet Watch"
                      className="w-full h-full object-cover object-center rounded-full"
                      referrerPolicy="no-referrer"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none bg-brand-stone">
                      <div className="w-20 h-20 rounded-full bg-brand-plum text-white flex items-center justify-center text-3xl font-extrabold shadow-sm mb-4 border-2 border-white">
                        JG
                      </div>
                      <span className="font-extrabold text-base text-brand-text">Jamie Giedd</span>
                      <span className="text-[11px] font-bold text-brand-pink tracking-wider uppercase mt-1">Owner</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Copy Block */}
            <div id="jamie-profile-text" className="md:col-span-7 space-y-6 flex flex-col justify-center">
              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#100720] animate-fade-in">
                  Hey, I’m Jamie
                </h2>
              </div>
              
              {/* Bio block displayed directly on white background in a clean editorial layout */}
              <div className="text-base text-[#1F1F1F] space-y-4 leading-relaxed font-sans font-medium">
                <p>
                  I’m an East River South Dakotan whose love for the Black Hills called me out to Rapid. For more than a decade, West River has been home, and in-home pet sitting has been part of how I care for this community.
                </p>
                <p>
                  Pets are family, and they should be treated like family, especially when you are away. For the ones who need a little extra love, a special diet, or an extra eye on their meds, you can leave knowing they are in experienced, trusted, dependable hands.
                </p>
                <p>
                  Sometimes those family members are rabbits. And sometimes, they are chickens. I love those chickens.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Service Pathway Cards (Soft Blush Background, Crisp White Rounded Cards) */}
      <section id="pathways-section" className="px-4 py-20 sm:px-6 lg:px-8 bg-brand-stone border-b border-brand-plum/10">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-text">Choose What You Need</h2>
            <p className="text-sm text-brand-text/80 max-w-lg mx-auto font-medium">
              Select the pathway that works best for your travel plans.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {pathways.map((path, idx) => {
              const Icon = path.icon;
              const isPrimary = idx === 0;

              // Map buttons exactly to Section 11 allowed names
              let buttonLabel = 'Get In Touch';
              if (idx === 0) buttonLabel = 'Request House Watch';
              else if (idx === 1) buttonLabel = 'Request Pet Care';
              else if (idx === 2) buttonLabel = 'Save Your Vacation Block';

              return (
                <div 
                  id={`pathway-card-${idx}`}
                  key={idx}
                  className={`bg-white rounded-3xl border p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:scale-[1.01] hover:shadow-xl hover:border-purple-300 group ${
                    isPrimary 
                      ? 'border-[#100720]' 
                      : 'border-[#100720]/10'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Larger circular marker with Dark Purple background and white icon */}
                    <div className="w-16 h-16 rounded-full bg-[#100720] text-white flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-110">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[#100720] text-base tracking-tight mt-0.5 flex flex-wrap items-center gap-1.5 font-sans">
                        <span>{path.title}</span>
                        {isPrimary && (
                          <span className="inline-block text-[9px] font-bold uppercase tracking-wider bg-[#9C5B7F] text-white px-2.5 py-0.5 rounded-full">
                            Primary
                          </span>
                        )}
                      </h3>
                    </div>
                    <p className="text-xs text-brand-plum/80 leading-relaxed font-semibold">
                      {path.description}
                    </p>
                  </div>

                  <div className="pt-6">
                    <button
                      id={`pathway-cta-${idx}`}
                      onClick={() => {
                        if (idx === 0) handleNavClick('house-watch');
                        else if (idx === 1) handleNavClick('pet-care');
                        else handleNavClick('request');
                      }}
                      className={`w-full py-2.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 text-center cursor-pointer border-2 bg-transparent ${
                        isPrimary
                          ? 'border-brand-plum text-brand-plum group-hover:bg-[#9C5B7F] group-hover:border-[#9C5B7F] group-hover:text-white'
                          : 'border-brand-plum/20 text-brand-text/80 group-hover:bg-[#9C5B7F] group-hover:border-[#9C5B7F] group-hover:text-white'
                      }`}
                    >
                      {buttonLabel}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. How We Get Things Set Up (Liquid Charcoal Block, White Type, Dusty Rose Steps) */}
      <section id="how-it-works" className="px-4 py-20 sm:px-6 lg:px-8 bg-brand-text text-white border-b border-brand-pink/20">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Simple Start, Clear Follow-Through</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Horizontal progress bar for desktop, centered between columns */}
            <div className="hidden md:block absolute top-[18px] left-[12.5%] right-[12.5%] h-0.5 bg-[#9C5B7F]/20 z-0">
              <div 
                className="h-full bg-brand-pink transition-all duration-[1000ms] --width-transition ease-out"
                style={{ width: timelineActive ? '100%' : '0%' }}
              />
            </div>
            
            {/* Centered steps */}
            {steps.map((step, idx) => (
              <div 
                id={`step-item-${idx}`} 
                key={idx} 
                className={`relative flex flex-col items-center text-center space-y-4 transition-all duration-700 ease-out select-none ${
                  timelineActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                {/* Visual Step Badge with Dusty Rose, centered perfectly */}
                <div className="relative flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-brand-pink text-white flex items-center justify-center text-sm font-bold shadow-sm border border-white/10 z-10 transition-transform duration-300 hover:scale-110">
                    {step.number}
                  </div>
                </div>
                <div className="space-y-1.5 z-10">
                  <h3 className="font-bold text-sm text-white tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-xs text-brand-pink-light/85 leading-relaxed font-semibold">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. What We Do / What We Do Not Do Genuine Editorial Columns (Zero Cards/Borders/Shadows) */}
      <section id="do-not-do-section" className="px-4 py-24 sm:px-6 lg:px-8 bg-[#FDF8FB] border-b border-[#100720]/10">
        <div className="max-w-4xl mx-auto space-y-16 font-sans">
          
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#100720]">Services</h2>
            <p className="text-sm text-[#100720]/80 max-w-xl mx-auto font-semibold">
              Practical check-ins for homes, pets, plants, packages, and routines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            
            {/* The "WE DO" List - Clean borderless list */}
            <div id="we-do-list" className="space-y-6">
              <div className="flex items-center gap-3 border-b border-[#100720]/10 pb-4">
                <div className="w-10 h-10 rounded-full bg-[#100720] text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-extrabold text-lg tracking-tight text-[#100720]">
                  How We Help
                </h3>
              </div>
              <ul className="space-y-2 text-sm text-[#100720]/90 font-semibold font-sans">
                <li className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#9C5B7F]/5 hover:translate-x-1.5 transition-all duration-200 cursor-default">
                  <Check className="w-4 h-4 text-[#9C5B7F] shrink-0" />
                  <span>Practical visual check-ins on your home stability</span>
                </li>
                <li className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#9C5B7F]/5 hover:translate-x-1.5 transition-all duration-200 cursor-default">
                  <Check className="w-4 h-4 text-[#9C5B7F] shrink-0" />
                  <span>Collecting incoming mail, flyers, and door packages</span>
                </li>
                <li className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#9C5B7F]/5 hover:translate-x-1.5 transition-all duration-200 cursor-default">
                  <Check className="w-4 h-4 text-[#9C5B7F] shrink-0" />
                  <span>Basic indoor/outdoor plant watering and care</span>
                </li>
                <li className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#9C5B7F]/5 hover:translate-x-1.5 transition-all duration-200 cursor-default">
                  <Check className="w-4 h-4 text-[#9C5B7F] shrink-0" />
                  <span>Drop-in pet feeding, fresh water, and comfort routines</span>
                </li>
                <li className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#9C5B7F]/5 hover:translate-x-1.5 transition-all duration-200 cursor-default">
                  <Check className="w-4 h-4 text-[#9C5B7F] shrink-0" />
                  <span>Straightforward, predictable text and photo updates</span>
                </li>
                <li className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#9C5B7F]/5 hover:translate-x-1.5 transition-all duration-200 cursor-default">
                  <Check className="w-4 h-4 text-[#9C5B7F] shrink-0" />
                  <span>Noticing unusual home changes and coordinating solutions</span>
                </li>
              </ul>
            </div>

            {/* The "WE DO NOT DO" List - Clean borderless list */}
            <div id="we-do-not-list" className="space-y-6">
              <div className="flex items-center gap-3 border-b border-[#100720]/10 pb-4">
                <div className="w-10 h-10 rounded-full bg-[#100720]/10 text-[#100720] flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5 text-[#100720]" />
                </div>
                <h3 className="font-extrabold text-lg tracking-tight text-[#100720]">
                  Where Other Experts Step In
                </h3>
              </div>
              <ul className="space-y-2 text-sm text-[#100720]/80 font-semibold font-sans">
                <li className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#100720]/5 hover:translate-x-1.5 transition-all duration-200 cursor-default">
                  <X className="w-4 h-4 text-[#100720]/60 shrink-0" />
                  <span>Active commercial alarm monitoring, patrols, or security</span>
                </li>
                <li className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#100720]/5 hover:translate-x-1.5 transition-all duration-200 cursor-default">
                  <X className="w-4 h-4 text-[#100720]/60 shrink-0" />
                  <span>Structural, mechanical, or plumbing diagnostics</span>
                </li>
                <li className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#100720]/5 hover:translate-x-1.5 transition-all duration-200 cursor-default">
                  <X className="w-4 h-4 text-[#100720]/60 shrink-0" />
                  <span>Repairing leaky pipes, electrical grids, or structural parts</span>
                </li>
                <li className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#100720]/5 hover:translate-x-1.5 transition-all duration-200 cursor-default">
                  <X className="w-4 h-4 text-[#100720]/60 shrink-0" />
                  <span>Long-term estate management or ongoing landscaping tasks</span>
                </li>
                <li className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#100720]/5 hover:translate-x-1.5 transition-all duration-200 cursor-default">
                  <X className="w-4 h-4 text-[#100720]/60 shrink-0" />
                  <span>Veterinary treatments, clinical meds, or urgent medical work</span>
                </li>
                <li className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#100720]/5 hover:translate-x-1.5 transition-all duration-200 cursor-default">
                  <X className="w-4 h-4 text-[#100720]/60 shrink-0" />
                  <span>Compensating for freeze pipe damage or weather emergencies</span>
                </li>
              </ul>
            </div>

          </div>

          {/* New Interactive Pricing Matrix Row */}
          <div className="pt-16 border-t border-[#100720]/10 space-y-8">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-extrabold text-[#100720] tracking-tight">Transparent Neighbor Pricing Tiers</h3>
              <p className="text-xs text-[#9C5B7F] font-bold uppercase tracking-wider">No hidden fees, simple local rates in Rapid City</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: House Watch Check */}
              <div className="bg-[#FDF8FC] rounded-2xl p-6 border border-[#9C5B7F]/15 flex flex-col justify-between space-y-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:border-[#9C5B7F]/30 group cursor-default">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#9C5B7F]">Basic Watch</span>
                    <h4 className="text-lg font-bold text-[#100720]">House Watch Check</h4>
                  </div>
                  <p className="text-xs text-brand-text/75 leading-relaxed font-semibold">
                    Home security checkpoints, picking up packages, managing flyer pileup, and checking light timers.
                  </p>
                </div>
                <div className="space-y-2 pt-4 border-t border-[#100720]/5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-[#100720]">$40</span>
                    <span className="text-xs font-semibold text-[#100720]/60">/ day base rate</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Companion Drop-In */}
              <div className="bg-[#FDF8FC] rounded-2xl p-6 border border-[#9C5B7F]/15 flex flex-col justify-between space-y-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:border-[#9C5B7F]/30 group cursor-default">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#9C5B7F]">Pet Companion</span>
                    <h4 className="text-lg font-bold text-[#100720]">Companion Drop-In</h4>
                  </div>
                  <p className="text-xs text-brand-text/75 leading-relaxed font-semibold">
                    Drop-in pet visits, refreshing food and water, cleaning dishes, administering treats, and companionship.
                  </p>
                </div>
                <div className="space-y-2 pt-4 border-t border-[#100720]/5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-[#100720]">$25</span>
                    <span className="text-xs font-semibold text-[#100720]/60">/ visit rate</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Combined Sanctuary Stay */}
              <div className="bg-[#FDF8FC] rounded-2xl p-6 border-2 border-[#9C5B7F] flex flex-col justify-between space-y-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:border-[#9C5B7F]/45 relative overflow-hidden group cursor-default">
                <div className="absolute top-0 right-0 bg-[#9C5B7F] text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl">
                  Popular Value
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#9C5B7F]">All-In Care</span>
                    <h4 className="text-lg font-bold text-[#100720]">Combined Sanctuary Stay</h4>
                  </div>
                  <p className="text-xs text-brand-text/75 leading-relaxed font-semibold">
                    Simultaneous house watch checkpoints plus pet companionship drop-ins. Our ultimate peace of mind package.
                  </p>
                </div>
                <div className="space-y-2 pt-4 border-t border-[#100720]/5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-[#100720]">$60</span>
                    <span className="text-xs font-semibold text-[#100720]/60">/ day packaged</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="text-center pt-2">
              <p className="text-xs text-[#9C5B7F] font-bold">
                Estimates calculate instantly inside your Client Portal.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 6. The Neighbor Standard (Future Trust Space with Editorial layout and zero builder cards) */}
      <section id="neighbor-standard-trust" className="bg-white text-[#100720] py-24 px-4 sm:px-6 lg:px-8 border-b border-[#100720]/10">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#100720]">
              The Neighbor Standard
            </h2>
            <p className="text-base font-semibold text-[#1F1F1F] leading-relaxed font-sans">
              Dedicated visual check-ins that help your home feel cared for while you are away.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
              {
                title: 'Direct Communication',
                desc: 'You coordinate directly with me. Every dynamic, question, or update comes directly and personally—never an app interface or an automated dispatcher.'
              },
              {
                title: 'Details Noticed',
                desc: 'Basic sweeps are completed with vigilance, from collecting stray papers or packages near your doorstep to adjusting light blurs and watering indoor greens.'
              },
              {
                title: 'Local Trust',
                desc: 'Serving neighborhoods around Rapid City and the surrounding Black Hills with absolute respect for your private residence.'
              },
              {
                title: 'Follow-Through',
                desc: 'Scheduled check-ins completed dependably. You receive straightforward photo updates as soon as tasks are completed, so you can travel without worry.'
              }
            ].map((theme, idx) => (
              <div id={`trust-theme-${idx}`} key={idx} className="space-y-4 group">
                {/* Large circular Dusty Rose icon treatment */}
                <span className="w-12 h-12 rounded-full bg-[#9C5B7F]/10 border border-[#9C5B7F]/25 text-[#9C5B7F]/60 group-hover:text-[#9C5B7F] group-hover:bg-[#9C5B7F]/20 group-hover:scale-105 flex items-center justify-center font-extrabold text-sm font-mono select-none transition-all duration-300">
                  0{idx + 1}
                </span>
                <h3 className="font-extrabold text-base tracking-tight text-[#100720] group-hover:text-[#9C5B7F] transition-colors duration-300">
                  {theme.title}
                </h3>
                <p className="text-base text-[#1F1F1F]/90 leading-relaxed font-semibold font-sans">
                  {theme.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Minimal Elegant FAQ Accordion Block */}
          <div className="pt-16 border-t border-[#100720]/10 max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2.5xl font-extrabold text-[#100720] tracking-tight">Frequently Asked Questions</h3>
              <p className="text-xs text-[#9C5B7F] font-bold uppercase tracking-wider">Quick answers about our local neighborhood standard</p>
            </div>

            <div className="space-y-4">
              {[
                {
                  question: "How often do I receive home security and pet updates?",
                  answer: "You will receive real-time text and photo updates during or immediately following each confirmed check-in. Whether it is a snapshot of your happy pet, confirmation that your mail has been brought in, or a visual verification of locked back gates, you will never have to wonder about the status of your residence."
                },
                {
                  question: "Are your services fully bonded and licensed in Rapid City?",
                  answer: "Yes, our services are fully bonded and insured through standard key-loss and pet Bailee liability policies for your comprehensive property protection. We are a registered business in Rapid City, South Dakota, operating under The Giedd Group LLC with transparent local 6.5% tax calculations detailed on every checkout quote."
                },
                {
                  question: "How do I modify my home instructions or access codes after booking?",
                  answer: "All booked clients receive immediate access to the encrypted Client Portal. Within your custom Care Vault, you can update home rules, security alarm instructions, gate access codes, and upload PDF veterinary emergency authorization directives directly at any time before or during your travel."
                }
              ].map((faq, fIdx) => {
                const isOpen = openFaqIndex === fIdx;
                return (
                  <div 
                    key={fIdx} 
                    className="border border-[#100720]/10 rounded-2xl overflow-hidden bg-[#FDF8FC] transition-colors duration-250 hover:border-[#9C5B7F]/30"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : fIdx)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left font-sans font-bold text-sm sm:text-base text-[#100720] hover:text-[#9C5B7F] transition-colors focus:outline-none cursor-pointer group"
                    >
                      <span className="font-extrabold">{faq.question}</span>
                      <span className="ml-4 shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-white border border-[#100720]/10 shadow-3xs group-hover:bg-[#9C5B7F]/10 group-hover:border-[#9C5B7F]/20">
                        <span className={`text-sm font-black transition-transform duration-300 transform leading-none inline-block ${isOpen ? 'rotate-45 text-[#9C5B7F]' : 'text-[#100720]'}`}>
                          +
                        </span>
                      </span>
                    </button>
                    
                    <div 
                      className="transition-all duration-300 ease-in-out overflow-hidden"
                      style={{ 
                        maxHeight: isOpen ? '240px' : '0px',
                        opacity: isOpen ? 1 : 0
                      }}
                    >
                      <div className="px-6 pb-5 text-xs sm:text-sm text-brand-text/80 font-medium leading-relaxed font-sans border-t border-[#100720]/5 pt-3">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* Stories from Around the Neighborhood (Soft Blush Background) */}
      <section id="what-neighbors-notice" className="bg-[#FDF8FB] py-24 px-4 sm:px-6 lg:px-8 border-b border-[#100720]/10 font-sans">
        <div className="max-w-5xl mx-auto space-y-16">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 text-center md:text-left">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#100720]">
                Stories from Around the Neighborhood
              </h2>
              <p className="text-sm font-semibold text-[#9C5B7F]/80 leading-relaxed max-w-xl">
                Real care, documented feedback, and neighborly peace of mind across the Black Hills.
              </p>
            </div>
            <div className="flex justify-center shrink-0">
              <button
                id="share-testimonial-btn"
                onClick={() => {
                  setIsTypeformOpen(true);
                  setFormStep(1);
                  setIsSubmitted(false);
                  setFormName('');
                  setFormNeighborhood('');
                  setFormQuote('');
                  setFormAvatar(null);
                  setFormPhotoCaption('');
                  setIncludeSocial(false);
                  setFormSocialHandle('');
                }}
                className="px-6 py-3 rounded-full border-2 border-[#100720] text-xs font-bold uppercase tracking-wider bg-white hover:bg-[#F2E2EC] text-[#100720] duration-150 cursor-pointer shadow-xs"
              >
                + Share A Neighborhood Note
              </button>
            </div>
          </div>

          {/* Testimonial carousel slider area (showing approved ones, swipeable and desktop arrow controllable of Neighbor Spotlights) */}
          <div className="relative group/carousel space-y-6" id="testimonial-carousel-grid-container" style={{ touchAction: 'pan-y' }}>
            
            {/* Scrollable track */}
            <div 
              id="testimonial-carousel-track"
              className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-8 scrollbar-none px-[9vw] md:px-0 touch-pan-x"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              {testimonials.filter(t => t.approved).map((testimonial, idx, arr) => {
                const isActive = activeTestimonialId === testimonial.id || (!activeTestimonialId && idx === 0);
                
                return (
                  <div 
                    id={`testimonial-spotlight-${testimonial.id}`}
                    key={testimonial.id}
                    className={`w-[82vw] sm:w-[350px] md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] flex-shrink-0 snap-center md:snap-start rounded-[16px] p-8 md:p-10 border transition-all duration-300 ease-out relative overflow-hidden flex flex-col justify-between h-auto min-h-[520px] md:min-h-[590px] hover:-translate-y-1.5 hover:shadow-lg hover:bg-[#FDF8FC] hover:border-[#9C5B7F]/40 ${
                      isActive 
                        ? 'bg-[#9C5B7F]/10 border-[#9C5B7F]/20 shadow-[0_12px_30px_rgba(156,91,127,0.06)]' 
                        : 'bg-[#FFFFFF] border-[#E5E5E5] shadow-xs'
                    }`}
                  >
                    {/* Decorative double quote marker - Neighbor Spotlights term referenced */}
                    <div className="absolute top-4 right-5 text-[#9C5B7F]/15 font-serif text-6xl leading-none select-none italic font-extrabold pointer-events-none">
                      &ldquo;
                    </div>

                    <div className="space-y-6">
                      {/* High-Contrast Category badge - Solid Black background / White text */}
                      <div className="flex">
                        <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest bg-black text-white px-3.5 py-2 rounded-full leading-none shadow-xs">
                          Neighbor Spotlight • {testimonial.category}
                        </span>
                      </div>

                      <p className="font-sans text-sm sm:text-base text-[#100720]/95 font-medium leading-relaxed" style={{ lineHeight: '1.6' }}>
                        "{testimonial.quote}"
                      </p>

                      {/* Image Area with caption strictly underneath */}
                      {testimonial.avatarUrl && (
                        <div className="space-y-2.5 mt-4 pt-4 border-t border-[#100720]/5 text-center">
                          <div className="aspect-square w-full rounded-2xl overflow-hidden border border-[#100720]/10 shadow-[0_4px_12px_rgba(0,0,0,0.015)] bg-[#100720]/2 flex items-center justify-center">
                            <BlurImage 
                              referrerPolicy="no-referrer"
                              src={testimonial.avatarUrl} 
                              alt={testimonial.name} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          {testimonial.photoCaption && (
                            <p className="text-xs sm:text-sm text-[#100720]/60 font-medium italic mt-2.5 text-center leading-relaxed block font-sans">
                              "{testimonial.photoCaption}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-[#100720]/5 mt-6 flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {!testimonial.avatarUrl && (
                            <div className="w-10 h-10 rounded-full bg-[#100720] text-white flex items-center justify-center font-bold text-xs select-none shrink-0 border border-[#9C5B7F]/25 shadow-xs">
                              {testimonial.name.slice(0,2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h5 className="font-bold text-sm sm:text-base text-[#100720] leading-snug">
                              {testimonial.name}
                            </h5>
                          </div>
                        </div>

                        {testimonial.socialHandle && (
                          <span className="text-xs font-bold text-[#9C5B7F] bg-[#9C5B7F]/10 px-2.5 py-1 rounded-full shrink-0">
                            {testimonial.socialHandle.startsWith('@') ? testimonial.socialHandle : `@${testimonial.socialHandle}`}
                          </span>
                        )}
                      </div>

                      {/* Verified Location Tags for neighborhoods */}
                      <div className="flex items-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#9C5B7F] bg-[#9C5B7F]/5 border border-[#9C5B7F]/10 px-2.5 py-1 rounded-full">
                          <MapPin className="w-3.5 h-3.5 text-[#9C5B7F]" />
                          {testimonial.neighborhood}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Neon Pink Carousel Dots Indicators */}
            <div className="flex justify-center items-center gap-2 pt-2" id="testimonial-carousel-progress-dots">
              {testimonials.filter(t => t.approved).map((testimonial, idx) => {
                const isActive = activeTestimonialId === testimonial.id || (!activeTestimonialId && idx === 0);
                return (
                  <button
                    key={`dot-${testimonial.id}`}
                    id={`dot-indicator-${testimonial.id}`}
                    title={`View note from ${testimonial.name}`}
                    onClick={() => {
                      const track = document.getElementById('testimonial-carousel-track');
                      const element = document.getElementById(`testimonial-spotlight-${testimonial.id}`);
                      if (track && element) {
                        track.scrollTo({ left: element.offsetLeft - track.offsetLeft, behavior: 'smooth' });
                        setActiveTestimonialId(testimonial.id);
                      }
                    }}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      isActive 
                        ? 'w-7 bg-[#E54B86] shadow-[0_0_10px_rgba(229,75,134,0.7)]' 
                        : 'w-2.5 bg-[#100720]/15 hover:bg-[#100720]/30'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                );
              })}
            </div>

            {/* Carousel controller and swipe indicator sitting with generous top margins */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 px-[9vw] md:px-0">
              <span className="text-[11px] font-semibold text-[#100720]/50 tracking-wide text-center md:text-left order-2 md:order-1 select-none">
                ✦ Swipe or use touch gestures to browse all Neighbor Spotlights
              </span>
              <div className="flex items-center gap-3 order-1 md:order-2">
                <button 
                  onClick={() => {
                    const track = document.getElementById('testimonial-carousel-track');
                    if (track) {
                      const scrollAmount = window.innerWidth < 768 ? window.innerWidth * 0.84 : track.clientWidth * 0.9;
                      track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                    }
                  }}
                  className="w-14 h-14 md:w-10 md:h-10 rounded-full border border-[#100720]/15 flex items-center justify-center bg-white text-[#100720] hover:bg-[#F2E2EC]/50 hover:border-[#9C5B7F]/40 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-6 h-6 md:w-5 md:h-5 text-[#100720]" />
                </button>
                <button 
                  onClick={() => {
                    const track = document.getElementById('testimonial-carousel-track');
                    if (track) {
                      const scrollAmount = window.innerWidth < 768 ? window.innerWidth * 0.84 : track.clientWidth * 0.9;
                      track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                    }
                  }}
                  className="w-14 h-14 md:w-10 md:h-10 rounded-full border border-[#100720]/15 flex items-center justify-center bg-white text-[#100720] hover:bg-[#F2E2EC]/50 hover:border-[#9C5B7F]/40 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-6 h-6 md:w-5 md:h-5 text-[#100720]" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Typeform style customer feedback intake modal */}
      {isTypeformOpen && (
        <div id="typeform-modal-overlay" className="fixed inset-0 z-[200] flex items-center justify-center bg-[#100720]/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-[#100720]/15 relative overflow-hidden flex flex-col justify-between max-h-[90vh]">
            
            {/* Header / Step Bar */}
            <div className="px-6 py-4 border-b border-[#100720]/10 flex items-center justify-between bg-brand-stone">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#9C5B7F]">
                {!isSubmitted ? `Question ${formStep} of 5` : 'Submission Successful'}
              </span>
              <button 
                onClick={() => setIsTypeformOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/5 text-[#100720] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields Step Navigation */}
            <div className="p-8 space-y-6 overflow-y-auto flex-grow">
              {!isSubmitted ? (
                <div>
                  {/* Step 1: Name */}
                  {formStep === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-150">
                      <h4 className="text-xl sm:text-2xl font-extrabold text-[#100720] tracking-tight leading-tight">
                        Could you share your name?
                      </h4>
                      <p className="text-[11px] text-brand-plum/70 font-semibold leading-relaxed">
                        We respect your privacy. First name and last initial work perfectly for our local spotlight.
                      </p>
                      <input 
                        type="text"
                        placeholder="e.g. Hannah F."
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-[#100720]/15 focus:outline-none focus:ring-2 focus:ring-[#9C5B7F]/20 focus:border-[#9C5B7F] font-bold text-sm tracking-wide text-[#100720]"
                      />
                    </div>
                  )}

                  {/* Step 2: Location/Neighborhood */}
                  {formStep === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-150">
                      <h4 className="text-xl sm:text-2xl font-extrabold text-[#100720] tracking-tight leading-tight">
                        Whereabouts in the Black Hills area are you located?
                      </h4>
                      <p className="text-[11px] text-brand-plum/70 font-semibold leading-relaxed">
                        Helps neighbors know which local communities we are active in.
                      </p>
                      <input 
                        type="text"
                        placeholder="e.g. Canyon Lake Heights / Rapid City"
                        value={formNeighborhood}
                        onChange={(e) => setFormNeighborhood(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-[#100720]/15 focus:outline-none focus:ring-2 focus:ring-[#9C5B7F]/20 focus:border-[#9C5B7F] font-bold text-sm tracking-wide text-[#100720]"
                      />
                    </div>
                  )}

                  {/* Step 3: Choose Spotlight Category */}
                  {formStep === 3 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-150">
                      <h4 className="text-xl sm:text-2xl font-extrabold text-[#100720] tracking-tight leading-tight">
                        Which trust category matches your experience best?
                      </h4>
                      <p className="text-[11px] text-brand-plum/70 font-semibold leading-relaxed">
                        Select an area where Jamie made the most beautiful impact.
                      </p>
                      <div className="grid grid-cols-1 gap-3">
                        {[
                          { val: 'Home Details', desc: 'Mail collection, security sweeps, water checks, plants' },
                          { val: 'Pet Routines', desc: 'Routines on medication, chickens, rabbit attention, feeding habits' },
                          { val: 'Follow-Through', desc: 'Simple updates, steady photos, reliability' }
                        ].map((cat) => (
                          <button
                            type="button"
                            key={cat.val}
                            onClick={() => setFormCategory(cat.val)}
                            className={`w-full p-4 rounded-xl border text-left flex flex-col transition-all cursor-pointer ${
                              formCategory === cat.val 
                                ? 'border-[#100720] bg-[#FDF8FB]' 
                                : 'border-[#100720]/10 bg-white hover:border-[#100720]/25'
                            }`}
                          >
                            <span className="font-bold text-xs text-[#100720]">{cat.val}</span>
                            <span className="text-[11px] text-brand-plum/75 font-semibold mt-0.5">{cat.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 4: Quote Story */}
                  {formStep === 4 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-150">
                      <h4 className="text-xl sm:text-2xl font-extrabold text-[#100720] tracking-tight leading-tight">
                        What would you tell others about leaving your home or pets with Jamie?
                      </h4>
                      <p className="text-[11px] text-brand-plum/70 font-semibold leading-relaxed">
                        Describe the peace of mind, specific details, or animals feeling cared for.
                      </p>
                      <textarea
                        rows={4}
                        placeholder="e.g. Jamie is extremely attentive. Sometimes I feel anxious when leaving my senior dog, but she sensed it and always kept me updated..."
                        value={formQuote}
                        onChange={(e) => setFormQuote(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-[#100720]/15 focus:outline-none focus:ring-2 focus:ring-[#9C5B7F]/20 focus:border-[#9C5B7F] font-semibold text-xs tracking-wide leading-relaxed text-[#100720]"
                      />
                    </div>
                  )}

                  {/* Step 5: Optional Pet Photo Upload */}
                  {formStep === 5 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-150">
                      <h4 className="text-xl sm:text-2xl font-extrabold text-[#100720] tracking-tight leading-tight">
                        Optional: Upload a photo of your pet
                      </h4>
                      <p className="text-[11px] text-brand-plum/70 font-semibold leading-relaxed">
                        A lovely dog, rabbit, plant, or chicken shot looks gorgeous beside your feedback.
                      </p>
                      
                      {/* Drag and Drop File Area */}
                      <div 
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragActive(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            const file = e.dataTransfer.files[0];
                            const r = new FileReader();
                            r.onload = () => setFormAvatar(r.result as string);
                            r.readAsDataURL(file);
                          }
                        }}
                        className={`w-full py-8 px-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-colors ${
                          dragActive 
                            ? 'border-[#9C5B7F] bg-[#9C5B7F]/5' 
                             : formAvatar 
                               ? 'border-emerald-500 bg-emerald-50/10' 
                              : 'border-[#100720]/20 hover:border-[#100720]/40'
                        }`}
                      >
                        <Image className={`w-8 h-8 ${formAvatar ? 'text-emerald-500' : 'text-[#9C5B7F]'}`} />
                        <div className="text-center">
                          {formAvatar ? (
                            <div className="space-y-2">
                              <p className="text-xs font-bold text-emerald-800">✓ Portrait Image Loaded Successfully</p>
                              <div className="flex justify-center">
                                <BlurImage src={formAvatar} alt="Preview" className="w-16 h-16 rounded-full object-cover border border-[#100720]/15 shadow-sm" />
                              </div>
                              <button 
                                type="button" 
                                onClick={(e) => { e.stopPropagation(); setFormAvatar(null); }} 
                                className="text-[10px] font-bold text-red-500 hover:underline"
                              >
                                Remove photo
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-brand-plum">Drag and drop file here, or click to choose</p>
                              <p className="text-[10px] text-brand-plum/60 font-semibold">Supports JPEG, PNG up to 5MB</p>
                            </div>
                          )}
                        </div>
                        <input 
                          type="file" 
                          id="avatar-upload-file-input"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              const r = new FileReader();
                              r.onload = () => setFormAvatar(r.result as string);
                              r.readAsDataURL(file);
                            }
                          }}
                          className="hidden" 
                        />
                        {!formAvatar && (
                          <label 
                            htmlFor="avatar-upload-file-input"
                            className="px-4 py-1.5 rounded-full bg-[#FDF8FB] hover:bg-[#F2E2EC] text-[10px] font-bold uppercase tracking-wider text-[#100720] border border-[#100720]/20 cursor-pointer shadow-xs transition-all"
                          >
                            Browse Files
                          </label>
                        )}
                      </div>

                      {/* Photo Caption Field */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#100720]">Photo Caption</label>
                        <input
                          type="text"
                          placeholder="e.g. Beau playing in the backyard"
                          value={formPhotoCaption}
                          onChange={(e) => setFormPhotoCaption(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#100720]/15 focus:outline-none focus:ring-2 focus:ring-[#9C5B7F]/20 focus:border-[#9C5B7F] font-semibold text-xs text-[#100720]"
                        />
                      </div>

                      {/* Display Social Media Checkbox & Conditional Reveal */}
                      <div className="space-y-3 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={includeSocial}
                            onChange={(e) => setIncludeSocial(e.target.checked)}
                            className="w-4 h-4 rounded border-[#100720]/25 text-[#9C5B7F] focus:ring-[#9C5B7F]"
                          />
                          <span className="text-xs font-bold text-[#100720]">Include Social Media Handle?</span>
                        </label>

                        {includeSocial && (
                          <div className="space-y-1.5 pl-6 animate-in fade-in slide-in-from-top-2 duration-150">
                            <label className="block text-xs font-semibold text-brand-plum">Your Username / Handle</label>
                            <div className="relative rounded-xl shadow-xs">
                              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-[#9C5B7F]">@</span>
                              <input
                                type="text"
                                placeholder="username"
                                value={formSocialHandle}
                                onChange={(e) => setFormSocialHandle(e.target.value)}
                                className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-[#100720]/15 focus:outline-none focus:ring-2 focus:ring-[#9C5B7F]/20 focus:border-[#9C5B7F] font-semibold text-xs text-[#100720]"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                </div>
              ) : (
                // Success State (Checklist, animation container)
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-4 animate-in fade-in duration-200">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-200 shadow-sm animate-bounce">
                    <Check className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-extrabold text-[#100720] tracking-tight">
                      Thank You Neighbor!
                    </h4>
                    <p className="text-xs text-brand-plum/85 leading-relaxed max-w-sm font-semibold font-sans">
                      Your public testimonial has been submitted. Because we respect local reputation, submissions go to Jamie Giedd for approval before spotlighting.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-[#100720]/10 flex items-center justify-between bg-brand-stone">
              {!isSubmitted ? (
                <>
                  <button
                    type="button"
                    disabled={formStep === 1}
                    onClick={() => setFormStep(formStep - 1)}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-brand-plum/70 hover:text-brand-plum disabled:opacity-30 cursor-pointer text-center"
                  >
                    Back
                  </button>
                  
                  {formStep < 5 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (formStep === 1 && !formName) { alert('Please enter your name.'); return; }
                        if (formStep === 2 && !formNeighborhood) { alert('Please enter your neighborhood.'); return; }
                        if (formStep === 4 && !formQuote) { alert('Please share your story.'); return; }
                        setFormStep(formStep + 1);
                      }}
                      className="px-6 py-2 bg-[#100720] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#100720]/90 transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        // Submit test story to local storage!
                        const stored = localStorage.getItem('plh_testimonials');
                        let currentTestimonials: Testimonial[] = [];
                        if (stored) {
                          try { currentTestimonials = JSON.parse(stored); } catch(e) {}
                        } else {
                          currentTestimonials = [...DEFAULT_TESTIMONIALS];
                        }

                        const newStory: Testimonial = {
                          id: `submission-${Date.now()}`,
                          name: formName || 'Anonymous',
                          neighborhood: formNeighborhood || 'Rapid City Area',
                          quote: formQuote || 'Loved working with Jamie.',
                          category: formCategory,
                          relationship: 'Neighbor / Client',
                          approved: false, // Customer initiated is pending approval
                          avatarUrl: formAvatar || undefined,
                          photoCaption: formPhotoCaption || undefined,
                          includeSocial: includeSocial,
                          socialHandle: includeSocial && formSocialHandle ? formSocialHandle : undefined
                        };

                        const updatedList = [...currentTestimonials, newStory];
                        localStorage.setItem('plh_testimonials', JSON.stringify(updatedList));
                        window.dispatchEvent(new Event('plh-storage-update'));
                        setIsSubmitted(true);
                      }}
                      className="px-6 py-2 bg-brand-pink text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-brand-pink-dark transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      Submit For Review
                    </button>
                  )}
                </>
              ) : (
                <div className="w-full flex justify-center">
                  <button
                    onClick={() => setIsTypeformOpen(false)}
                    className="px-8 py-2.5 bg-[#100720] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#100720]/90 transition-all cursor-pointer"
                  >
                    Got It, Thank You!
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 6. Request CTA Section (Bright White Background) */}
      <section id="bottom-cta-section" className="px-4 py-24 sm:px-6 lg:px-8 bg-white text-brand-text border-t border-brand-plum/10 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-plum animate-fade-in">Ready to Travel?</h2>
          <div className="pt-4">
            <button
              id="bottom-start-request-btn"
              onClick={() => handleNavClick('request')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#100720] hover:bg-brand-plum-hover text-white font-bold text-sm uppercase tracking-wider transition-all duration-150 shadow-md cursor-pointer border-0"
            >
              <span>Save Your Vacation Block</span>
            </button>
          </div>
        </div>
      </section>

      {/* 7. Become a Reserve Associate CTA (Soft Ivory Background) */}
      <section id="standby-reserve-cta" className="px-4 py-24 sm:px-6 lg:px-8 bg-[#FDF8FB] border-t border-brand-plum/10 text-center font-sans">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#100720]">Join the Prairie Land Reserve Network</h2>
            <p className="text-base text-brand-plum/80 max-w-2xl mx-auto font-medium leading-relaxed">
              Are you reliable, experienced with pets, and interested in occasional, flexible shift coverage? 
              Apply to join our tested standby list. Set your own availability calendar, pass a background check, 
              and earn extra income when we need emergency or overflow coverage.
            </p>
          </div>
          <div className="pt-6">
            <button
              onClick={() => handleNavClick('associate-portal')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-transparent border-2 border-[#9C5B7F] hover:bg-[#9C5B7F]/10 text-[#9C5B7F] font-bold text-sm uppercase tracking-wider transition-all duration-150 shadow-xs cursor-pointer"
            >
              Apply / Login to Reserve Portal
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
