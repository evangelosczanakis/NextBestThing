import React, { useMemo } from 'react';
import GlassCard from './GlassCard';
import { RefreshCw } from 'lucide-react';

const SUBSCRIPTION_KEYWORDS = [
    'Netflix', 'Spotify', 'Apple', 'iCloud', 'Hulu', 'HBO', 'Disney', 'Prime',
    'Gym', 'Fitness', 'Adobe', 'Patreon', 'GitHub', 'ChatGPT', 'Claude'
];

const SubscriptionSidebar = ({ transactions = [] }) => {
    const subscriptions = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];

        // Simple heuristic: Filter expenses that match known subscription keywords
        // In a real app, this would be smarter (e.g., same amount same day each month)
        return transactions
            .filter(t => t.type === 'EXPENSE' && SUBSCRIPTION_KEYWORDS.some(k => t.desc.toLowerCase().includes(k.toLowerCase())))
            .map((t, index) => ({
                id: index,
                name: t.desc,
                amount: t.amount,
                icon: t.desc.charAt(0).toUpperCase()
            }))
            // Deduplicate by name (taking the most recent one roughly)
            .filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);
    }, [transactions]);

    const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);

    if (subscriptions.length === 0) {
        return (
            <GlassCard className="p-6 sticky top-6 h-fit text-center">
                <div className="flex flex-col items-center gap-2 text-slate-400">
                    <RefreshCw size={24} />
                    <p className="text-sm">No recurring subscriptions detected.</p>
                </div>
            </GlassCard>
        );
    }

    return (
        <GlassCard className="p-0 sticky top-6 h-fit">
            <div className="p-4 border-b border-white/20 bg-white/5 flex items-center gap-2">
                <RefreshCw size={18} className="text-indigo-500" />
                <h3 className="font-semibold text-slate-700">Recurring</h3>
            </div>

            <div className="divide-y divide-white/10 max-h-[400px] overflow-y-auto">
                {subscriptions.map((sub) => (
                    <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-white/20 transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                {sub.icon}
                            </div>
                            <span className="text-sm font-medium text-slate-700 truncate">{sub.name}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-800">${sub.amount.toFixed(2)}</span>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-white/20 bg-indigo-50/30">
                <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Monthly Total</span>
                    <span className="text-lg font-bold text-indigo-700">${totalMonthly.toFixed(2)}</span>
                </div>
            </div>
        </GlassCard>
    );
};

export default SubscriptionSidebar;
