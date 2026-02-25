import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from './Icons';
import { useTranslation } from './LanguageContext';

export const CookieConsent: React.FC = () => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            // Delay appearance slightly for better UX
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookie-consent', 'declined');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-[400px] z-[100]"
                >
                    <div className="bg-[#1C1C1E]/90 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
                        {/* Gradient Glow */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="relative z-10">
                            <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                                {t('cookie.title')}
                            </h3>
                            <p className="text-gray-400 text-sm font-light leading-relaxed mb-6">
                                {t('cookie.text')}
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleAccept}
                                    className="flex-1 bg-white text-black text-xs font-bold py-2.5 rounded-lg hover:bg-gray-200 transition-colors uppercase tracking-wide"
                                >
                                    {t('cookie.accept')}
                                </button>
                                <button
                                    onClick={handleDecline}
                                    className="flex-1 bg-white/5 border border-white/10 text-white text-xs font-medium py-2.5 rounded-lg hover:bg-white/10 transition-colors uppercase tracking-wide"
                                >
                                    {t('cookie.decline')}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsVisible(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                        >
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
