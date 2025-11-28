import React from 'react';

const GlassCard = ({ children, className = "" }) => {
  return (
    <div className={`bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl text-slate-800 font-medium ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;
