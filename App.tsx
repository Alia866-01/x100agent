import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import {
  PainSection,
  HowItWorksSection,
  CapabilitiesSection,
  CatalogSection,
  IntegrationsSection,
  ComparisonSection,
  PricingSection
} from './components/ProductSections';
import { ProductDemoSection } from './components/ProductDemo';
import GeminiAdvisor from './components/GeminiAdvisor';
import TestimonialMarquee from './components/ui/TestimonialMarquee';
import { ImpactFeatures } from './components/ui/ImpactFeatures';
import { TargetAudienceSection } from './components/TargetAudienceSection';
import Footer from './components/Footer';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Dashboard from './components/Dashboard';
import AuthCallback from './components/AuthCallback';

// New Pages
import { About } from './components/About';
import { Blog } from './components/Blog';
import { Careers } from './components/Careers';
import { Contact } from './components/Contact';
import { PrivacyPolicy, TermsOfService, GDPR } from './components/Legal';
import { CookieConsent } from './components/CookieConsent';
import InvestorDeck from './components/InvestorDeck';

type ViewState = 'landing' | 'login' | 'register' | 'dashboard' | 'auth-callback' | 'about' | 'blog' | 'careers' | 'contact' | 'privacy' | 'terms' | 'gdpr' | 'investor';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('landing');

  // Check URL path on mount for OAuth callback
  useEffect(() => {
    const path = window.location.pathname;
    console.log('[App] Current path on mount:', path);
    if (path === '/auth/callback') {
      console.log('[App] OAuth callback detected, switching to auth-callback view');
      setCurrentView('auth-callback');
    } else if (path === '/investor' || path === '/deck' || path === '/vc') {
      setCurrentView('investor');
    }
    // Also support hash-based
    if (window.location.hash === '#/investor' || window.location.hash === '#/deck' || window.location.hash === '#/vc') {
      setCurrentView('investor');
    }
  }, []);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  const handleNavigate = (view: string) => {
    setCurrentView(view as ViewState);
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-black text-white font-sans selection:bg-[#00C2FF] selection:text-black">

        {/* Landing Page Flow */}
        {currentView === 'landing' && (
          <>
            <Header onLoginClick={() => setCurrentView('login')} onNavigate={handleNavigate} />
            <main>
              <Hero onNavigate={handleNavigate} />
              <PainSection />

              {/* Added Animation Section */}
              <section className="bg-black py-4 md:py-16 relative overflow-visible z-20">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,194,255,0.05)_0%,transparent_50%)] pointer-events-none"></div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 relative w-full pt-8">
                  <div className="relative rounded-2xl md:rounded-[32px] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(0,194,255,0.15)] bg-[#0A0A0A] group transition-all duration-700 hover:border-[#00C2FF]/30 hover:shadow-[0_0_120px_rgba(0,194,255,0.2)] will-change-transform">

                    {/* Inner glow */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#00C2FF]/5 via-transparent to-transparent pointer-events-none z-20"></div>

                    {/* Subtle top reflection */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent z-30"></div>

                    {/* Window Chrome / Browser effect */}
                    <div className="h-8 md:h-12 bg-[#151515] border-b border-white/5 flex items-center px-4 md:px-6 z-20 relative">
                      <div className="flex gap-1.5 md:gap-2">
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#FF5F57]"></div>
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#FEBC2E]"></div>
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#28C840]"></div>
                      </div>
                      <div className="mx-auto flex gap-2 items-center bg-[#0A0A0A] border border-white/5 px-3 py-1 md:py-1.5 rounded-md drop-shadow-sm">
                        <div className="w-2 h-2 md:w-3 md:h-3 bg-white/10 rounded-full cursor-pointer hover:bg-white/20 transition-colors"></div>
                        <div className="w-24 md:w-40 h-1.5 md:h-2 bg-white/5 rounded-full cursor-pointer hover:bg-white/10 transition-colors"></div>
                      </div>
                    </div>

                    {/* The Image */}
                    <div className="relative bg-[#000]">
                      <img
                        src="/dashboard_demo_fast.webp"
                        alt="Platform Dashboard Demo"
                        className="w-full h-auto object-cover relative z-10 opacity-90 group-hover:opacity-100 transition-opacity duration-1000"
                        loading="lazy"
                      />
                      {/* Glossy overlay over image to give screen effect */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none z-30 opacity-60 mix-blend-screen"></div>
                    </div>

                  </div>
                </div>
              </section>

              <ProductDemoSection />
              <ImpactFeatures />
              <TargetAudienceSection />
              <HowItWorksSection />
              <CapabilitiesSection />
              <IntegrationsSection />
              <CatalogSection onNavigate={handleNavigate} />
              <ComparisonSection />
              <TestimonialMarquee />
              <GeminiAdvisor />
              <PricingSection />
            </main>
            <Footer onNavigate={handleNavigate} showHero={true} />
          </>
        )}

        {/* Pages with Header/Footer */}
        {(['about', 'blog', 'careers', 'contact', 'privacy', 'terms', 'gdpr'].includes(currentView)) && (
          <>
            <Header onLoginClick={() => setCurrentView('login')} onNavigate={handleNavigate} />
            <main>
              {currentView === 'about' && <About />}
              {currentView === 'blog' && <Blog onNavigate={handleNavigate} />}
              {currentView === 'careers' && <Careers />}
              {currentView === 'contact' && <Contact />}
              {currentView === 'privacy' && <PrivacyPolicy />}
              {currentView === 'terms' && <TermsOfService />}
              {currentView === 'gdpr' && <GDPR />}
            </main>
            <Footer onNavigate={handleNavigate} />
          </>
        )}

        {/* Login Page Overlay */}
        {currentView === 'login' && (
          <LoginPage
            onBack={() => setCurrentView('landing')}
            onLoginSuccess={() => setCurrentView('dashboard')}
            onSwitchToRegister={() => setCurrentView('register')}
          />
        )}

        {/* Register Page Overlay */}
        {currentView === 'register' && (
          <RegisterPage
            onBack={() => setCurrentView('landing')}
            onRegisterSuccess={() => setCurrentView('dashboard')}
            onSwitchToLogin={() => setCurrentView('login')}
          />
        )}

        {/* OAuth Callback Handler */}
        {currentView === 'auth-callback' && (
          <AuthCallback
            onSuccess={() => {
              // Clear the callback URL and go to dashboard
              window.history.replaceState({}, '', '/');
              setCurrentView('dashboard');
            }}
            onError={() => {
              // Clear the callback URL and go back to landing
              window.history.replaceState({}, '', '/');
              setCurrentView('landing');
            }}
          />
        )}

        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <Dashboard onLogout={() => setCurrentView('landing')} />
        )}

        {/* Investor Deck (secret — only via /investor or /deck URL) */}
        {currentView === 'investor' && (
          <InvestorDeck />
        )}

        <CookieConsent />
      </div>
    </AuthProvider>
  );
}

export default App;