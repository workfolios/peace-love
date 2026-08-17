import { useState, useEffect } from 'react';
import { ActivePage } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import HouseWatchView from './components/HouseWatchView';
import PetCareView from './components/PetCareView';
import RequestView from './components/RequestView';
import AdminView from './components/AdminView';
import ClientPortalView from './components/ClientPortalView';
import AssociatePortalView from './components/AssociatePortalView';
import GovernedRefinementLayer from './components/GovernedRefinementLayer';
import AccessibilityValidationFixes from './components/AccessibilityValidationFixes';
import { ChevronUp } from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? 'auto' : 'smooth'
    });
  };

  useEffect(() => {
    let observer: IntersectionObserver | null = null;

    const injectScrollFades = () => {
      const sections = document.querySelectorAll('section');
      sections.forEach((sec) => {
        if (!sec.classList.contains('scroll-section')) {
          sec.classList.add('scroll-section');
        }
      });

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        sections.forEach((sec) => sec.classList.add('is-visible'));
        return;
      }

      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer?.unobserve(entry.target);
          }
        });
      }, {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1,
      });

      sections.forEach((sec) => observer?.observe(sec));
    };

    const timer = window.setTimeout(injectScrollFades, 50);

    return () => {
      window.clearTimeout(timer);
      observer?.disconnect();
    };
  }, [activePage]);

  const renderActiveView = () => {
    switch (activePage) {
      case 'home':
        return <HomeView setActivePage={setActivePage} />;
      case 'house-watch':
        return <HouseWatchView setActivePage={setActivePage} />;
      case 'pet-care':
        return <PetCareView setActivePage={setActivePage} />;
      case 'request':
        return <RequestView setActivePage={setActivePage} />;
      case 'admin':
        return <AdminView setActivePage={setActivePage} />;
      case 'client-portal':
        return <ClientPortalView setActivePage={setActivePage} />;
      case 'associate-portal':
        return <AssociatePortalView setActivePage={setActivePage} />;
      default:
        return <HomeView setActivePage={setActivePage} />;
    }
  };

  return (
    <div id="peace-love-home-app" className="min-h-screen flex flex-col bg-white text-brand-text relative">
      <a
        href="#main-content-stage"
        className="fixed top-2 left-2 z-[300] -translate-y-20 rounded-lg bg-white px-4 py-2 text-sm font-bold text-brand-plum shadow-lg border border-brand-plum/20 transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>

      {/* Governed accessibility, privacy, and interaction-state refinements */}
      <GovernedRefinementLayer activePage={activePage} />
      <AccessibilityValidationFixes />

      <Header activePage={activePage} setActivePage={setActivePage} />

      <main id="main-content-stage" tabIndex={-1} className="flex-grow pt-20">
        {renderActiveView()}
      </main>

      <Footer setActivePage={setActivePage} />

      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-[#b87d8d] hover:bg-[#a66c7c] text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 z-50 cursor-pointer active:scale-95 animate-in fade-in slide-in-from-bottom-5"
          aria-label="Back to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
