import React, { useState, useEffect } from 'react';
import Dashboard from './views/Dashboard';
import BudgetTab from './views/BudgetTab';
import GroceryMealPlanner from './views/GroceryMealPlanner';
import Onboarding from './views/Onboarding';
import { SafeModeProvider } from './context/SafeModeContext';
import { LayoutDashboard, Wallet, Search } from 'lucide-react';

function App() {
    const [activeTab, setActiveTab] = useState(() => {
        const isComplete = localStorage.getItem('onboardingComplete');
        return isComplete ? 'dashboard' : 'onboarding';
    });

    return (
        <SafeModeProvider>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans text-slate-800">
                {/* Main Content */}
                <main className="pb-24 pt-8 px-4">
                    {activeTab === 'onboarding' && <Onboarding onComplete={() => setActiveTab('dashboard')} />}
                    {activeTab === 'dashboard' && <Dashboard />}
                    {activeTab === 'budget' && <BudgetTab />}
                    {activeTab === 'search' && <GroceryMealPlanner />}
                </main>

                {/* Bottom Navigation */}
                <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-white/20 shadow-lg z-50 pb-safe">
                    <div className="flex justify-around items-center max-w-md mx-auto">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`flex flex-col items-center p-4 transition-colors ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <LayoutDashboard size={24} />
                            <span className="text-xs font-medium mt-1">Dashboard</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('search')}
                            className={`flex flex-col items-center p-4 transition-colors ${activeTab === 'search' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Search size={24} />
                            <span className="text-xs font-medium mt-1">Search</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('budget')}
                            className={`flex flex-col items-center p-4 transition-colors ${activeTab === 'budget' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Wallet size={24} />
                            <span className="text-xs font-medium mt-1">Budget</span>
                        </button>
                    </div>
                </nav>
            </div>
        </SafeModeProvider>
    );
}

export default App;
