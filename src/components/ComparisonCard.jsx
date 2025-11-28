import React from 'react';
import GlassCard from './GlassCard';

const ComparisonCard = ({ nameBrand, genericBrand, priceGap, store }) => {
    return (
        <GlassCard className="p-0 overflow-hidden animate-fade-in">
            <div className="flex flex-col md:flex-row relative">
                {/* Left Side: Name Brand (Expensive) */}
                <div className="flex-1 p-6 bg-red-50/10 backdrop-blur-sm border-r border-white/10 flex flex-col items-center justify-center text-center">
                    <h3 className="text-slate-500 text-sm uppercase tracking-wider font-semibold mb-2">Name Brand</h3>
                    <p className="text-slate-800 font-bold text-lg">{nameBrand}</p>
                </div>

                {/* Center Badge */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="bg-emerald-500 text-white px-4 py-2 rounded-full shadow-lg font-bold text-sm whitespace-nowrap border-2 border-white/20 backdrop-blur-md">
                        Save ${priceGap.toFixed(2)}
                    </div>
                </div>

                {/* Right Side: Generic Brand (Savings) */}
                <div className="flex-1 p-6 bg-green-50/10 backdrop-blur-sm flex flex-col items-center justify-center text-center">
                    <h3 className="text-slate-500 text-sm uppercase tracking-wider font-semibold mb-2">Generic Swap</h3>
                    <p className="text-slate-800 font-bold text-lg">{genericBrand}</p>
                    <p className="text-xs text-slate-400 mt-2">at {store}</p>
                </div>
            </div>
        </GlassCard>
    );
};

export default ComparisonCard;
