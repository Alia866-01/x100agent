import React, { useRef } from 'react';
import { useTranslation } from './LanguageContext';
import { ArrowRight } from './Icons';

const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 0L7.6 4.3H12L8.5 7.2L9.8 12L6 9.3L2.2 12L3.5 7.2L0 4.3H4.4L6 0Z" fill="white" />
  </svg>
);

const NavArrowLeft = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const NavArrowRight = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  image: string;
  gradientClass: string;
}

const TestimonialCard: React.FC<TestimonialProps> = ({ quote, author, role, image, gradientClass }) => (
  <div className={`min-w-[280px] md:min-w-[320px] lg:min-w-[360px] rounded-[24px] p-8 flex flex-col items-center justify-between text-center mx-3 snap-center shrink-0 ${gradientClass} transition-transform hover:scale-[1.02] duration-500 shadow-xl h-auto min-h-[400px]`}>
    <div className="flex gap-1 mt-1">
      {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
    </div>

    <p className="text-white text-base md:text-lg font-medium leading-relaxed font-heading max-w-[260px] md:max-w-xs drop-shadow-sm my-6 flex-grow flex items-center justify-center">
      "{quote}"
    </p>

    <div className="flex flex-col items-center gap-4 w-full border-t border-white/10 pt-6">
      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/20 shadow-lg">
        <img src={image} alt={author} className="w-full h-full object-cover" />
      </div>
      <div>
        <p className="text-white text-[11px] font-mono font-bold uppercase tracking-[0.2em] mb-1 opacity-90 drop-shadow-sm">
          {author}
        </p>
        <p className="text-white/70 text-[10px] uppercase tracking-wider">{role}</p>
      </div>
    </div>
  </div>
);

const Testimonials: React.FC = () => {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 340; // Approximate card width + margin
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-24 bg-black overflow-hidden relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 mb-16 text-center">
        <h2 className="text-4xl md:text-6xl font-serif text-white tracking-tight">
          {t('testim.title')} <em className="italic font-light">{t('testim.title_suffix')}</em>
        </h2>
      </div>

      <div className="flex justify-center w-full px-4">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto pb-8 -mx-4 px-4 scrollbar-hide snap-x items-center w-full max-w-[1200px] md:justify-center gap-4"
        >
          <TestimonialCard
            quote={t('testim.quote1')}
            author={t('testim.author1')}
            role={t('testim.role1')}
            image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop"
            gradientClass="bg-gradient-to-b from-[#45E3FF] to-[#0CA5B0]"
          />
          <TestimonialCard
            quote={t('testim.quote2')}
            author={t('testim.author2')}
            role={t('testim.role2')}
            image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"
            gradientClass="bg-gradient-to-b from-[#8CB8FF] to-[#708AD4]"
          />
          <TestimonialCard
            quote={t('testim.quote3')}
            author={t('testim.author3')}
            role={t('testim.role3')}
            image="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop"
            gradientClass="bg-[linear-gradient(135deg,#60A5FA_0%,#A5B4FC_40%,#FBBF24_100%)]"
          />
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-6 md:hidden">
        <button
          onClick={() => scroll('left')}
          className="w-12 h-12 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all active:scale-95"
          aria-label="Previous testimonial"
        >
          <NavArrowLeft />
        </button>
        <button
          onClick={() => scroll('right')}
          className="w-12 h-12 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all active:scale-95"
          aria-label="Next testimonial"
        >
          <NavArrowRight />
        </button>
      </div>
    </section>
  );
};

export default Testimonials;