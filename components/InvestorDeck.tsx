import React, { useState, useEffect, useRef } from 'react';

// ======================== TYPES ========================
interface RoadmapPhase {
    title: string;
    timeline: string;
    status: 'done' | 'current' | 'planned';
    color: string;
    glow: string;
    items: string[];
    details: string;
    clients: number;
    mrr: string;
}

interface MarketingChannel {
    name: string;
    icon: string;
    budget: string;
    roi: string;
    tactics: string[];
}

// ======================== DATA ========================

const COMPLETED_ITEMS = [
    { label: 'Мультитенантная архитектура', desc: 'PostgreSQL + RLS изоляция, каждый клиент — отдельный tenant', icon: '🏗️' },
    { label: 'AI-агенты (Agno Framework)', desc: 'Platform Agent создаёт Sales Agent через диалог. RAG, память, инструменты', icon: '🤖' },
    { label: 'Omnichannel', desc: 'WhatsApp, Telegram, Instagram, Email, Website — единый пайплайн', icon: '💬' },
    { label: 'OAuth & Composio', desc: '800+ интеграций: Gmail, Calendar, HubSpot, Salesforce, Slack через OAuth', icon: '🔗' },
    { label: 'Knowledge Base (RAG)', desc: 'pgvector + OpenAI embeddings, гибридный поиск по документам компании', icon: '📚' },
    { label: 'Google OAuth авторизация', desc: 'Neon Auth, JWT токены, мультитенант сессии', icon: '🔐' },
    { label: 'Landing + Dashboard', desc: 'Полный UI: лендинг, дашборд, визард создания агента, Kanban-доска', icon: '🎨' },
    { label: 'Голосовой ввод (Whisper)', desc: 'Speech-to-text через Faster-Whisper для голосовых команд', icon: '🎙️' },
];

const ROADMAP_PHASES: RoadmapPhase[] = [
    {
        title: 'Россия',
        timeline: 'Q2-Q3 2026',
        status: 'current',
        color: '#00C2FF',
        glow: 'rgba(0, 194, 255, 0.3)',
        items: ['Запуск MVP', 'Первые 500 клиентов', 'Product-Market Fit'],
        clients: 500,
        mrr: '$45K',
        details: 'Фокус на малый и средний бизнес в сфере услуг и e-commerce. Стартуем с WhatsApp и Telegram как основные каналы. Бесплатный тариф для первых 100 компаний в обмен на фидбек. Партнёрства с CRM-интеграторами (amoCRM, Bitrix24). Целевые отрасли: онлайн-школы, клиники, автосервисы, риелторы, beauty-сегмент. Средний чек ~$90/мес (70% Starter $50, 22% Pro $120, 8% Enterprise $350). К концу Q3 — 500 платящих клиентов, MRR $45K, ARR $540K.'
    },
    {
        title: 'СНГ + Турция',
        timeline: 'Q4 2026',
        status: 'planned',
        color: '#A78BFA',
        glow: 'rgba(167, 139, 250, 0.3)',
        items: ['Локализация', 'Партнёрская сеть', 'Масштабирование'],
        clients: 1000,
        mrr: '$100K',
        details: 'Казахстан, Узбекистан, Турция — схожие бизнес-модели, высокий спрос на автоматизацию. Локализация интерфейса и агентов на казахский, узбекский, турецкий. Партнёрства с local digital-агентствами. Адаптация под местные мессенджеры. +500 клиентов в регионе, кумулятивно 1 000. Микс: 60% Starter, 30% Pro, 10% Enterprise → ARPU ~$101/мес. MRR $100K, ARR $1.2M.'
    },
    {
        title: 'Европа',
        timeline: 'Q1-Q2 2027',
        status: 'planned',
        color: '#34D399',
        glow: 'rgba(52, 211, 153, 0.3)',
        items: ['GDPR compliance', 'EU хостинг', 'Enterprise tier'],
        clients: 1500,
        mrr: '$180K',
        details: 'Немецкий и французский рынки в первую очередь. GDPR-compliant инфраструктура (EU-based серверы). Enterprise-тариф с SLA, dedicated support, custom integrations. Участие в WebSummit, SaaStock Europe. Партнёрство с европейскими системными интеграторами. +500 B2B клиентов, кумулятивно 1 500. Микс: 50% Starter, 35% Pro, 15% Enterprise → ARPU ~$120/мес. MRR $180K, ARR $2.16M.'
    },
    {
        title: 'США',
        timeline: 'Q3-Q4 2027',
        status: 'planned',
        color: '#FBBF24',
        glow: 'rgba(251, 191, 36, 0.3)',
        items: ['US entity', 'SOC2', 'Series A ready'],
        clients: 3000,
        mrr: '$350K',
        details: 'Регистрация US entity (Delaware C-Corp). SOC2 Type II сертификация. Найм US-based sales team (2-3 человека). Фокус на SMB в vertical SaaS: real estate, healthcare, legal, финтех. Листинг на G2, Capterra, Product Hunt. Интеграция с Intercom, Zendesk, Freshdesk как "AI layer". +1 500 клиентов, кумулятивно 3 000. Микс: 55% Starter, 30% Pro, 15% Enterprise → ARPU ~$116/мес. MRR $350K, ARR $4.2M. Готовность к Series A на $3-5M.'
    },
];

const MARKETING_CHANNELS: MarketingChannel[] = [
    {
        name: 'Контент-ферма',
        icon: '📝',
        budget: '$2-5K/мес',
        roi: '5-8x за 6 мес',
        tactics: [
            'SEO-блог: 20+ статей/мес по ключам "AI для бизнеса", "автоматизация продаж"',
            'YouTube: еженедельные видео — демо продукта, кейсы, сравнения',
            'Telegram-канал: ежедневный контент, AI-инсайты, кейсы клиентов',
            'LinkedIn: thought leadership от фаундеров, 3-5 постов/нед',
            'Подкаст: интервью с клиентами и экспертами по AI в бизнесе',
            'Шаблоны и гайды: lead magnets для сбора email-базы',
        ],
    },
    {
        name: 'Инфлюенс-маркетинг',
        icon: '🎯',
        budget: '$3-8K/мес',
        roi: '3-5x',
        tactics: [
            'Микро-инфлюенсеры (10-100K): бизнес-блогеры, маркетологи — CPA-модель',
            'YouTube-обзорщики: tech-блогеры с фокусом на SaaS и AI-инструменты',
            'Telegram-каналы: размещения в бизнес/маркетинг каналах (50-200K подписчиков)',
            'Twitter/X: AI-комьюнити, треды о продукте от нишевых экспертов',
            'Подкасты: спонсорство бизнес-подкастов (CPM $25-50)',
            'Affiliate-программа: 20-30% рекуррентная комиссия для партнёров',
        ],
    },
    {
        name: 'Performance-маркетинг',
        icon: '📈',
        budget: '$5-15K/мес',
        roi: '2-4x',
        tactics: [
            'Google Ads: поиск по коммерческим запросам (CPC $1-3)',
            'Meta Ads: ретаргетинг + lookalike по базе лидов',
            'LinkedIn Ads: B2B таргетинг на decision-makers (CPC $5-12)',
            'Яндекс.Директ: для российского рынка (CPC $0.5-2)',
            'Product Hunt: launch + follow-up campaign',
            'G2/Capterra: спонсированные листинги + отзывы',
        ],
    },
    {
        name: 'Community & PLG',
        icon: '🌱',
        budget: '$1-3K/мес',
        roi: '10-15x (long-term)',
        tactics: [
            'Freemium тариф: 1 агент бесплатно навсегда → viral loop',
            'Referral-программа: "Пригласи друга — получи месяц Pro"',
            'Discord/Telegram-комьюнити для пользователей и партнёров',
            'Вебинары: еженедельные live-демо (конверсия 5-15%)',
            'Open-source компоненты: SDK, шаблоны агентов → GitHub stars',
            'Интеграционный маркетплейс: листинг в Composio, Zapier, Make',
        ],
    },
];

// ======================== COMPONENTS ========================

// --- Animated counter ---
const AnimatedNumber: React.FC<{ value: number; prefix?: string; suffix?: string }> = ({ value, prefix = '', suffix = '' }) => {
    const [display, setDisplay] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        let start = 0;
        const duration = 1500;
        const step = (ts: number) => {
            if (!start) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(eased * value));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [value]);

    return <span ref={ref}>{prefix}{display.toLocaleString('ru-RU')}{suffix}</span>;
};

// --- Expandable card ---
const ExpandableCard: React.FC<{
    phase: RoadmapPhase;
    index: number;
}> = ({ phase, index }) => {
    const [open, setOpen] = useState(false);

    return (
        <div
            className="group relative"
            style={{ animationDelay: `${index * 150}ms` }}
        >
            <div
                onClick={() => setOpen(!open)}
                className="relative cursor-pointer rounded-2xl p-6 transition-all duration-500 border overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, rgba(${phase.color === '#00C2FF' ? '0,194,255' : phase.color === '#A78BFA' ? '167,139,250' : phase.color === '#34D399' ? '52,211,153' : '251,191,36'}, 0.08), rgba(0,0,0,0.3))`,
                    borderColor: `${phase.color}30`,
                    boxShadow: open ? `0 0 40px ${phase.glow}, 0 20px 60px rgba(0,0,0,0.5)` : `0 4px 20px rgba(0,0,0,0.3)`,
                }}
            >
                {/* Animated gradient border on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                    background: `linear-gradient(135deg, ${phase.color}15, transparent 50%, ${phase.color}10)`,
                }} />

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: phase.color, boxShadow: `0 0 12px ${phase.glow}` }} />
                            <h3 className="text-xl font-serif text-white">{phase.title}</h3>
                            <span className="text-xs font-mono px-2.5 py-1 rounded-full" style={{ backgroundColor: `${phase.color}15`, color: phase.color }}>{phase.timeline}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* MRR & Clients badges — always visible */}
                            <div className="hidden sm:flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-lg font-bold" style={{ color: phase.color }}>{phase.mrr}</p>
                                    <p className="text-[9px] font-mono text-white/30 uppercase">MRR</p>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div className="text-right">
                                    <p className="text-lg font-bold text-white">{phase.clients.toLocaleString('ru-RU')}</p>
                                    <p className="text-[9px] font-mono text-white/30 uppercase">Клиентов</p>
                                </div>
                            </div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${open ? 'rotate-45' : ''}`} style={{ backgroundColor: `${phase.color}15` }}>
                                <span style={{ color: phase.color }} className="text-lg font-light">+</span>
                            </div>
                        </div>
                    </div>

                    {/* MRR on mobile (below title) */}
                    <div className="flex sm:hidden gap-4 mb-3">
                        <span className="text-sm font-bold" style={{ color: phase.color }}>MRR {phase.mrr}</span>
                        <span className="text-sm text-white/50">{phase.clients.toLocaleString('ru-RU')} клиентов</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-2">
                        {phase.items.map(item => (
                            <span key={item} className="text-xs px-3 py-1 rounded-lg bg-white/5 text-white/60">{item}</span>
                        ))}
                    </div>

                    {/* Expandable detail */}
                    <div className={`overflow-hidden transition-all duration-500 ${open ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                        <div className="pt-4 border-t" style={{ borderColor: `${phase.color}20` }}>
                            <p className="text-sm text-white/70 leading-relaxed">{phase.details}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Pricing tiers ---
const PRICING_TIERS = [
    { name: 'Starter', price: 50, color: '#00C2FF', desc: '1 агент, 500 сообщений/мес' },
    { name: 'Pro', price: 120, color: '#A78BFA', desc: '5 агентов, 5 000 сообщений/мес' },
    { name: 'Enterprise', price: 350, color: '#34D399', desc: '∞ агентов, ∞ сообщений, SLA' },
];

// --- Revenue & Expenses Infographic ---
const RevenueExpensesBlock: React.FC<{ clients: number; tierMix: number[]; warmClients: number }> = ({ clients, tierMix, warmClients }) => {
    const totalClients = clients + warmClients;
    const mixSum = tierMix[0] + tierMix[1] + tierMix[2];
    const nS = mixSum > 0 ? tierMix[0] / mixSum : 0.33;
    const nP = mixSum > 0 ? tierMix[1] / mixSum : 0.33;
    const starterClients = Math.round(totalClients * nS);
    const proClients = Math.round(totalClients * nP);
    const enterpriseClients = Math.max(0, totalClients - starterClients - proClients);

    const revenue = starterClients * 50 + proClients * 120 + enterpriseClients * 350;

    // Expenses breakdown
    const infra = Math.round(revenue * 0.10);        // 10% infrastructure (servers, DB, APIs)
    const aiCosts = Math.round(revenue * 0.08);       // 8% AI API calls (Anthropic, OpenAI)
    const marketing = Math.round(revenue * 0.20);     // 20% marketing
    const team = Math.round(revenue * 0.25);          // 25% team/salaries
    const other = Math.round(revenue * 0.05);         // 5% other

    const totalExpenses = infra + aiCosts + marketing + team + other;
    const profit = revenue - totalExpenses;
    const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;

    const expenseItems = [
        { label: 'Инфраструктура', value: infra, pct: 10, color: '#00C2FF', icon: '🖥️' },
        { label: 'AI API (LLM)', value: aiCosts, pct: 8, color: '#A78BFA', icon: '🤖' },
        { label: 'Маркетинг', value: marketing, pct: 20, color: '#FB7185', icon: '📢' },
        { label: 'Команда', value: team, pct: 25, color: '#FBBF24', icon: '👥' },
        { label: 'Прочее', value: other, pct: 5, color: '#94A3B8', icon: '📋' },
    ];

    const maxBar = revenue;

    return (
        <div className="rounded-2xl p-8 border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
            {/* Big revenue vs expenses */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="text-center md:text-left">
                    <p className="text-xs font-mono uppercase tracking-widest text-white/30 mb-2">Доход / мес</p>
                    <p className="text-4xl md:text-5xl font-bold text-[#34D399]">${revenue.toLocaleString('ru-RU')}</p>
                    <p className="text-sm text-white/30 mt-1">{totalClients} клиентов</p>
                </div>
                <div className="text-center md:text-left">
                    <p className="text-xs font-mono uppercase tracking-widest text-white/30 mb-2">Расходы / мес</p>
                    <p className="text-4xl md:text-5xl font-bold text-[#FB7185]">${totalExpenses.toLocaleString('ru-RU')}</p>
                    <p className="text-sm text-white/30 mt-1">{100 - margin}% от дохода</p>
                </div>
                <div className="text-center md:text-left">
                    <p className="text-xs font-mono uppercase tracking-widest text-white/30 mb-2">Прибыль / мес</p>
                    <p className={`text-4xl md:text-5xl font-bold ${profit >= 0 ? 'text-[#FBBF24]' : 'text-red-400'}`}>${profit.toLocaleString('ru-RU')}</p>
                    <p className="text-sm text-white/30 mt-1">Маржа {margin}%</p>
                </div>
            </div>

            {/* Visual revenue bar */}
            <div className="mb-8">
                <p className="text-xs font-mono uppercase tracking-widest text-white/30 mb-3">Структура дохода по тарифам</p>
                <div className="h-12 rounded-xl overflow-hidden flex relative">
                    {[
                        { count: starterClients, price: 50, color: '#00C2FF', name: 'Starter' },
                        { count: proClients, price: 120, color: '#A78BFA', name: 'Pro' },
                        { count: enterpriseClients, price: 350, color: '#34D399', name: 'Enterprise' },
                    ].map((t, i) => {
                        const rev = t.count * t.price;
                        const pct = revenue > 0 ? (rev / revenue) * 100 : 0;
                        return pct > 0 ? (
                            <div
                                key={i}
                                className="h-full flex items-center justify-center transition-all duration-700 relative group"
                                style={{
                                    width: `${pct}%`,
                                    background: `linear-gradient(135deg, ${t.color}40, ${t.color}20)`,
                                    borderRight: i < 2 ? '2px solid rgba(0,0,0,0.3)' : 'none',
                                }}
                            >
                                <span className="text-xs font-bold text-white whitespace-nowrap drop-shadow-md">
                                    {t.name} · ${rev.toLocaleString('ru-RU')}
                                </span>
                            </div>
                        ) : null;
                    })}
                </div>
                <div className="flex justify-between mt-2">
                    {PRICING_TIERS.map((t, i) => (
                        <span key={i} className="text-[10px] font-mono" style={{ color: t.color }}>
                            {t.name}: {[starterClients, proClients, enterpriseClients][i]} клиентов × ${t.price}
                        </span>
                    ))}
                </div>
            </div>

            {/* Expense breakdown bars */}
            <div>
                <p className="text-xs font-mono uppercase tracking-widest text-white/30 mb-3">Структура расходов</p>
                <div className="space-y-3">
                    {expenseItems.map(exp => (
                        <div key={exp.label} className="flex items-center gap-3">
                            <span className="text-lg w-7 text-center">{exp.icon}</span>
                            <span className="text-sm text-white/50 w-36">{exp.label}</span>
                            <div className="flex-1 h-8 rounded-lg overflow-hidden bg-white/[0.03] relative">
                                <div
                                    className="h-full rounded-lg flex items-center px-3 transition-all duration-700"
                                    style={{
                                        width: `${maxBar > 0 ? Math.max((exp.value / maxBar) * 100, 3) : 3}%`,
                                        background: `linear-gradient(90deg, ${exp.color}35, ${exp.color}15)`,
                                    }}
                                >
                                    <span className="text-sm font-bold text-white whitespace-nowrap">${exp.value.toLocaleString('ru-RU')}</span>
                                </div>
                            </div>
                            <span className="text-xs font-mono text-white/25 w-10 text-right">{exp.pct}%</span>
                        </div>
                    ))}
                </div>

                {/* Profit bar */}
                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <span className="text-lg w-7 text-center">💰</span>
                        <span className="text-sm font-semibold text-white w-36">Чистая прибыль</span>
                        <div className="flex-1 h-8 rounded-lg overflow-hidden bg-white/[0.03] relative">
                            <div
                                className="h-full rounded-lg flex items-center px-3 transition-all duration-700"
                                style={{
                                    width: `${maxBar > 0 ? Math.max((Math.abs(profit) / maxBar) * 100, 3) : 3}%`,
                                    background: profit >= 0
                                        ? 'linear-gradient(90deg, rgba(251,191,36,0.35), rgba(251,191,36,0.15))'
                                        : 'linear-gradient(90deg, rgba(239,68,68,0.35), rgba(239,68,68,0.15))',
                                }}
                            >
                                <span className="text-sm font-bold text-white whitespace-nowrap">${profit.toLocaleString('ru-RU')}</span>
                            </div>
                        </div>
                        <span className="text-xs font-bold w-10 text-right" style={{ color: profit >= 0 ? '#FBBF24' : '#FB7185' }}>{margin}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Unit Economics Calculator (Simplified for investors) ---
const UnitEconomicsCalc: React.FC = () => {
    // Simple inputs an investor understands
    // Cold funnel: views → clicks → signups → paying
    const [views, setViews] = useState(1000000);              // Marketing reach / views per month
    const [ctr, setCtr] = useState(3);                         // Click-through rate %
    const [signupRate, setSignupRate] = useState(12);          // Signup rate from clicks %
    const [paidConversion, setPaidConversion] = useState(15);  // Free → Paid %
    const [warmClients, setWarmClients] = useState(200);       // Warm clients (investor's trusted network)
    const [starterPct, setStarterPct] = useState(40);          // % on Starter plan
    const [proPct, setProPct] = useState(35);                  // % on Pro plan
    const [enterprisePct, setEnterprisePct] = useState(25);    // % on Enterprise plan
    const [churnMonthly, setChurnMonthly] = useState(5);
    const [cac, setCac] = useState(35);

    // Cold funnel derived values
    const clicks = Math.round(views * ctr / 100);
    const signups = Math.round(clicks * signupRate / 100);
    const coldClients = Math.round(signups * paidConversion / 100);

    // Normalize percentages so they always sum to 100
    const totalPct = starterPct + proPct + enterprisePct;
    const normStarter = totalPct > 0 ? starterPct / totalPct : 0.33;
    const normPro = totalPct > 0 ? proPct / totalPct : 0.33;

    // Calculations
    const totalClients = coldClients + warmClients;
    const starterClients = Math.round(totalClients * normStarter);
    const proClients = Math.round(totalClients * normPro);
    const enterpriseClients = Math.max(0, totalClients - starterClients - proClients);

    const mrr = starterClients * 50 + proClients * 120 + enterpriseClients * 350;
    const arr = mrr * 12;
    const arpu = totalClients > 0 ? Math.round(mrr / totalClients) : 0;
    const ltv = churnMonthly > 0 ? Math.round(arpu / (churnMonthly / 100)) : 0;
    // Blended CAC: cold clients pay full CAC, warm clients pay $0
    const blendedCac = totalClients > 0 ? Math.round((coldClients * cac) / totalClients) : cac;
    const ltvCacRatio = blendedCac > 0 ? ltv / blendedCac : 0;
    const paybackMonths = arpu > 0 ? blendedCac / arpu : 0;
    const warmSavings = warmClients * cac; // Money saved on acquisition

    const InputSlider: React.FC<{
        label: string;
        value: number;
        onChange: (v: number) => void;
        min: number;
        max: number;
        step?: number;
        suffix?: string;
        prefix?: string;
        color?: string;
        hint?: string;
    }> = ({ label, value, onChange, min, max, step = 1, suffix = '', prefix = '', color = '#00C2FF', hint }) => (
        <div className="mb-6">
            <div className="flex justify-between mb-2">
                <div>
                    <span className="text-sm text-white/60 font-medium">{label}</span>
                    {hint && <span className="text-[10px] text-white/25 ml-2">{hint}</span>}
                </div>
                <span className="text-xl font-bold" style={{ color }}>{prefix}{value.toLocaleString('ru-RU')}{suffix}</span>
            </div>
            <input
                type="range"
                min={min} max={max} step={step} value={value}
                onChange={e => onChange(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                    background: `linear-gradient(to right, ${color} 0%, ${color} ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.08) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.08) 100%)`,
                }}
            />
            <div className="flex justify-between mt-1">
                <span className="text-[10px] text-white/20 font-mono">{prefix}{min.toLocaleString('ru-RU')}{suffix}</span>
                <span className="text-[10px] text-white/20 font-mono">{prefix}{max.toLocaleString('ru-RU')}{suffix}</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Inputs */}
                <div className="rounded-2xl p-8 border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
                    <h3 className="text-xl font-serif text-white mb-8 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#00C2FF]" /> Параметры
                    </h3>

                    <p className="text-xs text-white/30 font-mono uppercase tracking-wider mb-4">Холодные клиенты — воронка маркетинга</p>
                    <InputSlider label="Охват / просмотры" value={views} onChange={setViews} min={1000} max={5000000} step={1000} color="#00C2FF" hint="в месяц" />
                    <InputSlider label="CTR (клик)" value={ctr} onChange={setCtr} min={0.5} max={10} step={0.5} suffix="%" color="#60A5FA" />
                    <InputSlider label="Конверсия в регистрацию" value={signupRate} onChange={setSignupRate} min={1} max={30} step={1} suffix="%" color="#A78BFA" />
                    <InputSlider label="Регистрация → Покупка" value={paidConversion} onChange={setPaidConversion} min={1} max={25} step={1} suffix="%" color="#FB7185" />

                    {/* Cold funnel result */}
                    <div className="rounded-xl p-4 bg-[#00C2FF]/[0.04] border border-[#00C2FF]/15 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm">📊</span>
                                <span className="text-xs text-white/50">Воронка:</span>
                                <span className="text-[10px] text-white/30 font-mono">{views.toLocaleString('ru-RU')} → {clicks.toLocaleString('ru-RU')} → {signups.toLocaleString('ru-RU')} →</span>
                            </div>
                            <span className="text-lg font-bold text-[#00C2FF]">{coldClients.toLocaleString('ru-RU')} клиентов</span>
                        </div>
                    </div>

                    <p className="text-xs text-white/30 font-mono uppercase tracking-wider mb-4 mt-2">Тёплые клиенты</p>
                    <InputSlider label="Тёплые клиенты" value={warmClients} onChange={setWarmClients} min={0} max={20000} step={50} color="#FBBF24" hint="доверенная сеть инвестора" />

                    <div className="rounded-xl p-4 bg-[#FBBF24]/[0.05] border border-[#FBBF24]/15 mb-6">
                        <p className="text-xs text-[#FBBF24]/70">
                            💡 Тёплые клиенты — база контактов инвестора, которые уже доверяют. CAC ≈ $0 (экономия <span className="font-bold text-[#FBBF24]">${warmSavings.toLocaleString('ru-RU')}</span>)
                        </p>
                    </div>

                    <p className="text-xs text-white/30 font-mono uppercase tracking-wider mb-4 mt-6">Распределение по тарифам</p>
                    <InputSlider label="Starter ($50/мес)" value={starterPct} onChange={setStarterPct} min={0} max={100} step={5} suffix="%" color="#00C2FF" />
                    <InputSlider label="Pro ($120/мес)" value={proPct} onChange={setProPct} min={0} max={100} step={5} suffix="%" color="#A78BFA" />
                    <InputSlider label="Enterprise ($350/мес)" value={enterprisePct} onChange={setEnterprisePct} min={0} max={100} step={5} suffix="%" color="#34D399" />

                    <p className="text-xs text-white/30 font-mono uppercase tracking-wider mb-4 mt-6">Экономика</p>
                    <InputSlider label="Отток клиентов" value={churnMonthly} onChange={setChurnMonthly} min={1} max={15} step={0.5} suffix="%/мес" color="#FB7185" />
                    <InputSlider label="CAC холодного клиента" value={cac} onChange={setCac} min={5} max={200} step={5} prefix="$" color="#A78BFA" hint="тёплые = $0" />
                </div>

                {/* Right: Key Results */}
                <div className="space-y-4">
                    {/* Pricing tiers */}
                    <div className="grid grid-cols-3 gap-3">
                        {PRICING_TIERS.map((tier, i) => (
                            <div
                                key={tier.name}
                                className="rounded-xl p-4 border text-center transition-all duration-500 hover:scale-[1.03]"
                                style={{
                                    borderColor: `${tier.color}30`,
                                    background: `linear-gradient(135deg, ${tier.color}10, ${tier.color}03)`,
                                    boxShadow: `0 0 20px ${tier.color}08`,
                                }}
                            >
                                <p className="text-[10px] font-mono uppercase tracking-widest mb-1" style={{ color: tier.color }}>{tier.name}</p>
                                <p className="text-3xl font-bold text-white">${tier.price}</p>
                                <p className="text-[10px] text-white/30">/мес</p>
                                <div className="mt-2 text-sm font-bold" style={{ color: tier.color }}>
                                    {[starterClients, proClients, enterpriseClients][i].toLocaleString('ru-RU')} кл.
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Big numbers */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'MRR', value: `$${mrr.toLocaleString('ru-RU')}`, sub: 'Ежемесячный доход', color: '#00C2FF' },
                            { label: 'ARR', value: `$${arr.toLocaleString('ru-RU')}`, sub: 'Годовой доход', color: '#34D399' },
                        ].map(m => (
                            <div key={m.label} className="rounded-2xl p-6 border transition-all duration-300 hover:scale-[1.02]" style={{
                                background: `linear-gradient(135deg, ${m.color}08, ${m.color}03)`,
                                borderColor: `${m.color}20`,
                                boxShadow: `0 0 30px ${m.color}08`,
                            }}>
                                <p className="text-xs font-mono uppercase tracking-widest text-white/30 mb-2">{m.label}</p>
                                <p className="text-3xl md:text-4xl font-bold" style={{ color: m.color }}>{m.value}</p>
                                <p className="text-xs text-white/25 mt-1">{m.sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* Secondary metrics */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-2xl p-5 border border-white/[0.06] bg-white/[0.02]">
                            <p className="text-xs font-mono uppercase tracking-widest text-white/30 mb-2">Средний чек (ARPU)</p>
                            <p className="text-3xl font-bold text-white">${arpu}</p>
                            <p className="text-xs text-white/25 mt-1">в месяц на клиента</p>
                        </div>
                        <div className="rounded-2xl p-5 border border-white/[0.06] bg-white/[0.02]">
                            <p className="text-xs font-mono uppercase tracking-widest text-white/30 mb-2">Всего клиентов</p>
                            <p className="text-3xl font-bold text-white">{totalClients}</p>
                            <p className="text-xs text-white/25 mt-1">{coldClients} холодных + {warmClients} тёплых</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="rounded-2xl p-5 border transition-all duration-300" style={{
                            borderColor: `${ltvCacRatio >= 3 ? '#34D399' : '#FB7185'}20`,
                            background: `linear-gradient(135deg, ${ltvCacRatio >= 3 ? '#34D399' : '#FB7185'}08, transparent)`,
                        }}>
                            <p className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-1">LTV / CAC</p>
                            <p className="text-2xl font-bold" style={{ color: ltvCacRatio >= 3 ? '#34D399' : '#FB7185' }}>{ltvCacRatio.toFixed(1)}x</p>
                            <p className="text-[10px] text-white/25 mt-0.5">{ltvCacRatio >= 3 ? 'Здоровый' : 'Цель 3x+'}</p>
                        </div>
                        <div className="rounded-2xl p-5 border border-white/[0.06] bg-white/[0.02]">
                            <p className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-1">LTV</p>
                            <p className="text-2xl font-bold text-[#A78BFA]">${ltv.toLocaleString('ru-RU')}</p>
                            <p className="text-[10px] text-white/25 mt-0.5">за жизнь клиента</p>
                        </div>
                        <div className="rounded-2xl p-5 border transition-all duration-300" style={{
                            borderColor: `${paybackMonths <= 6 ? '#FBBF24' : '#FB7185'}20`,
                            background: `linear-gradient(135deg, ${paybackMonths <= 6 ? '#FBBF24' : '#FB7185'}08, transparent)`,
                        }}>
                            <p className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-1">Окупаемость</p>
                            <p className="text-2xl font-bold" style={{ color: paybackMonths <= 6 ? '#FBBF24' : '#FB7185' }}>{paybackMonths.toFixed(1)} мес</p>
                            <p className="text-[10px] text-white/25 mt-0.5">{paybackMonths <= 6 ? 'Быстро' : 'Цель <6'}</p>
                        </div>
                    </div>

                    {/* Warm clients impact callout */}
                    {warmClients > 0 && (
                        <div className="rounded-2xl p-5 border border-[#FBBF24]/20 bg-gradient-to-r from-[#FBBF24]/[0.06] to-transparent">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🤝</span>
                                <div>
                                    <p className="text-sm font-semibold text-[#FBBF24]">Эффект тёплых клиентов</p>
                                    <p className="text-xs text-white/40 mt-0.5">
                                        Экономия на привлечении: <span className="text-[#FBBF24] font-bold">${warmSavings.toLocaleString('ru-RU')}</span> ·
                                        MRR от тёплых: <span className="text-[#FBBF24] font-bold">${(Math.round(warmClients * arpu)).toLocaleString('ru-RU')}</span>/мес ·
                                        Средний CAC (blended): <span className="text-[#FBBF24] font-bold">${blendedCac}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Revenue & Expenses Infographic (connected to same data) */}
            <RevenueExpensesBlock clients={coldClients} tierMix={[starterPct, proPct, enterprisePct]} warmClients={warmClients} />
        </div>
    );
};

// ======================== MAIN COMPONENT ========================

const InvestorDeck: React.FC = () => {
    const [activeMarketing, setActiveMarketing] = useState<number | null>(null);

    // Simple scroll-triggered visibility via state
    const [visible, setVisible] = useState<Set<string>>(new Set());

    useEffect(() => {
        const ids = ['done', 'roadmap', 'marketing', 'unit', 'revenue'];
        const handleScroll = () => {
            const newVisible = new Set(visible);
            let changed = false;
            ids.forEach(id => {
                if (newVisible.has(id)) return;
                const el = document.getElementById(`section-${id}`);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top < window.innerHeight * 0.85) {
                        newVisible.add(id);
                        changed = true;
                    }
                }
            });
            if (changed) setVisible(newVisible);
        };
        handleScroll(); // check immediately
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    });

    const sectionClass = (id: string) =>
        `transition-all duration-1000 ease-out ${visible.has(id) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`;

    return (
        <div className="min-h-screen bg-black text-white overflow-x-hidden">
            {/* === Background === */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-[#08090d] via-[#0c0e17] to-[#080a10]" />
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-[#00C2FF]/[0.04] blur-[150px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[#A78BFA]/[0.03] blur-[150px]" />
                <div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full bg-[#34D399]/[0.02] blur-[120px]" />
            </div>

            <div className="relative z-10">
                {/* === HERO === */}
                <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-[500px] h-[500px] rounded-full border border-white/[0.03] animate-spin" style={{ animationDuration: '60s' }} />
                        <div className="absolute w-[350px] h-[350px] rounded-full border border-[#00C2FF]/[0.06] animate-spin" style={{ animationDuration: '45s', animationDirection: 'reverse' }} />
                        <div className="absolute w-[200px] h-[200px] rounded-full border border-[#A78BFA]/[0.08] animate-spin" style={{ animationDuration: '30s' }} />
                    </div>

                    <div className="relative">
                        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#00C2FF]/10 border border-[#00C2FF]/20 mb-8 animate-fade-in">
                            <span className="text-[#00C2FF] text-[10px] font-mono font-bold tracking-[0.2em] uppercase">Investor Deck 2026</span>
                        </div>

                        <h1 className="font-serif text-white tracking-tight mb-6 animate-slide-up" style={{ fontSize: 'clamp(40px, 7vw, 100px)', lineHeight: '1.05', fontWeight: 300 }}>
                            <em className="italic">X100</em><br />AI Workforce
                        </h1>

                        <p className="text-lg md:text-2xl text-white/60 font-light max-w-2xl mx-auto mb-12 animate-fade-in" style={{ animationDelay: '200ms' }}>
                            AI-сотрудники для бизнеса, которые продают, консультируют и поддерживают клиентов 24/7
                        </p>

                        <div className="flex flex-wrap gap-6 justify-center animate-fade-in" style={{ animationDelay: '400ms' }}>
                            {[
                                { n: 800, suffix: '+', label: 'Интеграций' },
                                { n: 6, suffix: '', label: 'Каналов' },
                                { n: 85, suffix: '%', label: 'Gross Margin' },
                                { n: 24, suffix: '/7', label: 'Работа агентов' },
                            ].map(s => (
                                <div key={s.label} className="text-center">
                                    <p className="text-3xl md:text-4xl font-bold text-white"><AnimatedNumber value={s.n} suffix={s.suffix} /></p>
                                    <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-1">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="absolute bottom-10 animate-bounce">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20"><path d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                    </div>
                </section>

                {/* === WHAT'S DONE === */}
                <section id="section-done" className={`py-24 px-6 ${sectionClass('done')}`}>
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-16">
                            <span className="text-[10px] font-mono text-[#00C2FF] tracking-[0.3em] uppercase">Текущий статус</span>
                            <h2 className="text-4xl md:text-6xl font-serif text-white mt-3 tracking-tight">Что сделано</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {COMPLETED_ITEMS.map((item, i) => (
                                <div
                                    key={item.label}
                                    className="rounded-2xl p-5 border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl hover:bg-white/[0.05] hover:border-[#00C2FF]/20 transition-all duration-500 group"
                                    style={{ animationDelay: `${i * 80}ms` }}
                                >
                                    <div className="flex items-start gap-4">
                                        <span className="text-2xl mt-0.5 group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                                        <div>
                                            <h4 className="text-sm font-semibold text-white mb-1 group-hover:text-[#00C2FF] transition-colors">{item.label}</h4>
                                            <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* === ROADMAP === */}
                <section id="section-roadmap" className={`py-24 px-6 ${sectionClass('roadmap')}`}>
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <span className="text-[10px] font-mono text-[#A78BFA] tracking-[0.3em] uppercase">Expansion plan</span>
                            <h2 className="text-4xl md:text-6xl font-serif text-white mt-3 tracking-tight">Дорожная карта</h2>
                            <p className="text-white/40 mt-4 text-lg font-light">Нажмите на карточку для подробностей</p>
                        </div>

                        <div className="space-y-4">
                            {ROADMAP_PHASES.map((phase, i) => (
                                <ExpandableCard key={phase.title} phase={phase} index={i} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* === MARKETING === */}
                <section id="section-marketing" className={`py-24 px-6 ${sectionClass('marketing')}`}>
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-16">
                            <span className="text-[10px] font-mono text-[#34D399] tracking-[0.3em] uppercase">Go-to-market</span>
                            <h2 className="text-4xl md:text-6xl font-serif text-white mt-3 tracking-tight">Маркетинг</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {MARKETING_CHANNELS.map((ch, idx) => {
                                const isOpen = activeMarketing === idx;
                                const colors = ['#00C2FF', '#A78BFA', '#FB7185', '#34D399'];
                                const color = colors[idx % colors.length];

                                return (
                                    <div
                                        key={ch.name}
                                        onClick={() => setActiveMarketing(isOpen ? null : idx)}
                                        className="rounded-2xl p-6 border cursor-pointer transition-all duration-500 relative overflow-hidden group"
                                        style={{
                                            borderColor: isOpen ? `${color}40` : 'rgba(255,255,255,0.06)',
                                            background: isOpen
                                                ? `linear-gradient(135deg, ${color}10, ${color}05, transparent)`
                                                : 'rgba(255,255,255,0.02)',
                                            boxShadow: isOpen ? `0 0 40px ${color}15` : 'none',
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{ch.icon}</span>
                                                <div>
                                                    <h4 className="text-sm font-semibold text-white">{ch.name}</h4>
                                                    <div className="flex gap-3 mt-0.5">
                                                        <span className="text-[10px] font-mono text-white/30">Бюджет: {ch.budget}</span>
                                                        <span className="text-[10px] font-mono" style={{ color }}>ROI: {ch.roi}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} style={{ backgroundColor: `${color}15` }}>
                                                <span style={{ color }} className="text-sm">+</span>
                                            </div>
                                        </div>

                                        <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                            <div className="pt-4 border-t border-white/[0.06] space-y-2">
                                                {ch.tactics.map((t, i) => (
                                                    <div key={i} className="flex items-start gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: color }} />
                                                        <p className="text-xs text-white/60 leading-relaxed">{t}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Marketing budget infographic */}
                        <div className="mt-12 rounded-2xl p-8 border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
                            <h3 className="text-lg font-serif text-white mb-2 flex items-center gap-2">
                                <span className="text-xl">💰</span> Бюджет маркетинга по месяцам
                            </h3>
                            <p className="text-xs text-white/30 mb-6">Распределение расходов по каналам привлечения ($/мес)</p>

                            {(() => {
                                const budgetData = [
                                    { name: 'Контент', min: 2000, max: 5000, avg: 3500, color: '#00C2FF', icon: '📝' },
                                    { name: 'Инфлюенсеры', min: 3000, max: 8000, avg: 5500, color: '#A78BFA', icon: '🎯' },
                                    { name: 'Performance', min: 5000, max: 15000, avg: 10000, color: '#FB7185', icon: '📈' },
                                    { name: 'Community', min: 1000, max: 3000, avg: 2000, color: '#34D399', icon: '🌱' },
                                ];
                                const totalMin = budgetData.reduce((s, b) => s + b.min, 0);
                                const totalMax = budgetData.reduce((s, b) => s + b.max, 0);
                                const totalAvg = budgetData.reduce((s, b) => s + b.avg, 0);
                                const maxVal = totalMax;

                                return (
                                    <>
                                        <div className="space-y-4 mb-8">
                                            {budgetData.map(b => (
                                                <div key={b.name}>
                                                    <div className="flex items-center gap-3 mb-1.5">
                                                        <span className="text-lg w-7 text-center">{b.icon}</span>
                                                        <span className="text-sm text-white/60 w-28">{b.name}</span>
                                                        <div className="flex-1 h-10 rounded-lg overflow-hidden bg-white/[0.03] relative">
                                                            {/* Min bar */}
                                                            <div
                                                                className="absolute h-full rounded-lg"
                                                                style={{
                                                                    width: `${(b.max / maxVal) * 100}%`,
                                                                    background: `linear-gradient(90deg, ${b.color}15, ${b.color}08)`,
                                                                }}
                                                            />
                                                            {/* Avg bar */}
                                                            <div
                                                                className="absolute h-full rounded-lg flex items-center px-3"
                                                                style={{
                                                                    width: `${(b.avg / maxVal) * 100}%`,
                                                                    background: `linear-gradient(90deg, ${b.color}40, ${b.color}20)`,
                                                                }}
                                                            >
                                                                <span className="text-sm font-bold text-white whitespace-nowrap drop-shadow">${b.avg.toLocaleString('ru-RU')}</span>
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] font-mono text-white/25 w-28 text-right">${b.min.toLocaleString('ru-RU')} – ${b.max.toLocaleString('ru-RU')}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Total row */}
                                        <div className="pt-4 border-t border-white/[0.06]">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg w-7 text-center">📊</span>
                                                    <span className="text-sm font-semibold text-white">Итого в месяц</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-2xl font-bold text-white">${totalAvg.toLocaleString('ru-RU')}</span>
                                                    <span className="text-xs text-white/30 ml-2">(${totalMin.toLocaleString('ru-RU')} – ${totalMax.toLocaleString('ru-RU')})</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pie-like distribution */}
                                        <div className="mt-6 h-4 rounded-full overflow-hidden flex">
                                            {budgetData.map(b => (
                                                <div
                                                    key={b.name}
                                                    className="h-full transition-all duration-500"
                                                    style={{
                                                        width: `${(b.avg / totalAvg) * 100}%`,
                                                        background: `linear-gradient(135deg, ${b.color}60, ${b.color}30)`,
                                                    }}
                                                    title={`${b.name}: ${Math.round((b.avg / totalAvg) * 100)}%`}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex justify-between mt-2">
                                            {budgetData.map(b => (
                                                <span key={b.name} className="text-[10px] font-mono" style={{ color: b.color }}>
                                                    {b.name} {Math.round((b.avg / totalAvg) * 100)}%
                                                </span>
                                            ))}
                                        </div>
                                    </>
                                );
                            })()}
                        </div>

                        {/* Best practices block */}
                        <div className="mt-12 rounded-2xl p-8 border border-[#FBBF24]/15 bg-gradient-to-br from-[#FBBF24]/[0.04] to-transparent">
                            <h3 className="text-lg font-serif text-white mb-6 flex items-center gap-2">
                                <span className="text-xl">💡</span> Лучшие практики для AI SaaS в 2026
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { title: 'Product-Led Growth (PLG)', text: 'Бесплатный тариф с ограничениями → вирусный рост. Dropbox, Slack, Notion выросли так. Наш plan: 1 агент бесплатно навсегда.' },
                                    { title: 'Time-to-Value < 5 минут', text: 'Пользователь должен увидеть результат за 5 минут. Наш визард создаёт агента за 3 минуты через чат.' },
                                    { title: 'Community-Led Growth', text: 'Telegram/Discord комьюнити, open-source SDK, шаблоны агентов. Снижает CAC на 40-60%.' },
                                    { title: 'Vertical-first, Horizontal-later', text: 'Сначала 2-3 ниши (beauty, клиники, онлайн-школы), доминировать, потом расширяться.' },
                                    { title: 'Integration Marketplace', text: 'Каждая интеграция = канал дистрибуции. Листинг в Composio, Zapier, Make даёт органический трафик.' },
                                    { title: 'Usage-Based Pricing', text: 'Базовая подписка + оплата за сообщения сверх лимита. Растёт с бизнесом клиента → Net Revenue Retention > 120%.' },
                                ].map(tip => (
                                    <div key={tip.title} className="flex items-start gap-3">
                                        <div className="w-1 h-8 rounded-full bg-[#FBBF24]/30 shrink-0 mt-1" />
                                        <div>
                                            <h5 className="text-xs font-semibold text-[#FBBF24] mb-1">{tip.title}</h5>
                                            <p className="text-xs text-white/50 leading-relaxed">{tip.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* === UNIT ECONOMICS === */}
                <section id="section-unit" className={`py-24 px-6 ${sectionClass('unit')}`}>
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <span className="text-[10px] font-mono text-[#FB7185] tracking-[0.3em] uppercase">Финансовая модель</span>
                            <h2 className="text-4xl md:text-6xl font-serif text-white mt-3 tracking-tight">Юнит-экономика</h2>
                            <p className="text-white/40 mt-4 text-lg font-light">Двигайте слайдеры для моделирования сценариев</p>
                        </div>

                        <UnitEconomicsCalc />

                        {/* Benchmark table */}
                        <div className="mt-12 rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
                            <h3 className="text-sm font-serif text-white mb-4">Бенчмарки AI SaaS (2025-2026)</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/[0.06]">
                                            <th className="text-left py-3 text-white/30 font-mono">Метрика</th>
                                            <th className="text-center py-3 text-white/30 font-mono">Плохо</th>
                                            <th className="text-center py-3 text-white/30 font-mono">Норма</th>
                                            <th className="text-center py-3 text-[#34D399] font-mono">Отлично</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-white/60">
                                        {[
                                            ['LTV / CAC', '<2x', '3-5x', '>5x'],
                                            ['Payback Period', '>12 мес', '3-6 мес', '<3 мес'],
                                            ['Monthly Churn', '>8%', '3-5%', '<2%'],
                                            ['Net Revenue Retention', '<90%', '100-120%', '>130%'],
                                            ['Gross Margin', '<70%', '75-85%', '>85%'],
                                            ['CAC (SMB)', '>$200', '$50-100', '<$30'],
                                        ].map(row => (
                                            <tr key={row[0]} className="border-b border-white/[0.03]">
                                                <td className="py-3 text-white/50 font-medium">{row[0]}</td>
                                                <td className="py-3 text-center text-red-400/60">{row[1]}</td>
                                                <td className="py-3 text-center text-white/40">{row[2]}</td>
                                                <td className="py-3 text-center text-[#34D399]">{row[3]}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>

                {/* === FOOTER === */}
                <section className="py-20 px-6 text-center">
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-serif text-white tracking-tight mb-4">
                            Готовы к масштабированию
                        </h2>
                        <p className="text-white/40 text-lg mb-8">
                            Продукт построен, команда собрана, рынок растёт.<br />
                            Ищем партнёров для следующего этапа.
                        </p>
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.05] border border-white/10">
                            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
                            <span className="text-xs font-mono text-white/50">X100 AI Platform — 2026</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default InvestorDeck;
