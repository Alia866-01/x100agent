import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon, ArrowRight } from './Icons';
import { useTranslation } from './LanguageContext';
import { Flame, Calendar, CircleDollarSign } from 'lucide-react';

type AgentType = 'sales' | 'support' | 'receptionist' | 'recruiter';

interface Agent {
    id: AgentType;
    name: string;
    role: string;
    description: string;
    benefit: string;
    salary: string;
    humanSalary: string;
    color: string;
    image: string;
}

// --- Visual Components for "Proof of Work" ---

const NotificationCard = ({ icon, title, sub, color, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay, duration: 0.5 }}
        className="bg-[#1A1A1A] border border-white/10 p-4 rounded-xl flex items-center gap-4 shadow-lg mb-3 relative overflow-hidden"
    >
        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${color}`}></div>
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl shrink-0">
            {icon}
        </div>
        <div>
            <h4 className="text-white text-sm font-medium">{title}</h4>
            <p className="text-gray-500 text-xs">{sub}</p>
        </div>
    </motion.div>
)

const SalesVisual = () => {
    const { t } = useTranslation();
    return (
        <div className="h-full flex flex-col justify-center p-8">
            <NotificationCard
                icon={<CircleDollarSign className="w-5 h-5 text-white" />} title={t('advisor.visual.sales.p1.title')} sub={t('advisor.visual.sales.p1.sub')}
                color="from-blue-500 to-cyan-500" delay={0.1}
            />
            <NotificationCard
                icon={<Flame className="w-5 h-5 text-white" />} title={t('advisor.visual.sales.p2.title')} sub={t('advisor.visual.sales.p2.sub')}
                color="from-blue-500 to-cyan-500" delay={0.3}
            />
            <NotificationCard
                icon={<Calendar className="w-5 h-5 text-white" />} title={t('advisor.visual.sales.p3.title')} sub={t('advisor.visual.sales.p3.sub')}
                color="from-blue-500 to-cyan-500" delay={0.5}
            />
            <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 text-center">
                <p className="text-blue-300 text-xs font-mono uppercase tracking-widest">{t('advisor.visual.sales.today')}</p>
                <p className="text-3xl text-white font-serif mt-1">$4,850.00</p>
            </div>
        </div>
    );
};

const SupportVisual = () => {
    const { t } = useTranslation();
    return (
        <div className="h-full flex flex-col justify-center items-center p-8 text-center">
            <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
                className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50 mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]"
            >
                <CheckIcon className="w-12 h-12 text-green-400" />
            </motion.div>
            <h3 className="text-2xl text-white font-medium mb-2">{t('advisor.visual.support.inbox')}</h3>
            <p className="text-gray-400 text-sm mb-8 max-w-xs">{t('advisor.visual.support.desc')}</p>

            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                    <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + (i * 0.1) }}
                        className="text-yellow-400 text-xl"
                    >★</motion.span>
                ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">{t('advisor.visual.support.score')}</p>
        </div>
    );
};

const ReceptionistVisual = () => {
    const { t } = useTranslation();
    return (
        <div className="h-full flex flex-col justify-center p-8">
            <div className="bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden">
                <div className="bg-[#222] p-3 border-b border-white/5 flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-mono">{t('advisor.visual.recep.header')}</span>
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                </div>
                <div className="p-4 space-y-3">
                    <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ delay: 0.2 }} className="h-8 bg-orange-500/20 border-l-2 border-orange-500 rounded-r-md flex items-center px-3">
                        <span className="text-xs text-orange-200">{t('advisor.visual.recep.event1')}</span>
                    </motion.div>
                    <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ delay: 0.4 }} className="h-8 bg-orange-500/20 border-l-2 border-orange-500 rounded-r-md flex items-center px-3">
                        <span className="text-xs text-orange-200">{t('advisor.visual.recep.event2')}</span>
                    </motion.div>
                    <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ delay: 0.6 }} className="h-8 bg-orange-500/20 border-l-2 border-orange-500 rounded-r-md flex items-center px-3">
                        <span className="text-xs text-orange-200">{t('advisor.visual.recep.event3')}</span>
                    </motion.div>
                    <div className="h-8 border border-dashed border-white/10 rounded-md flex items-center justify-center">
                        <span className="text-xs text-gray-600">{t('advisor.visual.recep.free')}</span>
                    </div>
                </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-4">{t('advisor.visual.recep.quote')}</p>
        </div>
    );
};

const RecruiterVisual = () => {
    const { t } = useTranslation();
    return (
        <div className="h-full flex flex-col justify-center p-8">
            <div className="relative">
                {/* Stack effect */}
                <div className="absolute top-2 left-2 right-2 bottom-0 bg-[#222] border border-white/5 rounded-xl rotate-3 opacity-50"></div>
                <div className="absolute top-1 left-1 right-1 bottom-0 bg-[#222] border border-white/5 rounded-xl -rotate-2 opacity-75"></div>

                {/* Main Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    className="relative bg-[#1A1A1A] border border-white/10 rounded-xl p-5 shadow-2xl"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gray-700"></div>
                        <div>
                            <div className="h-2 w-24 bg-white/20 rounded mb-1"></div>
                            <div className="h-1.5 w-16 bg-white/10 rounded"></div>
                        </div>
                        <div className="ml-auto bg-purple-500/20 text-purple-300 text-[10px] px-2 py-1 rounded-full border border-purple-500/30">{t('advisor.visual.recruiter.match')}</div>
                    </div>
                    <div className="space-y-2 mb-4">
                        <div className="flex gap-2">
                            <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-gray-400">React</span>
                            <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-gray-400">Node.js</span>
                            <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-gray-400">5 YOE</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex-1 bg-white text-black text-xs font-bold py-2 rounded">{t('advisor.visual.recruiter.btn_schedule')}</button>
                        <button className="flex-1 bg-white/5 text-white text-xs py-2 rounded">{t('advisor.visual.recruiter.btn_cv')}</button>
                    </div>
                </motion.div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-6">{t('advisor.visual.recruiter.footer')}</p>
        </div>
    );
};

// Tab Button
const AgentTab = ({ active, label, onClick }: { active: boolean; label: string; onClick: () => void } & React.Attributes) => (
    <button
        onClick={onClick}
        className={`relative px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap overflow-hidden group
        ${active
                ? 'text-black font-bold'
                : 'text-gray-400 hover:text-white bg-[#111] border border-white/10'
            }`}
    >
        {active && (
            <div className="absolute inset-0 bg-white shadow-[0_0_20px_rgba(255,255,255,0.3)]"></div>
        )}
        <span className="relative z-10">{label}</span>
    </button>
)

const GeminiAdvisor: React.FC = () => {
    const { t } = useTranslation();
    const [activeAgentId, setActiveAgentId] = useState<AgentType>('sales');

    const AGENTS: Record<AgentType, Agent> = useMemo(() => ({
        sales: {
            id: 'sales',
            name: t('advisor.agent.sales.name'),
            role: t('advisor.agent.sales.role'),
            description: t('advisor.agent.sales.desc'),
            benefit: t('advisor.agent.sales.benefit'),
            salary: t('advisor.price.89'),
            humanSalary: t('advisor.price.5000'),
            color: "from-blue-500 to-cyan-400",
            image: "https://api.dicebear.com/9.x/notionists/svg?seed=Felix"
        },
        support: {
            id: 'support',
            name: t('advisor.agent.support.name'),
            role: t('advisor.agent.support.role'),
            description: t('advisor.agent.support.desc'),
            benefit: t('advisor.agent.support.benefit'),
            salary: t('advisor.price.89'),
            humanSalary: t('advisor.price.3500'),
            color: "from-green-500 to-emerald-400",
            image: "https://api.dicebear.com/9.x/notionists/svg?seed=Aneka"
        },
        receptionist: {
            id: 'receptionist',
            name: t('advisor.agent.receptionist.name'),
            role: t('advisor.agent.receptionist.role'),
            description: t('advisor.agent.receptionist.desc'),
            benefit: t('advisor.agent.receptionist.benefit'),
            salary: t('advisor.price.89'),
            humanSalary: t('advisor.price.3000'),
            color: "from-orange-500 to-amber-400",
            image: "https://api.dicebear.com/9.x/notionists/svg?seed=Bella"
        },
        recruiter: {
            id: 'recruiter',
            name: t('advisor.agent.recruiter.name'),
            role: t('advisor.agent.recruiter.role'),
            description: t('advisor.agent.recruiter.desc'),
            benefit: t('advisor.agent.recruiter.benefit'),
            salary: t('advisor.price.89'),
            humanSalary: t('advisor.price.4500'),
            color: "from-purple-500 to-indigo-400",
            image: "https://api.dicebear.com/9.x/notionists/svg?seed=Zack"
        }
    }), [t]);

    const activeAgent = AGENTS[activeAgentId];

    return (
        <section className="py-32 bg-black relative overflow-hidden flex flex-col items-center border-t border-white/5">

            {/* Background Ambient Light */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-white/5 blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl w-full px-4 relative z-10 flex flex-col items-center">

                {/* Header */}
                <div className="flex flex-col items-center text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-white/70">{t('advisor.status')}</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-serif text-white mb-6 tracking-tight">
                        {t('advisor.title')} <em className="italic text-gray-400">{t('advisor.title_suffix')}</em>
                    </h2>
                    <p className="text-lg text-gray-400 font-light max-w-xl">
                        {t('advisor.subtitle')}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap justify-center gap-3 mb-10">
                    {Object.values(AGENTS).map(agent => (
                        <AgentTab
                            key={agent.id}
                            active={activeAgentId === agent.id}
                            label={agent.name}
                            onClick={() => setActiveAgentId(agent.id as AgentType)}
                        />
                    ))}
                </div>

                {/* --- MAIN VISUALIZER CARD --- */}
                <div className="w-full max-w-5xl bg-[#0A0A0A] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl relative">

                    <div className="grid grid-cols-1 md:grid-cols-2 min-h-[500px]">

                        {/* LEFT: Agent Profile (The "Employee") */}
                        <div className="p-10 md:p-14 flex flex-col justify-center relative border-b md:border-b-0 md:border-r border-white/10 bg-[#0C0C0C]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeAgent.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex flex-col h-full"
                                >
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/20 shadow-2xl mb-8 relative group bg-white/5">
                                        <div className={`absolute inset-0 bg-gradient-to-br ${activeAgent.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500 mix-blend-overlay`}></div>
                                        <img
                                            src={activeAgent.image}
                                            alt={activeAgent.name}
                                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-500"
                                        />
                                    </div>

                                    <h3 className="text-3xl font-serif text-white mb-2">{activeAgent.name}</h3>
                                    <p className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-6">{activeAgent.role}</p>

                                    <p className="text-lg text-gray-300 font-light leading-relaxed mb-8">
                                        "{activeAgent.description}"
                                    </p>

                                    <div className="mt-auto">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-green-500/10 text-green-400 px-3 py-1 rounded-md text-xs font-bold font-mono">
                                                {t('advisor.active')}
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{t('advisor.cost')}</p>
                                                <p className="text-xl text-white font-mono">{activeAgent.salary}</p>
                                            </div>
                                            <div className="text-right opacity-50">
                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{t('advisor.human')}</p>
                                                <p className="text-sm text-gray-400 font-mono line-through">{activeAgent.humanSalary}</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* RIGHT: Proof of Work (The "Result") */}
                        <div className="bg-[#080808] relative overflow-hidden">
                            {/* Background subtle grid */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50"></div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeAgent.id}
                                    className="h-full relative z-10"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.05 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    {activeAgent.id === 'sales' && <SalesVisual />}
                                    {activeAgent.id === 'support' && <SupportVisual />}
                                    {activeAgent.id === 'receptionist' && <ReceptionistVisual />}
                                    {activeAgent.id === 'recruiter' && <RecruiterVisual />}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
};

export default GeminiAdvisor;