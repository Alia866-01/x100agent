import React from 'react';
import { SectionHeading } from './ProductSections';
import { motion } from 'framer-motion';
import { useTranslation } from './LanguageContext';

export const About = () => {
    const { t } = useTranslation();

    const teamMembers = [
        { name: t('about.team.david.name'), role: t('about.team.david.role'), img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=400" },
        { name: t('about.team.sarah.name'), role: t('about.team.sarah.role'), img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400&h=400" },
        { name: t('about.team.james.name'), role: t('about.team.james.role'), img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&h=400" },
    ];

    return (
        <div className="pt-32 pb-24 px-4 min-h-screen bg-black text-white relative overflow-hidden">

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-24">
                    <SectionHeading className="!text-5xl md:!text-8xl font-light mb-8">{t('about.mission.title')} <em className="italic text-gray-500">{t('about.mission.title_suffix')}</em></SectionHeading>
                    <p className="text-2xl text-gray-400 font-light max-w-3xl mx-auto leading-relaxed">
                        {t('about.mission.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-32 items-center">
                    <div>
                        <SectionHeading className="text-left mb-6">{t('about.problem.title')} <em className="italic text-gray-500">{t('about.problem.title_suffix')}</em></SectionHeading>
                        <p className="text-gray-400 leading-relaxed mb-6 font-light">
                            {t('about.problem.p1')}
                        </p>
                        <p className="text-gray-400 leading-relaxed font-light">
                            {t('about.problem.p2')}
                        </p>
                    </div>
                    <div className="bg-[#1C1C1E] border border-white/10 p-8 rounded-2xl relative">
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/20 blur-2xl rounded-full"></div>
                        <div className="h-64 flex items-center justify-center text-gray-600 font-mono text-sm uppercase tracking-widest border border-dashed border-white/20 rounded-xl">
                            {t('about.problem.visual')}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-32 items-center">
                    <div className="order-2 md:order-1 bg-[#1C1C1E] border border-white/10 p-8 rounded-2xl relative">
                        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-purple-500/20 blur-2xl rounded-full"></div>
                        <div className="h-64 flex items-center justify-center text-gray-600 font-mono text-sm uppercase tracking-widest border border-dashed border-white/20 rounded-xl">
                            {t('about.solution.visual')}
                        </div>
                    </div>
                    <div className="order-1 md:order-2">
                        <SectionHeading className="text-left mb-6">{t('about.solution.title')} <em className="italic text-gray-500">{t('about.solution.title_suffix')}</em></SectionHeading>
                        <p className="text-gray-400 leading-relaxed mb-6 font-light">
                            {t('about.solution.p1')}
                        </p>
                        <p className="text-gray-400 leading-relaxed font-light">
                            {t('about.solution.p2')}
                        </p>
                    </div>
                </div>

                <div className="text-center mb-12">
                    <SectionHeading className="mb-16">{t('about.leadership.title')}</SectionHeading>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {teamMembers.map((member, i) => (
                            <div key={i} className="group">
                                <div className="w-48 h-48 mx-auto rounded-full overflow-hidden mb-6 border border-white/10 group-hover:border-white/50 transition-colors duration-500 relative">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all duration-500 z-10"></div>
                                    <img src={member.img} alt={member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                </div>
                                <h3 className="text-xl text-white font-serif">{member.name}</h3>
                                <p className="text-sm text-gray-500 font-mono uppercase tracking-widest mt-2">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
