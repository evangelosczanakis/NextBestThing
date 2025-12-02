import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, ArrowRight, DollarSign, X, Briefcase } from 'lucide-react';

const EmergencyModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [executed, setExecuted] = useState(false);

    // Mock function to simulate backend call to calculate_emergency_fund_release
    const generatePlan = async () => {
        setLoading(true);

        // In a real app, this would be a fetch call to the backend
        // const response = await fetch('/api/emergency/calculate', { ... });

        // Simulating backend response
        setTimeout(() => {
            setPlan({
                status: "success",
                target_amount: 500,
                total_raised: 500,
                remaining_needed: 0,
                plan: [
                    {
                        step: 1,
                        source: "Wants (Dining Out)",
                        amount_taken: 150.00,
                        new_balance: 0,
                        description: "Draining non-essential 'Dining Out' budget."
                    },
                    {
                        step: 2,
                        source: "Wants (Entertainment)",
                        amount_taken: 100.00,
                        new_balance: 50,
                        description: "Reducing 'Entertainment' budget."
                    },
                    {
                        step: 3,
                        source: "Flexible Needs (Groceries)",
                        amount_taken: 250.00,
                        new_balance: 300,
                        description: "Switching to generic brands for Groceries."
                    }
                ],
                gig_suggestions: [
                    { id: 1, type: "DoorDash", description: "3 DoorDash runs near you", estimated_earnings: 45.00 },
                    { id: 2, type: "TaskRabbit", description: "Assemble IKEA furniture", estimated_earnings: 60.00 }
                ]
            });
            setLoading(false);
        }, 1500);
    };

    const executePlan = () => {
        // Here we would call the backend to actually apply the changes
        setExecuted(true);
        setTimeout(() => {
            setIsOpen(false);
            setExecuted(false);
            setPlan(null);
        }, 2000);
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => { setIsOpen(true); generatePlan(); }}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/80 to-rose-600/80 p-6 text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-red-500/25"
            >
                <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="flex items-center gap-3">
                    <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                        <AlertTriangle className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-xl font-bold">Panic Button</h3>
                        <p className="text-sm text-red-100">Fix My Budget Instantly</p>
                    </div>
                </div>
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    {/* Modal Content - Glassmorphism */}
                    <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/20 bg-gray-900/80 backdrop-blur-xl shadow-2xl">

                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-red-500/20 p-2 text-red-400">
                                    <AlertTriangle className="h-6 w-6" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Emergency Fund Rescue</h2>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-500 border-t-transparent"></div>
                                    <p className="text-gray-300 animate-pulse">Analyzing budget for liquid funds...</p>
                                </div>
                            ) : executed ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                                    <div className="rounded-full bg-green-500/20 p-4 text-green-400">
                                        <CheckCircle className="h-16 w-16" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">Crisis Averted!</h3>
                                    <p className="text-gray-300">Your budget has been adjusted. Funds are now available.</p>
                                </div>
                            ) : plan ? (
                                <div className="space-y-6">
                                    {/* Summary Card */}
                                    <div className="rounded-2xl bg-gradient-to-r from-red-500/10 to-orange-500/10 p-5 border border-red-500/20">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-sm text-gray-400">Target Amount</p>
                                                <p className="text-2xl font-bold text-white">${plan.target_amount}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-400">Found</p>
                                                <p className="text-2xl font-bold text-green-400">${plan.total_raised}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Plan */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                            <ArrowRight className="h-5 w-5 text-red-400" />
                                            Reallocation Plan
                                        </h3>
                                        <div className="space-y-3">
                                            {plan.plan.map((step, idx) => (
                                                <div key={idx} className="flex items-center justify-between rounded-xl bg-white/5 p-4 border border-white/5 hover:bg-white/10 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-sm font-bold text-gray-400">
                                                            {step.step}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-white">{step.source}</p>
                                                            <p className="text-xs text-gray-400">{step.description}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-red-400">-${step.amount_taken}</p>
                                                        <p className="text-xs text-gray-500">New: ${step.new_balance}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Gig Suggestions */}
                                    {plan.gig_suggestions && plan.gig_suggestions.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                                <Briefcase className="h-5 w-5 text-blue-400" />
                                                Quick Income Boosts
                                            </h3>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {plan.gig_suggestions.map((gig) => (
                                                    <div key={gig.id} className="rounded-xl bg-blue-500/10 p-4 border border-blue-500/20 hover:bg-blue-500/20 transition-colors cursor-pointer">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">{gig.type}</span>
                                                            <span className="text-green-400 font-bold text-sm">+${gig.estimated_earnings}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-300">{gig.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>

                        {/* Footer */}
                        {!loading && !executed && plan && (
                            <div className="border-t border-white/10 bg-white/5 p-6">
                                <button
                                    onClick={executePlan}
                                    className="w-full rounded-xl bg-gradient-to-r from-red-600 to-rose-600 py-4 font-bold text-white shadow-lg shadow-red-900/20 hover:from-red-500 hover:to-rose-500 transition-all active:scale-[0.98]"
                                >
                                    Execute Reallocation
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default EmergencyModal;
