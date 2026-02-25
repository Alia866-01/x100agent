import React from 'react';
import {
    Building2, Stethoscope, Scale, Scissors, Car, Dumbbell, Utensils, Hotel, Wrench,
    ShoppingBag, Laptop, Megaphone, GraduationCap, Users, CreditCard, Camera, Truck, BriefcaseMedical
} from 'lucide-react';
import { useTranslation } from './LanguageContext';

// Data moved inside component for i18n compatibility

const IndustryCard = ({ icon: Icon, name }: { icon: any; name: string } & React.Attributes) => (
    <div className="flex items-center gap-4 px-8 py-5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_24px_-1px_rgba(0,0,0,0.2)] transition-all duration-300 hover:bg-white/[0.06] hover:border-white/20 hover:scale-105 hover:shadow-[0_8px_32px_-4px_rgba(0,0,0,0.3)] group min-w-[240px]">
        <Icon className="w-5 h-5 text-white/60 group-hover:text-white transition-colors duration-300" strokeWidth={1.5} />
        <span className="text-sm font-mono font-medium tracking-widest text-white/70 group-hover:text-white uppercase transition-colors duration-300">{name}</span>
    </div>
);

const MarqueeRow = ({ items, direction, speed = "30s" }: { items: any[], direction: 'left' | 'right', speed?: string }) => {
    return (
        <div className="relative flex overflow-hidden w-full group py-4">
            <div
                className={`flex gap-6 animate-scroll-${direction}`}
                style={{
                    animation: `scroll-${direction} ${speed} linear infinite`,
                    width: "max-content"
                }}
            >
                {/* Tripled list for seamless infinite loop */}
                {[...items, ...items, ...items].map((item, idx) => (
                    <IndustryCard
                        key={`${item.name}-${idx}`}
                        icon={item.icon}
                        name={item.name}
                    />
                ))}
            </div>
        </div>
    );
};

export const TargetAudienceSection = () => {
    const { t } = useTranslation();

    const industriesRow1 = [
        { icon: Building2, name: t('target.ind.real_estate') },
        { icon: Stethoscope, name: t('target.ind.dentistry') },
        { icon: Scale, name: t('target.ind.law') },
        { icon: Scissors, name: t('target.ind.beauty') },
        { icon: Car, name: t('target.ind.auto') },
        { icon: Dumbbell, name: t('target.ind.fitness') },
        { icon: Utensils, name: t('target.ind.restaurants') },
        { icon: Hotel, name: t('target.ind.hospitality') },
        { icon: Wrench, name: t('target.ind.home_services') },
    ];

    const industriesRow2 = [
        { icon: ShoppingBag, name: t('target.ind.ecommerce') },
        { icon: Laptop, name: t('target.ind.saas') },
        { icon: Megaphone, name: t('target.ind.marketing') },
        { icon: GraduationCap, name: t('target.ind.coaching') },
        { icon: Users, name: t('target.ind.recruitment') },
        { icon: CreditCard, name: t('target.ind.fintech') },
        { icon: Camera, name: t('target.ind.creators') },
        { icon: Truck, name: t('target.ind.logistics') },
        { icon: BriefcaseMedical, name: t('target.ind.clinics') },
    ];

    return (
        <section className="py-32 bg-black border-t border-white/5 relative overflow-hidden">

            {/* Styles for marquee animation */}
            <style>{`
                @keyframes scroll-left {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); }
                }
                @keyframes scroll-right {
                    0% { transform: translateX(-33.33%); }
                    100% { transform: translateX(0); }
                }
            `}</style>

            <div className="max-w-7xl mx-auto px-4 text-center mb-24 relative z-10">
                <h2 className="text-4xl md:text-6xl font-serif font-light text-white mb-6 tracking-tight">
                    {t('target.title')} <em className="italic text-gray-500">{t('target.title_suffix')}</em>
                </h2>
                <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">
                    {t('target.subtitle')}
                </p>
            </div>

            <div className="relative w-full space-y-10">
                {/* Gradient Masks for Fade Effect */}
                <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-black via-black/80 to-transparent z-20 pointer-events-none"></div>
                <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-black via-black/80 to-transparent z-20 pointer-events-none"></div>

                {/* Row 1 - Moving Left */}
                <MarqueeRow
                    items={industriesRow1}
                    direction="left"
                    speed="60s"
                />

                {/* Row 2 - Moving Right */}
                <MarqueeRow
                    items={industriesRow2}
                    direction="right"
                    speed="70s"
                />
            </div>
        </section>
    );
};