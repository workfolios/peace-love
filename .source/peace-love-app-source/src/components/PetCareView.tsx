import { ActivePage } from '../types';
import { Heart, Compass, CheckCircle2, ShieldAlert, ArrowRight, MessageSquare, Utensils, Award, Cat } from 'lucide-react';

interface PetCareViewProps {
  setActivePage: (page: ActivePage) => void;
}

export default function PetCareView({ setActivePage }: PetCareViewProps) {
  
  const dropInPoints = [
    {
      title: 'Feeding & Spotless Bowls',
      icon: Utensils,
      description: 'Scheduled breakfast and dinner portions measured exactly as you direct. Washing food and water dishes during every single visit.'
    },
    {
      title: 'Water Refreshes',
      icon: Heart,
      description: 'Clean bowls of crisp, cold water. Dehydration or stale bowls aren’t an option here.'
    },
    {
      title: 'Comfort, Head Scratches & Sofa Care',
      icon: Cat,
      description: 'Because "pets prefer their own couch." I sit with them, talk to them, play with their favorite toys, and keep them friendly company.'
    },
    {
      title: 'Litter Tray & Yard Patrol',
      icon: CheckCircle2,
      description: 'Keeping litter tray areas clean, swept, and fully scooped. Yard cleanups are handled so you do not come home to a messy lawn.'
    },
    {
      title: 'Routine Exercises',
      icon: Compass,
      description: 'Short neighborhood walks, backyard stretches, or simple games inside so they can burn off travel anxiety.'
    },
    {
      title: 'Immediate Photo Updates',
      icon: MessageSquare,
      description: 'A quick text with a picture of your pet looking relaxed and comfortable. Your cat can continue judging everyone from their usual spot.'
    }
  ];

  const handleCTA = () => {
    setActivePage('request');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="pet-care-view" className="bg-white min-h-screen pb-16">
      
      {/* Page Header (Soft Blush Background) */}
      <section id="pet-care-header" className="px-4 py-20 sm:px-6 lg:px-8 border-b border-brand-plum/10 bg-brand-stone">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#100720] tracking-tight leading-tight max-w-3xl mx-auto text-balance">
            Pet Care That Keeps Familiar Routines In Place
          </h1>
          <p className="text-base sm:text-lg text-[#1F1F1F] leading-relaxed max-w-2xl mx-auto font-semibold font-sans text-balance">
            Some pets do better at home. Drop-in visits and in-home sitting help keep familiar routines steady while you are away.
          </p>
        </div>
      </section>

      {/* Drop-In Pet Care Points Grid */}
      <section id="drop-in-details" className="max-w-5xl mx-auto px-4 py-24 sm:px-6 lg:px-8 bg-white">
        <div className="space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#100720]">
              Grounded, Friendly Drop-In Support
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dropInPoints.map((point, idx) => {
              const Icon = point.icon;
              return (
                <div 
                  id={`pet-item-${idx}`}
                  key={idx}
                  className="bg-[#FDF8FB] hover:bg-white rounded-3xl p-8 space-y-5 border border-[#9C5B7F]/10 hover:border-[#9C5B7F]/30 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 flex flex-col justify-start h-full group"
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

      {/* Section 3: In-Home Pet Sitting explanation (Deep Dark Purple Contrast Area) */}
      <section id="sitting-details" className="bg-[#100720] text-white border-y border-white/10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">In-Home Sitting Scope</h2>
            <p className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto font-medium font-sans">
              For pets that do better with a dedicated overnight human presence in the house.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Column Left: What we do */}
            <div className="bg-white/5 border border-white/10 hover:border-purple-400/80 rounded-3xl p-8 space-y-6 transition-all duration-300 hover:-translate-y-1.5 shadow-sm">
              <h3 className="font-extrabold text-lg text-white flex items-center gap-3 border-b border-white/10 pb-3">
                <div className="w-10 h-10 rounded-full bg-[#9C5B7F]/20 text-[#9C5B7F] flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-[#9C5B7F]" />
                </div>
                What Sitting Includes
              </h3>
              <ul className="space-y-4 text-sm text-white/95 font-semibold tracking-wide">
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9C5B7F]" />
                  Overnight presence inside the home
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9C5B7F]" />
                  Consistent morning breakfast routines
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9C5B7F]" />
                  Mail collection and basic plant care
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9C5B7F]" />
                  Keeping your home appearing lived-in
                </li>
              </ul>
            </div>

            {/* Column Right: Limits */}
            <div className="bg-white/5 border border-white/10 hover:border-purple-400/80 rounded-3xl p-8 space-y-6 transition-all duration-300 hover:-translate-y-1.5 shadow-sm">
              <h3 className="font-extrabold text-lg text-white flex items-center gap-3 border-b border-white/10 pb-3">
                <div className="w-10 h-10 rounded-full bg-[#9C5B7F]/20 text-[#9C5B7F] flex items-center justify-center">
                  <Cat className="w-5 h-5 text-[#9C5B7F]" />
                </div>
                Booking & Schedules
              </h3>
              <p className="text-sm text-white/90 leading-relaxed font-semibold">
                Dates are limited. We confirm schedule slots individually, giving careful priority to friends, neighbors, and established local referral families.
              </p>
            </div>
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
