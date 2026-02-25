import React, { useState } from 'react';
import { useTranslation } from './LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { XIcon, ArrowRight } from './Icons';
import { ShaderAnimation } from './ui/shader-animation';

interface RegisterPageProps {
    onBack: () => void;
    onRegisterSuccess?: () => void;
    onSwitchToLogin: () => void;
}

const SocialButton = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
    <button className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group backdrop-blur-sm">
        {icon}
        <span className="text-sm font-medium text-white/80 group-hover:text-white">{label}</span>
    </button>
)

const StepCard = ({ number, title, active = false }: { number: string, title: string, active?: boolean }) => (
    <div className={`flex flex-col p-5 rounded-2xl border transition-all duration-300 h-32 justify-between backdrop-blur-md ${active ? 'bg-white/90 text-black border-white scale-105 shadow-xl' : 'bg-black/20 text-white/60 border-white/10 hover:bg-black/30'}`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${active ? 'bg-black text-white' : 'bg-white/10 text-white/40'}`}>
            {number}
        </div>
        <span className={`text-sm font-medium leading-tight ${active ? 'text-black' : 'text-white/60'}`}>
            {title}
        </span>
    </div>
)

const RegisterPage: React.FC<RegisterPageProps> = ({ onBack, onRegisterSuccess, onSwitchToLogin }) => {
    const { t } = useTranslation();
    const { register, loginWithGoogle, isLoading, error, clearError } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [companyName, setCompanyName] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        try {
            await register(email, password, companyName);
            // Success! Trigger navigation to dashboard
            if (onRegisterSuccess) {
                onRegisterSuccess();
            }
        } catch (err) {
            // Error is handled by AuthContext and available in `error` state
            console.error('Registration failed:', err);
        }
    };

    const handleGoogleLogin = async () => {
        clearError();
        try {
            await loginWithGoogle();
            // Will redirect to Google OAuth
        } catch (err) {
            console.error('Google login failed:', err);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black flex overflow-hidden">
            {/* --- Global Background Shader --- */}
            <div className="absolute inset-0 z-0">
                <ShaderAnimation />
                {/* Overlay for better text contrast, subtle darken */}
                <div className="absolute inset-0 bg-black/20"></div>
            </div>

            {/* Close Button (Mobile) */}
            <button
                onClick={onBack}
                className="absolute top-6 left-6 z-50 lg:hidden w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white backdrop-blur-md"
            >
                <XIcon />
            </button>

            {/* Back Button (Desktop) */}
            <button onClick={onBack} className="absolute top-8 left-8 text-white/50 hover:text-white transition-colors lg:block hidden z-50">
                <span className="text-2xl font-light">←</span>
            </button>

            <div className="relative z-10 w-full flex h-full">

                {/* --- Left Column: Visual & Steps (Desktop Only) --- */}
                <div className="hidden lg:flex w-1/2 flex-col justify-between p-16">
                    {/* Logo Area */}
                    <div className="relative z-10">
                        <span className="text-white font-mono font-bold tracking-widest text-xl">&lt;X100&gt;</span>
                    </div>

                    {/* Main Text Content */}
                    <div className="relative z-10 mb-12">
                        <h1 className="text-5xl font-serif text-white mb-6 leading-tight tracking-tight drop-shadow-lg">
                            {t('register.title')} <br />
                            {t('register.title_suffix')}
                        </h1>
                        <p className="text-white/80 text-lg font-light max-w-md mb-12 drop-shadow-md">
                            {t('register.subtitle')}
                        </p>

                        {/* Steps Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            <StepCard number="1" title={t('login.step1')} active={true} />
                            <StepCard number="2" title={t('login.step2')} />
                            <StepCard number="3" title={t('login.step3')} />
                        </div>
                    </div>
                </div>

                {/* --- Right Column: Register Form --- */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
                    {/* Glass Plate Container - 30% Dark Tint + Blur */}
                    <div className="w-full max-w-[480px] bg-black/30 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 md:p-12 shadow-2xl">
                        <div className="mb-10 text-center lg:text-left">
                            <h2 className="text-3xl font-medium text-white mb-2">{t('register.form.title')}</h2>
                            <p className="text-gray-300 text-sm font-light">{t('register.form.subtitle')}</p>
                        </div>

                        {/* Social Auth */}
                        <div className="flex gap-4 mb-8">
                            <button
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                                type="button"
                                className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                <span className="text-sm font-medium text-white/80 group-hover:text-white">Google</span>
                            </button>
                        </div>

                        <div className="relative mb-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="bg-black/20 backdrop-blur-sm px-2 text-gray-400 rounded">Or</span>
                            </div>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-5">
                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 backdrop-blur-sm">
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs text-gray-300 ml-1">{t('login.email')}</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    required
                                    disabled={isLoading}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-500 outline-none focus:border-white/30 focus:bg-black/40 transition-all text-sm backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-gray-300 ml-1">{t('register.company')}</label>
                                <input
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="Your Company Name"
                                    required
                                    disabled={isLoading}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-500 outline-none focus:border-white/30 focus:bg-black/40 transition-all text-sm backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-gray-300 ml-1">{t('login.password')}</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password (min 8 characters)"
                                        required
                                        minLength={8}
                                        disabled={isLoading}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-500 outline-none focus:border-white/30 focus:bg-black/40 transition-all text-sm backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                    <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    </button>
                                </div>
                            </div>

                            <p className="text-[11px] text-gray-500">
                                {t('login.min_chars')}
                            </p>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-white text-black font-bold text-sm py-4 rounded-xl hover:bg-gray-200 transition-colors mt-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Creating account...' : t('register.submit')}
                            </button>
                        </form>

                        <div className="text-center mt-8">
                            <p className="text-sm text-gray-400">
                                {t('register.footer')}{' '}
                                <a
                                    onClick={onSwitchToLogin}
                                    className="text-white font-medium hover:underline cursor-pointer"
                                >
                                    {t('register.footer_link')}
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
