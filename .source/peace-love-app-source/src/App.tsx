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
import { ChevronUp } from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button if scrolled down by 300px
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    // Give direct transition tags to each root page level section element of active view
    const injectScrollFades = () => {
      const sections = document.querySelectorAll('section');
      sections.forEach((sec) => {
        if (!sec.classList.contains('scroll-section')) {
          sec.classList.add('scroll-section');
        }
      });

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Retain on screen without repeating fade
            observer.unobserve(entry.target);
          }
        });
      }, {
        root: null,
        rootMargin: '0px 0px -100px 0px', // Trigger slightly ahead of viewport edge
        threshold: 0.1,
      });

      sections.forEach((sec) => {
        observer.observe(sec);
      });

      return observer;
    };

    // Delay a micro-instant of 50ms so active view renders properly first
    const timer = setTimeout(() => {
      const observer = injectScrollFades();
      return () => observer.disconnect();
    }, 50);

    return () => clearTimeout(timer);
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
      {/* Dynamic Header */}
      <Header activePage={activePage} setActivePage={setActivePage} />
      
      {/* Active Inner Page Content */}
      <main id="main-content-stage" className="flex-grow pt-20">
        {renderActiveView()}
      </main>

      {/* Global Brand Footer */}
      <Footer setActivePage={setActivePage} />

      {/* Floating Back to Top Button */}
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

