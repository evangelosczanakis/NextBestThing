import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import Slider from './Slider';

const BudgetPlayground = () => {
    const [totalIncome, setTotalIncome] = useState(1000);
    const [allocations, setAllocations] = useState({
        needs: 50,
        wants: 30,
        savings: 20,
    });

    const handleAllocationChange = (category, newValue) => {
        setAllocations((prev) => ({
            ...prev,
            [category]: newValue,
        }));
    };

    const totalAllocatedPercent = Object.values(allocations).reduce((a, b) => a + b, 0);
    const remainingPercent = 100 - totalAllocatedPercent;
    const remainingAmount = totalIncome * (remainingPercent / 100);

    const isOverBudget = remainingPercent < 0;

    return (
        <GlassCard className="p-6 max-w-md mx-auto w-full">
            <div className="mb-6 text-center">
                <h2 className="text-xl font-semibold text-slate-800 mb-2">Budget Playground</h2>
                <div className="flex flex-col items-center">
                    <label className="text-sm text-slate-500 mb-1">Monthly Income</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                        <input
                            type="number"
                            value={totalIncome}
                            onChange={(e) => setTotalIncome(Number(e.target.value))}
                            className="pl-7 pr-4 py-2 rounded-xl bg-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-32 text-center font-bold text-lg text-slate-800"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <Slider
                    label="Needs"
                    value={allocations.needs}
                    onChange={(val) => handleAllocationChange('needs', val)}
                    color="blue"
                />
                <Slider
                    label="Wants"
                    value={allocations.wants}
                    onChange={(val) => handleAllocationChange('wants', val)}
                    color="purple"
                />
                <Slider
                    label="Savings"
                    value={allocations.savings}
                    onChange={(val) => handleAllocationChange('savings', val)}
                    color="green"
                />
            </div>

            <div className="mt-8 pt-6 border-t border-white/20 text-center">
                <p className="text-sm text-slate-500 mb-1">Remaining</p>
                <div className={`text-4xl font-bold transition-colors duration-300 ${isOverBudget ? 'text-red-500' : 'text-emerald-600'}`}>
                    ${remainingAmount.toFixed(2)}
                </div>
                {isOverBudget && (
                    <p className="text-red-500 text-sm mt-2 font-medium">Over Budget!</p>
                )}
            </div>
        </GlassCard>
    );
};

export default BudgetPlayground;
