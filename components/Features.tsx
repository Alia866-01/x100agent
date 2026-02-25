import React from 'react';
import { useTranslation } from './LanguageContext';
import { ChartIcon, ShieldIcon, WalletIcon } from './Icons';
import { Feature } from '../types';
import GlowingButton from './GlowingButton';

const FeatureCard: React.FC<Feature> = ({ title, description, icon, image, large }) => {
  const { t } = useTranslation();
  return (
    <div className={`group relative bg-[#0D0D0D] border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all duration-500 ${large ? 'md:col-span-2 md:row-span-2' : 'col-span-1'} flex flex-col`}>
      <div className="p-8 h-full flex flex-col">
        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 text-white border border-white/10">
          {icon}
        </div>
        <h3 className="text-2xl font-heading font-medium text-white mb-3 tracking-tight">{title}</h3>
        <p className="text-gray-400 leading-relaxed mb-10 font-light">{description}</p>

        <div className="mt-auto relative z-20">
          <GlowingButton href="#">
            {t('features.more_about')} {title.split(' ')[0]}
          </GlowingButton>
        </div>

        {image && (
          <div className="mt-8 rounded-xl overflow-hidden relative w-full h-64 md:h-auto flex-grow">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-transparent z-10" />
            <img src={image} alt={title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-80" />
          </div>
        )}
      </div>
    </div>
  );
};

const Features: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className="py-24 px-4 bg-black">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-20 md:text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-serif font-light text-white mb-6">{t('features.title')} <span className="text-gray-600">{t('features.title_suffix')}</span></h2>
          <p className="text-xl text-gray-400 font-light">{t('features.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            large={true}
            title={t('features.net_worth.title')}
            description={t('features.net_worth.desc')}
            icon={<ChartIcon />}
            image="https://images.unsplash.com/photo-1611974765270-ca1258634369?q=80&w=2664&auto=format&fit=crop"
          />
          <FeatureCard
            title={t('features.tax.title')}
            description={t('features.tax.desc')}
            icon={<ShieldIcon />}
          />
          <FeatureCard
            title={t('features.equity.title')}
            description={t('features.equity.desc')}
            icon={<WalletIcon />}
          />
          <FeatureCard
            title={t('features.retirement.title')}
            description={t('features.retirement.desc')}
            icon={<ChartIcon />}
          />
          <FeatureCard
            title={t('features.advisory.title')}
            description={t('features.advisory.desc')}
            icon={<ShieldIcon />}
            image="https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2669&auto=format&fit=crop"
          />
        </div>
      </div>
    </section>
  );
};

export default Features;