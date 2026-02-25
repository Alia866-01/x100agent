import React from 'react';
import { SparkleIcon, XIcon, ThumbUpIcon, ThumbDownIcon, ArrowRight } from './Icons';
import { useTranslation } from './LanguageContext';

const TransactionItem: React.FC<{ name: string; date: string; amount: string }> = ({ name, date, amount }) => (
    <div className="flex items-center justify-between group">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/70">
                {/* Simulated category icon */}
                <div className="w-1.5 h-1.5 rounded-[1px] border border-white/70"></div>
            </div>
            <div>
                <p className="text-white text-xs font-medium leading-none mb-1">{name}</p>
                <p className="text-gray-500 text-[10px] font-mono">{date}</p>
            </div>
        </div>
        <div className="text-white font-mono text-xs text-right">
            {amount}
        </div>
    </div>
);

// Animated Background Component mimicking Arc Theme Structure
const UltraGradient: React.FC<{ variant: 'light' | 'dark' }> = ({ variant }) => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            {variant === 'light' ? (
                <>
                    {/* Base Background: --arc-palette-background */}
                    <div className="absolute inset-0 bg-[#0E1A2E]"></div>

                    {/* Main Shapes Wrapper */}
                    <div className="absolute inset-0">
                        {/* shape-3b: --arc-background-gradient-color1 (#B19EE0) 
                            Rotated and floating */}
                        <div className="absolute top-[-20%] left-[-20%] w-[100%] h-[100%] bg-[#B19EE0] rounded-full blur-[120px] opacity-40 animate-float-1 mix-blend-screen transform rotate-12"></div>

                        {/* shape-2b: --arc-background-gradient-color0 (#9EB6E0) */}
                        <div className="absolute top-[30%] right-[-10%] w-[90%] h-[90%] bg-[#9EB6E0] rounded-full blur-[100px] opacity-30 animate-float-2 mix-blend-screen"></div>

                        {/* shape-1: --arc-palette-cutoutColor (#315899) */}
                        <div className="absolute bottom-[-10%] left-[20%] w-[80%] h-[80%] bg-[#315899] rounded-full blur-[90px] opacity-40 animate-float-3"></div>
                    </div>

                    {/* Blending Group Wrapper */}
                    <div className="absolute inset-0">
                        {/* shape-8: --arc-background-gradient-overlay-color1 (#9EE0DD) */}
                        <div className="absolute top-[10%] left-[40%] w-[40%] h-[40%] bg-[#9EE0DD] rounded-full blur-[60px] opacity-50 animate-pulse-glow mix-blend-overlay"></div>

                        {/* shape-9: --arc-palette-backgroundExtra (#070D17) for depth */}
                        <div className="absolute bottom-[0%] right-[0%] w-[50%] h-[50%] bg-[#070D17] rounded-full blur-[70px] opacity-60"></div>

                        {/* Additional subtle highlights for "ultra" feel */}
                        <div className="absolute top-[50%] left-[10%] w-[30%] h-[30%] bg-[#9EB6E0] rounded-full blur-[50px] opacity-20 animate-float-2"></div>
                    </div>

                    {/* Grain Texture */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/noise.png')] mix-blend-overlay"></div>
                </>
            ) : (
                <>
                    {/* Base */}
                    <div className="absolute inset-0 bg-[#0F1021]"></div>
                    {/* Shapes */}
                    <div className="absolute top-[-20%] left-[20%] w-[80%] h-[80%] bg-[#1e1b4b] rounded-full blur-[100px] opacity-90 animate-float-2"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#312e81] rounded-full blur-[80px] opacity-80 animate-float-1"></div>
                    <div className="absolute top-[40%] left-[-10%] w-[50%] h-[50%] bg-[#4c1d95] rounded-full blur-[90px] opacity-60 animate-float-3"></div>
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent mix-blend-soft-light"></div>
                </>
            )}
        </div>
    );
};

const InsightRecapSection: React.FC = () => {
    const { t } = useTranslation();
    return (
        <section className="py-12 md:py-24 bg-black overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-4">

                {/* Watch Demo CTA Section - New Feature */}
                <div className="mb-24 flex justify-center">
                    <div className="relative group cursor-pointer w-full max-w-4xl">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
                        <div className="relative bg-[#0A0A0A] border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6 relative z-10">{t('recap.cta.title')}</h2>
                            <p className="text-gray-400 max-w-xl mb-8 relative z-10">{t('recap.cta.desc')}</p>
                            <button className="relative z-10 bg-white text-black px-8 py-4 rounded-lg font-bold font-mono tracking-widest uppercase hover:bg-gray-200 transition-colors flex items-center gap-2">
                                {t('recap.cta.btn')} <ArrowRight />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

                    {/* Left Column - Instant Insights */}
                    <div className="relative rounded-[32px] md:rounded-[48px] overflow-hidden p-8 md:p-16 text-center flex flex-col items-center min-h-[700px] group transition-all duration-700 isolate">
                        <UltraGradient variant="light" />

                        <div className="relative z-10 animate-fade-in">
                            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6 font-light tracking-tight">
                                <em className="italic font-light">{t('recap.left.title_em')}</em> {t('recap.left.title')}
                            </h2>
                            <p className="text-white/80 text-lg md:text-xl font-light mb-16 max-w-md mx-auto leading-relaxed">
                                {t('recap.left.subtitle')}
                            </p>
                        </div>

                        {/* Floating Card */}
                        <div className="relative w-full max-w-[420px] mt-auto z-10">
                            <div className="absolute -inset-4 bg-white/20 rounded-[40px] blur-2xl animate-pulse-glow"></div>
                            <div className="relative bg-[#3b406e]/20 backdrop-blur-2xl border border-white/20 rounded-[32px] p-8 md:p-10 text-left shadow-[0_20px_50px_rgba(0,0,0,0.3)] transform transition-transform duration-700 hover:-translate-y-2 hover:scale-[1.02]">
                                <div className="mb-8">
                                    <SparkleIcon className="w-8 h-8 md:w-10 md:h-10 animate-bounce delay-700" />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-heading font-medium text-white mb-6 leading-tight">
                                    {t('recap.left.card_title')}
                                </h3>
                                <p className="text-white/90 font-light leading-relaxed text-sm md:text-base">
                                    {t('recap.left.card_desc')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Deep Recaps */}
                    <div className="relative rounded-[32px] md:rounded-[48px] overflow-hidden p-8 md:p-16 text-center flex flex-col items-center min-h-[700px] group isolate">
                        <UltraGradient variant="dark" />

                        <div className="relative z-10 flex flex-col items-center w-full h-full">
                            <div className="animate-fade-in delay-200">
                                <h2 className="text-4xl md:text-5xl font-serif text-white mb-6 font-light tracking-tight">
                                    <em className="italic font-light">{t('recap.right.title_em')}</em> {t('recap.right.title')}
                                </h2>
                                <p className="text-white/80 text-lg md:text-xl font-light mb-16 max-w-md mx-auto leading-relaxed">
                                    {t('recap.right.subtitle')}
                                </p>
                            </div>

                            {/* Phone UI Card */}
                            <div className="relative w-full max-w-[380px] mt-auto">
                                <div className="bg-[#131315] rounded-[32px] p-6 md:p-8 text-left w-full shadow-2xl border border-white/5 flex flex-col transform transition-transform duration-700 hover:-translate-y-2 hover:scale-[1.02]">
                                    {/* Progress Bars */}
                                    <div className="flex gap-1.5 mb-8">
                                        <div className="h-0.5 bg-green-500 rounded-full flex-1 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                        <div className="h-0.5 bg-white/20 rounded-full flex-1"></div>
                                        <div className="h-0.5 bg-white/20 rounded-full flex-1"></div>
                                    </div>

                                    {/* Close Icon */}
                                    <div className="absolute top-8 right-8 text-white/60 hover:text-white cursor-pointer transition-colors">
                                        <XIcon />
                                    </div>

                                    <h3 className="text-2xl md:text-3xl font-heading text-white mb-4 leading-tight font-medium">
                                        {t('recap.right.card_title')}
                                    </h3>
                                    <p className="text-gray-400 text-xs md:text-sm mb-8 leading-relaxed font-light">
                                        {t('recap.right.card_desc')}
                                    </p>

                                    <div className="bg-[#1C1C1E] rounded-xl p-5 mb-6 border border-white/5">
                                        <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-4 font-mono font-medium">{t('recap.right.recents')}</div>
                                        <div className="space-y-5">
                                            <TransactionItem name={t('recap.tx.ent')} date={t('recap.tx.ent_sub')} amount="120 000 ₽" />
                                            <TransactionItem name={t('recap.tx.start')} date={t('recap.tx.start_sub')} amount="29 900 ₽" />
                                            <TransactionItem name={t('recap.tx.consult')} date={t('recap.tx.consult_sub')} amount="Free" />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-auto">
                                        <button className="flex-1 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white py-2.5 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-center gap-2 border border-white/5">
                                            <ThumbUpIcon /> {t('recap.right.report')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default InsightRecapSection;