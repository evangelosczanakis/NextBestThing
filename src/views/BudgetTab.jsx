import React, { useState } from 'react';
import BudgetPlayground from '../components/BudgetPlayground';
import ProjectBuilder from '../components/ProjectBuilder';
import CashGrid from '../components/CashGrid';
import FrictionUnlock from '../components/FrictionUnlock';

const BudgetTab = () => {
    const [mode, setMode] = useState('Allocator'); // 'Allocator' | 'ProjectBuilder'

    return (
        <div className="max-w-md mx-auto mt-6 pb-24">
            <div className="flex justify-center mb-6">
                <div className="bg-slate-200/50 p-1 rounded-xl flex gap-1">
                    <button
                        onClick={() => setMode('Allocator')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${mode === 'Allocator'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Allocator
                    </button>
                    <button
                        onClick={() => setMode('ProjectBuilder')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${mode === 'ProjectBuilder'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Project Builder
                    </button>
                    <button
                        onClick={() => setMode('QuickAdd')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${mode === 'QuickAdd'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Quick Add
                    </button>
                </div>
            </div>

            <div className="transition-opacity duration-300">
                {mode === 'Allocator' ? (
                    <BudgetPlayground />
                ) : mode === 'ProjectBuilder' ? (
                    <ProjectBuilder />
                ) : (
                    <div className="space-y-6">
                        <CashGrid />
                        <div className="px-4">
                            <h4 className="text-sm font-medium text-slate-500 mb-2 uppercase tracking-wider">Safety Controls</h4>
                            <FrictionUnlock
                                label="Unlock Emergency Fund"
                                warningText="⚠️ Using Emergency Savings!"
                                onUnlock={() => console.log("Emergency Fund Unlocked")}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BudgetTab;
