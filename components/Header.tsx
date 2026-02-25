import React from 'react';
import { MenuIcon, ArrowRight, PlusIcon } from './Icons';
import { useTranslation } from './LanguageContext';

interface HeaderProps {
  onLoginClick?: () => void;
  onNavigate?: (view: string) => void;
}

const DropdownMenu: React.FC<{ title: string; items: { label: string; onClick: () => void }[]; hasIcon?: boolean }> = ({ title, items, hasIcon }) => (
  <div className="relative group h-full flex items-center">
    <button
      className="text-xs font-medium font-mono text-white/90 hover:text-white transition-colors uppercase flex items-center gap-1 tracking-wide h-full px-2"
    >
      {title} {hasIcon && <PlusIcon />}
    </button>

    {/* Dropdown Content */}
    <div className="absolute top-[calc(100%+10px)] left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
      <div className="bg-[#1C1C1E]/90 backdrop-blur-xl border border-white/10 rounded-xl p-2 w-48 shadow-2xl">
        <ul className="flex flex-col">
          {items.map((item, idx) => (
            <li key={idx}>
              <button
                onClick={item.onClick}
                className="block w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-sans"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

const Header: React.FC<HeaderProps> = ({ onLoginClick, onNavigate }) => {
  const { t, language, setLanguage } = useTranslation();

  const handleProductClick = () => {
    onNavigate?.('landing');
    setTimeout(() => {
      const el = document.getElementById('products');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
      {/* Floating Plate Container with Lighter Glass Effect */}
      <div className="w-full max-w-[1240px] bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl h-[68px] px-2 pl-6 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all hover:bg-white/15">

        {/* Left: Brand */}
        <div className="flex-shrink-0 cursor-pointer mr-8 flex items-center gap-2" onClick={() => onNavigate?.('landing')}>
          <span className="text-white font-mono font-bold tracking-widest text-lg">&lt;X100&gt;</span>
        </div>

        {/* Center: Navigation */}
        <nav className="hidden lg:flex items-center space-x-6 h-full mr-auto">
          <DropdownMenu
            title={t('nav.products')}
            items={[
              { label: t('products.sales_manager'), onClick: handleProductClick },
              { label: t('products.receptionist'), onClick: handleProductClick },
              { label: t('products.support_agent'), onClick: handleProductClick },
              { label: t('products.personal_assistant'), onClick: handleProductClick },
              { label: t('products.content_manager'), onClick: handleProductClick }
            ]}
            hasIcon={true}
          />
          <button onClick={() => onNavigate?.('about')} className="text-xs font-medium font-mono text-white/90 hover:text-white transition-colors uppercase flex items-center gap-1 tracking-wide h-full px-2">
            {t('nav.about')}
          </button>
          <button onClick={() => onNavigate?.('blog')} className="text-xs font-medium font-mono text-white/90 hover:text-white transition-colors uppercase flex items-center gap-1 tracking-wide h-full px-2">
            {t('nav.blog')}
          </button>
          <button onClick={() => onNavigate?.('careers')} className="text-xs font-medium font-mono text-white/90 hover:text-white transition-colors uppercase flex items-center gap-1 tracking-wide h-full px-2">
            {t('nav.careers')}
          </button>
          <button onClick={() => onNavigate?.('contact')} className="text-xs font-medium font-mono text-white/90 hover:text-white transition-colors uppercase flex items-center gap-1 tracking-wide h-full px-2">
            {t('nav.contact')}
          </button>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center space-x-3 pr-2">
          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ru' : 'en')}
            className="hidden md:flex items-center justify-center text-[10px] font-mono font-bold text-white/70 hover:text-white border border-white/10 rounded-md px-2 py-1 transition-colors w-[32px]"
          >
            {language === 'en' ? 'RU' : 'EN'}
          </button>

          <button
            onClick={onLoginClick}
            className="hidden md:block text-[12px] font-medium font-mono text-white/90 hover:text-white transition-colors uppercase tracking-wide px-4"
          >
            {t('nav.login')}
          </button>
          <button
            onClick={onLoginClick}
            className="bg-white text-black pl-5 pr-4 py-3 rounded-lg text-[12px] font-bold font-mono tracking-wide hover:bg-gray-100 transition-all duration-300 uppercase flex items-center leading-none shadow-[0_0_20px_rgba(255,255,255,0.2)] group"
          >
            {t('hero.cta.start')} <ArrowRight />
          </button>
          <button className="lg:hidden text-white ml-2 bg-white/10 p-2 rounded-lg">
            <MenuIcon />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;