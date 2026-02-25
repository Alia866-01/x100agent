import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SendIcon, CheckIcon } from './Icons';
import { useTranslation } from './LanguageContext';

export const Contact = () => {
    const { t } = useTranslation();
    const [formState, setFormState] = useState<'idle' | 'sending' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormState('sending');
        // Simulate API call
        setTimeout(() => {
            setFormState('success');
        }, 1500);
    };

    return (
        <div className="pt-32 pb-24 px-4 min-h-screen bg-black text-white relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/10 blur-[120px] pointer-events-none"></div>

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-7xl font-serif font-light mb-6 tracking-tight">{t('contact.title')} <em className="italic text-gray-500">{t('contact.title_suffix')}</em></h1>
                    <p className="text-xl text-gray-400 font-light max-w-xl mx-auto">
                        {t('contact.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-white font-serif text-2xl mb-2">{t('contact.headquarters')}</h3>
                            <p className="text-gray-400 font-light">
                                {t('contact.headquarters.address')}<br />
                                {t('contact.headquarters.city')}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-white font-serif text-2xl mb-2">{t('contact.email')}</h3>
                            <p className="text-gray-400 font-light">
                                {t('contact.email.hello')}<br />
                                {t('contact.email.support')}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-white font-serif text-2xl mb-2">{t('contact.follow')}</h3>
                            <div className="flex gap-4">
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">{t('contact.social.twitter')}</a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">{t('contact.social.linkedin')}</a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">{t('contact.social.instagram')}</a>
                            </div>
                        </div>
                    </div>

                    {/* Feedback Form */}
                    <div className="bg-[#1C1C1E]/50 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
                        {formState === 'success' ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-12"
                            >
                                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckIcon className="w-8 h-8 text-green-500" />
                                </div>
                                <h3 className="text-2xl text-white font-serif mb-2">{t('contact.success.title')}</h3>
                                <p className="text-gray-400">{t('contact.success.subtitle')}</p>
                                <button
                                    onClick={() => setFormState('idle')}
                                    className="mt-6 text-sm text-blue-400 hover:text-blue-300 underline"
                                >
                                    {t('contact.success.send_another')}
                                </button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">{t('contact.form.name')}</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00C2FF] transition-colors"
                                        placeholder={t('contact.form.name.placeholder')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">{t('contact.form.email')}</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00C2FF] transition-colors"
                                        placeholder={t('contact.form.email.placeholder')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">{t('contact.form.message')}</label>
                                    <textarea
                                        required
                                        rows={4}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00C2FF] transition-colors"
                                        placeholder={t('contact.form.message.placeholder')}
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={formState === 'sending'}
                                    className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {formState === 'sending' ? (
                                        <span>{t('contact.form.sending')}</span>
                                    ) : (
                                        <>
                                            {t('contact.form.submit')} <SendIcon className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
