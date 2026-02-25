import React from 'react';

interface GlowingButtonProps {
    children: React.ReactNode;
    href?: string;
    className?: string;
}

const GlowingButton: React.FC<GlowingButtonProps> = ({ children, href = '#', className = '' }) => {
    return (
        <div className={`relative inline-block rounded-lg p-[1px] overflow-hidden group ${className}`}>
            {/* Spinning Glow Gradient */}
            <div className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,255,255,0.7)_60deg,transparent_120deg)] animate-[spin-glow_3s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            
            {/* Inner Button Content */}
            <a href={href} className="relative block bg-[#0A0A0A] rounded-[7px] px-6 py-3 font-mono text-[11px] font-bold uppercase tracking-widest text-white transition-colors duration-200 group-hover:bg-[#151515] flex items-center justify-center border border-white/5 group-hover:border-transparent">
                {children}
            </a>
            
            {/* Default Static Border (Visible when not hovering) */}
            <div className="absolute inset-0 border border-white/10 rounded-lg pointer-events-none transition-opacity duration-300 group-hover:opacity-0"></div>
        </div>
    );
};

export default GlowingButton;