import { ActivePage } from '../types';
import { Eye, Mail, Leaf, Lightbulb, Bell, FileText, CheckCircle2, UserCheck, MessageSquare, AlertTriangle, ArrowRight } from 'lucide-react';

interface HouseWatchViewProps {
  setActivePage: (page: ActivePage) => void;
}

export default function HouseWatchView({ setActivePage }: HouseWatchViewProps) {
  
  const checkInPoints = [
    {
      title: 'Mail & Package Collection',
      icon: Mail,
      description: 'Piles of stacks and packages on the doorstep tell everyone you are out of town. I pick up mail, flyers, and packages, bringing them securely inside.'
    },
    {
      title: 'Attentive Plant Watering',
      icon: Leaf,
      description: 'For plants that dramatically wilt the second you leave town. I follow watering schedules to keep your indoor and porch greens looking vibrant.'
    },
    {
      title: 'Blinds & Lights Adjustments',
      icon: Lightbulb,
      description: 'A dark house for ten days is a clear tell. I can adjust blinds or toggle lights to keep things feeling familiar and lived-in.'
    },
    {
      title: 'Basic Visual Sweeps',
      icon: CheckCircle2,
      description: 'Checking that doors are closed, faucets are not visibly dripping, and things look exactly as they did when you locked up.'
    },
    {
      title: 'General Exterior Walks',
      icon: Eye,
      description: 'Taking a simple walk around the yard to pick up garbage, check for porch flyers, and verify everything looks normal.'
    },
    {
      title: 'Client Updates',
      icon: MessageSquare,
      description: 'Direct, clear updates by text, call, or email as soon as I check in on the details, so you never have to wonder.'
    }
  ];

  const valueSelling = [
    {
      title: 'Direct Communication',
      desc: 'You coordinate directly with me for every check-in and update.'
    },
    {
      title: 'Community Trust',
      desc: 'Serving neighborhoods around the Black Hills with absolute respect for your space.'
    },
    {
      title: 'Attention to Detail',
      desc: 'From collecting porch packages to Adjusting light schedules and watering indoor greens.'
    },
    {
      title: 'Consistent Follow-Through',
      desc: 'Scheduled check-ins completed dependably so you can travel without worry.'
    }
  ];

  const handleCTA = () => {
    setActivePage('request');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="house-watch-view" className="bg-white min-h-screen pb-16">
      
      {/* Page Header (Soft Blush Background) */}
      <section id="house-watch-header" className="px-4 py-20 sm:px-6 lg:px-8 border-b border-brand-plum/10 bg-brand-stone">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#100720] tracking-tight leading-tight max-w-3xl mx-auto text-balance">
            House watch for the details that matter while you’re away.
          </h1>
          <p className="text-base sm:text-lg text-[#1F1F1F] leading-relaxed max-w-2xl mx-auto font-semibold font-sans text-balance">
            When you leave town, the little things at home do not stop needing attention. Practical check-in support helps keep an eye on the basics.
          </p>
        </div>
      </section>

      {/* Practical Check-ins grid */}
      <section id="check-in-points" className="max-w-5xl mx-auto px-4 py-24 sm:px-6 lg:px-8 bg-white">
        <div className="space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#100720]">
              While-You're-Away Home Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 group/grid">
            {checkInPoints.map((point, idx) => {
              const Icon = point.icon;
              return (
                <div 
                  id={`hw-item-${idx}`}
                  key={idx}
                  className="bg-[#FDF8FB] rounded-3xl p-8 space-y-5 border border-[#9C5B7F]/10 transition-all duration-300 group-hover/grid:opacity-60 hover:!opacity-100 hover:scale-[1.02] hover:-translate-y-2 hover:bg-white hover:border-[#9C5B7F]/30 hover:shadow-lg flex flex-col justify-start h-full group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#100720] text-white flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-110 shrink-0">
                    <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-base tracking-tight text-[#100720]">
                      {point.title}
                    </h3>
                    <p className="text-base text-[#1F1F1F]/90 leading-relaxed font-semibold">
                      {point.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ready to Travel Section */}
      <section id="bottom-cta-section" className="px-4 py-24 sm:px-6 lg:px-8 bg-white text-brand-text border-t border-brand-plum/10 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-plum animate-fade-in">Ready to Travel?</h2>
          <div className="pt-4">
            <button
              id="bottom-start-request-btn"
              onClick={handleCTA}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#100720] hover:bg-brand-plum-hover text-white font-bold text-sm uppercase tracking-wider transition-all duration-150 shadow-md cursor-pointer border-0"
            >
              <span>Save Your Vacation Block</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
