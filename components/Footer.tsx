import React from 'react';
import { ArrowRight } from './Icons';
import { useTranslation } from './LanguageContext';

const FooterHero: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => {
    const { t } = useTranslation();
    return (
        <div className="relative bg-[#0A0A0A] pt-32 pb-40 px-6 overflow-hidden border-b border-white/10">

            {/* --- Smooth Gradient Background --- */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                <div className="absolute inset-0 bg-[#0A0A0A]"></div>

                {/* Smooth moving gradient orbs */}
                <div className="absolute inset-0 opacity-60">
                    <div className="absolute top-1/2 left-[30%] w-[800px] h-[800px] bg-[#4f46e5]/40 rounded-full mix-blend-screen blur-[120px] animate-blob-1 -translate-y-1/2 -translate-x-1/2"></div>
                    <div className="absolute top-[40%] left-[70%] w-[600px] h-[600px] bg-[#06b6d4]/40 rounded-full mix-blend-screen blur-[120px] animate-blob-2 -translate-y-1/2 -translate-x-1/2"></div>
                    <div className="absolute top-[60%] left-[50%] w-[900px] h-[900px] bg-[#3b82f6]/40 rounded-full mix-blend-screen blur-[140px] animate-blob-3 -translate-y-1/2 -translate-x-1/2"></div>
                </div>

                {/* Top and Bottom fading edges to smoothly blend with the page */}
                <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#0A0A0A] to-transparent opacity-100"></div>
                <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#0A0A0A] to-transparent opacity-100"></div>
            </div>

            {/* Animations */}
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

            <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-8">
                <div className="max-w-xl text-center lg:text-left">
                    <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#A5F3FC]/10 border border-[#A5F3FC]/30 backdrop-blur-md mb-8">
                        <p className="text-[#A5F3FC] text-[11px] font-mono font-bold tracking-widest uppercase">
                            {t('footer.roi')}
                        </p>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-serif text-white mb-6 font-light">{t('footer.title')} <em className="italic">{t('footer.title_suffix')}</em> {t('footer.title_suffix2')}</h2>
                    <p className="text-xl text-gray-400 font-light mb-8">{t('footer.subtitle')}</p>

                    <button onClick={() => onNavigate?.('register')} className="inline-flex items-center bg-white text-black pl-6 pr-5 py-3.5 rounded-lg text-[12px] font-mono font-bold tracking-wide hover:bg-gray-100 transition-all uppercase gap-2 shadow-lg cursor-pointer">
                        {t('footer.cta')} <ArrowRight />
                    </button>
                </div>

                <div className="relative flex flex-col items-center">

                    {/* Floating Stats */}
                    <div className="flex gap-4 mb-8 relative z-20">
                        <div className="flex flex-col items-center px-6 py-4 bg-[#111] border border-white/10 rounded-2xl shadow-2xl">
                            <div className="text-[#00C2FF] font-mono font-bold text-3xl">24/7</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{t('footer.stat.uptime')}</div>
                        </div>
                        <div className="flex flex-col items-center px-6 py-4 bg-[#111] border border-white/10 rounded-2xl shadow-2xl">
                            <div className="text-[#00C2FF] font-mono font-bold text-3xl">100%</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{t('footer.stat.automated')}</div>
                        </div>
                    </div>

                    <div className="relative w-[320px] md:w-[400px]">
                        {/* Left Peeking Card */}
                        <div className="absolute -left-4 top-4 w-full h-full bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 transform -rotate-6 scale-90 opacity-60 z-0 blur-[1px]">
                            <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-4 opacity-50">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800">
                                    <img src="https://api.dicebear.com/9.x/notionists/svg?seed=Maya" className="w-full h-full object-cover opacity-50" />
                                </div>
                            </div>
                            <div className="h-2 bg-white/10 rounded w-3/4 mb-3"></div>
                            <div className="h-2 bg-white/5 rounded w-1/2"></div>
                        </div>

                        {/* Right Peeking Card */}
                        <div className="absolute -right-4 top-4 w-full h-full bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 transform rotate-6 scale-90 opacity-60 z-0 blur-[1px]">
                            <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-4 opacity-50">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800">
                                    <img src="https://api.dicebear.com/9.x/notionists/svg?seed=Leo" className="w-full h-full object-cover opacity-50" />
                                </div>
                            </div>
                            <div className="h-2 bg-white/10 rounded w-3/4 mb-3"></div>
                            <div className="h-2 bg-white/5 rounded w-1/2"></div>
                        </div>

                        {/* Main Card */}
                        <div className="relative bg-[#1C1C1E] border border-white/10 rounded-2xl p-6 shadow-2xl z-10">
                            <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-4">
                                {/* Person Image instead of emoji */}
                                <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg relative">
                                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00C2FF] border-2 border-[#1C1C1E] rounded-full z-10"></div>
                                    <img
                                        src="https://api.dicebear.com/9.x/notionists/svg?seed=Felix"
                                        className="w-full h-full object-cover rounded-full"
                                        alt="Agent"
                                    />
                                </div>
                                <div>
                                    <div className="text-white font-medium text-xl">{t('footer.card.growth_engine')}</div>
                                    <div className="text-[#00C2FF] text-[10px] font-mono uppercase tracking-widest flex items-center gap-2 mt-1">
                                        <span className="w-1.5 h-1.5 bg-[#00C2FF] rounded-full animate-pulse"></span>
                                        {t('footer.card.running')}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-400 text-sm">{t('footer.card.leads')}</span>
                                        <span className="text-white font-mono text-lg">1,240 <span className="text-green-400 text-xs">▲</span></span>
                                    </div>
                                    <div className="w-full bg-white/5 rounded-full h-2">
                                        <div className="bg-blue-500 h-2 rounded-full w-[85%] shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-400 text-sm">{t('footer.card.revenue')}</span>
                                        <span className="text-white font-mono text-lg">4,5 млн ₽ <span className="text-green-400 text-xs">▲</span></span>
                                    </div>
                                    <div className="w-full bg-white/5 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full w-[65%] shadow-[0_0_15px_rgba(34,197,94,0.5)]"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 pt-4 border-t border-white/5 text-center">
                                <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-medium">{t('footer.card.team_perf')}</span>
                            </div>
                        </div>
                    </div>
                    {/* Gradient over bottom cards to blend them into the footer */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent z-10 h-48 pointer-events-none"></div>
                    <div className="absolute -right-10 top-20 w-40 h-40 bg-[#00C2FF]/10 rounded-full blur-[80px] pointer-events-none z-0"></div>
                </div>
            </div>
        </div>
    );
};

interface FooterProps {
    onNavigate?: (view: string) => void;
    showHero?: boolean;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, showHero = false }) => {
    const { t } = useTranslation();
    return (
        <>
            {showHero && <FooterHero onNavigate={onNavigate} />}
            <footer className="bg-black pt-20 pb-10 px-6 border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10 mb-20">
                        <div className="col-span-2 lg:col-span-2 pr-10">
                            <h4 className="text-white font-mono text-xs uppercase tracking-widest mb-6">X100 AI</h4>
                            <p className="text-gray-500 font-light text-sm mb-6 leading-relaxed">
                                {t('footer.disclaimer')}
                            </p>
                            <form className="flex gap-2">
                                <input type="email" placeholder={t('footer.email_placeholder')} className="bg-[#111] border border-white/10 text-white px-4 py-2 rounded-md text-sm w-full outline-none focus:border-white/30" />
                                <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-md text-xs font-mono font-bold uppercase hover:bg-white/20 transition-colors">{t('footer.join')}</button>
                            </form>
                        </div>

                        <div>
                            <h4 className="text-white font-mono text-xs uppercase tracking-widest mb-6">{t('footer.col.roles')}</h4>
                            <ul className="space-y-3 text-sm font-light text-gray-500">
                                <li><a href="#" className="hover:text-white transition-colors">{t('products.sales_manager')}</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">{t('products.receptionist')}</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">{t('products.support_agent')}</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">{t('products.personal_assistant')}</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">{t('products.content_manager')}</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-mono text-xs uppercase tracking-widest mb-6">{t('footer.col.company')}</h4>
                            <ul className="space-y-3 text-sm font-light text-gray-500">
                                <li><button onClick={() => onNavigate?.('about')} className="hover:text-white transition-colors text-left w-full">{t('nav.about')}</button></li>
                                <li><button onClick={() => onNavigate?.('blog')} className="hover:text-white transition-colors text-left w-full">{t('nav.blog')}</button></li>
                                <li><button onClick={() => onNavigate?.('careers')} className="hover:text-white transition-colors text-left w-full">{t('nav.careers')}</button></li>
                                <li><button onClick={() => onNavigate?.('contact')} className="hover:text-white transition-colors text-left w-full">{t('nav.contact')}</button></li>
                            </ul>
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <h4 className="text-white font-mono text-xs uppercase tracking-widest mb-6">{t('footer.col.legal')}</h4>
                            <ul className="space-y-3 text-sm font-light text-gray-500">
                                <li><button onClick={() => onNavigate?.('privacy')} className="hover:text-white transition-colors text-left w-full">{t('footer.nav.privacy')}</button></li>
                                <li><button onClick={() => onNavigate?.('terms')} className="hover:text-white transition-colors text-left w-full">{t('footer.nav.terms')}</button></li>
                                <li><button onClick={() => onNavigate?.('gdpr')} className="hover:text-white transition-colors text-left w-full">{t('footer.nav.gdpr')}</button></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-white font-bold font-mono">&lt;X100&gt;</span>
                        </div>
                        <div className="text-[10px] text-gray-600 mt-6 md:mt-0 font-light text-center md:text-right max-w-3xl">
                            <p className="mb-4">{t('footer.legal.copyright')}</p>
                            <p>{t('footer.legal.text')}</p>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Footer;