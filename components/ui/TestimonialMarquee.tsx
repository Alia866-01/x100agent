import React, { useMemo } from 'react';
import { motion } from "framer-motion";
import { useTranslation } from '../LanguageContext';

// --- Types ---
interface Testimonial {
  text: string;
  image: string;
  name: string;
  role: string;
}

// --- Sub-Components ---
const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.ul
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 bg-transparent transition-colors duration-300 list-none m-0 p-0"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, image, name, role }, i) => (
                <motion.li
                  key={`${index}-${i}`}
                  whileHover={{
                    scale: 1.02,
                    y: -5,
                    transition: { type: "spring", stiffness: 400, damping: 17 }
                  }}
                  className="p-8 rounded-[24px] border border-white/10 bg-[#0D0D0D] shadow-2xl max-w-xs w-full transition-all duration-300 cursor-default select-none group hover:border-white/20 hover:bg-[#111]"
                >
                  <blockquote className="m-0 p-0 flex flex-col h-full justify-between">
                    <p className="text-gray-400 leading-relaxed font-light m-0 text-sm">
                      "{text}"
                    </p>
                    <footer className="flex items-center gap-3 mt-6 pt-6 border-t border-white/5">
                      <img
                        width={40}
                        height={40}
                        src={image}
                        alt={`Avatar of ${name}`}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-[#00C2FF]/50 transition-all duration-300"
                      />
                      <div className="flex flex-col">
                        <cite className="font-medium not-italic tracking-wide text-white text-sm">
                          {name}
                        </cite>
                        <span className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">
                          {role}
                        </span>
                      </div>
                    </footer>
                  </blockquote>
                </motion.li>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.ul>
    </div>
  );
};

const TestimonialsSection = () => {
  const { t } = useTranslation();

  const testimonials: Testimonial[] = useMemo(() => [
    {
      text: t('testim.q1'),
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
      name: t('testim.n1'),
      role: t('testim.r1'),
    },
    {
      text: t('testim.q2'),
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
      name: t('testim.n2'),
      role: t('testim.r2'),
    },
    {
      text: t('testim.q3'),
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150",
      name: t('testim.n3'),
      role: t('testim.r3'),
    },
    {
      text: t('testim.q4'),
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150",
      name: t('testim.n4'),
      role: t('testim.r4'),
    },
    {
      text: t('testim.q5'),
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150",
      name: t('testim.n5'),
      role: t('testim.r5'),
    },
    {
      text: t('testim.q6'),
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150",
      name: t('testim.n6'),
      role: t('testim.r6'),
    },
    {
      text: t('testim.q7'),
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150&h=150",
      name: t('testim.n7'),
      role: t('testim.r7'),
    },
    {
      text: t('testim.q8'),
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150",
      name: t('testim.n8'),
      role: t('testim.r8'),
    },
    {
      text: t('testim.q9'),
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150",
      name: t('testim.n9'),
      role: t('testim.r9'),
    },
  ], [t]);

  const firstColumn = testimonials.slice(0, 3);
  const secondColumn = testimonials.slice(3, 6);
  const thirdColumn = testimonials.slice(6, 9);

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="bg-black py-24 relative overflow-hidden border-t border-white/5"
    >
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-[radial-gradient(circle_at_center,rgba(0,194,255,0.05)_0%,transparent_70%)] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 1 }}
        className="container px-4 z-10 mx-auto relative"
      >
        <div className="flex flex-col items-center justify-center max-w-2xl mx-auto mb-16">
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="w-1.5 h-1.5 bg-[#00C2FF] rounded-full mr-2 animate-pulse"></span>
              <span className="text-gray-300 text-[11px] font-mono font-bold tracking-widest uppercase">
                {t('testim.trusted')}
              </span>
            </div>
          </div>

          <h2 id="testimonials-heading" className="text-4xl md:text-6xl font-serif text-white text-center mb-6">
            {t('testim.title')} <em className="italic text-gray-400">{t('testim.switch')}</em>
          </h2>
          <p className="text-center text-gray-500 font-light text-lg leading-relaxed max-w-lg mx-auto">
            {t('testim.subtitle')}
          </p>
        </div>

        <div
          className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] max-h-[740px] overflow-hidden"
          role="region"
          aria-label="Scrolling Testimonials"
        >
          <TestimonialsColumn testimonials={firstColumn} duration={45} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={55} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={50} />
        </div>
      </motion.div>
    </section>
  );
};

export default TestimonialsSection;