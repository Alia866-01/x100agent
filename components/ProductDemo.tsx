import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChatBubbleIcon, UsersIcon, PieChartIcon,
    ArrowUp, TrendingUpIcon
} from './Icons';
import { useTranslation } from './LanguageContext';

// --- Visual Mocks for the "Screens" ---

const MockChatScreen = () => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col h-full bg-black relative overflow-hidden">
            {/* Sidebar placeholder */}
            <div className="absolute left-0 top-0 bottom-0 w-16 border-r border-white/5 bg-[#050505] flex flex-col items-center py-4 gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white/20 rounded-full"></div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white/5"></div>
                <div className="w-8 h-8 rounded-lg bg-white/5"></div>
            </div>

            {/* Main Chat Area */}
            <div className="ml-16 flex-1 flex flex-col p-8">
                <div className="flex-1 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="flex gap-4"
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-blue-500">AI</span>
                        </div>
                        <div className="bg-[#1C1C1E] border border-white/10 p-4 rounded-2xl rounded-tl-sm max-w-md">
                            <p className="text-gray-200 text-sm leading-relaxed font-light">
                                {t('demo.mock.chat.ai_greeting')}
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                        className="flex gap-4 flex-row-reverse"
                    >
                        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/10">
                            <img src="https://api.dicebear.com/9.x/notionists/svg?seed=Leo" alt="User" className="w-full h-full object-cover" />
                        </div>
                        <div className="bg-white text-black p-4 rounded-2xl rounded-tr-sm max-w-md shadow-lg">
                            <p className="text-sm leading-relaxed font-medium">
                                {t('demo.mock.chat.user_req')}
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6 }}
                        className="flex gap-4"
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-blue-500">AI</span>
                        </div>
                        <div className="bg-[#1C1C1E] border border-white/10 p-4 rounded-2xl rounded-tl-sm max-w-md">
                            <p className="text-gray-200 text-sm leading-relaxed mb-3 font-light">
                                {t('demo.mock.chat.ai_response')} <span className="text-white font-medium">{t('demo.mock.chat.role_name')}</span> {t('demo.mock.chat.with_capabilities')}
                            </p>
                            <div className="flex gap-2 mb-2 flex-wrap">
                                <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded">{t('demo.mock.chat.cap1')}</span>
                                <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded">{t('demo.mock.chat.cap2')}</span>
                                <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded">{t('demo.mock.chat.cap3')}</span>
                            </div>
                            <p className="text-gray-200 text-sm leading-relaxed font-light">
                                {t('demo.mock.chat.upload_prompt')}
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Input Bar */}
                <div className="mt-auto pt-6">
                    <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-2 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:bg-white/10 transition-colors cursor-pointer">
                            <span className="text-lg font-light">+</span>
                        </div>
                        <div className="h-4 w-48 bg-white/5 rounded-full"></div>
                        <div className="ml-auto w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
                            <ArrowUp className="w-4 h-4 text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MockWorkforceScreen = () => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col h-full bg-black p-8 relative">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h3 className="text-white text-xl font-medium mb-1 font-serif tracking-tight">{t('demo.mock.workforce.title')}</h3>
                    <p className="text-gray-500 text-xs uppercase tracking-widest font-mono">{t('demo.mock.workforce.subtitle')}</p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-green-900/20 text-green-400 px-3 py-1.5 rounded-full text-[10px] font-mono flex items-center gap-2 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        {t('demo.mock.workforce.system')}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Agent Card 1 */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                    className="bg-[#111] border border-white/10 rounded-xl p-4 relative overflow-hidden group hover:border-white/20 transition-all cursor-default"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-50">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                            <img src="https://api.dicebear.com/9.x/notionists/svg?seed=Felix" className="w-full h-full object-cover" alt="Alex" />
                        </div>
                        <div>
                            <div className="text-white text-sm font-medium">Alex</div>
                            <div className="text-gray-500 text-[10px] font-mono">{t('demo.mock.workforce.agent1.role')}</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] bg-white/5 p-2 rounded border border-white/5">
                            <span className="text-gray-400">{t('demo.mock.workforce.agent1.metric1')}</span>
                            <span className="text-green-400 font-mono">0.8s</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] bg-white/5 p-2 rounded border border-white/5">
                            <span className="text-gray-400">{t('demo.mock.workforce.agent1.metric2')}</span>
                            <span className="text-blue-400 font-mono">14</span>
                        </div>
                    </div>

                    <div className="mt-3 text-[10px] text-gray-500 text-center font-mono py-1 border-t border-white/5">
                        {t('demo.mock.workforce.agent1.footer')}
                    </div>
                </motion.div>

                {/* Agent Card 2 */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                    className="bg-[#111] border border-white/10 rounded-xl p-4 relative overflow-hidden group hover:border-white/20 transition-all cursor-default"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-50">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                            <img src="https://api.dicebear.com/9.x/notionists/svg?seed=Aneka" className="w-full h-full object-cover" alt="Sarah" />
                        </div>
                        <div>
                            <div className="text-white text-sm font-medium">Sarah</div>
                            <div className="text-gray-500 text-[10px] font-mono">{t('demo.mock.workforce.agent2.role')}</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] bg-white/5 p-2 rounded border border-white/5">
                            <span className="text-gray-400">{t('demo.mock.workforce.agent2.metric1')}</span>
                            <span className="text-green-400 font-mono">128</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] bg-white/5 p-2 rounded border border-white/5">
                            <span className="text-gray-400">{t('demo.mock.workforce.agent2.metric2')}</span>
                            <span className="text-purple-400 font-mono">45</span>
                        </div>
                    </div>

                    <div className="mt-3 text-[10px] text-gray-500 text-center font-mono py-1 border-t border-white/5">
                        {t('demo.mock.workforce.agent2.footer')}
                    </div>
                </motion.div>

                {/* Agent Card 3 - Add New */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                    className="col-span-2 border border-dashed border-white/10 rounded-xl p-4 flex items-center justify-center gap-3 text-gray-500 hover:bg-white/5 hover:border-white/20 hover:text-white transition-all cursor-pointer group"
                >
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#00C2FF] group-hover:text-black transition-colors">+</div>
                    <span className="text-xs font-mono uppercase tracking-wide">{t('demo.mock.workforce.hire')}</span>
                </motion.div>
            </div>
        </div>
    );
};

const MockAnalyticsScreen = () => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col h-full bg-black p-8">
            <div className="flex justify-between items-start mb-6">
                <h3 className="text-white text-xl font-medium font-serif">{t('demo.mock.analytics.title')}</h3>
                <div className="flex gap-2">
                    <div className="bg-[#111] border border-white/10 px-3 py-1 rounded text-[10px] text-gray-400 font-mono">{t('demo.mock.analytics.period')}</div>
                </div>
            </div>

            {/* Big Chart Area */}
            <div className="flex-1 bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden mb-4 group hover:border-white/20 transition-colors">
                <div className="flex justify-between items-end mb-6 relative z-10">
                    <div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-mono">{t('demo.mock.analytics.roi')}</div>
                        <div className="text-4xl text-white font-light tracking-tight">$325k</div>
                    </div>
                    <div className="text-green-400 text-xs font-mono flex items-center bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                        <TrendingUpIcon className="w-3 h-3 mr-1" /> +124%
                    </div>
                </div>

                {/* CSS Chart */}
                <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end px-4 space-x-1 opacity-60 group-hover:opacity-80 transition-opacity">
                    {[40, 50, 45, 60, 55, 70, 65, 80, 75, 90, 85, 95, 90, 100, 110, 130].map((h, i) => (
                        <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: 0.1 * i, duration: 0.5 }}
                            className="flex-1 bg-[#00C2FF]"
                            style={{ opacity: 0.2 + (i / 16) * 0.8 }}
                        ></motion.div>
                    ))}
                </div>
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#111] to-transparent pointer-events-none"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#111] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">{t('demo.mock.analytics.man_hours')}</div>
                        <ArrowUp className="w-3 h-3 text-green-500 rotate-45" />
                    </div>
                    <div className="text-xl text-white font-light">1,240 <span className="text-xs text-gray-600 ml-1">{t('demo.mock.analytics.saved')}</span></div>
                </div>
                <div className="bg-[#111] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">{t('demo.mock.analytics.cost_lead')}</div>
                        <ArrowUp className="w-3 h-3 text-green-500 rotate-180" />
                    </div>
                    <div className="text-xl text-white font-light">$0.35 <span className="text-xs text-gray-600 ml-1">{t('demo.mock.analytics.avg')}</span></div>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

export const ProductDemoSection = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState(0);
    const [isHovering, setIsHovering] = useState(false);

    const tabs = useMemo(() => [
        {
            id: 'build',
            label: t('demo.tab1'),
            icon: <ChatBubbleIcon className="w-5 h-5" />,
            title: t('demo.tab1.title'),
            desc: t('demo.tab1.desc'),
            component: <MockChatScreen />
        },
        {
            id: 'manage',
            label: t('demo.tab2'),
            icon: <UsersIcon className="w-5 h-5" />,
            title: t('demo.tab2.title'),
            desc: t('demo.tab2.desc'),
            component: <MockWorkforceScreen />
        },
        {
            id: 'scale',
            label: t('demo.tab3'),
            icon: <PieChartIcon className="w-5 h-5" />,
            title: t('demo.tab3.title'),
            desc: t('demo.tab3.desc'),
            component: <MockAnalyticsScreen />
        }
    ], [t]);

    // Auto-rotate tabs
    useEffect(() => {
        if (isHovering) return;

        const interval = setInterval(() => {
            setActiveTab((prev) => (prev + 1) % tabs.length);
        }, 5000); // 5 seconds per tab

        return () => clearInterval(interval);
    }, [isHovering, tabs.length]);

    return (
        <section className="bg-black py-24 md:py-32 border-t border-white/5 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute left-0 top-1/3 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="mb-20">
                    <h2 className="text-4xl md:text-6xl font-serif text-white mb-6 tracking-tight">
                        {t('demo.title')} <em className="italic text-gray-500">{t('demo.title_suffix')}</em>
                    </h2>
                    <p className="text-xl text-gray-400 font-light max-w-2xl">
                        {t('demo.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

                    {/* Left Column: Navigation Tabs */}
                    <div className="lg:col-span-4 flex flex-col gap-4">
                        {tabs.map((tab, index) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(index)}
                                onMouseEnter={() => setIsHovering(true)}
                                onMouseLeave={() => setIsHovering(false)}
                                className={`text-left p-6 rounded-2xl transition-all duration-300 border relative group overflow-hidden ${activeTab === index
                                    ? 'bg-white/10 border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.05)]'
                                    : 'bg-transparent border-transparent hover:bg-white/5'
                                    }`}
                            >
                                {activeTab === index && (
                                    <motion.div
                                        layoutId="active-glow"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-[#00C2FF]"
                                    />
                                )}

                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`p-2 rounded-lg transition-colors ${activeTab === index ? 'bg-white text-black' : 'bg-white/5 text-gray-400'}`}>
                                        {tab.icon}
                                    </div>
                                    <span className={`font-mono text-sm uppercase tracking-widest font-bold ${activeTab === index ? 'text-white' : 'text-gray-500'}`}>
                                        {tab.label}
                                    </span>
                                </div>

                                <h3 className={`text-xl font-medium mb-2 transition-colors ${activeTab === index ? 'text-white' : 'text-gray-400'}`}>
                                    {tab.title}
                                </h3>

                                <div className={`grid transition-all duration-300 ${activeTab === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                    <p className="text-sm text-gray-400 leading-relaxed font-light overflow-hidden">
                                        {tab.desc}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Right Column: Screen Mockup */}
                    <div className="lg:col-span-8">
                        <div className="relative rounded-[20px] bg-[#0A0A0A] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden aspect-[16/10] group">

                            {/* Window Chrome / Header */}
                            <div className="absolute top-0 left-0 right-0 h-10 bg-[#151515] border-b border-white/5 flex items-center px-4 z-20">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#FF5F57]"></div>
                                    <div className="w-3 h-3 rounded-full bg-[#FEBC2E]"></div>
                                    <div className="w-3 h-3 rounded-full bg-[#28C840]"></div>
                                </div>
                                <div className="mx-auto flex gap-2 items-center bg-[#0A0A0A] border border-white/5 px-3 py-1 rounded-md">
                                    <div className="w-3 h-3 bg-white/10 rounded-full"></div>
                                    <div className="w-32 h-1.5 bg-white/5 rounded-full"></div>
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="absolute inset-0 pt-10 bg-black">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.02 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full h-full"
                                    >
                                        {tabs[activeTab].component}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Glossy Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none z-30 opacity-50"></div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
