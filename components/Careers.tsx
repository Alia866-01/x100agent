import React from 'react';
import { SectionHeading } from './ProductSections';
import { motion } from 'framer-motion';
import { ArrowRight } from './Icons';
import { useTranslation } from './LanguageContext';

const useJobs = () => {
    const { t } = useTranslation();
    return [
        {
            title: t('careers.job1.title'),
            department: t('careers.job1.department'),
            location: t('careers.job1.location'),
            type: t('careers.job1.type'),
        },
        {
            title: t('careers.job2.title'),
            department: t('careers.job2.department'),
            location: t('careers.job2.location'),
            type: t('careers.job2.type'),
        },
        {
            title: t('careers.job3.title'),
            department: t('careers.job3.department'),
            location: t('careers.job3.location'),
            type: t('careers.job3.type'),
        },
        {
            title: t('careers.job4.title'),
            department: t('careers.job4.department'),
            location: t('careers.job4.location'),
            type: t('careers.job4.type'),
        },
    ];
};

export const Careers = () => {
    const { t } = useTranslation();
    const JOBS = useJobs();
    return (
        <div className="pt-32 pb-24 px-4 min-h-screen bg-black text-white relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-900/10 blur-[150px] pointer-events-none"></div>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-20">
                    <SectionHeading className="!text-5xl md:!text-8xl font-light mb-8">{t('careers.title')} <em className="italic text-gray-500">{t('careers.title_suffix')}</em></SectionHeading>
                    <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">
                        {t('careers.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    <div className="bg-[#1C1C1E] border border-white/10 p-8 rounded-2xl">
                        <h3 className="text-2xl font-serif mb-4">{t('careers.autonomy.title')}</h3>
                        <p className="text-gray-400 font-light leading-relaxed">
                            {t('careers.autonomy.desc')}
                        </p>
                    </div>
                    <div className="bg-[#1C1C1E] border border-white/10 p-8 rounded-2xl">
                        <h3 className="text-2xl font-serif mb-4">{t('careers.impact.title')}</h3>
                        <p className="text-gray-400 font-light leading-relaxed">
                            {t('careers.impact.desc')}
                        </p>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-20">
                    <SectionHeading className="mb-12">{t('careers.positions.title')} <em className="italic text-gray-500">{t('careers.positions.title_suffix')}</em></SectionHeading>
                    <div className="space-y-4">
                        {JOBS.map((job, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group relative bg-[#111] hover:bg-[#161616] border border-white/5 p-6 md:p-8 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-colors duration-300"
                            >
                                <div>
                                    <h3 className="text-xl font-medium text-white group-hover:text-[#00C2FF] transition-colors">{job.title}</h3>
                                    <div className="flex gap-4 mt-2 text-sm text-gray-500 font-mono">
                                        <span>{job.department}</span>
                                        <span>•</span>
                                        <span>{job.location}</span>
                                        <span>•</span>
                                        <span>{job.type}</span>
                                    </div>
                                </div>
                                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="mt-20 text-center">
                    <p className="text-gray-500 mb-6 font-light">{t('careers.no_fit')}</p>
                    <a href="mailto:careers@x100.ai" className="inline-block border border-white/20 hover:bg-white hover:text-black text-white px-8 py-3 rounded-full transition-all duration-300 font-mono text-sm uppercase tracking-widest">
                        {t('careers.general_application')}
                    </a>
                </div>

            </div>
        </div>
    );
};
