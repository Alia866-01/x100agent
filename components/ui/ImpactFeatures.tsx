import { Card, CardContent } from './card'
import { useTranslation } from '../LanguageContext';

export function ImpactFeatures() {
    const { t } = useTranslation();

    return (
        <section className="bg-black py-24 md:py-32 relative border-t border-white/5 overflow-hidden">

            {/* Animations */}
            <style>{`
                @keyframes scan {
                    0% { top: 25%; opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { top: 75%; opacity: 0; }
                }
            `}</style>

            <div className="mx-auto max-w-7xl px-4 relative z-10">
                <div className="mb-20 text-center max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-6xl font-serif font-light text-white mb-6 tracking-tight">
                        {t('impact.title')} <em className="italic text-gray-500">{t('impact.title_suffix')}</em>
                    </h2>
                    <p className="text-xl text-gray-400 font-light leading-relaxed">
                        {t('impact.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                    {/* CARD 1: REVENUE - Red/Rose/Purple Gradient */}
                    <Card className="relative col-span-1 md:col-span-2 lg:col-span-4 bg-gradient-to-br from-[#8b5cf6] via-[#d946ef] to-[#f43f5e] border-0 hover:scale-[1.01] transition-transform duration-500 group overflow-hidden h-full rounded-[32px] shadow-2xl">
                        {/* Dark Glass Tint - Increased Opacity */}
                        <div className="absolute inset-0 bg-[#0A0A0A]/80 z-0 transition-all duration-500 group-hover:bg-[#0A0A0A]/70"></div>

                        <CardContent className="p-0 flex flex-col md:flex-row h-full relative z-10">
                            {/* Visual Section */}
                            <div className="relative w-full md:w-1/2 min-h-[300px] flex items-center justify-center overflow-hidden flex-1">
                                {/* Inner Glow */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/20 blur-[60px] rounded-full mix-blend-overlay"></div>

                                {/* SVG Background */}
                                <svg className="absolute inset-0 size-full text-white/10 z-0 mix-blend-overlay" viewBox="0 0 254 104" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M112.891 97.7022C140.366 97.0802 171.004 94.6715 201.087 87.5116C210.43 85.2881 219.615 82.6412 228.284 78.2473C232.198 76.3179 235.905 73.9942 239.348 71.3124C241.85 69.2557 243.954 66.7571 245.555 63.9408C249.34 57.3235 248.281 50.5341 242.498 45.6109C239.033 42.7237 235.228 40.2703 231.169 38.3054C219.443 32.7209 207.141 28.4382 194.482 25.534C184.013 23.1927 173.358 21.7755 162.64 21.2989C161.376 21.3512 160.113 21.181 158.908 20.796C158.034 20.399 156.857 19.1682 156.962 18.4535C157.115 17.8927 157.381 17.3689 157.743 16.9139C158.104 16.4588 158.555 16.0821 159.067 15.8066C160.14 15.4683 161.274 15.3733 162.389 15.5286C179.805 15.3566 196.626 18.8373 212.998 24.462C220.978 27.2494 228.798 30.4747 236.423 34.1232C240.476 36.1159 244.202 38.7131 247.474 41.8258C254.342 48.2578 255.745 56.9397 251.841 65.4892C249.793 69.8582 246.736 73.6777 242.921 76.6327C236.224 82.0192 228.522 85.4602 220.502 88.2924C205.017 93.7847 188.964 96.9081 172.738 99.2109C153.442 101.949 133.993 103.478 114.506 103.79C91.1468 104.161 67.9334 102.97 45.1169 97.5831C36.0094 95.5616 27.2626 92.1655 19.1771 87.5116C13.839 84.5746 9.1557 80.5802 5.41318 75.7725C-0.54238 67.7259 -1.13794 59.1763 3.25594 50.2827C5.82447 45.3918 9.29572 41.0315 13.4863 37.4319C24.2989 27.5721 37.0438 20.9681 50.5431 15.7272C68.1451 8.8849 86.4883 5.1395 105.175 2.83669C129.045 0.0992292 153.151 0.134761 177.013 2.94256C197.672 5.23215 218.04 9.01724 237.588 16.3889C240.089 17.3418 242.498 18.5197 244.933 19.6446C246.627 20.4387 247.725 21.6695 246.997 23.615C246.455 25.1105 244.814 25.5605 242.63 24.5811C230.322 18.9961 217.233 16.1904 204.117 13.4376C188.761 10.3438 173.2 8.36665 157.558 7.52174C129.914 5.70776 102.154 8.06792 75.2124 14.5228C60.6177 17.8788 46.5758 23.2977 33.5102 30.6161C26.6595 34.3329 20.4123 39.0673 14.9818 44.658C12.9433 46.8071 11.1336 49.1622 9.58207 51.6855C4.87056 59.5336 5.61172 67.2494 11.9246 73.7608C15.2064 77.0494 18.8775 79.925 22.8564 82.3236C31.6176 87.7101 41.3848 90.5291 51.3902 92.5804C70.6068 96.5773 90.0219 97.7419 112.891 97.7022Z"
                                        fill="currentColor"
                                    />
                                </svg>
                                <div className="relative z-10 flex flex-col items-center">
                                    <span className="text-white text-6xl md:text-8xl font-heading font-semibold tracking-tighter drop-shadow-lg">100%</span>
                                    <span className="text-white/80 text-sm font-mono uppercase tracking-widest mt-4">{t('impact.card1.stat_label')}</span>
                                </div>
                            </div>
                            {/* Content Section */}
                            <div className="p-10 md:w-1/2 flex flex-col justify-center bg-transparent relative z-20">
                                <h3 className="text-3xl font-heading font-medium text-white mb-4 drop-shadow-sm">{t('impact.card1.title')}</h3>
                                <p className="text-white/80 text-lg leading-relaxed font-light">
                                    {t('impact.card1.desc')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* CARD 2: SPEED / INSTANT SCALE - Green/Teal Gradient */}
                    <Card className="relative col-span-1 md:col-span-1 lg:col-span-2 bg-gradient-to-br from-[#4ade80] to-[#0d9488] border-0 hover:scale-[1.01] transition-transform duration-500 group overflow-hidden h-full rounded-[32px] shadow-2xl">
                        {/* Dark Glass Tint - Increased Opacity */}
                        <div className="absolute inset-0 bg-[#0A0A0A]/80 z-0 transition-all duration-500 group-hover:bg-[#0A0A0A]/70"></div>

                        <CardContent className="p-0 h-full flex flex-col relative z-10">
                            <div className="flex-1 relative flex items-center justify-center min-h-[250px] overflow-hidden">
                                {/* Soft Glow */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/20 blur-[50px] rounded-full mix-blend-overlay"></div>

                                {/* Complex Speed Visual - White Theme */}
                                <div className="relative w-40 h-40 flex items-center justify-center z-10">
                                    {/* Outer Ring */}
                                    <div className="absolute inset-0 border border-white/20 rounded-full border-t-white/80 animate-[spin_1.5s_linear_infinite]"></div>
                                    {/* Inner Ring */}
                                    <div className="absolute inset-6 border border-white/20 rounded-full border-b-white/60 animate-[spin_1s_linear_infinite_reverse]"></div>

                                    {/* Core Symbol */}
                                    <div className="absolute inset-0 flex items-center justify-center z-10">
                                        <div className="w-16 h-16 rounded-full bg-white/10 border border-white/30 flex items-center justify-center backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform duration-500">
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 bg-transparent h-auto flex flex-col justify-end relative z-20">
                                <h3 className="text-2xl font-heading font-medium text-white mb-2 drop-shadow-sm">{t('impact.card2.title')}</h3>
                                <p className="text-white/80 font-light text-base leading-relaxed">
                                    {t('impact.card2.desc')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* CARD 3: SECURITY - Pink/Fuchsia Gradient */}
                    <Card className="relative col-span-1 md:col-span-1 lg:col-span-2 bg-gradient-to-br from-[#f472b6] via-[#db2777] to-[#9333ea] border-0 hover:scale-[1.01] transition-transform duration-500 group overflow-hidden h-full rounded-[32px] shadow-2xl">
                        {/* Dark Glass Tint - Increased Opacity */}
                        <div className="absolute inset-0 bg-[#0A0A0A]/80 z-0 transition-all duration-500 group-hover:bg-[#0A0A0A]/70"></div>

                        <CardContent className="p-0 h-full flex flex-col relative z-10">
                            <div className="flex-1 relative flex items-center justify-center min-h-[250px] overflow-hidden">
                                {/* Soft Glow */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/20 blur-[50px] rounded-full mix-blend-overlay"></div>

                                {/* Complex Security Visual */}
                                <div className="relative w-40 h-40 flex items-center justify-center z-10">

                                    {/* Shield Perimeter */}
                                    <svg className="absolute inset-0 w-full h-full text-white/10 drop-shadow-lg" viewBox="0 0 100 100" fill="currentColor">
                                        <path d="M50 95 C 20 80 5 60 5 30 L 50 5 L 95 30 C 95 60 80 80 50 95 Z" />
                                    </svg>

                                    {/* Rotating Ring */}
                                    <div className="absolute inset-4 border border-white/20 rounded-full border-l-white/60 animate-[spin_2s_linear_infinite]"></div>

                                    {/* Lock Core */}
                                    <div className="relative z-10 w-16 h-16 rounded-2xl bg-white/10 border border-white/30 flex items-center justify-center backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform duration-500">
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                        </svg>
                                    </div>

                                    {/* Dots Effect (from Screenshot) */}
                                    <div className="absolute top-1/2 left-0 w-full flex justify-between px-2 opacity-50">
                                        <div className="w-1 h-1 bg-white rounded-full"></div>
                                        <div className="w-1 h-1 bg-white rounded-full"></div>
                                        <div className="w-1 h-1 bg-white rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 bg-transparent h-auto flex flex-col justify-end relative z-20">
                                <h3 className="text-2xl font-heading font-medium text-white mb-2 drop-shadow-sm">{t('impact.card3.title')}</h3>
                                <p className="text-white/80 font-light text-base leading-relaxed">
                                    {t('impact.card3.desc')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* CARD 4: ZERO ERROR - Orange/Blue/Purple Gradient */}
                    <Card className="relative col-span-1 md:col-span-2 lg:col-span-4 bg-gradient-to-br from-[#fb923c] via-[#ea580c] to-[#3b82f6] border-0 hover:scale-[1.01] transition-transform duration-500 group overflow-hidden h-full rounded-[32px] shadow-2xl">
                        {/* Dark Glass Tint - Increased Opacity */}
                        <div className="absolute inset-0 bg-[#0A0A0A]/80 z-0 transition-all duration-500 group-hover:bg-[#0A0A0A]/70"></div>

                        {/* Blue blur visual from screenshot style - Adjusted z-index to be under content but over gradient */}
                        <div className="absolute bottom-[-20%] right-[-10%] w-[300px] h-[300px] bg-blue-600 blur-[80px] rounded-full opacity-40 mix-blend-overlay animate-pulse z-0 pointer-events-none"></div>

                        <CardContent className="p-0 flex flex-col md:flex-row-reverse h-full relative z-10">
                            {/* Visual Section */}
                            <div className="relative w-full md:w-1/2 min-h-[300px] flex items-center justify-center overflow-hidden flex-1">
                                {/* Soft Glow */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/10 blur-[60px] rounded-full mix-blend-overlay"></div>

                                <div className="absolute inset-0 flex items-center justify-center z-10">
                                    {/* Abstract Node Network - White Theme */}
                                    <div className="relative w-64 h-64">
                                        {/* Rings */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/40 rounded-full animate-[spin_5s_linear_infinite]"></div>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/20 rounded-full animate-[spin_7s_linear_infinite_reverse]"></div>

                                        {/* Center Point */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_20px_white]"></div>

                                        {/* Satellite Nodes */}
                                        <div className="absolute top-0 left-1/2 w-3 h-3 bg-white/80 rounded-full -translate-x-1/2 shadow-lg"></div>
                                        <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-white/80 rounded-full -translate-x-1/2 shadow-lg"></div>
                                        <div className="absolute left-0 top-1/2 w-3 h-3 bg-white/80 rounded-full -translate-y-1/2 shadow-lg"></div>
                                        <div className="absolute right-0 top-1/2 w-3 h-3 bg-white/80 rounded-full -translate-y-1/2 shadow-lg"></div>
                                    </div>
                                </div>
                            </div>
                            {/* Content Section */}
                            <div className="p-10 md:w-1/2 flex flex-col justify-center bg-transparent relative z-20">
                                <h3 className="text-3xl font-heading font-medium text-white mb-4 drop-shadow-sm">{t('impact.card4.title')}</h3>
                                <p className="text-white/80 text-lg leading-relaxed font-light">
                                    {t('impact.card4.desc')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}