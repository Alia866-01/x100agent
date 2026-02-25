import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { XIcon, ArrowUp, TrendingUpIcon } from './Icons';

// --- Types ---
interface AgentDetail {
    id: string;
    name: string;
    role: string;
    description?: string;
    status: 'active' | 'paused';
    image: string;
    stats: {
        conversations: number;
        leads: number;
    };
    channels?: ChannelBadge[];
    integrations?: IntegrationBadge[];
}

interface ChannelBadge {
    type: 'whatsapp' | 'telegram' | 'instagram' | 'email' | 'web';
    active: boolean;
}

interface IntegrationBadge {
    name: string;
    icon: string;
    active: boolean;
}

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

// --- Channel/Integration metadata ---
const CHANNEL_ICONS: Record<string, { icon: string; label: string; color: string }> = {
    whatsapp: { icon: '💬', label: 'WhatsApp', color: '#25D366' },
    telegram: { icon: '✈️', label: 'Telegram', color: '#0088cc' },
    instagram: { icon: '📸', label: 'Instagram', color: '#E4405F' },
    email: { icon: '📧', label: 'Email', color: '#6366F1' },
    web: { icon: '🌐', label: 'Web', color: '#00C2FF' },
};

// --- Mock data for demo ---
const MOCK_AGENTS: AgentDetail[] = [
    {
        id: 'agent-1',
        name: 'Alex',
        role: 'Sales Manager',
        description: 'Qualifies inbound leads, handles objections, books demo calls. Trained on product catalog and pricing. Responds in English and Spanish.',
        status: 'active',
        image: 'https://api.dicebear.com/9.x/notionists/svg?seed=Felix',
        stats: { conversations: 1240, leads: 85 },
        channels: [
            { type: 'whatsapp', active: true },
            { type: 'telegram', active: true },
            { type: 'email', active: false },
        ],
        integrations: [
            { name: 'HubSpot', icon: '🔷', active: true },
            { name: 'Google Calendar', icon: '📅', active: true },
            { name: 'Slack', icon: '💬', active: true },
            { name: 'Gmail', icon: '📧', active: false },
        ],
    },
    {
        id: 'agent-2',
        name: 'Sarah',
        role: 'Support Specialist',
        description: 'Resolves customer tickets, tracks orders, answers FAQ. Connected to knowledge base with 200+ articles. Average resolution time: 2 minutes.',
        status: 'active',
        image: 'https://api.dicebear.com/9.x/notionists/svg?seed=Aneka',
        stats: { conversations: 890, leads: 420 },
        channels: [
            { type: 'web', active: true },
            { type: 'email', active: true },
        ],
        integrations: [
            { name: 'Zendesk', icon: '🎫', active: true },
            { name: 'Notion', icon: '📝', active: true },
        ],
    },
    {
        id: 'agent-3',
        name: 'Maya',
        role: 'Receptionist',
        description: 'Manages appointment bookings, sends reminders, handles rescheduling. Reduces no-shows by 40%.',
        status: 'paused',
        image: 'https://api.dicebear.com/9.x/notionists/svg?seed=Bella',
        stats: { conversations: 340, leads: 180 },
        channels: [
            { type: 'whatsapp', active: true },
        ],
        integrations: [
            { name: 'Google Calendar', icon: '📅', active: true },
        ],
    },
];

// --- Mock stats ---
const MOCK_STATS = {
    totalConversations: 2470,
    conversionRate: 12.4,
    avgResponseTime: '1.8s',
    satisfactionScore: 94,
    weeklyData: [
        { day: 'Mon', conversations: 42, conversions: 5 },
        { day: 'Tue', conversations: 58, conversions: 8 },
        { day: 'Wed', conversations: 35, conversions: 4 },
        { day: 'Thu', conversations: 62, conversions: 9 },
        { day: 'Fri', conversations: 71, conversions: 11 },
        { day: 'Sat', conversations: 28, conversions: 3 },
        { day: 'Sun', conversations: 19, conversions: 2 },
    ],
};

// ============================================================================
// AgentDetailView — opens when clicking an agent card
// ============================================================================
interface AgentDetailViewProps {
    agent: AgentDetail;
    darkMode: boolean;
    onBack: () => void;
    onEdit: (agent: AgentDetail) => void;
}

export const AgentDetailView: React.FC<AgentDetailViewProps> = ({ agent, darkMode, onBack, onEdit }) => {
    const dm = darkMode;
    const stats = MOCK_STATS;
    const maxConv = Math.max(...stats.weeklyData.map(d => d.conversations));

    return (
        <div className="p-8 max-w-5xl mx-auto w-full">
            {/* Back + Title */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={onBack}
                    className={`p-2 rounded-xl transition-colors ${dm ? 'hover:bg-white/10 text-white/60' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h2 className={`text-2xl font-semibold ${dm ? 'text-white' : 'text-gray-900'}`}>Agent Profile</h2>
            </div>

            {/* Hero Card */}
            <div className={`rounded-2xl p-6 mb-6 ${dm ? 'glass-card' : 'bg-white border border-gray-200 shadow-sm'}`}>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <img src={agent.image} alt={agent.name} className={`w-16 h-16 rounded-2xl object-cover ring-2 ${dm ? 'ring-white/10 bg-white' : 'ring-gray-100 bg-gray-50'}`} />
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${dm ? 'border-[#0c0e17]' : 'border-white'} ${agent.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-yellow-500'}`} />
                        </div>
                        <div>
                            <h3 className={`text-xl font-semibold ${dm ? 'text-white' : 'text-gray-900'}`}>{agent.name}</h3>
                            <p className={`text-sm ${dm ? 'text-white/50' : 'text-gray-500'}`}>{agent.role}</p>
                            <p className={`text-sm mt-2 max-w-lg leading-relaxed ${dm ? 'text-white/40' : 'text-gray-400'}`}>
                                {agent.description}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => onEdit(agent)}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium bg-[#00C2FF] hover:bg-[#00A8E0] text-black transition-all btn-accent-glow"
                    >
                        Edit Agent
                    </button>
                </div>

                {/* Channels + Integrations */}
                <div className={`mt-6 pt-5 border-t flex flex-wrap gap-6 ${dm ? 'border-white/10' : 'border-gray-100'}`}>
                    {/* Channels */}
                    <div>
                        <p className={`text-[10px] font-mono uppercase tracking-widest mb-2.5 ${dm ? 'text-white/30' : 'text-gray-400'}`}>Channels</p>
                        <div className="flex gap-2">
                            {(agent.channels || []).map(ch => {
                                const meta = CHANNEL_ICONS[ch.type];
                                return (
                                    <div
                                        key={ch.type}
                                        title={`${meta.label} — ${ch.active ? 'Active' : 'Inactive'}`}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
                                            ${ch.active
                                                ? dm ? 'bg-white/5 border-white/10 text-white/80' : 'bg-gray-50 border-gray-200 text-gray-700'
                                                : dm ? 'bg-white/5 border-white/5 text-white/25' : 'bg-gray-50 border-gray-100 text-gray-300'
                                            }`}
                                    >
                                        <span>{meta.icon}</span>
                                        <span>{meta.label}</span>
                                        {ch.active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                                    </div>
                                );
                            })}
                            {(!agent.channels || agent.channels.length === 0) && (
                                <span className={`text-xs ${dm ? 'text-white/20' : 'text-gray-300'}`}>No channels</span>
                            )}
                        </div>
                    </div>

                    {/* Integrations */}
                    <div>
                        <p className={`text-[10px] font-mono uppercase tracking-widest mb-2.5 ${dm ? 'text-white/30' : 'text-gray-400'}`}>Integrations</p>
                        <div className="flex gap-2">
                            {(agent.integrations || []).map(intg => (
                                <div
                                    key={intg.name}
                                    title={`${intg.name} — ${intg.active ? 'Active' : 'Inactive'}`}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
                                        ${intg.active
                                            ? dm ? 'bg-white/5 border-white/10 text-white/80' : 'bg-gray-50 border-gray-200 text-gray-700'
                                            : dm ? 'bg-white/5 border-white/5 text-white/25' : 'bg-gray-50 border-gray-100 text-gray-300'
                                        }`}
                                >
                                    <span>{intg.icon}</span>
                                    <span>{intg.name}</span>
                                </div>
                            ))}
                            {(!agent.integrations || agent.integrations.length === 0) && (
                                <span className={`text-xs ${dm ? 'text-white/20' : 'text-gray-300'}`}>No integrations</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard dm={dm} label="Conversations" value={stats.totalConversations.toLocaleString()} trend="+8.2%" positive />
                <StatCard dm={dm} label="Conversion Rate" value={`${stats.conversionRate}%`} trend="+1.3%" positive />
                <StatCard dm={dm} label="Avg Response" value={stats.avgResponseTime} trend="-0.4s" positive />
                <StatCard dm={dm} label="Satisfaction" value={`${stats.satisfactionScore}%`} trend="+2%" positive />
            </div>

            {/* Activity Chart (simple bar chart) */}
            <div className={`rounded-2xl p-6 ${dm ? 'glass-card' : 'bg-white border border-gray-200 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-6">
                    <h4 className={`text-sm font-medium ${dm ? 'text-white/80' : 'text-gray-700'}`}>Weekly Activity</h4>
                    <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-sm bg-[#00C2FF]" />
                            <span className={dm ? 'text-white/40' : 'text-gray-500'}>Conversations</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                            <span className={dm ? 'text-white/40' : 'text-gray-500'}>Conversions</span>
                        </span>
                    </div>
                </div>
                <div className="flex items-end gap-3 h-40">
                    {stats.weeklyData.map(d => (
                        <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full flex flex-col items-center gap-0.5" style={{ height: '120px' }}>
                                <div className="w-full flex items-end justify-center gap-1 h-full">
                                    <div
                                        className="w-3 rounded-t-sm bg-[#00C2FF]/80 transition-all"
                                        style={{ height: `${(d.conversations / maxConv) * 100}%` }}
                                    />
                                    <div
                                        className="w-3 rounded-t-sm bg-emerald-500/80 transition-all"
                                        style={{ height: `${(d.conversions / maxConv) * 100}%` }}
                                    />
                                </div>
                            </div>
                            <span className={`text-[10px] font-mono ${dm ? 'text-white/30' : 'text-gray-400'}`}>{d.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Conversations */}
            <div className={`rounded-2xl p-6 mt-6 ${dm ? 'glass-card' : 'bg-white border border-gray-200 shadow-sm'}`}>
                <h4 className={`text-sm font-medium mb-4 ${dm ? 'text-white/80' : 'text-gray-700'}`}>Recent Conversations</h4>
                <div className="space-y-3">
                    {[
                        { name: 'John Miller', channel: 'whatsapp', time: '2 min ago', status: 'Active', preview: 'I want to learn more about your enterprise plan...' },
                        { name: 'Anna Chen', channel: 'telegram', time: '15 min ago', status: 'Converted', preview: 'Great, let me book a demo for Thursday...' },
                        { name: 'support@acme.co', channel: 'email', time: '1h ago', status: 'Resolved', preview: 'Thank you for the quick help!' },
                    ].map((conv, i) => (
                        <div key={i} className={`flex items-center justify-between p-3 rounded-xl transition-colors ${dm ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                            <div className="flex items-center gap-3">
                                <span className="text-lg">{CHANNEL_ICONS[conv.channel]?.icon || '💬'}</span>
                                <div>
                                    <p className={`text-sm font-medium ${dm ? 'text-white/80' : 'text-gray-800'}`}>{conv.name}</p>
                                    <p className={`text-xs truncate max-w-[280px] ${dm ? 'text-white/30' : 'text-gray-400'}`}>{conv.preview}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium
                                    ${conv.status === 'Active' ? 'bg-blue-500/10 text-blue-400'
                                        : conv.status === 'Converted' ? 'bg-emerald-500/10 text-emerald-400'
                                        : 'bg-gray-500/10 text-gray-400'}`}>
                                    {conv.status}
                                </span>
                                <p className={`text-[10px] mt-1 ${dm ? 'text-white/20' : 'text-gray-300'}`}>{conv.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Stat Card ---
const StatCard: React.FC<{ dm: boolean; label: string; value: string; trend: string; positive: boolean }> = ({ dm, label, value, trend, positive }) => (
    <div className={`rounded-2xl p-4 ${dm ? 'glass-stat' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <p className={`text-[10px] font-mono uppercase tracking-widest mb-1 ${dm ? 'text-white/30' : 'text-gray-400'}`}>{label}</p>
        <p className={`text-2xl font-semibold ${dm ? 'text-white' : 'text-gray-900'}`}>{value}</p>
        <p className={`text-xs mt-1 flex items-center gap-1 ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
            <TrendingUpIcon className="w-3 h-3" />
            {trend}
        </p>
    </div>
);

// ============================================================================
// EditAgentChat — Chat panel for editing agent via conversation
// ============================================================================
interface EditAgentChatProps {
    agent: AgentDetail;
    darkMode: boolean;
    onClose: () => void;
}

export const EditAgentChat: React.FC<EditAgentChatProps> = ({ agent, darkMode, onClose }) => {
    const dm = darkMode;
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: `I have the current configuration for **${agent.name}** (${agent.role}).\n\nChannels: ${(agent.channels || []).map(c => CHANNEL_ICONS[c.type]?.label).filter(Boolean).join(', ') || 'none'}\nIntegrations: ${(agent.integrations || []).map(i => i.name).join(', ') || 'none'}\n\nWhat would you like to change?`,
            sender: 'ai',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId] = useState(`edit_${agent.id}_${Date.now()}`);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const API_BASE = import.meta.env.VITE_API_URL || (window.location.hostname !== 'localhost' ? '' : 'http://localhost:8000');

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isSending) return;

        const userMsg: Message = { id: Date.now(), text: input, sender: 'user', timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        const text = input;
        setInput('');
        setIsSending(true);
        setIsTyping(true);

        try {
            const userId = localStorage.getItem('user')
                ? JSON.parse(localStorage.getItem('user')!).id
                : 'anonymous';

            // Prepend agent context so the Platform Agent understands what we're editing
            const contextPrefix = `[EDITING AGENT: ${agent.name} | Role: ${agent.role} | Channels: ${(agent.channels || []).map(c => c.type).join(',')} | Integrations: ${(agent.integrations || []).map(i => i.name).join(',')}]\n\nUser request: `;

            const res = await fetch(`${API_BASE}/api/platform/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: contextPrefix + text,
                    user_id: userId,
                    session_id: sessionId,
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ detail: res.statusText }));
                throw new Error(err.detail || `HTTP ${res.status}`);
            }

            const data = await res.json();

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: data.content,
                sender: 'ai',
                timestamp: new Date(),
            }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: `Error: ${err instanceof Error ? err.message : 'Could not reach the agent. Is the backend running?'}`,
                sender: 'ai',
                timestamp: new Date(),
            }]);
        } finally {
            setIsSending(false);
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Panel */}
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={`fixed top-0 right-0 h-full w-full md:w-[520px] z-50 flex flex-col
                    ${dm ? 'glass-card-elevated' : 'bg-white border-l border-gray-200'}`}
            >
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${dm ? 'border-white/10' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                        <img src={agent.image} alt={agent.name} className={`w-8 h-8 rounded-lg object-cover ${dm ? 'bg-white' : 'bg-gray-50'}`} />
                        <div>
                            <h3 className={`text-sm font-semibold ${dm ? 'text-white' : 'text-gray-900'}`}>
                                Editing {agent.name}
                            </h3>
                            <p className={`text-[10px] font-mono uppercase tracking-widest ${dm ? 'text-white/30' : 'text-gray-400'}`}>
                                AI Architect
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className={`p-2 rounded-xl transition-colors ${dm ? 'hover:bg-white/10 text-white/40' : 'hover:bg-gray-100 text-gray-500'}`}>
                        <XIcon />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-grow overflow-y-auto px-4 py-6 space-y-4 scrollbar-hide">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                                msg.sender === 'user'
                                    ? dm ? 'bg-white text-black rounded-tr-sm' : 'bg-blue-600 text-white rounded-tr-sm'
                                    : dm ? 'bg-white/[0.04] backdrop-blur-md text-white border border-white/8 rounded-tl-sm' : 'bg-gray-50 text-gray-900 border border-gray-200 rounded-tl-sm'
                            }`}>
                                {msg.sender === 'ai' && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-[#00C2FF] to-purple-500" />
                                        <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Architect</span>
                                    </div>
                                )}
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className={`p-4 rounded-2xl rounded-tl-sm ${dm ? 'bg-white/[0.04] backdrop-blur-md border border-white/8' : 'bg-gray-50 border border-gray-200'}`}>
                                <div className="flex items-center gap-1">
                                    <div className={`w-2 h-2 rounded-full animate-bounce ${dm ? 'bg-white/60' : 'bg-gray-400'}`} style={{ animationDelay: '0ms' }} />
                                    <div className={`w-2 h-2 rounded-full animate-bounce ${dm ? 'bg-white/60' : 'bg-gray-400'}`} style={{ animationDelay: '150ms' }} />
                                    <div className={`w-2 h-2 rounded-full animate-bounce ${dm ? 'bg-white/60' : 'bg-gray-400'}`} style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className={`p-4 border-t ${dm ? 'border-white/10' : 'border-gray-200'}`}>
                    <div className={`flex items-end gap-2 rounded-2xl p-2 ${dm ? 'glass-input' : 'bg-white border border-gray-200'}`}>
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                            placeholder="Describe what you want to change..."
                            disabled={isSending}
                            className={`flex-grow bg-transparent border-0 focus:ring-0 resize-none py-2.5 px-2 max-h-28 min-h-[40px] text-sm ${dm ? 'text-white placeholder-white/30' : 'text-gray-900 placeholder-gray-400'} disabled:opacity-50`}
                            rows={1}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isSending}
                            className={`p-2.5 rounded-xl transition-all ${
                                input.trim() && !isSending
                                    ? dm ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'
                                    : dm ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {isSending
                                ? <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" />
                                : <ArrowUp className="w-4 h-4" />
                            }
                        </button>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

// ============================================================================
// Export mock data for Dashboard integration
// ============================================================================
export { MOCK_AGENTS };
export type { AgentDetail, ChannelBadge, IntegrationBadge };
