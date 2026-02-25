import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeftIcon } from './Icons';
import { useTranslation } from './LanguageContext';

// --- Types ---
interface BlogPost {
    id: string;
    title: string;
    slug: string;
    summary: string;
    image: string;
    date: string;
    author: string;
    content: React.ReactNode;
}

// --- Data: 5 Smart Articles (using translation function) ---
const useBlogPosts = () => {
    const { t } = useTranslation();
    return [
        {
            id: 'post-1',
            title: t('blog.post1.title'),
            slug: "death-of-call-center",
            date: t('blog.post1.date'),
            author: t('blog.post1.author'),
            summary: t('blog.post1.summary'),
            image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1200&h=600",
            content: (
                <>
                    <p>The traditional call center model is broken. Businesses bleed money on overhead while customers spend hours on hold. The solution isn't hiring more people—it's deploying autonomous agents.</p>
                    <h3>The Scalability Problem</h3>
                    <p>Human support teams scale linearly with cost. Need to handle 2x calls? You need 2x staff. This model is unsustainable in a hyper-growth environment.</p>
                    <p>AI agents, conversely, scale infinitely. Whether you receive 10 calls or 10,000, the infrastructure handles the load instantly, without adding a single dollar to your payroll per interaction.</p>
                    <h3>Zero Wait Times</h3>
                    <p>Imagine a world where "please hold" is a relic of the past. AI agents answer immediately, access customer data instantly, and resolve issues in seconds—not minutes.</p>
                </>
            )
        },
        {
            id: 'post-2',
            title: t('blog.post2.title'),
            slug: "train-ai-sales-manager",
            date: t('blog.post2.date'),
            author: t('blog.post2.author'),
            summary: t('blog.post2.summary'),
            image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200&h=600",
            content: (
                <>
                    <p>Complex setup processes are the enemy of adoption. That's why we built X100 to be intuitive. In just 7 minutes, you can have a fully functional Sales Manager.</p>
                    <h3>Step 1: Define the Role</h3>
                    <p>Simply tell X100: "I need a sales rep for my real estate agency." The system instantly configures the tone, vocabulary, and objectives.</p>
                    <h3>Step 2: Sync Knowledge</h3>
                    <p>Drag and drop your pricing sheets, FAQs, and property listings. The AI reads and memorizes every detail instantly.</p>
                    <h3>Step 3: Deploy</h3>
                    <p>Connect to WhatsApp, Instagram, or your website chat. Your agent is live, qualifying leads and booking appointments while you sleep.</p>
                </>
            )
        },
        {
            id: 'post-3',
            title: t('blog.post3.title'),
            slug: "economics-of-ai-roi",
            date: t('blog.post3.date'),
            author: t('blog.post3.author'),
            summary: t('blog.post3.summary'),
            image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1200&h=600",
            content: (
                <>
                    <p>Let's talk numbers. A skilled sales representative costs minimally $50k/year plus benefits, training, and commission. They work 40 hours a week.</p>
                    <h3>The AI Advantage</h3>
                    <p>An X100 agent costs $89/month. That's approx $1,000/year. It works 168 hours a week (24/7). It never gets sick, never asks for a raise, and never quits.</p>
                    <h3>Unexpected Benefits</h3>
                    <p>Beyond direct cost savings, consider the opportunity cost. Every missed call is lost revenue. An AI agent captures 100% of opportunities, potentially doubling your top-line revenue simply by being present.</p>
                </>
            )
        },
        {
            id: 'post-4',
            title: t('blog.post4.title'),
            slug: "voice-vs-text-ai",
            date: t('blog.post4.date'),
            author: t('blog.post4.author'),
            summary: t('blog.post4.summary'),
            image: "https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&q=80&w=1200&h=600",
            content: (
                <>
                    <p>The medium matters. Some businesses thrive on phone interactions (e.g., dental clinics, contractors), while others live in DMs (e.g., e-commerce, coaching).</p>
                    <h3>Voice AI</h3>
                    <p>Best for urgent, high-touch interactions. Booking an appointment or reporting an emergency feels better over a voice call. X100's voice agents sound indistinguishable from humans, with pauses, intonations, and empathy.</p>
                    <h3>Text AI</h3>
                    <p>Best for asynchronous, detail-rich exchanges. Sending product specs, tracking links, or troubleshooting steps is far superior via chat.</p>
                </>
            )
        },
        {
            id: 'post-5',
            title: t('blog.post5.title'),
            slug: "managing-hybrid-teams",
            date: t('blog.post5.date'),
            author: t('blog.post5.author'),
            summary: t('blog.post5.summary'),
            image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200&h=600",
            content: (
                <>
                    <p>The fear of replacement is misplaced. The future is collaboration. The most successful companies will be those that effectively blend human creativity with AI efficiency.</p>
                    <h3>The New Org Chart</h3>
                    <p>Your "Head of Sales" isn't making cold calls anymore. They are managing a fleet of 10 AI agents who make the calls. The human focuses on high-level strategy, closing key accounts, and refining the AI's pitch.</p>
                    <h3>Skill Shift</h3>
                    <p>The most valuable skill for employees is no longer rote execution, but "AI Management"—the ability to direct, train, and optimize autonomous agents to do the heavy lifting.</p>
                </>
            )
        }
    ];
};

// --- Components ---

const BlogCard = ({ post, onClick, t }: { post: BlogPost; onClick: () => void; t: (key: string) => string } & React.Attributes) => (
    <motion.div
        whileHover={{ y: -5, transition: { duration: 0.3 } }}
        className="group cursor-pointer flex flex-col h-full bg-[#1C1C1E]/50 border border-white/10 rounded-2xl overflow-hidden hover:border-[#00C2FF]/30 transition-all duration-300"
        onClick={onClick}
    >
        <div className="h-48 overflow-hidden relative">
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
            <img src={post.image} alt={post.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
        </div>
        <div className="p-6 flex flex-col flex-grow">
            <div className="flex items-center gap-4 mb-3 text-xs text-gray-500 font-mono uppercase tracking-widest">
                <span>{post.date}</span>
                <span>•</span>
                <span>{post.author}</span>
            </div>
            <h3 className="text-xl text-white font-serif font-medium mb-3 group-hover:text-[#00C2FF] transition-colors">{post.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">{post.summary}</p>

            <div className="mt-auto flex items-center text-[#00C2FF] text-xs font-bold uppercase tracking-wide gap-2 group/btn">
                {t('blog.read_article')} <ArrowRight className="w-3 h-3 transform group-hover/btn:translate-x-1 transition-transform" />
            </div>
        </div>
    </motion.div>
);

const BlogPostView = ({ post, onBack, t, POSTS }: { post: BlogPost; onBack: () => void; t: (key: string) => string; POSTS: BlogPost[] } & React.Attributes) => {
    // Scroll to top when mounted
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="pt-32 pb-24 px-4 min-h-screen bg-black text-white"
        >
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 group"
                >
                    <ChevronLeftIcon className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-mono uppercase tracking-widest">{t('blog.back_to_blog')}</span>
                </button>

                <div className="mb-8">
                    <span className="text-[#00C2FF] font-mono text-xs uppercase tracking-widest mb-4 block">
                        {post.date} · {post.author}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-serif font-light leading-tight mb-8 text-white">
                        {post.title}
                    </h1>
                </div>

                <div className="aspect-video w-full rounded-2xl overflow-hidden mb-12 border border-white/10 shadow-2xl">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                </div>

                <div className="prose prose-invert prose-lg max-w-none text-gray-300 font-light font-sans">
                    {post.content}
                </div>

                <div className="mt-16 pt-16 border-t border-white/10">
                    <h4 className="text-white font-serif text-2xl mb-6">{t('blog.read_next')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {POSTS.filter(p => p.id !== post.id).slice(0, 2).map((p) => (
                            <div key={p.id} className="group cursor-pointer" onClick={() => {
                                // Simple hack to reload/change view if we were doing real routing, 
                                // but for now we just want to show visual consistency.
                                // Ideally, we'd call a prop to switch post, but let's keep it simple.
                                console.log("Navigate to", p.title);
                            }}>
                                <h5 className="text-lg text-white group-hover:text-[#00C2FF] transition-colors mb-2">{p.title}</h5>
                                <p className="text-sm text-gray-500 line-clamp-2">{p.summary}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export const Blog = ({ onNavigate }: { onNavigate?: (view: string) => void }) => {
    const { t } = useTranslation();
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const POSTS = useBlogPosts();

    const selectedPost = POSTS.find(p => p.id === selectedPostId);

    return (
        <>
            <AnimatePresence mode="wait">
                {selectedPost ? (
                    <BlogPostView key="post-view" post={selectedPost} onBack={() => setSelectedPostId(null)} t={t} POSTS={POSTS} />
                ) : (
                    <motion.div
                        key="list-view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="pt-32 pb-24 px-4 min-h-screen bg-black text-white"
                    >
                        {/* Background Elements */}
                        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none"></div>

                        <div className="max-w-7xl mx-auto relative z-10">
                            <div className="text-center mb-20">
                                <h1 className="text-5xl md:text-7xl font-serif font-light mb-6 tracking-tight">{t('blog.title')} <em className="italic text-gray-500">{t('blog.title_suffix')}</em></h1>
                                <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">
                                    {t('blog.subtitle')}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {POSTS.map(post => (
                                    <BlogCard
                                        key={post.id}
                                        post={post}
                                        onClick={() => setSelectedPostId(post.id)}
                                        t={t}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
