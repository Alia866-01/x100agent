import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChatBubbleIcon, UsersIcon, SettingsIcon, UserCircleIcon,
    MicIcon, PaperClipIcon, SendIcon, PlusIcon, LogOutIcon,
    XIcon, CheckIcon,
    ArrowUp, PieChartIcon, TrendingUpIcon, TrendingDownIcon,
    MoonIcon, SunIcon, SearchIcon
} from './Icons';
import { agentService } from '../services/agentService';
import type { Agent as APIAgent } from '../types/api';
import { AgentDetailView, EditAgentChat, MOCK_AGENTS } from './ChannelsView';
import type { AgentDetail } from './ChannelsView';

// --- Types ---
interface DashboardProps {
    onLogout: () => void;
}

type View = 'chat' | 'agents' | 'agent-detail' | 'channels' | 'knowledge' | 'conversations' | 'analytics' | 'settings';

interface AgentChannel {
    id: string;
    name: string;
    status: 'connected' | 'pending' | 'disconnected';
    messages: number;
    icon: string;
}

interface AgentKBSource {
    id: string;
    name: string;
    size: string;
    type: string;
    synced: string;
    status: 'synced' | 'processing';
}

interface ConversationMessage {
    id: string;
    sender: 'customer' | 'agent';
    text: string;
    time: string;
}

interface AgentConversation {
    id: string;
    customer: string;
    channel: string;
    lastMsg: string;
    time: string;
    status: 'active' | 'resolved' | 'escalated';
    messages: ConversationMessage[];
}

interface Agent {
    id: string;
    name: string;
    role: string;
    description?: string;
    status: 'active' | 'paused';
    stats: {
        conversations: number;
        leads: number;
    };
    image: string;
    channels: AgentChannel[];
    knowledge: AgentKBSource[];
    recentConversations: AgentConversation[];
}

interface WizardButton { label: string; value: string; icon?: string }
interface WizardCheckItem { id: string; label: string; checked: boolean }

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    buttons?: WizardButton[];
    checklist?: WizardCheckItem[];
    fileUpload?: boolean;
    summary?: Record<string, string>;
}

// --- Constants ---
const AGENT_TEMPLATES = [
    {
        name: "Sales Manager",
        role: "Revenue Growth",
        description: "Qualifies leads, handles objections, and closes deals on WhatsApp & Telegram. Expert in funnel management.",
        image: 'https://api.dicebear.com/9.x/notionists/svg?seed=Felix'
    },
    {
        name: "Support Specialist",
        role: "Customer Success",
        description: "Resolves tickets, tracks orders, and answers FAQs instantly 24/7. Connects to your knowledge base.",
        image: 'https://api.dicebear.com/9.x/notionists/svg?seed=Aneka'
    },
    {
        name: "Receptionist",
        role: "Front Desk",
        description: "Manages calendar, books appointments, and sends reminders to reduce no-shows. Integrates with Google Calendar.",
        image: 'https://api.dicebear.com/9.x/notionists/svg?seed=Bella'
    },
    {
        name: "HR Recruiter",
        role: "Talent Acquisition",
        description: "Screens resumes, conducts initial interviews, and schedules meetings with top candidates automatically.",
        image: 'https://api.dicebear.com/9.x/notionists/svg?seed=Zack'
    }
];

const AVATAR_LIBRARY = [
    "https://api.dicebear.com/9.x/notionists/svg?seed=Felix",
    "https://api.dicebear.com/9.x/notionists/svg?seed=Aneka",
    "https://api.dicebear.com/9.x/notionists/svg?seed=Zack",
    "https://api.dicebear.com/9.x/notionists/svg?seed=Midnight",
    "https://api.dicebear.com/9.x/notionists/svg?seed=Bandit",
    "https://api.dicebear.com/9.x/notionists/svg?seed=Bella",
    "https://api.dicebear.com/9.x/notionists/svg?seed=Luna",
    "https://api.dicebear.com/9.x/notionists/svg?seed=Shadow",
    "https://api.dicebear.com/9.x/notionists/svg?seed=Spooky",
    "https://api.dicebear.com/9.x/notionists/svg?seed=Tiger"
];

// --- Initial Data ---
const INITIAL_AGENTS: Agent[] = [
    {
        id: 'agent-1',
        name: 'Alex',
        role: 'Sales Manager',
        description: 'Qualifies inbound leads, handles objections, books demo calls.',
        status: 'active',
        stats: { conversations: 1240, leads: 85 },
        image: 'https://api.dicebear.com/9.x/notionists/svg?seed=Felix',
        channels: [
            { id: 'whatsapp', name: 'WhatsApp Business', status: 'connected', messages: 2340, icon: '💬' },
            { id: 'telegram', name: 'Telegram Bot', status: 'connected', messages: 1850, icon: '✈️' },
            { id: 'email', name: 'Email (SMTP)', status: 'connected', messages: 920, icon: '📧' },
        ],
        knowledge: [
            { id: 'kb1', name: 'Product_Pricing_2026.pdf', size: '2.4 MB', type: 'PDF', synced: '2h ago', status: 'synced' },
            { id: 'kb4', name: 'Sales_Scripts_v3.pdf', size: '560 KB', type: 'PDF', synced: 'Just now', status: 'processing' },
            { id: 'kb5', name: 'Objection_Handling.docx', size: '340 KB', type: 'DOCX', synced: '1d ago', status: 'synced' },
        ],
        recentConversations: [
            { id: 'c1', customer: 'Elena K.', channel: 'WhatsApp', lastMsg: 'Thank you! I will proceed with the order.', time: '5m ago', status: 'resolved', messages: [
                { id: 'm1', sender: 'customer', text: 'Hi, I saw your enterprise plan. Can you tell me more about pricing?', time: '10:02 AM' },
                { id: 'm2', sender: 'agent', text: 'Of course! Our enterprise plan starts at $299/month and includes unlimited agents, priority support, and custom integrations. Would you like me to send a detailed breakdown?', time: '10:03 AM' },
                { id: 'm3', sender: 'customer', text: 'Yes please, that would be great.', time: '10:05 AM' },
                { id: 'm4', sender: 'agent', text: 'I\'ve just sent it to your email. Let me know if you have any questions!', time: '10:06 AM' },
                { id: 'm5', sender: 'customer', text: 'Thank you! I will proceed with the order.', time: '10:08 AM' },
            ]},
            { id: 'c3', customer: 'Maria S.', channel: 'Telegram', lastMsg: 'Can you schedule a demo for next week?', time: '28m ago', status: 'active', messages: [
                { id: 'm1', sender: 'customer', text: 'Hello! I\'m interested in your AI workforce platform.', time: '9:30 AM' },
                { id: 'm2', sender: 'agent', text: 'Welcome, Maria! I\'d love to show you what we can do. Are you looking for a specific use case?', time: '9:31 AM' },
                { id: 'm3', sender: 'customer', text: 'Yes, we need automated customer support for our e-commerce store.', time: '9:33 AM' },
                { id: 'm4', sender: 'agent', text: 'Perfect, we have several clients in e-commerce. I can walk you through a live demo. Would next Tuesday or Wednesday work?', time: '9:34 AM' },
                { id: 'm5', sender: 'customer', text: 'Can you schedule a demo for next week?', time: '9:36 AM' },
            ]},
            { id: 'c5', customer: 'Sophie B.', channel: 'WhatsApp', lastMsg: 'This is not what I ordered.', time: '2h ago', status: 'escalated', messages: [
                { id: 'm1', sender: 'customer', text: 'Hi, I received my package but the items are wrong.', time: '8:15 AM' },
                { id: 'm2', sender: 'agent', text: 'I\'m sorry to hear that, Sophie. Could you share your order number so I can look into this?', time: '8:16 AM' },
                { id: 'm3', sender: 'customer', text: 'Order #X100-4829. I ordered the Pro plan setup but received Basic.', time: '8:18 AM' },
                { id: 'm4', sender: 'agent', text: 'I see the issue. Let me escalate this to our fulfillment team right away. You\'ll receive a corrected setup within 24 hours.', time: '8:20 AM' },
                { id: 'm5', sender: 'customer', text: 'This is not what I ordered.', time: '8:22 AM' },
            ]},
            { id: 'c7', customer: 'Tom H.', channel: 'Email', lastMsg: 'Please send the proposal by Friday.', time: '4h ago', status: 'active', messages: [
                { id: 'm1', sender: 'customer', text: 'We discussed the custom integration package last week. Any updates?', time: '6:40 AM' },
                { id: 'm2', sender: 'agent', text: 'Hi Tom! Yes, I\'ve prepared a tailored proposal including the API integration and dedicated support channel.', time: '6:45 AM' },
                { id: 'm3', sender: 'customer', text: 'Great. What\'s the timeline for implementation?', time: '6:50 AM' },
                { id: 'm4', sender: 'agent', text: 'Typically 2-3 weeks from contract signing. I\'ll include the full timeline in the proposal.', time: '6:52 AM' },
                { id: 'm5', sender: 'customer', text: 'Please send the proposal by Friday.', time: '6:55 AM' },
            ]},
        ],
    },
    {
        id: 'agent-2',
        name: 'Sarah',
        role: 'Support Specialist',
        description: 'Resolves customer tickets, tracks orders, answers FAQ.',
        status: 'active',
        stats: { conversations: 890, leads: 420 },
        image: 'https://api.dicebear.com/9.x/notionists/svg?seed=Aneka',
        channels: [
            { id: 'webchat', name: 'Website Widget', status: 'connected', messages: 3100, icon: '🌐' },
            { id: 'email', name: 'Email (SMTP)', status: 'connected', messages: 640, icon: '📧' },
            { id: 'instagram', name: 'Instagram DM', status: 'pending', messages: 0, icon: '📸' },
        ],
        knowledge: [
            { id: 'kb2', name: 'FAQ_Database.csv', size: '840 KB', type: 'CSV', synced: '1d ago', status: 'synced' },
            { id: 'kb3', name: 'Company_Policies.docx', size: '1.1 MB', type: 'DOCX', synced: '3d ago', status: 'synced' },
            { id: 'kb6', name: 'Return_Policy.pdf', size: '180 KB', type: 'PDF', synced: '5d ago', status: 'synced' },
        ],
        recentConversations: [
            { id: 'c2', customer: 'James R.', channel: 'Email', lastMsg: 'When will my refund be processed?', time: '12m ago', status: 'active', messages: [
                { id: 'm1', sender: 'customer', text: 'I cancelled my subscription 5 days ago but haven\'t received a refund.', time: '9:50 AM' },
                { id: 'm2', sender: 'agent', text: 'I\'m sorry for the delay, James. Let me check your account right away.', time: '9:51 AM' },
                { id: 'm3', sender: 'agent', text: 'I can see the cancellation was processed. Refunds typically take 5-7 business days. Yours should arrive by Wednesday.', time: '9:53 AM' },
                { id: 'm4', sender: 'customer', text: 'When will my refund be processed?', time: '9:55 AM' },
            ]},
            { id: 'c6', customer: 'Max W.', channel: 'Instagram', lastMsg: 'Perfect, thanks for the quick help!', time: '3h ago', status: 'resolved', messages: [
                { id: 'm1', sender: 'customer', text: 'How do I connect my Instagram DMs to the platform?', time: '7:10 AM' },
                { id: 'm2', sender: 'agent', text: 'Go to Settings → Channels → Add Channel → Instagram. You\'ll need to authorize with your business account.', time: '7:11 AM' },
                { id: 'm3', sender: 'customer', text: 'Perfect, thanks for the quick help!', time: '7:13 AM' },
            ]},
            { id: 'c8', customer: 'Anna P.', channel: 'Website', lastMsg: 'How do I update my billing info?', time: '6h ago', status: 'resolved', messages: [
                { id: 'm1', sender: 'customer', text: 'I need to change the credit card on file.', time: '4:20 AM' },
                { id: 'm2', sender: 'agent', text: 'Sure! Navigate to Account → Billing → Payment Methods. You can add a new card and remove the old one there.', time: '4:21 AM' },
                { id: 'm3', sender: 'customer', text: 'How do I update my billing info?', time: '4:23 AM' },
                { id: 'm4', sender: 'agent', text: 'Just follow the steps I mentioned: Account → Billing → Payment Methods. Would you like me to send you a direct link?', time: '4:24 AM' },
                { id: 'm5', sender: 'customer', text: 'Got it, found it. Thanks!', time: '4:26 AM' },
            ]},
        ],
    },
    {
        id: 'agent-3',
        name: 'Maya',
        role: 'Receptionist',
        description: 'Manages appointment bookings, sends reminders.',
        status: 'paused',
        stats: { conversations: 340, leads: 180 },
        image: 'https://api.dicebear.com/9.x/notionists/svg?seed=Bella',
        channels: [
            { id: 'whatsapp', name: 'WhatsApp Business', status: 'connected', messages: 340, icon: '💬' },
            { id: 'sms', name: 'SMS / Twilio', status: 'disconnected', messages: 0, icon: '📱' },
        ],
        knowledge: [
            { id: 'kb7', name: 'Services_Catalog.pdf', size: '1.8 MB', type: 'PDF', synced: '2d ago', status: 'synced' },
            { id: 'kb8', name: 'Booking_Rules.docx', size: '220 KB', type: 'DOCX', synced: '4d ago', status: 'synced' },
        ],
        recentConversations: [
            { id: 'c4', customer: 'David L.', channel: 'WhatsApp', lastMsg: 'I need to reschedule my appointment.', time: '1h ago', status: 'resolved', messages: [
                { id: 'm1', sender: 'customer', text: 'Hi, I have an appointment tomorrow at 3 PM but I can\'t make it.', time: '9:00 AM' },
                { id: 'm2', sender: 'agent', text: 'No problem, David! I can help reschedule. What time works better for you?', time: '9:01 AM' },
                { id: 'm3', sender: 'customer', text: 'How about Thursday at 11 AM?', time: '9:03 AM' },
                { id: 'm4', sender: 'agent', text: 'Thursday at 11 AM is available. I\'ve updated your appointment. You\'ll get a confirmation shortly.', time: '9:04 AM' },
                { id: 'm5', sender: 'customer', text: 'I need to reschedule my appointment.', time: '9:05 AM' },
            ]},
        ],
    }
];

// --- Sub-Components ---

const Toggle = ({ checked, onChange, darkMode, activeClass = "bg-[#00C2FF]" }: { checked: boolean; onChange: (v: boolean) => void, darkMode: boolean, activeClass?: string }) => (
    <button 
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full relative transition-colors duration-300 focus:outline-none 
        ${checked ? activeClass : (darkMode ? 'bg-white/5 border border-white/10' : 'bg-gray-300 border border-gray-300')}
        `}
    >
        <div className={`absolute top-1 bottom-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);

// --- Custom SVG Chart Components ---

const RevenueChart = ({ darkMode }: { darkMode: boolean }) => (
    <div className="relative w-full h-[220px] mt-6">
        <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
            <defs>
                <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#34D399" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
                </linearGradient>
            </defs>
            {/* Grid Lines */}
            <line x1="0" y1="150" x2="600" y2="150" stroke={darkMode ? "#333" : "#e5e5e5"} strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
            <line x1="0" y1="100" x2="600" y2="100" stroke={darkMode ? "#333" : "#e5e5e5"} strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
            <line x1="0" y1="50" x2="600" y2="50" stroke={darkMode ? "#333" : "#e5e5e5"} strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />

            {/* Area */}
            <path 
                d="M0,150 C50,140 100,160 150,120 C200,80 250,110 300,90 C350,70 400,80 450,50 C500,20 550,60 600,40 V200 H0 Z" 
                fill="url(#gradient)" 
            />
            {/* Line */}
            <path 
                d="M0,150 C50,140 100,160 150,120 C200,80 250,110 300,90 C350,70 400,80 450,50 C500,20 550,60 600,40" 
                fill="none" 
                stroke="#34D399" 
                strokeWidth="3" 
                strokeLinecap="round"
            />
            {/* End Dot */}
            <circle cx="600" cy="40" r="4" fill="#34D399" />
            <circle cx="600" cy="40" r="8" fill="#34D399" opacity="0.3" />
        </svg>
    </div>
)

const ProgressBar = ({ label, percentage, color = "bg-[#00C2FF]", modelPercentage, darkMode }: { label: string, percentage: number, color?: string, modelPercentage?: number, darkMode: boolean }) => (
    <div className="mb-4">
        <div className="flex justify-between items-end mb-1">
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
        </div>
        <div className={`relative h-1.5 w-full rounded-full overflow-hidden ${darkMode ? 'bg-white/5' : 'bg-gray-200'}`}>
             <div className={`absolute top-0 left-0 h-full w-full ${darkMode ? 'bg-white/[0.03]' : 'bg-gray-100'}`}></div>
            <div 
                className={`absolute top-0 left-0 h-full rounded-full ${color}`} 
                style={{ width: `${percentage}%` }}
            ></div>
            {modelPercentage && (
                 <div 
                    className={`absolute top-0 h-full w-0.5 z-10 ${darkMode ? 'bg-white/50' : 'bg-black/20'}`} 
                    style={{ left: `${modelPercentage}%` }}
                 ></div>
            )}
        </div>
        <div className="flex justify-between text-[10px] mt-1 font-mono">
             <span className={darkMode ? 'text-white' : 'text-gray-900'}>Current ({percentage}%)</span>
             {modelPercentage && <span className="text-gray-500">Target ({modelPercentage}%)</span>}
        </div>
    </div>
)

const AgentTemplatesModal = ({ onClose, onSelect, darkMode }: { onClose: () => void, onSelect: (template: any) => void, darkMode: boolean }) => {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${darkMode ? 'glass-card-elevated' : 'bg-white border border-gray-200'}`}
            >
                <div className={`p-8 border-b ${darkMode ? 'border-white/10' : 'border-gray-100'}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className={`text-2xl font-serif mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Deploy New Agent</h2>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Choose a template to configure your new digital employee.</p>
                        </div>
                        <button onClick={onClose} className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-black'}`}>
                            <XIcon />
                        </button>
                    </div>
                </div>
                
                <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                    {AGENT_TEMPLATES.map((template, idx) => (
                        <button 
                            key={idx}
                            onClick={() => onSelect(template)}
                            className={`flex flex-col text-left p-6 rounded-2xl transition-all duration-300 group ${darkMode ? 'glass-card hover:border-[#00C2FF]/30' : 'bg-gray-50 border border-gray-200 hover:border-blue-400 hover:bg-white'}`}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg border border-white/5">
                                    <img src={template.image} alt={template.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h3 className={`font-medium text-lg ${darkMode ? 'text-white group-hover:text-[#00C2FF]' : 'text-gray-900 group-hover:text-blue-600'}`}>{template.name}</h3>
                                    <p className="text-xs font-mono uppercase tracking-widest text-gray-500">{template.role}</p>
                                </div>
                            </div>
                            <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {template.description}
                            </p>
                        </button>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}

const AgentEditorPanel = ({ agent, onClose, onSave, darkMode }: { agent: Agent | null, onClose: () => void, onSave: (agent: Agent) => void, darkMode: boolean }) => {
    if (!agent) return null;

    // Form State
    const [name, setName] = useState(agent.name);
    const [role, setRole] = useState(agent.role);
    const [description, setDescription] = useState(agent.description || '');
    const [currentImage, setCurrentImage] = useState(agent.image);
    const [knowledgeBase, setKnowledgeBase] = useState([
        { id: 'kb1', name: 'Company_Pricing.pdf', size: '1.2 MB', type: 'PDF', status: 'Synced' }
    ]);
    
    // Update state if agent prop changes
    useEffect(() => {
        setName(agent.name);
        setRole(agent.role);
        setDescription(agent.description || '');
        setCurrentImage(agent.image);
    }, [agent]);

    // Local state for integrations (demo purposes, not part of main Agent object yet)
    const [integrations, setIntegrations] = useState([
        { id: 'whatsapp', name: 'WhatsApp Business', active: true },
        { id: 'telegram', name: 'Telegram Bot', active: true },
        { id: 'gmail', name: 'Gmail / Outlook', active: false },
        { id: 'calendar', name: 'Google Calendar', active: true },
        { id: 'crm', name: 'HubSpot CRM', active: false },
    ]);

    const [showToolModal, setShowToolModal] = useState(false);
    const [toolSearch, setToolSearch] = useState("");
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const knowledgeInputRef = useRef<HTMLInputElement>(null);

    const tools = [
        { name: "Slack", icon: "💬" },
        { name: "Notion", icon: "📝" },
        { name: "Google Drive", icon: "📁" },
        { name: "Zapier", icon: "⚡" },
        { name: "Jira", icon: "🔨" },
        { name: "Trello", icon: "📋" },
        { name: "GitHub", icon: "🐙" },
        { name: "Linear", icon: "🔷" },
        { name: "Zoom", icon: "🎥" },
        { name: "Stripe", icon: "💳" },
        { name: "Intercom", icon: "😊" },
        { name: "Salesforce", icon: "☁️" },
    ];

    const filteredTools = tools.filter(t => t.name.toLowerCase().includes(toolSearch.toLowerCase()));

    const toggleIntegration = (id: string) => {
        setIntegrations(prev => prev.map(i => i.id === id ? { ...i, active: !i.active } : i));
    };

    const handleAddTool = (tool: { name: string }) => {
        const id = tool.name.toLowerCase().replace(/\s+/g, '-');
        // Avoid duplicates
        if (!integrations.some(i => i.id === id)) {
            setIntegrations([...integrations, { id, name: tool.name, active: true }]);
        }
        setShowToolModal(false);
        setToolSearch(""); // Reset search
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCurrentImage(reader.result as string);
                setShowAvatarPicker(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleKnowledgeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Simulate upload
            setKnowledgeBase(prev => [...prev, {
                id: `kb_${Date.now()}`,
                name: file.name,
                size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
                status: 'Uploading...'
            }]);
            
            // Simulate sync finish
            setTimeout(() => {
                setKnowledgeBase(prev => prev.map(item => 
                    item.name === file.name ? { ...item, status: 'Synced' } : item
                ));
            }, 1500);
        }
    };

    const removeSource = (id: string) => {
        setKnowledgeBase(prev => prev.filter(item => item.id !== id));
    };

    const handleSave = () => {
        const updatedAgent: Agent = {
            ...agent,
            name,
            role,
            description,
            image: currentImage
        };
        onSave(updatedAgent);
    };

    return (
        <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed top-0 right-0 h-full w-full md:w-[480px] backdrop-blur-2xl border-l shadow-[0_0_50px_rgba(0,0,0,0.5)] z-50 flex flex-col
            ${darkMode ? 'bg-[#121212]/80 border-white/15' : 'bg-white/90 border-gray-200'}
            `}
        >
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-5 border-b ${darkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                <h3 className={`text-xl font-heading font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{agent.id.startsWith('new') ? 'Deploy Agent' : 'Edit Agent'}</h3>
                <button onClick={onClose} className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-black'}`}>
                    <XIcon />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-grow overflow-y-auto px-6 py-6 scrollbar-hide space-y-8 relative">
                
                {/* Profile Section */}
                <div className="flex flex-col items-center">
                    <div 
                        className={`w-24 h-24 rounded-full overflow-hidden border-2 mb-4 relative group cursor-pointer shadow-2xl ${darkMode ? 'border-white/10' : 'border-gray-200'}`}
                        onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                    >
                        <img src={currentImage} alt={name} className="w-full h-full object-cover group-hover:opacity-50 transition-opacity bg-black" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                            <span className="text-xs font-bold text-white uppercase tracking-widest">Change</span>
                        </div>
                    </div>
                    
                    {/* Avatar Picker Overlay */}
                    <AnimatePresence>
                        {showAvatarPicker && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className={`absolute top-36 z-50 p-4 rounded-xl border shadow-xl w-64 grid grid-cols-4 gap-2
                                ${darkMode ? 'bg-[#1A1A1A] border-white/10' : 'bg-white border-gray-200'}
                                `}
                            >
                                {AVATAR_LIBRARY.map((url, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => { setCurrentImage(url); setShowAvatarPicker(false); }}
                                        className="w-12 h-12 rounded-full overflow-hidden border border-transparent hover:border-blue-500 transition-all hover:scale-110 bg-white"
                                    >
                                        <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center transition-all hover:border-blue-500 hover:text-blue-500
                                    ${darkMode ? 'border-white/20 text-white/50' : 'border-gray-300 text-gray-400'}
                                    `}
                                    title="Upload Custom"
                                >
                                    <PlusIcon />
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="text-center">
                         <h2 className={`text-2xl font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{name}</h2>
                         <div className="flex items-center justify-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-yellow-500'}`}></span>
                            <span className="text-xs font-mono uppercase tracking-widest text-gray-400">{agent.status}</span>
                        </div>
                    </div>
                </div>

                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h4 className="text-xs text-gray-500 font-mono uppercase tracking-widest border-b border-gray-200 dark:border-white/5 pb-2">Identity</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-400 mb-1.5 block">Display Name</label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)}
                                    className={`w-full rounded-lg px-4 py-3 outline-none transition-colors text-sm border focus:border-[#00C2FF] ${darkMode ? 'bg-[#0A0A0A] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`} 
                                />
                            </div>
                             <div>
                                <label className="text-xs text-gray-400 mb-1.5 block">Role / Function</label>
                                <input 
                                    type="text" 
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className={`w-full rounded-lg px-4 py-3 outline-none transition-colors text-sm border focus:border-[#00C2FF] ${darkMode ? 'bg-[#0A0A0A] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Description & Process */}
                    <div className="space-y-4">
                        <h4 className="text-xs text-gray-500 font-mono uppercase tracking-widest border-b border-gray-200 dark:border-white/5 pb-2">Behavior & Logic</h4>
                        <div className="space-y-3">
                             <div>
                                <label className="text-xs text-gray-400 mb-1.5 block">Agent Description</label>
                                <textarea 
                                    className={`w-full rounded-lg px-4 py-3 outline-none transition-colors text-sm min-h-[80px] resize-none border focus:border-[#00C2FF] ${darkMode ? 'bg-[#0A0A0A] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={agent.id.startsWith('new') ? "This agent is configured to handle..." : ""}
                                />
                            </div>
                             <div>
                                <label className="text-xs text-gray-400 mb-1.5 block">Workflow Process</label>
                                <textarea 
                                    className={`w-full rounded-lg px-4 py-3 outline-none transition-colors text-sm min-h-[120px] font-mono text-xs leading-relaxed resize-none border focus:border-[#00C2FF] ${darkMode ? 'bg-[#0A0A0A] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                    defaultValue={`1. Analyze incoming message sentiment.\n2. Check Knowledge Base for pricing/availability.\n3. If intent is "booking", query Google Calendar.\n4. Propose slots or answer questions.\n5. Log conversation to CRM.`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Integrations */}
                    <div className="space-y-4">
                        <h4 className="text-xs text-gray-500 font-mono uppercase tracking-widest border-b border-gray-200 dark:border-white/5 pb-2">Integrations</h4>
                        <div className="space-y-2">
                            {integrations.map((item) => (
                                <div key={item.id} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${darkMode ? 'bg-[#0A0A0A] border-white/5 hover:border-white/10' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{item.name}</span>
                                    </div>
                                    <Toggle checked={item.active} onChange={() => toggleIntegration(item.id)} darkMode={darkMode} activeClass="bg-green-500" />
                                </div>
                            ))}
                        </div>
                        <button 
                            type="button" 
                            onClick={() => setShowToolModal(true)}
                            className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${darkMode ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-900/20' : 'bg-green-600 hover:bg-green-700 text-white shadow-green-200'}`}
                        >
                             Connect New Tool +
                        </button>
                    </div>
                    
                    {/* Knowledge Base */}
                    <div className="space-y-4">
                        <h4 className="text-xs text-gray-500 font-mono uppercase tracking-widest border-b border-gray-200 dark:border-white/5 pb-2">Knowledge Base</h4>
                        <div className="space-y-2">
                            {knowledgeBase.map((file) => (
                                <div key={file.id} className={`border rounded-lg p-3 flex items-center justify-between group ${darkMode ? 'bg-[#0A0A0A] border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center border border-blue-500/20">
                                            <span className="text-[10px] font-bold">{file.type}</span>
                                        </div>
                                        <div>
                                            <p className={`text-sm group-hover:text-blue-400 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>{file.name}</p>
                                            <p className="text-[10px] text-gray-600">{file.size} · {file.status}</p>
                                        </div>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => removeSource(file.id)}
                                        className="text-gray-600 hover:text-red-400 transition-colors"
                                    >
                                        <XIcon />
                                    </button>
                                </div>
                            ))}
                            
                            <button 
                                type="button" 
                                onClick={() => knowledgeInputRef.current?.click()}
                                className={`w-full py-3 border border-dashed rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${darkMode ? 'border-white/20 text-gray-400 hover:text-white hover:border-white/40' : 'border-gray-300 text-gray-500 hover:text-black hover:border-gray-400'}`}
                            >
                                <PlusIcon /> Add Source
                            </button>
                            <input 
                                type="file" 
                                ref={knowledgeInputRef} 
                                className="hidden" 
                                onChange={handleKnowledgeUpload}
                            />
                        </div>
                    </div>
                </form>
            </div>

            {/* Tool Selection Modal Overlay */}
            <AnimatePresence>
                {showToolModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
                        onClick={() => setShowToolModal(false)} // Close on background click
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal
                            className={`w-full max-w-sm rounded-2xl border shadow-2xl flex flex-col max-h-[500px] overflow-hidden ${darkMode ? 'bg-[#151515] border-white/10' : 'bg-white border-gray-200'}`}
                        >
                            {/* Search Header */}
                            <div className={`p-4 border-b flex items-center gap-3 ${darkMode ? 'border-white/10' : 'border-gray-100'}`}>
                                <SearchIcon className={darkMode ? "text-gray-500" : "text-gray-400"} />
                                <input 
                                    type="text" 
                                    autoFocus
                                    placeholder="Search integrations..." 
                                    value={toolSearch}
                                    onChange={(e) => setToolSearch(e.target.value)}
                                    className={`flex-1 bg-transparent outline-none text-sm ${darkMode ? 'text-white placeholder:text-gray-600' : 'text-gray-900 placeholder:text-gray-400'}`}
                                />
                                <button onClick={() => setShowToolModal(false)} className="text-gray-500 hover:text-white transition-colors">
                                    <XIcon />
                                </button>
                            </div>

                            {/* List */}
                            <div className="overflow-y-auto p-2 scrollbar-hide">
                                {filteredTools.length > 0 ? (
                                    filteredTools.map((tool) => (
                                        <button 
                                            key={tool.name}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors group ${darkMode ? 'hover:bg-white/5 text-gray-200' : 'hover:bg-gray-50 text-gray-700'}`}
                                            onClick={() => handleAddTool(tool)}
                                        >
                                            <span className="text-sm font-medium">{tool.name}</span>
                                            <span className={`ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                                ADD
                                            </span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-500 text-xs">
                                        No tools found.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <div className={`p-6 border-t backdrop-blur-md space-y-3 ${darkMode ? 'border-white/10 bg-[#0A0A0A]/50' : 'border-gray-200 bg-white/50'}`}>
                <button 
                    onClick={handleSave}
                    className={`w-full py-3.5 rounded-xl font-mono text-sm font-bold uppercase tracking-wide transition-colors shadow-lg ${darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
                >
                    {agent.id.startsWith('new') ? 'Deploy Agent' : 'Save Changes'}
                </button>
                {!agent.id.startsWith('new') && (
                    <button className="w-full bg-red-500/5 text-red-400 py-3.5 rounded-xl font-mono text-sm font-bold uppercase tracking-wide hover:bg-red-500/10 transition-colors border border-red-500/20">
                        Pause Agent
                    </button>
                )}
            </div>
        </motion.div>
    );
};

// --- Views ---

// --- Test Bot Panel (customer simulation) ---
const TestBotPanel = ({ darkMode }: { darkMode: boolean }) => {
    const dm = darkMode;
    const [msgs, setMsgs] = useState<Message[]>([
        { id: 1, text: "Hi! I'm interested in your product. Can you tell me more?", sender: 'user', timestamp: new Date() },
    ]);
    const [inp, setInp] = useState('');
    const [sending, setSending] = useState(false);
    const [typing, setTyping] = useState(false);
    const [testSessionId] = useState(`test_${Date.now()}`);
    const endRef = useRef<HTMLDivElement>(null);
    const API_BASE = import.meta.env.VITE_API_URL || (window.location.hostname !== 'localhost' ? '' : 'http://localhost:8000');

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

    const send = async () => {
        if (!inp.trim() || sending) return;
        const text = inp;
        setMsgs(prev => [...prev, { id: Date.now(), text, sender: 'user', timestamp: new Date() }]);
        setInp('');
        setSending(true);
        setTyping(true);

        try {
            const res = await fetch(`${API_BASE}/api/platform/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `[TEST MODE — You are now role-playing as the Sales Agent that was just configured. Respond to the customer message below as that agent would. Be concise, friendly, and stay in character. Do NOT break character or mention that you are the Platform Agent.]\n\nCustomer: ${text}`,
                    user_id: 'test-customer',
                    session_id: testSessionId,
                }),
            });
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();
            setMsgs(prev => [...prev, { id: Date.now() + 1, text: data.content, sender: 'ai', timestamp: new Date() }]);
        } catch {
            setMsgs(prev => [...prev, { id: Date.now() + 1, text: 'Connection error. Check backend.', sender: 'ai', timestamp: new Date() }]);
        } finally {
            setSending(false);
            setTyping(false);
        }
    };

    return (
        <div className="relative w-[340px] h-[520px]">
            {/* Gradient glow border */}
            {dm && (
                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-[#00C2FF]/40 via-[#7C3AED]/30 to-[#00C2FF]/20 blur-[1px]" />
            )}
            {/* Outer glow */}
            {dm && (
                <div className="absolute -inset-3 rounded-3xl bg-gradient-to-b from-[#00C2FF]/10 via-[#7C3AED]/8 to-[#00C2FF]/5 blur-xl pointer-events-none" />
            )}
        <div className={`relative w-full h-full flex flex-col rounded-2xl overflow-hidden ${dm ? 'bg-[#0d1020]/95 backdrop-blur-xl' : 'border border-gray-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)]'}`}>
            {/* Header — phone-like */}
            <div className={`px-4 py-3 flex items-center gap-3 border-b ${dm ? 'border-white/[0.06] bg-white/[0.02]' : 'border-gray-100 bg-gray-50'}`}>
                <div className="relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${dm ? 'bg-[#00C2FF]/10 text-[#00C2FF]' : 'bg-blue-50 text-blue-600'}`}>AI</div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0a0c14]" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${dm ? 'text-white/90' : 'text-gray-900'}`}>Test Customer Chat</p>
                    <p className={`text-[10px] ${dm ? 'text-emerald-400/80' : 'text-emerald-600'}`}>Agent online</p>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider ${dm ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                    Test
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 scrollbar-hide">
                {msgs.map(m => (
                    <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] px-3 py-2 rounded-xl text-[13px] leading-relaxed ${
                            m.sender === 'user'
                                ? dm ? 'bg-[#00C2FF] text-black rounded-tr-sm' : 'bg-blue-600 text-white rounded-tr-sm'
                                : dm ? 'bg-white/[0.05] text-white/90 border border-white/[0.06] rounded-tl-sm' : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                        }`}>
                            <p className="whitespace-pre-wrap">{m.text}</p>
                        </div>
                    </div>
                ))}
                {typing && (
                    <div className="flex justify-start">
                        <div className={`px-3 py-2 rounded-xl rounded-tl-sm ${dm ? 'bg-white/[0.05] border border-white/[0.06]' : 'bg-gray-100'}`}>
                            <div className="flex gap-1">
                                <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${dm ? 'bg-white/50' : 'bg-gray-400'}`} style={{ animationDelay: '0ms' }} />
                                <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${dm ? 'bg-white/50' : 'bg-gray-400'}`} style={{ animationDelay: '150ms' }} />
                                <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${dm ? 'bg-white/50' : 'bg-gray-400'}`} style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={endRef} />
            </div>

            {/* Input */}
            <div className={`p-2 border-t ${dm ? 'border-white/[0.06]' : 'border-gray-100'}`}>
                <div className={`flex items-end gap-1.5 rounded-xl p-1.5 ${dm ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-gray-50 border border-gray-200'}`}>
                    <textarea
                        value={inp}
                        onChange={e => setInp(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
                        placeholder="Type as customer..."
                        disabled={sending}
                        className={`flex-1 bg-transparent border-0 focus:ring-0 resize-none py-2 px-2 text-[13px] min-h-[36px] max-h-20 scrollbar-hide ${dm ? 'text-white placeholder-white/25' : 'text-gray-900 placeholder-gray-400'} disabled:opacity-50`}
                        rows={1}
                    />
                    <button
                        onClick={send}
                        disabled={!inp.trim() || sending}
                        className={`p-2 rounded-lg transition-all shrink-0 ${
                            inp.trim() && !sending
                                ? 'bg-[#00C2FF] text-black hover:bg-[#00A8E0]'
                                : dm ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {sending
                            ? <div className="w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin" />
                            : <ArrowUp className="w-3.5 h-3.5" />
                        }
                    </button>
                </div>
            </div>
        </div>
        </div>
    );
};

// --- Checklist widget (extracted to respect React hooks rules) ---
const ChecklistWidget = ({ items, locked, darkMode, onConfirm }: {
    items: WizardCheckItem[];
    locked: boolean;
    darkMode: boolean;
    onConfirm: (items: WizardCheckItem[]) => void;
}) => {
    const [localChecks, setLocalChecks] = useState<WizardCheckItem[]>(items);
    const dm = darkMode;
    return (
        <div className="mt-3 space-y-1.5">
            {localChecks.map(item => (
                <label
                    key={item.id}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                        locked ? 'opacity-60 pointer-events-none' : ''
                    } ${dm ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50'}`}
                >
                    <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => {
                            if (locked) return;
                            setLocalChecks(prev => prev.map(c => c.id === item.id ? { ...c, checked: !c.checked } : c));
                        }}
                        className="w-4 h-4 rounded border-2 accent-[#00C2FF] cursor-pointer"
                    />
                    <span className={`text-sm ${item.checked ? (dm ? 'text-white' : 'text-gray-900') : (dm ? 'text-white/60' : 'text-gray-600')}`}>
                        {item.label}
                    </span>
                </label>
            ))}
            {!locked && (
                <button
                    onClick={() => onConfirm(localChecks)}
                    className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all bg-[#00C2FF] text-black hover:bg-[#00A8E0]"
                >
                    Confirm selection
                </button>
            )}
        </div>
    );
};

const ChatView = ({ darkMode }: { darkMode: boolean }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [showTestBot, setShowTestBot] = useState(false);
    const [wizardStep, setWizardStep] = useState(0);
    const [wizardData, setWizardData] = useState<Record<string, string>>({});
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const API_BASE = import.meta.env.VITE_API_URL || (window.location.hostname !== 'localhost' ? '' : 'http://localhost:8000');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);

    // --- Helpers ---
    const addAiMsg = (text: string, extra?: Partial<Message>) => {
        setMessages(prev => [...prev, { id: Date.now() + Math.random(), text, sender: 'ai', timestamp: new Date(), ...extra }]);
    };
    const addUserMsg = (text: string) => {
        setMessages(prev => [...prev, { id: Date.now() + Math.random(), text, sender: 'user', timestamp: new Date() }]);
    };

    const [sessionId] = useState<string>(`session_${Date.now()}`);

    // Send prompt to real backend agent and return response
    const askAgent = async (prompt: string): Promise<string> => {
        const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).id : 'anonymous';
        const res = await fetch(`${API_BASE}/api/platform/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: prompt, user_id: userId, session_id: sessionId }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return data.content || '';
    };

    // Widgets for each step — frontend adds these to the agent's real response
    const STEP_WIDGETS: Record<number, Partial<Message>> = {
        0: { buttons: [
            { label: 'Sales Agent', value: 'Sales Agent', icon: '💼' },
            { label: 'Support Agent', value: 'Support Agent', icon: '🎧' },
            { label: 'Receptionist', value: 'Receptionist', icon: '📞' },
            { label: 'Recruiter', value: 'Recruiter', icon: '👤' },
            { label: 'Marketing Agent', value: 'Marketing Agent', icon: '📊' },
            { label: 'Custom', value: 'Custom Agent', icon: '⚙️' },
        ]},
        1: { buttons: [
            { label: 'Answer client questions', value: 'Answer incoming client questions and provide information' },
            { label: 'Generate leads', value: 'Qualify and generate leads from incoming requests' },
            { label: 'Process orders', value: 'Process and track customer orders' },
            { label: 'Book appointments', value: 'Schedule calls and appointments with clients' },
            { label: 'Technical support', value: 'Resolve technical issues and support tickets' },
        ]},
        3: { checklist: [
            { id: 'goal_leads', label: 'Lead generation', checked: false },
            { id: 'goal_sales', label: 'Close sales', checked: false },
            { id: 'goal_consult', label: 'Consultations', checked: false },
            { id: 'goal_call', label: 'Book a call / demo', checked: false },
            { id: 'goal_qualify', label: 'Qualify prospects', checked: false },
            { id: 'goal_support', label: 'Customer support', checked: false },
            { id: 'goal_upsell', label: 'Upsell / Cross-sell', checked: false },
            { id: 'goal_followup', label: 'Follow-ups & reminders', checked: false },
        ]},
        4: { checklist: [
            { id: 'tone_friendly', label: 'Friendly & casual', checked: false },
            { id: 'tone_formal', label: 'Professional & formal', checked: false },
            { id: 'tone_concise', label: 'Concise & to the point', checked: false },
            { id: 'tone_emoji', label: 'Uses emojis', checked: false },
            { id: 'tone_proactive', label: 'Proactive (asks follow-up questions)', checked: true },
            { id: 'tone_escalate', label: 'Knows when to escalate to human', checked: true },
        ]},
        5: { fileUpload: true },
        6: { checklist: [
            { id: 'ch_whatsapp', label: 'WhatsApp', checked: false },
            { id: 'ch_telegram', label: 'Telegram', checked: false },
            { id: 'ch_instagram', label: 'Instagram DMs', checked: false },
            { id: 'ch_email', label: 'Email', checked: false },
            { id: 'ch_website', label: 'Website chat widget', checked: true },
            { id: 'ch_phone', label: 'Phone / Voice', checked: false },
        ]},
    };

    // Prompts sent to the real agent for each step transition
    const buildStepPrompt = (step: number, d: Record<string, string>): string => {
        const ctx = `[SYSTEM CONTEXT: You are X100 Architect — an AI that guides users through creating AI agents for their business. Be concise (2-4 sentences). The user is on step ${step + 1} of 7 in the agent creation wizard. Summary so far: ${JSON.stringify(d)}]\n\n`;

        switch (step) {
            case 0: return ctx + 'Greet the user and ask what type of AI agent they want to create. Mention options like Sales, Support, Receptionist, Recruiter, Marketing, or Custom.';
            case 1: return ctx + `The user chose "${d.role}". Acknowledge their choice positively and ask what the main task/job of this agent should be. Give examples relevant to the role.`;
            case 2: return ctx + `The agent role is "${d.role}" with task "${d.task}". Now ask the user to briefly describe their business — industry, product/service, target audience. Be encouraging.`;
            case 3: return ctx + `Business: "${d.business}". Now ask the user to select the goals for this agent. Mention that they can pick multiple: lead generation, closing sales, consultations, booking calls, qualifying prospects, support, upselling, follow-ups.`;
            case 4: return ctx + `Goals selected: "${d.goals}". Now ask about the communication style/tone the agent should use — friendly, formal, concise, uses emojis, proactive, knows when to escalate.`;
            case 5: return ctx + `Tone: "${d.tone}". Ask the user to upload company documents — FAQ, product catalog, price lists, scripts — so the agent can learn the business. Mention they can skip if they want to add later.`;
            case 6: return ctx + `Documents: ${uploadedFiles.length > 0 ? uploadedFiles.join(', ') : 'none yet'}. Ask which channels the agent should work on: WhatsApp, Telegram, Instagram DMs, Email, Website chat, Phone.`;
            case 7: return ctx + `All data collected. Present a brief summary of the configured agent and say it's ready to deploy. Role: ${d.role}, Task: ${d.task}, Business: ${d.business}, Goals: ${d.goals}, Tone: ${d.tone}, Docs: ${uploadedFiles.length}, Channels: ${d.channels}.`;
            default: return ctx + d.lastMsg;
        }
    };

    // --- Advance wizard: calls real agent + appends widgets ---
    const advanceWizard = async (step: number, data: Record<string, string>) => {
        const d = { ...wizardData, ...data };
        setWizardData(d);
        setWizardStep(step);
        setIsTyping(true);

        try {
            const prompt = buildStepPrompt(step, d);
            const agentText = await askAgent(prompt);
            setIsTyping(false);

            if (step === 7) {
                // Summary step
                addAiMsg(agentText, {
                    summary: {
                        'Agent type': d.role || '—',
                        'Main task': d.task || '—',
                        'Business': d.business || '—',
                        'Goals': d.goals || '—',
                        'Communication style': d.tone || '—',
                        'Documents': uploadedFiles.length > 0 ? uploadedFiles.join(', ') : 'None uploaded',
                        'Channels': d.channels || '—',
                    }
                });
                setTimeout(() => {
                    addAiMsg("", {
                        buttons: [
                            { label: 'Deploy Agent', value: '__deploy__' },
                            { label: 'Edit settings', value: '__edit__' },
                            { label: 'Start over', value: '__restart__' },
                        ]
                    });
                }, 400);
            } else {
                addAiMsg(agentText, STEP_WIDGETS[step] || {});
            }
        } catch {
            setIsTyping(false);
            // Fallback if backend is down
            const fallbacks: Record<number, string> = {
                0: "Welcome! Let's create your AI agent. What role should they perform?",
                1: `${d.role} — great choice! What is the main task for this agent?`,
                2: "Now tell me about your business: industry, product/service, target audience.",
                3: "Select the goals for your agent:",
                4: "What communication style should the agent use?",
                5: "Upload company documents so the agent knows your business (FAQ, catalogs, scripts).",
                6: "Which channels should this agent work on?",
                7: "Your agent is configured! Here's the summary:",
            };
            if (step === 7) {
                addAiMsg(fallbacks[7] || '', {
                    summary: {
                        'Agent type': d.role || '—', 'Main task': d.task || '—', 'Business': d.business || '—',
                        'Goals': d.goals || '—', 'Communication style': d.tone || '—',
                        'Documents': uploadedFiles.length > 0 ? uploadedFiles.join(', ') : 'None',
                        'Channels': d.channels || '—',
                    }
                });
                setTimeout(() => addAiMsg("", { buttons: [
                    { label: 'Deploy Agent', value: '__deploy__' },
                    { label: 'Edit settings', value: '__edit__' },
                    { label: 'Start over', value: '__restart__' },
                ]}), 400);
            } else {
                addAiMsg(fallbacks[step] || "Let's continue.", STEP_WIDGETS[step] || {});
            }
        }
    };

    // --- Init: ask real agent for first message ---
    useEffect(() => {
        if (messages.length === 0) {
            (async () => {
                setIsTyping(true);
                try {
                    const text = await askAgent(buildStepPrompt(0, {}));
                    setIsTyping(false);
                    addAiMsg(text, STEP_WIDGETS[0]);
                } catch {
                    setIsTyping(false);
                    addAiMsg("Welcome! I'm the X100 Architect. Let's create your AI agent step by step.\n\nFirst — what kind of agent do you need?", STEP_WIDGETS[0]);
                }
            })();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- Button click handler ---
    const handleButtonClick = (value: string) => {
        if (value === '__deploy__') {
            addUserMsg('Deploy Agent');
            setIsTyping(true);
            (async () => {
                try {
                    const text = await askAgent(`[SYSTEM: The user clicked "Deploy Agent". Confirm the agent has been deployed successfully. Suggest testing it. Be enthusiastic and brief.]`);
                    setIsTyping(false);
                    addAiMsg(text);
                } catch {
                    setIsTyping(false);
                    addAiMsg("Agent deployed successfully! You can now test it using the Test Agent panel on the right. →");
                }
                setShowTestBot(true);
            })();
            return;
        }
        if (value === '__restart__') {
            setMessages([]);
            setWizardStep(0);
            setWizardData({});
            setUploadedFiles([]);
            return;
        }
        if (value === '__edit__') {
            addUserMsg('Edit settings');
            (async () => {
                setIsTyping(true);
                try {
                    const text = await askAgent(`[SYSTEM: The user wants to edit the agent settings. Ask what they'd like to change. Current config: ${JSON.stringify(wizardData)}]`);
                    setIsTyping(false);
                    addAiMsg(text);
                } catch {
                    setIsTyping(false);
                    addAiMsg("Sure! Just type what you'd like to change and I'll update the configuration.");
                }
            })();
            return;
        }

        if (wizardStep === 0) {
            addUserMsg(value);
            advanceWizard(1, { role: value });
        } else if (wizardStep === 1) {
            addUserMsg(value);
            advanceWizard(2, { task: value });
        }
    };

    // --- Checklist confirm handler ---
    const handleChecklistConfirm = (msgId: number, items: WizardCheckItem[]) => {
        const selected = items.filter(i => i.checked).map(i => i.label).join(', ') || 'None selected';
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, checklist: items } : m));
        addUserMsg(selected);

        if (wizardStep === 3) {
            advanceWizard(4, { goals: selected });
        } else if (wizardStep === 4) {
            advanceWizard(5, { tone: selected });
        } else if (wizardStep === 6) {
            advanceWizard(7, { channels: selected });
        }
    };

    // --- File upload handler ---
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const names = Array.from(files).map((f: File) => f.name);
        setUploadedFiles(prev => [...prev, ...names]);
    };

    const handleFilesConfirm = () => {
        addUserMsg(uploadedFiles.length > 0 ? `Uploaded: ${uploadedFiles.join(', ')}` : 'Skip documents');
        advanceWizard(6, {});
    };

    // --- Voice Recording (MediaRecorder → Whisper) ---
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            audioChunksRef.current = [];
            mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
            mediaRecorder.onstop = () => { stream.getTracks().forEach(t => t.stop()); };
            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error('[Mic] Could not access microphone:', err);
        }
    };

    const stopRecordingAndTranscribe = async (): Promise<string | null> => {
        return new Promise((resolve) => {
            const recorder = mediaRecorderRef.current;
            if (!recorder || recorder.state !== 'recording') { setIsRecording(false); resolve(null); return; }
            recorder.onstop = async () => {
                recorder.stream.getTracks().forEach(t => t.stop());
                setIsRecording(false);
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                if (audioBlob.size < 1000) { resolve(null); return; }
                setIsTranscribing(true);
                try {
                    const formData = new FormData();
                    formData.append('file', audioBlob, 'recording.webm');
                    const res = await fetch(`${API_BASE}/api/transcribe`, { method: 'POST', body: formData });
                    if (!res.ok) throw new Error('Transcription failed');
                    const data = await res.json();
                    resolve(data.text || null);
                } catch { resolve(null); } finally { setIsTranscribing(false); }
            };
            recorder.stop();
        });
    };

    const toggleRecording = async () => {
        if (isRecording) {
            const text = await stopRecordingAndTranscribe();
            if (text) setInput(prev => prev ? prev + ' ' + text : text);
        } else {
            await startRecording();
        }
    };

    // --- Free-text send (for steps that accept typed input) ---
    const handleSend = async () => {
        if (isSending || isTranscribing) return;

        if (isRecording) {
            const transcribed = await stopRecordingAndTranscribe();
            const fullText = [input, transcribed].filter(Boolean).join(' ').trim();
            if (fullText) { setInput(''); handleTextSubmit(fullText); }
            return;
        }
        if (!input.trim()) return;
        const text = input;
        setInput('');
        handleTextSubmit(text);
    };

    const handleTextSubmit = (text: string) => {
        addUserMsg(text);

        // Route based on wizard step
        if (wizardStep === 0) {
            advanceWizard(1, { role: text });
        } else if (wizardStep === 1) {
            advanceWizard(2, { task: text });
        } else if (wizardStep === 2) {
            advanceWizard(3, { business: text });
        } else {
            // Free-text fallback — send to backend
            sendToBackend(text);
        }
    };

    const sendToBackend = async (text: string) => {
        setIsSending(true);
        setIsTyping(true);
        try {
            const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).id : 'anonymous';
            const res = await fetch(`${API_BASE}/api/platform/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, user_id: userId, session_id: `session_${Date.now()}` }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            addAiMsg(data.content);
        } catch {
            addAiMsg("I'll note that. Anything else you'd like to adjust?");
        } finally {
            setIsSending(false);
            setIsTyping(false);
        }
    };

    return (
        <div className="flex h-full w-full relative">
            {/* Main Architect Chat */}
            <div className={`flex flex-col h-full flex-1 min-w-0 ${showTestBot ? '' : 'max-w-4xl mx-auto'} w-full relative`}>
                 <div className="flex-grow overflow-y-auto px-4 py-8 space-y-6 scrollbar-hide">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] md:max-w-[70%] ${msg.sender === 'user' ? 'p-4' : 'p-4'} rounded-2xl ${
                                msg.sender === 'user'
                                    ? (darkMode ? 'bg-white text-black rounded-tr-sm' : 'bg-blue-600 text-white rounded-tr-sm')
                                    : (darkMode ? 'bg-white/[0.04] backdrop-blur-md text-white border border-white/8 rounded-tl-sm' : 'bg-white text-gray-900 border border-gray-200 shadow-sm rounded-tl-sm')
                            } shadow-lg`}>
                                {msg.sender === 'ai' && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#00C2FF] to-purple-500"></div>
                                        <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Architect AI</span>
                                    </div>
                                )}
                                {msg.text && <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>}

                                {/* Wizard: Button choices */}
                                {msg.buttons && msg.buttons.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {msg.buttons.map(btn => (
                                            <button
                                                key={btn.value}
                                                onClick={() => handleButtonClick(btn.value)}
                                                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 border cursor-pointer ${
                                                    darkMode
                                                        ? 'border-white/10 bg-white/[0.03] hover:bg-[#00C2FF]/10 hover:border-[#00C2FF]/30 hover:text-[#00C2FF] text-white/80'
                                                        : 'border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 text-gray-700'
                                                }`}
                                            >
                                                {btn.icon && <span className="mr-1.5">{btn.icon}</span>}{btn.label}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Wizard: Checklist */}
                                {msg.checklist && msg.checklist.length > 0 && (
                                    <ChecklistWidget
                                        items={msg.checklist}
                                        locked={messages.findIndex(m => m.id === msg.id) < messages.length - 1}
                                        darkMode={darkMode}
                                        onConfirm={(items) => handleChecklistConfirm(msg.id, items)}
                                    />
                                )}

                                {/* Wizard: File upload */}
                                {msg.fileUpload && (() => {
                                    const isLocked = messages.findIndex(m => m.id === msg.id) < messages.length - 1;
                                    return (
                                        <div className="mt-3">
                                            {uploadedFiles.length > 0 && (
                                                <div className="space-y-1 mb-3">
                                                    {uploadedFiles.map((f, i) => (
                                                        <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${darkMode ? 'bg-white/[0.03] text-white/70' : 'bg-gray-50 text-gray-600'}`}>
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                                            {f}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {!isLocked && (
                                                <div className="flex gap-2">
                                                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />
                                                    <button
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${darkMode ? 'border-white/10 text-white/70 hover:bg-white/5' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                                    >
                                                        + Add files
                                                    </button>
                                                    <button
                                                        onClick={handleFilesConfirm}
                                                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#00C2FF] text-black hover:bg-[#00A8E0] transition-all"
                                                    >
                                                        {uploadedFiles.length > 0 ? 'Continue' : 'Skip for now'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}

                                {/* Wizard: Summary card */}
                                {msg.summary && (
                                    <div className={`mt-3 rounded-xl overflow-hidden ${darkMode ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-gray-50 border border-gray-200'}`}>
                                        {Object.entries(msg.summary).map(([key, val]) => (
                                            <div key={key} className={`flex px-4 py-2.5 text-sm ${darkMode ? 'border-b border-white/[0.04] last:border-0' : 'border-b border-gray-100 last:border-0'}`}>
                                                <span className={`w-40 shrink-0 font-medium ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{key}</span>
                                                <span className={`flex-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{val}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className={`max-w-[80%] md:max-w-[65%] p-4 rounded-2xl rounded-tl-sm shadow-lg ${darkMode ? 'bg-white/[0.04] backdrop-blur-md border border-white/8' : 'bg-white border border-gray-200'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#00C2FF] to-purple-500"></div>
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Architect AI</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-white/60' : 'bg-gray-400'}`} style={{ animationDelay: '0ms' }}></div>
                                    <div className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-white/60' : 'bg-gray-400'}`} style={{ animationDelay: '150ms' }}></div>
                                    <div className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-white/60' : 'bg-gray-400'}`} style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                 </div>

                 <div className={`p-4 md:p-6 bg-gradient-to-t ${darkMode ? 'from-[#080a10] via-[#080a10]' : 'from-gray-50 via-gray-50'} to-transparent`}>
                     <div className={`relative rounded-2xl p-2 shadow-2xl flex items-end gap-2 ${darkMode ? 'glass-input' : 'bg-white/80 backdrop-blur-xl border border-gray-200'}`}>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                            placeholder={isRecording ? "Recording... click send when done" : isTranscribing ? "Transcribing..." : isSending ? "Sending..." : "Describe the agent you want to create..."}
                            disabled={isSending || isTranscribing}
                            className={`flex-grow bg-transparent border-0 placeholder:text-gray-500 focus:ring-0 resize-none py-3 px-3 max-h-32 min-h-[48px] scrollbar-hide text-sm ${darkMode ? 'text-white' : 'text-gray-900'} disabled:opacity-50`}
                            rows={1}
                        />
                        <button
                            onClick={toggleRecording}
                            disabled={isSending || isTranscribing}
                            className={`p-3 transition-colors rounded-xl relative ${
                                isRecording
                                    ? 'text-red-400 bg-red-500/10 animate-pulse'
                                    : darkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-black hover:bg-gray-100'
                            } disabled:opacity-50`}
                            title={isRecording ? 'Stop recording' : 'Voice input (Whisper)'}
                        >
                            <MicIcon />
                            {isRecording && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={(!input.trim() && !isRecording) || isSending || isTranscribing}
                            className={`p-3 rounded-xl transition-all duration-200 ${(input.trim() || isRecording) && !isSending && !isTranscribing ? (darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800') : (darkMode ? 'bg-white/5 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed')}`}
                        >
                            {isSending || isTranscribing ? (
                                <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <ArrowUp className="w-5 h-5" />
                            )}
                        </button>
                     </div>
                     <p className="text-center text-[10px] text-gray-600 mt-3 font-mono">
                        AI Architect can make mistakes. Review generated configurations.
                     </p>
                 </div>
            </div>

            {/* Test Bot Toggle */}
            <button
                onClick={() => setShowTestBot(!showTestBot)}
                className={`absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    showTestBot
                        ? darkMode ? 'bg-[#00C2FF]/10 text-[#00C2FF] border border-[#00C2FF]/20' : 'bg-blue-50 text-blue-600 border border-blue-200'
                        : darkMode ? 'bg-white/5 text-white/50 border border-white/[0.06] hover:bg-white/10 hover:text-white/80' : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                }`}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Test Agent
            </button>

            {/* Test Bot Panel (right side) */}
            {showTestBot && (
                <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 370, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="shrink-0 self-center flex items-center justify-center py-4 pr-4"
                >
                    <TestBotPanel darkMode={darkMode} />
                </motion.div>
            )}
        </div>
    );
};

const WorkforceView = ({ agents, onEditAgent, onDeployAgent, darkMode }: { agents: Agent[], onEditAgent: (agent: Agent) => void, onDeployAgent: () => void, darkMode: boolean }) => {
    const dm = darkMode;
    return (
        <div className="p-8 max-w-6xl mx-auto w-full">
            <h2 className={`text-3xl font-serif mb-8 ${dm ? 'text-white' : 'text-gray-900'}`}>My Workforce</h2>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className={`p-6 rounded-2xl ${dm ? 'glass-stat' : 'bg-white border border-gray-200 shadow-sm'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${dm ? 'icon-bg-emerald' : 'bg-green-50'}`}>
                            <UsersIcon className="w-3.5 h-3.5 icon-emerald" />
                        </div>
                        <p className={`text-xs font-mono uppercase tracking-widest ${dm ? 'text-white/40' : 'text-gray-500'}`}>Active Agents</p>
                    </div>
                    <div className="flex items-end gap-3">
                        <p className={`text-3xl font-medium ${dm ? 'text-white' : 'text-gray-900'}`}>{agents.filter(a => a.status === 'active').length}<span className={`text-lg ${dm ? 'text-white/30' : 'text-gray-400'}`}>/5</span></p>
                        <p className="text-emerald-400 text-sm font-mono mb-1.5 flex items-center">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2"></span> Online
                        </p>
                    </div>
                </div>
                <div className={`p-6 rounded-2xl ${dm ? 'glass-stat' : 'bg-white border border-gray-200 shadow-sm'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${dm ? 'icon-bg-cyan' : 'bg-blue-50'}`}>
                            <ChatBubbleIcon className="w-3.5 h-3.5 icon-cyan" />
                        </div>
                        <p className={`text-xs font-mono uppercase tracking-widest ${dm ? 'text-white/40' : 'text-gray-500'}`}>Total Conversations</p>
                    </div>
                    <div className="flex items-end gap-3">
                        <p className={`text-3xl font-medium ${dm ? 'text-white' : 'text-gray-900'}`}>5,480</p>
                        <p className="text-emerald-400 text-sm font-mono mb-1.5 flex items-center">
                            <TrendingUpIcon className="w-4 h-4 mr-1" /> +8.2%
                        </p>
                    </div>
                </div>
                <div className={`p-6 rounded-2xl ${dm ? 'glass-stat' : 'bg-white border border-gray-200 shadow-sm'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${dm ? 'icon-bg-amber' : 'bg-yellow-50'}`}>
                            <TrendingUpIcon className="w-3.5 h-3.5 icon-amber" />
                        </div>
                        <p className={`text-xs font-mono uppercase tracking-widest ${dm ? 'text-white/40' : 'text-gray-500'}`}>Est. Cost Saved</p>
                    </div>
                    <div className="flex items-end gap-3">
                        <p className="text-3xl text-emerald-400 font-medium">$12,400</p>
                        <p className={`text-sm font-mono mb-1.5 ${dm ? 'text-white/30' : 'text-gray-500'}`}>vs Human</p>
                    </div>
                </div>
            </div>

            {/* Agent Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map((agent) => (
                    <div
                        key={agent.id}
                        onClick={() => onEditAgent(agent)}
                        className={`group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 cursor-pointer relative overflow-hidden
                        ${dm ? 'glass-card' : 'bg-white border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'}`}
                    >
                        <div className="absolute top-4 right-4">
                            <div className={`w-2.5 h-2.5 rounded-full ${agent.status === 'active' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]'}`}></div>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className={`w-14 h-14 rounded-xl overflow-hidden ring-2 ${dm ? 'ring-white/10 bg-white/10' : 'ring-gray-100 bg-gray-50'}`}>
                                <img src={agent.image} alt={agent.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h3 className={`font-medium text-lg ${dm ? 'text-white' : 'text-gray-900'}`}>{agent.name}</h3>
                                <p className={`text-sm ${dm ? 'text-white/50' : 'text-gray-500'}`}>{agent.role}</p>
                            </div>
                        </div>

                        {agent.description && (
                            <p className={`text-xs mb-4 leading-relaxed ${dm ? 'text-white/35' : 'text-gray-400'}`}>{agent.description}</p>
                        )}

                        <div className={`grid grid-cols-2 gap-4 border-t pt-4 ${dm ? 'border-white/8' : 'border-gray-100'}`}>
                            <div>
                                <p className={`text-[10px] uppercase tracking-wider ${dm ? 'text-white/30' : 'text-gray-400'}`}>Conversations</p>
                                <p className={`font-mono font-medium ${dm ? 'text-white/90' : 'text-gray-900'}`}>{agent.stats.conversations.toLocaleString()}</p>
                            </div>
                             <div>
                                <p className={`text-[10px] uppercase tracking-wider ${dm ? 'text-white/30' : 'text-gray-400'}`}>Leads</p>
                                <p className={`font-mono font-medium ${dm ? 'text-white/90' : 'text-gray-900'}`}>{agent.stats.leads.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add New Card */}
                <button
                    onClick={onDeployAgent}
                    className={`border border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-4 transition-all duration-300 group hover:-translate-y-1 ${dm ? 'border-white/10 hover:border-white/20 hover:bg-white/[0.03]' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
                >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${dm ? 'bg-white/5 group-hover:bg-white/10' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                        <PlusIcon />
                    </div>
                    <span className={`text-sm font-medium ${dm ? 'text-white/40 group-hover:text-white/60' : 'text-gray-400'}`}>Deploy New Agent</span>
                </button>
            </div>
        </div>
    );
};

const AnalyticsView = ({ darkMode }: { darkMode: boolean }) => {
    const [timeframe, setTimeframe] = useState<'1W' | '1M' | '3M' | '6M' | '1Y'>('1M');

    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            <h2 className={`text-3xl font-serif mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Performance Analytics</h2>

            {/* Top Cards (KPIs) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 <div className={`p-6 rounded-2xl ${darkMode ? 'glass-stat' : 'bg-white border border-gray-200 shadow-sm'}`}>
                    <div className="flex items-center gap-2 mb-1">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${darkMode ? 'icon-bg-emerald' : 'bg-green-50'}`}>
                            <TrendingUpIcon className="w-3.5 h-3.5 icon-emerald" />
                        </div>
                        <p className={`text-xs font-mono uppercase tracking-widest ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>Total Revenue</p>
                    </div>
                    <div className="flex items-end gap-3">
                        <p className={`text-4xl font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>$325,321</p>
                        <p className="text-green-400 text-sm font-mono mb-1.5 flex items-center">
                            <TrendingUpIcon className="w-4 h-4 mr-1" /> +12%
                        </p>
                    </div>
                </div>
                 <div className={`p-6 rounded-2xl ${darkMode ? 'glass-stat' : 'bg-white border border-gray-200 shadow-sm'}`}>
                    <div className="flex items-center gap-2 mb-1">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${darkMode ? 'icon-bg-cyan' : 'bg-blue-50'}`}>
                            <UsersIcon className="w-3.5 h-3.5 icon-cyan" />
                        </div>
                        <p className={`text-xs font-mono uppercase tracking-widest ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>Active Leads</p>
                    </div>
                     <div className="flex items-end gap-3">
                        <p className={`text-4xl font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>1,240</p>
                        <p className="text-green-400 text-sm font-mono mb-1.5 flex items-center">
                            <TrendingUpIcon className="w-4 h-4 mr-1" /> +5.4%
                        </p>
                    </div>
                </div>
                 <div className={`p-6 rounded-2xl ${darkMode ? 'glass-stat' : 'bg-white border border-gray-200 shadow-sm'}`}>
                    <div className="flex items-center gap-2 mb-1">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${darkMode ? 'icon-bg-purple' : 'bg-purple-50'}`}>
                            <ChatBubbleIcon className="w-3.5 h-3.5 icon-purple" />
                        </div>
                        <p className={`text-xs font-mono uppercase tracking-widest ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>Avg. Response Time</p>
                    </div>
                     <div className="flex items-end gap-3">
                        <p className={`text-4xl font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>45s</p>
                        <p className="text-green-400 text-sm font-mono mb-1.5 flex items-center">
                             -98% vs Human
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Main Chart Card */}
                <div className={`p-8 rounded-3xl ${darkMode ? 'glass-card' : 'bg-white border border-gray-200 shadow-sm'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-500 text-xs font-mono uppercase tracking-widest">Revenue Growth</p>
                    </div>
                    <div>
                        <span className={`text-3xl font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>$45,200</span>
                        <span className="text-green-400 text-sm ml-3 font-mono">+3.9% this month</span>
                    </div>

                    <RevenueChart darkMode={darkMode} />

                    <div className="flex gap-2 mt-6">
                        {['1W', '1M', '3M', '6M', '1Y', '2Y'].map((tf) => (
                            <button 
                                key={tf}
                                onClick={() => setTimeframe(tf as any)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                                    timeframe === tf 
                                        ? (darkMode ? 'bg-white/10 text-white' : 'bg-gray-200 text-black') 
                                        : (darkMode ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-black')
                                }`}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Allocation / Breakdown Card */}
                <div className={`p-8 rounded-3xl flex flex-col ${darkMode ? 'glass-card' : 'bg-white border border-gray-200 shadow-sm'}`}>
                    <div className="mb-6">
                        <p className="text-gray-500 text-xs font-mono uppercase tracking-widest mb-1">Lead Sources</p>
                        <h3 className={`text-xl font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Traffic Allocation</h3>
                    </div>

                    <div className="space-y-6 flex-grow">
                        <ProgressBar label="Inbound (Website)" percentage={40.2} modelPercentage={56} color="bg-blue-500" darkMode={darkMode} />
                        <ProgressBar label="Outbound (Email)" percentage={14.2} modelPercentage={24} color="bg-yellow-500" darkMode={darkMode} />
                        <ProgressBar label="WhatsApp / Chat" percentage={25} modelPercentage={31} color="bg-orange-500" darkMode={darkMode} />
                        <ProgressBar label="Referral" percentage={37.6} modelPercentage={18.3} color="bg-green-500" darkMode={darkMode} />
                    </div>
                </div>
            </div>
            
            {/* Insights Row */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className={`p-6 rounded-2xl col-span-1 lg:col-span-2 ${darkMode ? 'glass-card' : 'bg-white border border-gray-200 shadow-sm'}`}>
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-gray-500 text-xs font-mono uppercase tracking-widest">Business Insights</p>
                         <div className="flex gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            <span className="text-[10px] text-blue-400 font-mono uppercase">AI Analysis</span>
                         </div>
                    </div>
                    <div className="space-y-4">
                         <div className={`flex gap-4 p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                             <TrendingUpIcon className="text-green-400 w-6 h-6 shrink-0" />
                             <div>
                                 <h4 className={`text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Conversion Spike Detected</h4>
                                 <p className="text-xs text-gray-400 leading-relaxed">Sales Agent 'Alex' has increased conversion rates by 15% during off-hours (6 PM - 12 AM). Recommendation: Scale ad spend during these hours.</p>
                             </div>
                         </div>
                         <div className={`flex gap-4 p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                             <TrendingDownIcon className="text-red-400 w-6 h-6 shrink-0" />
                             <div>
                                 <h4 className={`text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Churn Risk Alert</h4>
                                 <p className="text-xs text-gray-400 leading-relaxed">Engagement with 'Enterprise' leads has dropped 8% this week. Suggest updating the follow-up script for high-value prospects.</p>
                             </div>
                         </div>
                    </div>
                </div>

                <div className={`p-6 rounded-2xl ${darkMode ? 'glass-card' : 'bg-white border border-gray-200 shadow-sm'}`}>
                     <p className="text-gray-500 text-xs font-mono uppercase tracking-widest mb-4">Markets at a Glance</p>
                     
                     <div className="space-y-6">
                        <div>
                             <div className="flex justify-between items-end mb-2">
                                 <div>
                                     <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ad Spend</p>
                                     <p className="text-[10px] text-gray-500">Google Ads</p>
                                 </div>
                                 <div className="text-right">
                                     <p className={`text-sm font-mono ${darkMode ? 'text-white' : 'text-gray-900'}`}>$42.34k</p>
                                     <p className="text-[10px] text-green-400 font-mono">1.78% ↗</p>
                                 </div>
                             </div>
                             {/* Mini Sparkline */}
                             <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 20">
                                 <path d="M0,15 Q10,5 20,10 T40,15 T60,5 T80,10 T100,5" fill="none" stroke={darkMode ? "#fff" : "#9ca3af"} strokeWidth="1.5" strokeOpacity="0.5" />
                             </svg>
                        </div>
                        
                         <div>
                             <div className="flex justify-between items-end mb-2">
                                 <div>
                                     <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>CAC</p>
                                     <p className="text-[10px] text-gray-500">Cost per Customer</p>
                                 </div>
                                 <div className="text-right">
                                     <p className={`text-sm font-mono ${darkMode ? 'text-white' : 'text-gray-900'}`}>$18.96</p>
                                     <p className="text-[10px] text-red-400 font-mono">7.83% ↘</p>
                                 </div>
                             </div>
                             {/* Mini Sparkline Red */}
                             <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 20">
                                 <path d="M0,5 Q10,15 20,10 T40,5 T60,15 T80,10 T100,15" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.8" />
                             </svg>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

const SettingsView = ({ darkMode }: { darkMode: boolean; toggleDarkMode: () => void }) => {
    return (
        <div className="p-8 max-w-4xl mx-auto w-full">
            <h2 className={`text-3xl font-serif mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h2>

            <div className={`rounded-2xl overflow-hidden mb-8 ${darkMode ? 'glass-card' : 'bg-white border border-gray-200 shadow-sm'}`}>
                <div className={`p-8 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${darkMode ? 'border-white/8' : 'border-gray-200'}`}>
                    <div>
                        <p className="text-gray-500 text-xs font-mono uppercase tracking-widest mb-1">Current Plan</p>
                        <h3 className={`text-3xl font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Pro Plan</h3>
                    </div>
                    <div className="text-right">
                        <p className={`text-2xl font-mono ${darkMode ? 'text-white' : 'text-gray-900'}`}>$89<span className="text-sm text-gray-500">/mo</span></p>
                        <p className="text-xs text-green-400">Next billing: Apr 12, 2026</p>
                    </div>
                </div>
                <div className={`p-8 ${darkMode ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                    <div className={`mb-4 flex justify-between text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <span>Agent Usage</span>
                        <span>3 / 5 Agents</span>
                    </div>
                    <div className={`w-full rounded-full h-2 mb-6 ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                        <div className="bg-[#00C2FF] h-2 rounded-full w-[60%]"></div>
                    </div>
                    <button className={`text-sm border rounded-lg px-4 py-2 transition-colors ${darkMode ? 'text-white border-white/20 hover:bg-white hover:text-black' : 'text-gray-900 border-gray-300 hover:bg-black hover:text-white'}`}>
                        Manage Subscription
                    </button>
                </div>
            </div>

            <div className={`rounded-2xl p-8 ${darkMode ? 'glass-card' : 'bg-white border border-gray-200 shadow-sm'}`}>
                <h4 className={`font-medium mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Profile Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-xs text-gray-500">Email Address</label>
                        <input type="email" value="alex@example.com" disabled className={`w-full rounded-lg px-4 py-3 cursor-not-allowed ${darkMode ? 'glass-input text-gray-400 opacity-60' : 'bg-gray-50 border border-gray-200 text-gray-500'}`} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-gray-500">Company Name</label>
                        <input type="text" defaultValue="Acme Corp" className={`w-full rounded-lg px-4 py-3 outline-none ${darkMode ? 'glass-input text-white' : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-black'}`} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- New Views: Channels, Knowledge Base, Conversations ---

// --- Agent Filter Selector (shared across views) ---
const AgentFilter = ({ agents, selectedId, onChange, darkMode }: { agents: Agent[]; selectedId: string; onChange: (id: string) => void; darkMode: boolean }) => {
    const dm = darkMode;
    return (
        <div className="flex items-center gap-1.5 flex-wrap">
            <button
                onClick={() => onChange('all')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedId === 'all' ? (dm ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-900') : (dm ? 'text-gray-500 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100')}`}
            >
                All Agents
            </button>
            {agents.map(agent => (
                <button
                    key={agent.id}
                    onClick={() => onChange(agent.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedId === agent.id ? (dm ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-900') : (dm ? 'text-gray-500 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100')}`}
                >
                    <img src={agent.image} alt="" className="w-4 h-4 rounded-full" />
                    {agent.name}
                    <span className={`w-1.5 h-1.5 rounded-full ${agent.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                </button>
            ))}
        </div>
    );
};

const ChannelsListView = ({ darkMode, agents }: { darkMode: boolean; agents: Agent[] }) => {
    const dm = darkMode;
    const [selectedAgent, setSelectedAgent] = useState('all');

    const filteredAgents = selectedAgent === 'all' ? agents : agents.filter(a => a.id === selectedAgent);

    return (
        <div className="p-8 max-w-6xl mx-auto w-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className={`text-3xl font-serif ${dm ? 'text-white' : 'text-gray-900'}`}>Channels</h2>
                <button className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${dm ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>
                    <PlusIcon /> Connect Channel
                </button>
            </div>

            <div className="mb-6">
                <AgentFilter agents={agents} selectedId={selectedAgent} onChange={setSelectedAgent} darkMode={dm} />
            </div>

            {filteredAgents.map(agent => (
                <div key={agent.id} className="mb-8 last:mb-0">
                    {/* Agent header */}
                    {(selectedAgent === 'all') && (
                        <div className="flex items-center gap-3 mb-4">
                            <img src={agent.image} alt="" className="w-8 h-8 rounded-full" />
                            <div>
                                <h3 className={`text-sm font-medium ${dm ? 'text-white' : 'text-gray-900'}`}>{agent.name}</h3>
                                <p className="text-[10px] text-gray-500 font-mono uppercase">{agent.role}</p>
                            </div>
                            <span className={`ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full ${agent.status === 'active' ? (dm ? 'bg-emerald-500/10 text-emerald-400' : 'bg-green-50 text-green-600') : (dm ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600')}`}>{agent.status}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {agent.channels.map(ch => (
                            <div key={`${agent.id}-${ch.id}`} className={`p-5 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 cursor-pointer group ${dm ? 'glass-card' : 'bg-white border border-gray-200 shadow-sm hover:shadow-md'}`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${dm ? 'bg-white/5' : 'bg-gray-50'}`}>
                                        {ch.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`font-medium text-sm ${dm ? 'text-white' : 'text-gray-900'}`}>{ch.name}</h3>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className={`w-1.5 h-1.5 rounded-full ${ch.status === 'connected' ? 'bg-emerald-500' : ch.status === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-gray-500'}`} />
                                            <span className="text-[10px] text-gray-500 font-mono uppercase">{ch.status}</span>
                                        </div>
                                    </div>
                                </div>
                                {ch.status === 'connected' && (
                                    <div className={`pt-3 border-t ${dm ? 'border-white/5' : 'border-gray-100'}`}>
                                        <div className="flex justify-between items-center">
                                            <span className={`text-[10px] uppercase tracking-wider ${dm ? 'text-white/30' : 'text-gray-400'}`}>Messages</span>
                                            <span className={`text-sm font-mono ${dm ? 'text-white/80' : 'text-gray-900'}`}>{ch.messages.toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}
                                {ch.status === 'disconnected' && (
                                    <button className={`w-full mt-3 py-2 rounded-lg text-xs font-medium border border-dashed transition-colors ${dm ? 'border-white/10 text-gray-500 hover:border-white/30 hover:text-white' : 'border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600'}`}>
                                        Connect
                                    </button>
                                )}
                            </div>
                        ))}
                        {agent.channels.length === 0 && (
                            <div className={`col-span-full p-8 text-center border border-dashed rounded-2xl ${dm ? 'border-white/10 text-gray-600' : 'border-gray-200 text-gray-400'}`}>
                                <p className="text-sm mb-2">No channels connected</p>
                                <button className={`text-xs font-medium ${dm ? 'text-[#00C2FF]' : 'text-blue-600'}`}>+ Add Channel</button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

const KnowledgeView = ({ darkMode, agents }: { darkMode: boolean; agents: Agent[] }) => {
    const dm = darkMode;
    const [selectedAgent, setSelectedAgent] = useState('all');

    const filteredAgents = selectedAgent === 'all' ? agents : agents.filter(a => a.id === selectedAgent);
    const allSources = filteredAgents.flatMap(a => a.knowledge.map(k => ({ ...k, agentName: a.name, agentImage: a.image })));

    return (
        <div className="p-8 max-w-6xl mx-auto w-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className={`text-3xl font-serif ${dm ? 'text-white' : 'text-gray-900'}`}>Knowledge Base</h2>
                    <p className={`text-sm mt-1 ${dm ? 'text-white/40' : 'text-gray-500'}`}>Training data and documents for your AI agents</p>
                </div>
                <button className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${dm ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>
                    <PlusIcon /> Upload Source
                </button>
            </div>

            <div className="mb-6">
                <AgentFilter agents={agents} selectedId={selectedAgent} onChange={setSelectedAgent} darkMode={dm} />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className={`p-5 rounded-2xl ${dm ? 'glass-stat' : 'bg-white border border-gray-200 shadow-sm'}`}>
                    <p className={`text-xs font-mono uppercase tracking-widest mb-1 ${dm ? 'text-white/40' : 'text-gray-500'}`}>Sources</p>
                    <p className={`text-2xl font-medium ${dm ? 'text-white' : 'text-gray-900'}`}>{allSources.length}</p>
                </div>
                <div className={`p-5 rounded-2xl ${dm ? 'glass-stat' : 'bg-white border border-gray-200 shadow-sm'}`}>
                    <p className={`text-xs font-mono uppercase tracking-widest mb-1 ${dm ? 'text-white/40' : 'text-gray-500'}`}>Agents</p>
                    <p className={`text-2xl font-medium ${dm ? 'text-white' : 'text-gray-900'}`}>{filteredAgents.length}</p>
                </div>
                <div className={`p-5 rounded-2xl ${dm ? 'glass-stat' : 'bg-white border border-gray-200 shadow-sm'}`}>
                    <p className={`text-xs font-mono uppercase tracking-widest mb-1 ${dm ? 'text-white/40' : 'text-gray-500'}`}>Processing</p>
                    <p className={`text-2xl font-medium ${dm ? 'text-amber-400' : 'text-amber-600'}`}>{allSources.filter(s => s.status === 'processing').length}</p>
                </div>
            </div>

            {/* Sources List */}
            <div className={`rounded-2xl overflow-hidden ${dm ? 'glass-card' : 'bg-white border border-gray-200 shadow-sm'}`}>
                <div className={`px-6 py-4 border-b ${dm ? 'border-white/5' : 'border-gray-100'}`}>
                    <div className="grid grid-cols-12 text-[10px] font-mono uppercase tracking-widest text-gray-500">
                        <div className="col-span-5">File</div>
                        <div className="col-span-2">Type</div>
                        <div className="col-span-2">Agent</div>
                        <div className="col-span-2">Synced</div>
                        <div className="col-span-1">Status</div>
                    </div>
                </div>
                {allSources.length === 0 ? (
                    <div className={`px-6 py-12 text-center ${dm ? 'text-gray-600' : 'text-gray-400'}`}>
                        <p className="text-sm">No knowledge sources yet</p>
                    </div>
                ) : allSources.map(src => (
                    <div key={src.id} className={`px-6 py-4 border-b last:border-b-0 transition-colors group cursor-pointer ${dm ? 'border-white/5 hover:bg-white/[0.02]' : 'border-gray-50 hover:bg-gray-50'}`}>
                        <div className="grid grid-cols-12 items-center">
                            <div className="col-span-5 flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border text-[10px] font-bold ${dm ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                    {src.type}
                                </div>
                                <div>
                                    <p className={`text-sm font-medium ${dm ? 'text-white' : 'text-gray-900'}`}>{src.name}</p>
                                    <p className="text-[10px] text-gray-500">{src.size}</p>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <span className={`text-xs px-2 py-1 rounded-md ${dm ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>{src.type}</span>
                            </div>
                            <div className="col-span-2">
                                <div className="flex items-center gap-1.5">
                                    <img src={src.agentImage} alt="" className="w-4 h-4 rounded-full" />
                                    <span className={`text-xs ${dm ? 'text-white/60' : 'text-gray-600'}`}>{src.agentName}</span>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <span className="text-xs text-gray-500">{src.synced}</span>
                            </div>
                            <div className="col-span-1">
                                <span className={`inline-flex items-center gap-1 text-[10px] font-mono uppercase ${src.status === 'synced' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${src.status === 'synced' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                                    {src.status}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

type ConvWithAgent = AgentConversation & { agentName: string; agentImage: string; agentId: string };

const KANBAN_COLUMNS: { key: AgentConversation['status']; label: string; color: string; bg: string; border: string }[] = [
    { key: 'active',    label: 'Active',    color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
    { key: 'escalated', label: 'Escalated', color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20' },
    { key: 'resolved',  label: 'Resolved',  color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
];

const ConversationsView = ({ darkMode, agents }: { darkMode: boolean; agents: Agent[] }) => {
    const dm = darkMode;
    const [selectedAgent, setSelectedAgent] = useState('all');
    const [openConvId, setOpenConvId] = useState<string | null>(null);
    const [dragOverCol, setDragOverCol] = useState<string | null>(null);
    const [localOverrides, setLocalOverrides] = useState<Record<string, AgentConversation['status']>>({});

    const filteredAgents = selectedAgent === 'all' ? agents : agents.filter(a => a.id === selectedAgent);
    const allConversations: ConvWithAgent[] = filteredAgents.flatMap(a =>
        a.recentConversations.map(c => ({
            ...c,
            status: localOverrides[c.id] || c.status,
            agentName: a.name,
            agentImage: a.image,
            agentId: a.id,
        }))
    );

    const openConv = allConversations.find(c => c.id === openConvId) || null;

    const getColumnConvs = (status: AgentConversation['status']) =>
        allConversations.filter(c => c.status === status);

    const handleDragStart = (e: React.DragEvent, convId: string) => {
        e.dataTransfer.setData('convId', convId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetStatus: AgentConversation['status']) => {
        e.preventDefault();
        const convId = e.dataTransfer.getData('convId');
        if (convId) {
            setLocalOverrides(prev => ({ ...prev, [convId]: targetStatus }));
        }
        setDragOverCol(null);
    };

    const handleDragOver = (e: React.DragEvent, colKey: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragOverCol !== colKey) setDragOverCol(colKey);
    };

    return (
        <div className="flex h-full w-full overflow-hidden">
            {/* Kanban Board */}
            <div className={`flex-1 flex flex-col h-full overflow-hidden ${openConv ? '' : ''}`}>
                {/* Header */}
                <div className="px-6 pt-6 pb-0 shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className={`text-2xl font-serif ${dm ? 'text-white' : 'text-gray-900'}`}>Conversations</h2>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm ${dm ? 'glass-input' : 'bg-white border border-gray-200'}`}>
                            <SearchIcon className="w-3.5 h-3.5 text-gray-500" />
                            <input placeholder="Search..." className={`bg-transparent outline-none text-xs w-32 ${dm ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'}`} />
                        </div>
                    </div>
                    <div className="mb-4">
                        <AgentFilter agents={agents} selectedId={selectedAgent} onChange={setSelectedAgent} darkMode={dm} />
                    </div>
                </div>

                {/* Kanban Columns */}
                <div className="flex-1 flex gap-4 px-6 pb-6 overflow-x-auto overflow-y-hidden scrollbar-hide">
                    {KANBAN_COLUMNS.map(col => {
                        const convs = getColumnConvs(col.key);
                        const isOver = dragOverCol === col.key;
                        return (
                            <div
                                key={col.key}
                                className="flex-1 min-w-[260px] flex flex-col h-full"
                                onDragOver={e => handleDragOver(e, col.key)}
                                onDragLeave={() => setDragOverCol(null)}
                                onDrop={e => handleDrop(e, col.key)}
                            >
                                {/* Column Header */}
                                <div className={`flex items-center gap-2 px-3 py-2.5 rounded-t-xl border-b-2 mb-0 ${dm ? 'bg-white/[0.02] ' + col.border : 'bg-gray-50 border-gray-200'}`}>
                                    <span className={`w-2 h-2 rounded-full ${col.bg}`} />
                                    <span className={`text-xs font-semibold uppercase tracking-wider ${dm ? col.color : 'text-gray-700'}`}>{col.label}</span>
                                    <span className={`ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded-full ${dm ? 'bg-white/5 text-white/30' : 'bg-gray-200 text-gray-500'}`}>{convs.length}</span>
                                </div>

                                {/* Cards Container */}
                                <div className={`flex-1 overflow-y-auto rounded-b-xl p-2 space-y-2 scrollbar-hide transition-colors duration-200 ${
                                    isOver
                                        ? (dm ? 'bg-white/[0.04] ring-1 ring-[#00C2FF]/30' : 'bg-blue-50/50 ring-1 ring-blue-300')
                                        : (dm ? 'bg-white/[0.01]' : 'bg-gray-50/50')
                                }`}>
                                    {convs.length === 0 ? (
                                        <div className={`text-center py-8 text-[11px] ${dm ? 'text-gray-600' : 'text-gray-400'}`}>
                                            Drop here
                                        </div>
                                    ) : convs.map(conv => (
                                        <div
                                            key={conv.id}
                                            draggable
                                            onDragStart={e => handleDragStart(e, conv.id)}
                                            onClick={() => setOpenConvId(conv.id === openConvId ? null : conv.id)}
                                            className={`p-3 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-150 group
                                                ${conv.id === openConvId
                                                    ? (dm ? 'ring-1 ring-[#00C2FF]/40 bg-[#00C2FF]/5' : 'ring-1 ring-blue-400 bg-blue-50')
                                                    : (dm ? 'bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04]' : 'bg-white hover:shadow-md border border-gray-100')
                                                }`}
                                        >
                                            <div className="flex items-start gap-2.5">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5 ${dm ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-gray-500'}`}>
                                                    {conv.customer.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`text-xs font-medium truncate ${dm ? 'text-white' : 'text-gray-900'}`}>{conv.customer}</span>
                                                        <span className={`text-[8px] px-1.5 py-0.5 rounded shrink-0 ${dm ? 'bg-white/5 text-gray-500' : 'bg-gray-100 text-gray-500'}`}>{conv.channel}</span>
                                                    </div>
                                                    <p className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${dm ? 'text-white/35' : 'text-gray-500'}`}>{conv.lastMsg}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-dashed" style={{ borderColor: dm ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)' }}>
                                                <div className="flex items-center gap-1.5">
                                                    <img src={conv.agentImage} alt="" className="w-4 h-4 rounded-full" />
                                                    <span className={`text-[9px] ${dm ? 'text-white/30' : 'text-gray-400'}`}>{conv.agentName}</span>
                                                </div>
                                                <span className={`text-[9px] ${dm ? 'text-white/20' : 'text-gray-400'}`}>{conv.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right: Conversation Detail Panel */}
            {openConv && (
                <div className={`w-[400px] shrink-0 flex flex-col h-full border-l ${dm ? 'border-white/[0.06] bg-[#0a0c14]/50' : 'border-gray-200 bg-white'}`}>
                    {/* Conversation Header */}
                    <div className={`px-5 py-4 flex items-center gap-3 shrink-0 border-b ${dm ? 'border-white/[0.06] bg-white/[0.01]' : 'border-gray-100 bg-gray-50/50'}`}>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold ${dm ? 'bg-white/5 text-white/60' : 'bg-gray-100 text-gray-600'}`}>
                            {openConv.customer.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold ${dm ? 'text-white' : 'text-gray-900'}`}>{openConv.customer}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${dm ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>{openConv.channel}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <img src={openConv.agentImage} alt="" className="w-3.5 h-3.5 rounded-full" />
                                <span className={`text-[10px] ${dm ? 'text-white/40' : 'text-gray-500'}`}>{openConv.agentName}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setOpenConvId(null)}
                            className={`p-1.5 rounded-lg transition-colors ${dm ? 'hover:bg-white/5 text-gray-500 hover:text-white' : 'hover:bg-gray-200 text-gray-400 hover:text-gray-900'}`}
                        >
                            <XIcon />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3 scrollbar-hide">
                        {openConv.messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === 'customer' ? 'justify-start' : 'justify-end'}`}>
                                <div className="max-w-[80%]">
                                    <div className={`px-3.5 py-2 rounded-2xl text-[13px] leading-relaxed ${
                                        msg.sender === 'customer'
                                            ? (dm ? 'bg-white/[0.04] text-white/90 border border-white/[0.06] rounded-tl-sm' : 'bg-gray-100 text-gray-900 rounded-tl-sm')
                                            : (dm ? 'bg-[#00C2FF]/10 text-[#00C2FF]/90 border border-[#00C2FF]/10 rounded-tr-sm' : 'bg-blue-50 text-blue-900 rounded-tr-sm')
                                    }`}>
                                        <p className="whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                    <div className={`flex items-center gap-1.5 mt-0.5 ${msg.sender === 'customer' ? '' : 'justify-end'}`}>
                                        <span className={`text-[8px] ${dm ? 'text-white/20' : 'text-gray-400'}`}>
                                            {msg.sender === 'agent' ? openConv.agentName : openConv.customer}
                                        </span>
                                        <span className={`text-[8px] ${dm ? 'text-white/15' : 'text-gray-300'}`}>{msg.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Top Navigation Bar Item ---
const NavItem = ({ icon, label, active, onClick, darkMode, badge }: {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick: () => void;
    darkMode: boolean;
    badge?: number;
}) => (
    <button
        onClick={onClick}
        className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
        ${active
            ? (darkMode ? 'bg-white/[0.1] text-white backdrop-blur-sm shadow-[0_0_15px_rgba(0,194,255,0.08)]' : 'bg-gray-200/80 text-gray-900')
            : (darkMode ? 'text-gray-500 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100')
        }`}
    >
        <span className={`shrink-0 ${active ? (darkMode ? 'text-[#00C2FF]' : 'text-gray-900') : ''}`}>{icon}</span>
        <span className="hidden lg:inline whitespace-nowrap">{label}</span>
        {badge !== undefined && badge > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#00C2FF] text-[8px] font-bold text-black flex items-center justify-center">{badge}</span>
        )}
    </button>
);

// --- Main Dashboard Component ---

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
    const [currentView, setCurrentView] = useState<View>('chat');
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [darkMode, setDarkMode] = useState(true);
    const [showTemplates, setShowTemplates] = useState(false);
    const [selectedAgentDetail, setSelectedAgentDetail] = useState<AgentDetail | null>(null);
    const [editChatAgent, setEditChatAgent] = useState<AgentDetail | null>(null);

    // Load agents from API on mount
    useEffect(() => {
        const loadAgents = async () => {
            try {
                setLoading(true);
                setError(null);

                const apiAgents = await agentService.list();

                // Transform API agents to Dashboard Agent format
                const transformedAgents: Agent[] = apiAgents.map(apiAgent => ({
                    id: apiAgent.id,
                    name: apiAgent.name,
                    role: apiAgent.config.role || 'Agent',
                    description: apiAgent.config.instructions?.slice(0, 100),
                    status: apiAgent.is_active ? 'active' : 'paused',
                    stats: {
                        conversations: 0,
                        leads: 0
                    },
                    image: AVATAR_LIBRARY[Math.floor(Math.random() * AVATAR_LIBRARY.length)],
                    channels: [],
                    knowledge: [],
                    recentConversations: [],
                }));

                // Use API agents if available, otherwise show demo agents
                setAgents(transformedAgents.length > 0 ? transformedAgents : INITIAL_AGENTS);
            } catch (err) {
                console.error('Failed to load agents:', err);
                setAgents(INITIAL_AGENTS);
            } finally {
                setLoading(false);
            }
        };

        loadAgents();
    }, []);

    const toggleDarkMode = () => setDarkMode(!darkMode);

    const handleTemplateSelect = (_template: any) => {
        setShowTemplates(false);
        setCurrentView('chat');
    };

    const handleOpenAgentDetail = (agent: Agent) => {
        const mockAgent = MOCK_AGENTS.find(m => m.name === agent.name) || {
            id: agent.id,
            name: agent.name,
            role: agent.role,
            description: agent.description || `${agent.role} agent handling customer interactions.`,
            status: agent.status,
            image: agent.image,
            stats: agent.stats,
            channels: [],
            integrations: [],
        };
        setSelectedAgentDetail(mockAgent);
        setCurrentView('agent-detail');
    };

    const handleSaveAgent = (updatedAgent: Agent) => {
        setAgents(prevAgents => {
            const existingAgent = prevAgents.find(a => a.id === updatedAgent.id);
            if (existingAgent) {
                return prevAgents.map(a => a.id === updatedAgent.id ? updatedAgent : a);
            } else {
                return [...prevAgents, { ...updatedAgent, status: 'active' }];
            }
        });
    };

    // Book icon for Knowledge Base
    const BookIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
    );

    // Messages icon for Conversations
    const MessagesIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
    );

    // Channels icon
    const ChannelIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
    );

    return (
        <div className={`flex flex-col h-screen font-sans overflow-hidden transition-colors duration-300 ${darkMode ? 'dark-gradient-bg text-white' : 'bg-gray-50 text-gray-900'}`}>

            {/* === Top Navigation Bar === */}
            <header className={`h-14 shrink-0 flex items-center justify-between px-4 z-30 relative
                ${darkMode
                    ? 'bg-[#0a0c14]/70 backdrop-blur-2xl border-b border-white/[0.06]'
                    : 'bg-white/80 backdrop-blur-xl border-b border-gray-200'
                }`}
            >
                {/* Left: Logo + Nav */}
                <div className="flex items-center gap-1">
                    {/* Logo */}
                    <span className={`font-mono font-bold text-sm tracking-widest mr-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>&lt;X100&gt;</span>

                    <div className={`h-5 w-px mr-2 ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`} />

                    {/* Nav Items */}
                    <NavItem
                        icon={<ChatBubbleIcon className="w-4 h-4" />}
                        label="Architect"
                        active={currentView === 'chat'}
                        onClick={() => setCurrentView('chat')}
                        darkMode={darkMode}
                    />
                    <NavItem
                        icon={<UsersIcon className="w-4 h-4" />}
                        label="Workforce"
                        active={currentView === 'agents' || currentView === 'agent-detail'}
                        onClick={() => setCurrentView('agents')}
                        darkMode={darkMode}
                    />
                    <NavItem
                        icon={<ChannelIcon />}
                        label="Channels"
                        active={currentView === 'channels'}
                        onClick={() => setCurrentView('channels')}
                        darkMode={darkMode}
                    />
                    <NavItem
                        icon={<BookIcon />}
                        label="Knowledge"
                        active={currentView === 'knowledge'}
                        onClick={() => setCurrentView('knowledge')}
                        darkMode={darkMode}
                    />
                    <NavItem
                        icon={<MessagesIcon />}
                        label="Conversations"
                        active={currentView === 'conversations'}
                        onClick={() => setCurrentView('conversations')}
                        darkMode={darkMode}
                        badge={2}
                    />
                    <NavItem
                        icon={<PieChartIcon className="w-4 h-4" />}
                        label="Analytics"
                        active={currentView === 'analytics'}
                        onClick={() => setCurrentView('analytics')}
                        darkMode={darkMode}
                    />
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className={`p-2 rounded-xl transition-colors ${darkMode ? 'text-gray-500 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}
                        title={darkMode ? 'Light mode' : 'Dark mode'}
                    >
                        {darkMode ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
                    </button>

                    {/* Settings */}
                    <NavItem
                        icon={<SettingsIcon className="w-4 h-4" />}
                        label=""
                        active={currentView === 'settings'}
                        onClick={() => setCurrentView('settings')}
                        darkMode={darkMode}
                    />

                    <div className={`h-5 w-px mx-1 ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`} />

                    {/* User / Logout */}
                    <button
                        onClick={onLogout}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors group ${darkMode ? 'hover:bg-red-500/10 text-gray-500 hover:text-red-400' : 'hover:bg-red-50 text-gray-500 hover:text-red-600'}`}
                        title="Log out"
                    >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${darkMode ? 'bg-white/10 text-white/60' : 'bg-gray-200 text-gray-600'}`}>A</div>
                        <LogOutIcon className="w-4 h-4 hidden lg:block" />
                    </button>
                </div>
            </header>

            {/* === Main Content === */}
            <main className={`flex-grow relative overflow-hidden flex flex-col transition-colors duration-300 ${darkMode ? '' : 'bg-gray-50'}`}>
                <div className="flex-grow overflow-auto relative">
                    {currentView === 'chat' && <ChatView darkMode={darkMode} />}
                    {currentView === 'agents' && (
                        loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className={`inline-block w-8 h-8 border-4 border-t-transparent rounded-full animate-spin ${darkMode ? 'border-white/20' : 'border-gray-300'}`}></div>
                                    <p className={`mt-4 text-sm ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>Loading agents...</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center h-full">
                                <div className={`text-center max-w-md p-6 rounded-lg ${darkMode ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
                                    <p className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${darkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                                    >
                                        Retry
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <WorkforceView
                                agents={agents}
                                onEditAgent={handleOpenAgentDetail}
                                onDeployAgent={() => setShowTemplates(true)}
                                darkMode={darkMode}
                            />
                        )
                    )}
                    {currentView === 'agent-detail' && selectedAgentDetail && (
                        <AgentDetailView
                            agent={selectedAgentDetail}
                            darkMode={darkMode}
                            onBack={() => { setCurrentView('agents'); setSelectedAgentDetail(null); }}
                            onEdit={(agent) => setEditChatAgent(agent)}
                        />
                    )}
                    {currentView === 'channels' && <ChannelsListView darkMode={darkMode} agents={agents} />}
                    {currentView === 'knowledge' && <KnowledgeView darkMode={darkMode} agents={agents} />}
                    {currentView === 'conversations' && <ConversationsView darkMode={darkMode} agents={agents} />}
                    {currentView === 'analytics' && <AnalyticsView darkMode={darkMode} />}
                    {currentView === 'settings' && <SettingsView darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
                </div>
            </main>

            {/* Agent Templates Modal */}
            <AnimatePresence>
                {showTemplates && (
                    <AgentTemplatesModal
                        onClose={() => setShowTemplates(false)}
                        onSelect={handleTemplateSelect}
                        darkMode={darkMode}
                    />
                )}
            </AnimatePresence>

            {/* Edit Agent Chat — conversational editing */}
            <AnimatePresence>
                {editChatAgent && (
                    <EditAgentChat
                        agent={editChatAgent}
                        darkMode={darkMode}
                        onClose={() => setEditChatAgent(null)}
                    />
                )}
            </AnimatePresence>

        </div>
    );
};

export default Dashboard;