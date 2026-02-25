import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from './LanguageContext';
import { ArrowRight, ArrowUp, LaurelLeft, LaurelRight } from './Icons';

const Hero: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => {
    const { t, language } = useTranslation();

    // Search bar typing effect
    const [searchText, setSearchText] = useState("");
    const searchFullText = t('hero.search_placeholder');

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            if (index <= searchFullText.length) {
                setSearchText(searchFullText.slice(0, index));
                index++;
            } else {
                clearInterval(interval);
            }
        }, 50);
        return () => clearInterval(interval);
    }, [searchFullText]);

    // Headline typing effect
    const [headlineText, setHeadlineText] = useState("");
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    const phrases = useMemo(() => [
        t('hero.phrases.0'),
        t('hero.phrases.1'),
        t('hero.phrases.2')
    ], [language]); // Re-create phrases when language changes

    useEffect(() => {
        // Reset if index is out of bounds (when switching lang, though usually array length same)
        if (phraseIndex >= phrases.length) setPhraseIndex(0);

        const currentPhrase = phrases[phraseIndex] || phrases[0];

        const type = () => {
            if (isDeleting) {
                setHeadlineText(prev => currentPhrase.substring(0, prev.length - 1));
            } else {
                setHeadlineText(prev => currentPhrase.substring(0, prev.length + 1));
            }
        };

        let timer: ReturnType<typeof setTimeout>;

        if (!isDeleting && headlineText === currentPhrase) {
            // Pause at end of typing
            timer = setTimeout(() => setIsDeleting(true), 2000);
        } else if (isDeleting && headlineText === "") {
            // Move to next phrase
            setIsDeleting(false);
            setPhraseIndex(prev => (prev + 1) % phrases.length);
        } else {
            // Typing or deleting
            timer = setTimeout(type, isDeleting ? 50 : 100);
        }

        return () => clearTimeout(timer);
    }, [headlineText, isDeleting, phraseIndex, phrases]);

    return (
        <section className="relative h-screen min-h-[850px] w-full flex flex-col items-center justify-center text-center px-4 overflow-hidden bg-black">
            {/* Background Video */}
            <div className="absolute inset-0 z-0 w-full h-full">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    poster="https://cdn.prod.website-files.com/68acbc076b672f730e0c77b9%2F68bb73e8d95f81619ab0f106_Clouds1-poster-00001.jpg"
                >
                    <source src="https://cdn.prod.website-files.com/68acbc076b672f730e0c77b9%2F68bb73e8d95f81619ab0f106_Clouds1-transcode.mp4" type="video/mp4" />
                </video>

                {/* Overlays to ensure text readability and match design */}
                <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
                {/* Top gradient for header visibility */}
                <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/80 to-transparent" />
                {/* Main bottom gradient fade */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent via-50% to-black/90" />
                {/* Additional bottom fade for seamless transition */}
                <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black to-transparent opacity-80" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center pt-20 w-full">
                {/* Promo Bar / Pill */}
                <div className="animate-fade-in mb-8">
                    <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#A5F3FC]/10 backdrop-blur-md border border-[#A5F3FC]/30 shadow-[0_0_20px_rgba(165,243,252,0.1)]">
                        <p className="text-[#A5F3FC] text-[11px] font-mono font-bold tracking-widest uppercase">
                            {t('hero.promo')}
                        </p>
                    </div>
                </div>

                {/* Main Heading */}
                <h1
                    className="animate-slide-up font-serif text-white mb-6 tracking-tight drop-shadow-2xl"
                    style={{
                        fontSize: 'clamp(48px, 6vw, 96px)',
                        lineHeight: '1.1',
                        fontWeight: 300,
                        minHeight: '2.2em' // prevent layout shift
                    }}
                >
                    <em className="italic">{t('hero.headline_prefix')}</em><br />
                    {headlineText}<span className="animate-pulse text-[#00C2FF]">|</span>
                </h1>

                {/* Subheading */}
                <div className="animate-fade-in delay-100 max-w-3xl mx-auto mb-10">
                    <p className="text-[18px] md:text-[22px] text-white/80 font-light leading-relaxed drop-shadow-lg">
                        {t('hero.subheading')}
                    </p>
                </div>

                {/* Get Started Button (Solid White) */}
                <div className="animate-fade-in delay-200 mb-10">
                    <button onClick={() => onNavigate?.('register')} className="bg-white text-black pl-7 pr-6 py-3.5 rounded-lg text-[12px] font-mono font-bold tracking-widest hover:bg-gray-100 transition-all duration-300 uppercase flex items-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.2)] cursor-pointer">
                        {t('hero.cta.create')} <ArrowRight />
                    </button>
                </div>

                {/* Search Bar / Typed Words (Rounded Pill) */}
                <div className="w-full max-w-2xl animate-fade-in delay-300 mb-8 px-4">
                    <div className="relative group cursor-pointer">
                        <div className="absolute -inset-1 bg-white/10 rounded-[40px] blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                        <div className="relative flex items-center justify-between bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[40px] p-2 pl-8 transition-all duration-300 hover:bg-white/10 h-[80px] shadow-2xl">
                            <span className="text-white text-lg md:text-2xl font-light tracking-wide">
                                {searchText}<span className="animate-pulse">|</span>
                            </span>
                            <div className="bg-white/10 border border-white/10 group-hover:bg-white/20 text-white w-16 h-16 rounded-full flex items-center justify-center transition-colors backdrop-blur-md flex-shrink-0">
                                <ArrowUp />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Badges */}
                <div className="flex flex-row items-center justify-center gap-6 md:gap-12 animate-fade-in delay-500 opacity-90">
                    <div className="flex items-center gap-2">
                        <LaurelLeft />
                        <div className="text-center flex flex-col items-center">
                            <span className="text-white font-serif font-bold text-lg tracking-tight">{t('hero.trusted')}</span>
                            <span className="text-white/80 text-[10px] font-mono font-bold tracking-widest uppercase leading-tight mt-1">
                                {t('hero.businesses')}
                            </span>
                        </div>
                        <LaurelRight />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;