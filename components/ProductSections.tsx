import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldIcon, CheckIcon, XIcon, ThumbUpIcon, SyncIcon } from './Icons';
import GlowingButton from './GlowingButton';
import { useTranslation } from './LanguageContext';

export const SectionHeading = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <h2 className={`text-4xl md:text-6xl font-serif text-white mb-8 tracking-tight ${className}`}>
        {children}
    </h2>
);

export const SectionSub = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <p className={`text-xl text-[#ffffff99] max-w-2xl mx-auto mb-12 font-light leading-relaxed ${className}`}>
        {children}
    </p>
);

// --- 1. PAIN SECTION ---

const PainCard = ({ quote }: { quote: React.ReactNode }) => (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-10 rounded-[24px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_24px_-1px_rgba(0,0,0,0.5)] transition-all duration-500 hover:bg-gradient-to-br hover:from-red-900/20 hover:to-transparent hover:border-red-500/30 hover:shadow-[0_0_30px_rgba(220,38,38,0.1)] hover:scale-[1.02] group relative overflow-hidden flex flex-col justify-center min-h-[220px]">
        {/* Red Glow Effect */}
        <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

        <div className="absolute top-6 right-6 p-2 opacity-30 group-hover:opacity-100 group-hover:text-red-400 transition-all duration-300 transform group-hover:rotate-90">
            <XIcon />
        </div>
        <p className="text-xl text-white/70 font-light leading-relaxed group-hover:text-white transition-colors duration-300 relative z-10">
            "{quote}"
        </p>
    </div>
)

export const PainSection = () => {
    const { t } = useTranslation();
    return (
        <section className="py-24 bg-black relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <SectionHeading>{t('pain.title')} <em className="italic text-gray-500">{t('pain.title_suffix')}</em></SectionHeading>
                <SectionSub>{t('pain.subtitle')}</SectionSub>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
                    <PainCard quote={<>{t('pain.quote1')} <br /><span className="text-white font-medium">{t('pain.quote1_highlight')}</span></>} />
                    <PainCard quote={t('pain.quote2')} />
                    <PainCard quote={<>{t('pain.quote3')} <span className="text-white font-medium">{t('pain.quote3_highlight')}</span></>} />
                    <PainCard quote={t('pain.quote4')} />
                </div>
            </div>
        </section>
    );
};

// --- 2. HOW IT WORKS (Formerly Simplify) ---

export const HowItWorksSection = () => {
    const { t } = useTranslation();
    const [activeStep, setActiveStep] = useState(0);

    // Auto-rotate steps every 4 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep(prev => (prev + 1) % 3);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const steps = [
        {
            id: 0,
            title: t('how.step1.title'),
            desc: t('how.step1.desc'),
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        },
        {
            id: 1,
            title: t('how.step2.title'),
            desc: t('how.step2.desc'),
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
            )
        },
        {
            id: 2,
            title: t('how.step3.title'),
            desc: t('how.step3.desc'),
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            )
        }
    ];

    return (
        <section className="py-32 bg-black text-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,194,255,0.08)_0%,transparent_60%)] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <SectionHeading>{t('how.title')} <em className="italic text-gray-500">{t('how.title_suffix')}</em></SectionHeading>
                <SectionSub>{t('how.subtitle')}</SectionSub>

                <div className="relative h-[600px] flex items-center justify-center mt-10">

                    {/* Static Orbit Ring Lines (visible circles) */}
                    <div className="absolute w-[350px] h-[350px] md:w-[450px] md:h-[450px] rounded-full border border-[#00C2FF]/15 pointer-events-none"></div>
                    <div className="absolute w-[380px] h-[380px] md:w-[480px] md:h-[480px] rounded-full border border-[#00C2FF]/8 pointer-events-none"></div>
                    <div className="absolute w-[320px] h-[320px] md:w-[420px] md:h-[420px] rounded-full border border-white/5 pointer-events-none"></div>

                    {/* Orbit Glow Effect */}
                    <div className="absolute w-[350px] h-[350px] md:w-[450px] md:h-[450px] rounded-full pointer-events-none shadow-[0_0_60px_rgba(0,194,255,0.08),inset_0_0_60px_rgba(0,194,255,0.05)]"></div>

                    {/* Rotating Ring Container */}
                    <motion.div
                        className="absolute w-[350px] h-[350px] md:w-[450px] md:h-[450px] rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                    >
                        {/* Orbiting Icons — non-clickable, auto-animated */}
                        {steps.map((step, index) => (
                            <div
                                key={step.id}
                                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                                style={{ transform: `rotate(${index * 120}deg)` }}
                            >
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <motion.div
                                        className={`w-16 h-16 md:w-20 md:h-20 rounded-full border flex items-center justify-center transition-all duration-500 backdrop-blur-md ${activeStep === step.id
                                            ? 'bg-[#00C2FF] border-[#00C2FF] text-black shadow-[0_0_40px_rgba(0,194,255,0.5)] scale-110'
                                            : 'bg-[#0A0A0A]/80 border-white/10 text-gray-500'
                                            }`}
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                                    >
                                        {step.icon}
                                    </motion.div>
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Central Sphere (Content Display) */}
                    <div className="absolute z-20 w-64 h-64 md:w-80 md:h-80 rounded-full bg-[#050505] border border-white/10 flex flex-col items-center justify-center text-center p-8 shadow-[0_0_80px_rgba(0,0,0,0.8),0_0_40px_rgba(0,194,255,0.06)] backdrop-blur-xl">
                        {/* Inner ambient glow */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-[#00C2FF]/8 to-transparent pointer-events-none"></div>
                        {/* Edge glow ring */}
                        <div className="absolute inset-[-1px] rounded-full shadow-[inset_0_0_20px_rgba(0,194,255,0.1)] pointer-events-none"></div>

                        <div className="relative z-10 space-y-4">
                            <motion.div
                                key={activeStep}
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                <div className="text-5xl font-serif text-white/10 mb-2 font-light tracking-tighter">
                                    0{activeStep + 1}
                                </div>
                                <h3 className="text-2xl text-white font-medium mb-3 tracking-tight">
                                    {steps[activeStep].title.split('. ')[1]}
                                </h3>
                                <p className="text-sm text-gray-400 leading-relaxed max-w-[240px] mx-auto">
                                    {steps[activeStep].desc}
                                </p>
                            </motion.div>
                        </div>
                    </div>

                    {/* Step indicators */}
                    <div className="absolute bottom-8 flex gap-2 z-30">
                        {steps.map((step) => (
                            <div
                                key={step.id}
                                className={`h-1 rounded-full transition-all duration-500 ${activeStep === step.id
                                    ? 'w-8 bg-[#00C2FF] shadow-[0_0_10px_rgba(0,194,255,0.5)]'
                                    : 'w-2 bg-white/20'
                                    }`}
                            />
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
};

// --- 3. CAPABILITIES (Formerly Track) ---

// Visual Components for Capabilities
const LinearListItem = ({ icon, title, subtitle, time, color }: any) => (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group cursor-default">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center border border-white/10 ${color}`}>
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
                <span className="text-gray-200 text-xs font-medium truncate">{title}</span>
                <span className="text-gray-500 text-[10px]">{subtitle}</span>
            </div>
        </div>
        <div className="text-gray-600 text-[10px] whitespace-nowrap">{time}</div>
    </div>
);

const IntegrationListVisual = () => {
    const { t } = useTranslation();
    return (
        <div className="w-full max-w-[320px] bg-[#0A0A0A] border border-white/10 rounded-xl p-2 shadow-2xl relative overflow-hidden backdrop-blur-md">
            {/* Glass reflection */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
            <div className="space-y-1 relative z-10">
                <LinearListItem
                    icon={<div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_5px_#22c55e]"></div>}
                    title="HubSpot"
                    subtitle={t('visual.integration.hubspot')}
                    time={t('visual.integration.just_now')}
                    color="bg-green-500/10 text-green-500"
                />
                <LinearListItem
                    icon={<div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_5px_#3b82f6]"></div>}
                    title="Salesforce"
                    subtitle={t('visual.integration.salesforce')}
                    time={t('visual.integration.ago_2m')}
                    color="bg-blue-500/10 text-blue-500"
                />
                <LinearListItem
                    icon={<div className="w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_5px_#a855f7]"></div>}
                    title="Slack"
                    subtitle={t('visual.integration.slack')}
                    time={t('visual.integration.ago_5m')}
                    color="bg-purple-500/10 text-purple-500"
                />
                <LinearListItem
                    icon={<div className="w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_5px_#f97316]"></div>}
                    title="Gmail"
                    subtitle={t('visual.integration.gmail')}
                    time={t('visual.integration.ago_12m')}
                    color="bg-orange-500/10 text-orange-500"
                />
            </div>
        </div>
    );
};

const ResponseVisual = () => {
    const { t } = useTranslation();
    return (
        <div className="relative w-full max-w-[280px] space-y-3">
            {/* User Message */}
            <div className="flex justify-end">
                <div className="bg-[#1A1A1A] border border-white/10 text-gray-400 text-xs py-2 px-3 rounded-2xl rounded-tr-sm max-w-[80%] shadow-lg">
                    {t('visual.cap.user')}
                </div>
            </div>
            {/* Agent Message */}
            <div className="flex justify-start">
                <div className="bg-[#00C2FF]/10 border border-[#00C2FF]/20 text-[#00C2FF] text-xs py-2 px-3 rounded-2xl rounded-tl-sm max-w-[90%] shadow-[0_0_20px_rgba(0,194,255,0.1)] backdrop-blur-md">
                    <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#00C2FF] rounded-full animate-pulse"></span>
                        {t('visual.cap.agent_check')}
                    </span>
                </div>
            </div>
            <div className="flex justify-start delay-75">
                <div className="bg-[#1C1C1E] border border-white/10 text-gray-200 text-xs py-2 px-3 rounded-2xl rounded-tl-sm max-w-[90%] shadow-lg backdrop-blur-md">
                    {t('visual.cap.agent_confirm')}
                </div>
            </div>
        </div>
    );
}

const BookingVisual = () => {
    const { t } = useTranslation();
    return (
        <div className="relative w-full max-w-[280px]">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-4 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 right-0 p-3 opacity-20">
                    <CheckIcon />
                </div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xl">
                        📅
                    </div>
                    <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">{t('visual.booking.new')}</div>
                        <div className="text-white text-sm font-medium">{t('visual.booking.demo')}</div>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                        <span className="text-gray-500">{t('visual.booking.time_label')}</span>
                        <span className="text-gray-300">{t('visual.booking.time_val')}</span>
                    </div>
                    <div className="flex justify-between text-xs pt-1">
                        <span className="text-gray-500">{t('visual.booking.guest_label')}</span>
                        <span className="text-gray-300">alex@example.com</span>
                    </div>
                </div>
                {/* Success pill */}
                <div className="mt-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-2 flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full shadow-[0_0_5px_#06b6d4]"></div>
                    <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest">{t('visual.booking.confirmed')}</span>
                </div>
            </div>
        </div>
    );
}

const GlassCard: React.FC<{
    title: string;
    desc: string;
    children: React.ReactNode;
    className?: string;
}> = ({ title, desc, children, className = "" }) => (
    <div className={`relative rounded-3xl overflow-hidden group min-h-[400px] flex flex-col border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-sm transition-all duration-500 hover:border-[#00C2FF]/30 hover:shadow-[0_0_50px_-10px_rgba(0,194,255,0.15)] ${className}`}>

        {/* Hover Glow/Tint */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(0,194,255,0.1),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[#00C2FF]/[0.02]"></div>
        </div>

        <div className="relative z-10 p-8 flex flex-col h-full">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-6 text-[#00C2FF] border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:bg-[#00C2FF]/10 group-hover:border-[#00C2FF]/30 transition-colors duration-500">
                <CheckIcon />
            </div>
            <h3 className="text-2xl font-medium text-white mb-2 font-heading tracking-tight">{title}</h3>
            <p className="text-[#ffffffdd] font-light leading-relaxed text-sm mb-8">{desc}</p>

            {/* Visual Container */}
            <div className="mt-auto flex items-center justify-center relative w-full h-[200px]">
                {/* Background Glow for visual */}
                <div className="absolute bg-[#00C2FF]/5 w-32 h-32 blur-[60px] rounded-full pointer-events-none group-hover:bg-[#00C2FF]/20 transition-colors duration-700"></div>
                <div className="transform group-hover:scale-105 transition-transform duration-500 ease-out relative z-20">
                    {children}
                </div>
            </div>
        </div>
    </div>
);

export const CapabilitiesSection = () => {
    const { t } = useTranslation();
    return (
        <section className="py-24 bg-black text-center relative">
            <div className="max-w-7xl mx-auto px-4">
                <SectionHeading>{t('cap.title')} <em className="italic">{t('cap.title_suffix')}</em></SectionHeading>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left mt-16">
                    <GlassCard
                        title={t('cap.card1.title')}
                        desc={t('cap.card1.desc')}
                    >
                        <ResponseVisual />
                    </GlassCard>

                    <GlassCard
                        title={t('cap.card2.title')}
                        desc={t('cap.card2.desc')}
                    >
                        <BookingVisual />
                    </GlassCard>

                    <GlassCard
                        title={t('cap.card3.title')}
                        desc={t('cap.card3.desc')}
                        className="md:col-span-2 lg:col-span-1"
                    >
                        <IntegrationListVisual />
                    </GlassCard>
                </div>
            </div>
        </section>
    );
};

// --- 4. CATALOG (Visuals) ---

const AgentWindow = ({ children, color = "bg-blue-500" }: { children: React.ReactNode, color?: string }) => (
    <div className="w-full h-full bg-[#111] rounded-t-xl border border-white/10 overflow-hidden flex flex-col shadow-2xl relative">
        <div className="h-9 bg-[#161616] border-b border-white/5 flex items-center justify-between px-4">
            <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#3A3A3C] border border-white/5"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#3A3A3C] border border-white/5"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#3A3A3C] border border-white/5"></div>
            </div>
            <div className={`h-1 w-12 rounded-full ${color}/40`}></div>
        </div>
        <div className="p-5 flex-grow font-mono text-sm relative bg-[#0D0D0D]">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none"></div>
            {children}
        </div>
    </div>
);

const SalesAgentVisual = () => {
    const { t } = useTranslation();
    return (
        <AgentWindow color="bg-blue-500">
            <div className="space-y-4">
                <div className="flex justify-start">
                    <div className="bg-[#222] text-gray-300 px-3 py-2.5 rounded-2xl rounded-tl-sm text-xs max-w-[85%] border border-white/5 leading-relaxed">
                        {t('visual.sales.user')}
                    </div>
                </div>
                <div className="flex justify-end">
                    <div className="bg-blue-600/10 text-blue-100 px-3 py-2.5 rounded-2xl rounded-tr-sm text-xs max-w-[85%] border border-blue-500/20 leading-relaxed shadow-[0_0_15px_rgba(37,99,235,0.1)]">
                        {t('visual.sales.agent')}
                    </div>
                </div>
                <div className="flex justify-center mt-3">
                    <span className="text-[9px] text-gray-500 bg-white/5 px-2 py-1 rounded-full border border-white/5 uppercase tracking-wide">{t('visual.sales.tag')}</span>
                </div>
            </div>
        </AgentWindow>
    );
};

const ReceptionistVisual = () => {
    const { t } = useTranslation();
    return (
        <AgentWindow color="bg-orange-500">
            <div className="flex justify-between items-center mb-4">
                <div className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">{t('visual.reception.calendar')}</div>
                <div className="text-[10px] text-orange-400">{t('visual.reception.syncing')}</div>
            </div>
            <div className="space-y-3">
                <div className="flex gap-3 bg-white/5 p-3 rounded-lg border border-white/5 items-center">
                    <div className="w-1 h-8 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                        <div className="text-xs text-white font-medium mb-0.5">{t('visual.reception.booking')}</div>
                        <div className="text-[10px] text-gray-500">{t('visual.reception.time')}</div>
                    </div>
                    <div className="text-green-400 text-xs">{t('visual.reception.confirmed')}</div>
                </div>
                <div className="flex gap-3 bg-white/5 p-3 rounded-lg border border-white/5 items-center opacity-70">
                    <div className="w-1 h-8 bg-gray-500 rounded-full"></div>
                    <div className="flex-1">
                        <div className="text-xs text-white font-medium mb-0.5">{t('visual.reception.haircut')}</div>
                        <div className="text-[10px] text-gray-500">{t('visual.reception.reminder')}</div>
                    </div>
                </div>
            </div>
        </AgentWindow>
    );
};

const SupportVisual = () => {
    const { t } = useTranslation();
    return (
        <AgentWindow color="bg-green-500">
            <div className="space-y-4">
                <div className="flex justify-start">
                    <div className="bg-[#222] text-gray-300 px-3 py-2.5 rounded-2xl rounded-tl-sm text-xs max-w-[85%] border border-white/5 leading-relaxed">
                        {t('visual.support.user')}
                    </div>
                </div>
                <div className="flex justify-end">
                    <div className="bg-green-600/10 text-green-100 px-3 py-2.5 rounded-2xl rounded-tr-sm text-xs max-w-[85%] border border-green-500/20 leading-relaxed shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                        {t('visual.support.agent')}
                    </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                    <span className="text-[9px] text-gray-500">{t('visual.support.kb')}</span>
                    <span className="text-[9px] text-green-400">{t('visual.support.response')}</span>
                </div>
            </div>
        </AgentWindow>
    );
};

const ContentVisual = () => {
    const { t } = useTranslation();
    return (
        <AgentWindow color="bg-purple-500">
            <div className="flex items-center gap-2 mb-5">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                <span className="text-xs text-purple-300 font-bold">{t('visual.content.drafting')}</span>
            </div>
            <div className="space-y-3 opacity-80">
                <div className="h-2 bg-white/20 rounded w-1/3 mb-4"></div>
                <div className="h-1.5 bg-white/10 rounded w-full"></div>
                <div className="h-1.5 bg-white/10 rounded w-11/12"></div>
                <div className="h-1.5 bg-white/10 rounded w-4/5"></div>
                <div className="p-2 bg-white/5 rounded border border-white/5 text-[10px] text-gray-400 font-sans italic">
                    {t('visual.content.post')}
                </div>
            </div>
        </AgentWindow>
    );
};

const InvestCard: React.FC<{
    title: React.ReactNode;
    desc: string;
    features?: string[];
    visual: React.ReactNode;
    className?: string
}> = ({ title, desc, features, visual, className = "" }) => (
    <div className={`relative bg-[#0D0D0D] border border-white/10 rounded-3xl overflow-hidden group hover:border-white/20 transition-all duration-500 flex flex-col h-[600px] ${className}`}>
        <div className="p-8 relative z-10 flex flex-col h-full pointer-events-none">
            <h3 className="text-2xl text-white mb-3 font-serif pointer-events-auto">{title}</h3>
            <p className="text-[#ffffff99] font-light leading-relaxed mb-6 text-sm md:text-[15px] pointer-events-auto">{desc}</p>

            {features && (
                <ul className="mb-8 space-y-3 pointer-events-auto">
                    {features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-gray-400 font-mono tracking-wide">
                            <CheckIcon className="w-3 h-3 text-[#00C2FF]" />
                            {feature}
                        </li>
                    ))}
                </ul>
            )}

            <div className="flex-grow relative mt-auto -mx-8 -mb-8 overflow-hidden">
                <div className="w-full h-full transform translate-y-6 group-hover:translate-y-2 transition-transform duration-700 ease-out px-4 flex items-end justify-center">
                    <div className="w-full max-w-[320px]">
                        {visual}
                    </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/80 to-transparent pointer-events-none z-20" />
            </div>
        </div>
    </div>
);

export const CatalogSection = ({ onNavigate }: { onNavigate?: (view: string) => void }) => {
    const { t } = useTranslation();
    return (
        <section id="products" className="py-32 bg-black relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] pointer-events-none z-0"></div>

            {/* --- Smooth Gradient Background --- */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
                {/* Smooth moving gradient orbs */}
                <div className="absolute inset-0 opacity-40">
                    <div className="absolute top-1/2 left-[30%] w-[800px] h-[800px] bg-[#4f46e5]/40 rounded-full mix-blend-screen blur-[120px] animate-blob-1 -translate-y-1/2 -translate-x-1/2"></div>
                    <div className="absolute top-[40%] left-[70%] w-[600px] h-[600px] bg-[#06b6d4]/40 rounded-full mix-blend-screen blur-[120px] animate-blob-2 -translate-y-1/2 -translate-x-1/2"></div>
                    <div className="absolute top-[60%] left-[50%] w-[900px] h-[900px] bg-[#3b82f6]/40 rounded-full mix-blend-screen blur-[140px] animate-blob-3 -translate-y-1/2 -translate-x-1/2"></div>
                </div>

                {/* Top and Bottom fading edges to smoothly blend with the page */}
                <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-black to-transparent opacity-100"></div>
                <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black to-transparent opacity-100"></div>
            </div>

            <style>{`
            @keyframes blob-1 {
                0% { transform: translate(-50%, -50%) translate(10%, -10%) scale(1); }
                50% { transform: translate(-50%, -50%) translate(-10%, 10%) scale(1.1); }
                100% { transform: translate(-50%, -50%) translate(10%, -10%) scale(1); }
            }
            @keyframes blob-2 {
                0% { transform: translate(-50%, -50%) translate(-10%, -10%) scale(1.1); }
                50% { transform: translate(-50%, -50%) translate(10%, 10%) scale(0.9); }
                100% { transform: translate(-50%, -50%) translate(-10%, -10%) scale(1.1); }
            }
            @keyframes blob-3 {
                0% { transform: translate(-50%, -50%) translate(0%, 10%) scale(0.9); }
                50% { transform: translate(-50%, -50%) translate(0%, -10%) scale(1.05); }
                100% { transform: translate(-50%, -50%) translate(0%, 10%) scale(0.9); }
            }
            .animate-blob-1 { animation: blob-1 25s infinite ease-in-out; }
            .animate-blob-2 { animation: blob-2 30s infinite ease-in-out; }
            .animate-blob-3 { animation: blob-3 35s infinite ease-in-out; }
            `}</style>

            <div className="max-w-4xl mx-auto text-center relative z-10">
                <SectionHeading>{t('catalog.title')} <em className="italic text-gray-500">{t('catalog.title_suffix')}</em></SectionHeading>
                <SectionSub>{t('catalog.subtitle')}</SectionSub>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mt-16">
                    <InvestCard
                        title={<><span className="font-heading font-medium">{t('catalog.sales.title')}</span></>}
                        desc={t('catalog.sales.desc')}
                        features={[
                            t('catalog.sales.f1'),
                            t('catalog.sales.f2'),
                            t('catalog.sales.f3'),
                            t('catalog.sales.f4')
                        ]}
                        visual={<SalesAgentVisual />}
                    />
                    <InvestCard
                        title={<><span className="font-heading font-medium">{t('catalog.reception.title')}</span></>}
                        desc={t('catalog.reception.desc')}
                        features={[
                            t('catalog.reception.f1'),
                            t('catalog.reception.f2'),
                            t('catalog.reception.f3'),
                            t('catalog.reception.f4')
                        ]}
                        visual={<ReceptionistVisual />}
                    />
                    <InvestCard
                        title={<><span className="font-heading font-medium">{t('catalog.support.title')}</span></>}
                        desc={t('catalog.support.desc')}
                        features={[
                            t('catalog.support.f1'),
                            t('catalog.support.f2'),
                            t('catalog.support.f3'),
                            t('catalog.support.f4')
                        ]}
                        visual={<SupportVisual />}
                    />
                    <InvestCard
                        title={<><span className="font-heading font-medium">{t('catalog.content.title')}</span></>}
                        desc={t('catalog.content.desc')}
                        features={[
                            t('catalog.content.f1'),
                            t('catalog.content.f2'),
                            t('catalog.content.f3'),
                            t('catalog.content.f4')
                        ]}
                        visual={<ContentVisual />}
                    />
                </div>

                <div className="mt-16 text-center">
                    <GlowingButton onClick={() => onNavigate?.('register')}>
                        {t('section.learn_more')}
                    </GlowingButton>
                </div>
            </div>
        </section>
    );
};

// --- 5. INTEGRATIONS ---

const IntegrationVisual = () => {
    const { t } = useTranslation();

    // Expanded Icons for integration
    const icons = [
        "https://cdn.simpleicons.org/whatsapp/25D366",
        "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/slack/slack-original.svg",
        "https://cdn.simpleicons.org/telegram/26A5E4",
        "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/salesforce/salesforce-original.svg",
        "https://cdn.simpleicons.org/hubspot/FF7A59",
        "https://cdn.simpleicons.org/google/4285F4",
        "https://cdn.simpleicons.org/notion/ffffff",
        "https://cdn.simpleicons.org/jira/0052CC",
        "https://cdn.simpleicons.org/figma/F24E1E",
        "https://cdn.simpleicons.org/trello/0052CC",
        "https://cdn.simpleicons.org/github/ffffff",
        "https://cdn.simpleicons.org/gitlab/FC6D26"
    ];

    // More particles, spreading wider horizontally
    const particles = Array.from({ length: 30 }).map((_, i) => {
        // pseudo-random generation for deterministic render
        const rand1 = Math.sin(i * 1234.5);
        const rand2 = Math.cos(i * 9876.5);

        return {
            id: i,
            delay: i * 0.15,
            targetX: rand1 * 480, // wide spread (-480px to 480px)
            targetY: rand2 * 180, // shorter vertical spread (-180px to 180px)
            scale: 0.6 + Math.abs(rand1) * 0.6, // size variation
            icon: icons[i % icons.length]
        };
    });

    return (
        <div className="relative h-[450px] w-full max-w-6xl mx-auto flex items-center justify-center overflow-hidden mt-12 mb-8 rounded-[3rem]">

            {/* Background Energy Field - Horizontal */}
            <div className="absolute inset-0 top-1/2 -translate-y-1/2 w-full h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(0,194,255,0.1)_0%,transparent_60%)] pointer-events-none animate-pulse"></div>

            {/* Orbiting / Exploding Icons */}
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute w-14 h-14 bg-[#111] border border-white/10 rounded-2xl flex items-center justify-center shadow-lg z-20 backdrop-blur-sm"
                    initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                    animate={{
                        x: [0, p.targetX, p.targetX * 1.05],
                        y: [0, p.targetY, p.targetY * 1.05],
                        scale: [0, p.scale, 0],
                        opacity: [0, 1, 0]
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "easeOut"
                    }}
                >
                    <img src={p.icon} alt="Integration" className="w-7 h-7 object-contain drop-shadow-lg" />
                </motion.div>
            ))}

            {/* Central Dialogue Core (Larger Window) */}
            <div className="absolute z-30 w-[340px] md:w-[400px] bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-xl">
                <div className="bg-[#151515] px-4 py-3 flex gap-1.5 border-b border-white/5 items-center">
                    <span className="w-3 h-3 rounded-full bg-[#FF5F57] opacity-80"></span>
                    <span className="w-3 h-3 rounded-full bg-[#FEBC2E] opacity-80"></span>
                    <span className="w-3 h-3 rounded-full bg-[#28C840] opacity-80"></span>
                    <span className="ml-auto text-[10px] uppercase tracking-widest text-[#00C2FF] font-mono animate-pulse">System Active</span>
                </div>
                <div className="p-6 md:p-8 space-y-6 relative">
                    {/* Inner glow */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#00C2FF]/5 to-transparent pointer-events-none"></div>

                    <div className="flex gap-4 items-start relative z-10">
                        <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full bg-[#00C2FF]/10 flex items-center justify-center border border-[#00C2FF]/20 shadow-[0_0_15px_rgba(0,194,255,0.2)]">
                            <span className="text-sm md:text-base font-bold text-[#00C2FF]">AI</span>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl rounded-tl-none p-4 text-sm md:text-base text-gray-300 font-light shadow-sm">
                            {t('integ.visual.init')}
                        </div>
                    </div>

                    <div className="flex gap-4 items-start flex-row-reverse relative z-10">
                        <div className="bg-gradient-to-r from-[#00C2FF]/10 to-[#00C2FF]/5 text-[#00C2FF] border border-[#00C2FF]/30 rounded-2xl rounded-tr-none px-4 py-3 text-sm md:text-base font-mono shadow-[0_0_20px_rgba(0,194,255,0.15)] flex flex-col items-end gap-1.5">
                            <span>{t('integ.visual.target')}</span>
                            <span className="flex items-center gap-2 text-[10px] md:text-xs opacity-80">
                                <span className="w-1.5 h-1.5 bg-[#00C2FF] rounded-full animate-pulse"></span>
                                CONNECTING...
                            </span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export const IntegrationsSection = () => {
    const { t } = useTranslation();
    return (
        <section className="py-24 bg-black text-center overflow-hidden border-t border-white/5 relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,194,255,0.05)_0%,transparent_60%)] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-12 px-4 max-w-5xl mx-auto">
                    <h3 className="text-4xl md:text-6xl font-serif text-white mb-6">{t('integ.title')}</h3>
                    <p className="text-xl text-[#ffffff99] font-light max-w-2xl mx-auto leading-relaxed">
                        {t('integ.desc')} <span className="text-white font-medium">{t('integ.nocode')}</span> {t('integ.desc2')}
                    </p>
                </div>

                <IntegrationVisual />

                {/* Scrolling Marquee Ticker */}
                <div className="mt-8 overflow-hidden relative w-full border-y border-white/5 bg-white/[0.02] backdrop-blur-sm py-4 tracking-wider group">
                    {/* Side fades for the marquee */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 md:w-48 bg-gradient-to-r from-black via-black/80 to-transparent z-10"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-8 md:w-48 bg-gradient-to-l from-black via-black/80 to-transparent z-10"></div>

                    {/* Marquee Content */}
                    <div className="flex w-max animate-[marquee_25s_linear_infinite] group-hover:[animation-play-state:paused] ease-linear">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex gap-12 md:gap-16 px-6 md:px-8 items-center text-sm md:text-base text-gray-400 font-mono uppercase tracking-[0.2em] whitespace-nowrap">
                                <span>AmoCRM</span>
                                <span><span className="text-[#00C2FF]">·</span></span>
                                <span>HubSpot</span>
                                <span><span className="text-[#00C2FF]">·</span></span>
                                <span>Telegram</span>
                                <span><span className="text-[#00C2FF]">·</span></span>
                                <span>WhatsApp</span>
                                <span><span className="text-[#00C2FF]">·</span></span>
                                <span>Notion</span>
                                <span><span className="text-[#00C2FF]">·</span></span>
                                <span>Google Workspace</span>
                                <span><span className="text-[#00C2FF]">·</span></span>
                                <span>Slack</span>
                                <span><span className="text-[#00C2FF]">·</span></span>
                                <span>Discord</span>
                                <span><span className="text-[#00C2FF]">·</span></span>
                                <span>Salesforce</span>
                                <span><span className="text-[#00C2FF]">·</span></span>
                                <span>Jira</span>
                                <span><span className="text-[#00C2FF]">·</span></span>
                                <span>Figma</span>
                            </div>
                        ))}
                    </div>

                    <style>{`
                        @keyframes marquee {
                            0% { transform: translateX(0); }
                            100% { transform: translateX(-50%); }
                        }
                    `}</style>
                </div>
            </div>
        </section>
    );
};

// --- 6. COMPARISON (AI vs HUMAN) ---

const ComparisonRow = ({ metric, human, ai }: { metric: string, human: string, ai: string }) => (
    <div className="grid grid-cols-3 py-4 border-b border-white/10 text-sm md:text-base relative z-20">
        <div className="text-gray-400 font-light text-left">{metric}</div>
        <div className="text-white/60 font-light text-center">{human}</div>
        <div className="text-[#00C2FF] font-medium text-center">{ai}</div>
    </div>
)

export const ComparisonSection = () => {
    const { t } = useTranslation();
    return (
        <section className="py-24 bg-black text-center">
            <div className="max-w-4xl mx-auto px-4">
                <SectionHeading>{t('comp.title')} <em className="italic">{t('comp.title_suffix')}</em></SectionHeading>

                <div className="mt-12 relative group">
                    {/* Outer Colorful Glow Gradient */}
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-[26px] opacity-30 blur-lg group-hover:opacity-50 transition duration-1000"></div>

                    {/* Card Container */}
                    <div className="relative bg-[#0D0D0D] rounded-3xl p-6 md:p-10 overflow-hidden border border-white/10">

                        {/* Inner Gradient Tint (Slightly inside) */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10 pointer-events-none"></div>

                        {/* Top highlight */}
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                        <div className="relative z-10">
                            <div className="grid grid-cols-3 mb-6 pb-4 border-b border-white/10">
                                <div className="text-left font-mono text-xs uppercase text-gray-500 tracking-widest">{t('comp.metric')}</div>
                                <div className="text-center font-mono text-xs uppercase text-gray-500 tracking-widest">{t('comp.human')}</div>
                                <div className="text-center font-mono text-xs uppercase text-[#00C2FF] tracking-widest">{t('comp.ai')}</div>
                            </div>
                            <ComparisonRow metric={t('comp.m1')} human={t('comp.h1')} ai={t('comp.a1')} />
                            <ComparisonRow metric={t('comp.m2')} human={t('comp.h2')} ai={t('comp.a2')} />
                            <ComparisonRow metric={t('comp.m3')} human={t('comp.h3')} ai={t('comp.a3')} />
                            <ComparisonRow metric={t('comp.m4')} human={t('comp.h4')} ai={t('comp.a4')} />
                            <ComparisonRow metric={t('comp.m5')} human={t('comp.h5')} ai={t('comp.a5')} />
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-gray-500 text-sm font-light">
                    {t('comp.disclaimer')}
                </p>
            </div>
        </section>
    );
};

// --- 7. PRICING ---

const PricingCard = ({ title, price, subtitle, features, highlight }: { title: string, price: string, subtitle: string, features: string[], highlight?: boolean }) => {
    const { t } = useTranslation();
    return (
        <div className={`p-8 rounded-3xl border flex flex-col relative overflow-hidden group transition-all duration-500
        ${highlight
                ? 'bg-gradient-to-br from-[#00C2FF]/10 to-transparent border-[#00C2FF]/50 shadow-[0_0_40px_rgba(0,194,255,0.15)]'
                : 'bg-gradient-to-br from-white/[0.03] to-transparent border-white/10 hover:border-[#00C2FF]/30 hover:shadow-[0_0_40px_rgba(0,194,255,0.1)]'
            } backdrop-blur-sm`}>

            {/* Background Glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(0,194,255,0.1),transparent_50%)]"></div>
            </div>

            <h3 className="text-xl text-white font-medium mb-2">{title}</h3>
            <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-serif">{price}</span>
                <span className="text-gray-500 text-sm">{t('pricing.per_month')}</span>
            </div>
            <p className="text-gray-400 text-sm font-light mb-8">{subtitle}</p>

            <ul className="space-y-4 mb-8 flex-grow">
                {features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-300 font-light">
                        <CheckIcon /> {f}
                    </li>
                ))}
            </ul>

            <GlowingButton href="#" className="w-full">
                {highlight ? t('pricing.cta.free') : t('pricing.cta.plan')}
            </GlowingButton>
        </div>
    )
}

export const PricingSection = () => {
    const { t } = useTranslation();
    return (
        <section className="py-24 bg-black text-center border-t border-white/5">
            <div className="max-w-6xl mx-auto px-4">
                <SectionHeading>{t('pricing.title')} <em className="italic">{t('pricing.title_suffix')}</em></SectionHeading>
                <SectionSub>{t('pricing.subtitle')}</SectionSub>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
                    <PricingCard
                        title={t('pricing.starter')}
                        price="14 900 ₽"
                        subtitle={t('pricing.starter.sub')}
                        features={[t('pricing.starter.f1'), t('pricing.starter.f2'), t('pricing.starter.f3'), t('pricing.starter.f4')]}
                    />
                    <PricingCard
                        title={t('pricing.pro')}
                        price="24 900 ₽"
                        subtitle={t('pricing.pro.sub')}
                        features={[t('pricing.pro.f1'), t('pricing.pro.f2'), t('pricing.pro.f3'), t('pricing.pro.f4'), t('pricing.pro.f5')]}
                        highlight={true}
                    />
                    <PricingCard
                        title={t('pricing.biz')}
                        price="39 900 ₽"
                        subtitle={t('pricing.biz.sub')}
                        features={[t('pricing.biz.f1'), t('pricing.biz.f2'), t('pricing.biz.f3'), t('pricing.biz.f4'), t('pricing.biz.f5')]}
                    />
                </div>
            </div>
        </section>
    );
};