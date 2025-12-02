import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fuel, Utensils, Banknote, Plus, Check, Delete, X } from 'lucide-react';
import GlassCard from './GlassCard';

const CashGrid = () => {
    const [showCustom, setShowCustom] = useState(false);
    const [customAmount, setCustomAmount] = useState('');
    const [isIncome, setIsIncome] = useState(false); // Toggle state
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleQuickAdd = async (amount, description, type, direction) => {
        try {
            const response = await fetch('http://localhost:8000/add-transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    description,
                    type,
                    direction
                }),
            });

            if (!response.ok) throw new Error('Failed to add transaction');

            showToast(`Added ${description}: $${amount}`);
        } catch (error) {
            console.error(error);
            showToast('Error adding transaction', 'error');
        }
    };

    const handleKeypadPress = (key) => {
        if (key === 'backspace') {
            setCustomAmount(prev => prev.slice(0, -1));
        } else if (key === '.') {
            if (!customAmount.includes('.')) {
                setCustomAmount(prev => prev + key);
            }
        } else {
            // Limit length
            if (customAmount.length < 8) {
                setCustomAmount(prev => prev + key);
            }
        }
    };

    const handleCustomSubmit = () => {
        if (!customAmount) return;
        const amount = parseFloat(customAmount);
        if (isNaN(amount) || amount <= 0) return;

        handleQuickAdd(
            amount,
            isIncome ? "Custom Income" : "Custom Expense",
            'cash',
            isIncome ? 'INCOME' : 'EXPENSE'
        );

        setCustomAmount('');
        setShowCustom(false);
    };

    const buttons = [
        {
            label: "Gas ($20)",
            amount: 20,
            desc: "Gas",
            type: "cash",
            direction: "EXPENSE",
            icon: <Fuel size={24} />,
            color: "bg-amber-100 text-amber-600 border-amber-200",
            hover: "hover:bg-amber-200"
        },
        {
            label: "Food ($15)",
            amount: 15,
            desc: "Food",
            type: "cash",
            direction: "EXPENSE",
            icon: <Utensils size={24} />,
            color: "bg-blue-100 text-blue-600 border-blue-200",
            hover: "hover:bg-blue-200"
        },
        {
            label: "Tips (+$50)",
            amount: 50,
            desc: "Tips",
            type: "cash",
            direction: "INCOME",
            icon: <Banknote size={24} />,
            color: "bg-emerald-100 text-emerald-600 border-emerald-200",
            hover: "hover:bg-emerald-200"
        },
    ];

    // Keypad keys layout
    const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'backspace'];

    return (
        <div className="relative">
            <GlassCard className="p-6 overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">Quick Cash</h3>
                    {/* Toggle Switch */}
                    <div className="flex items-center bg-slate-100 rounded-full p-1">
                        <button
                            onClick={() => setIsIncome(false)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${!isIncome ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`}
                        >
                            Expense
                        </button>
                        <button
                            onClick={() => setIsIncome(true)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${isIncome ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}
                        >
                            Income
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {buttons.map((btn, index) => (
                        <motion.button
                            key={index}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleQuickAdd(btn.amount, btn.desc, btn.type, btn.direction)}
                            className={`p-4 rounded-2xl border ${btn.color} ${btn.hover} transition-colors flex flex-col items-center justify-center gap-2 shadow-sm`}
                        >
                            {btn.icon}
                            <span className="font-medium text-sm">{btn.label}</span>
                        </motion.button>
                    ))}

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCustom(true)}
                        className={`p-4 rounded-2xl border transition-colors flex flex-col items-center justify-center gap-2 shadow-sm
                            ${isIncome
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                    >
                        <Plus size={24} />
                        <span className="font-medium text-sm">Custom</span>
                    </motion.button>
                </div>
            </GlassCard>

            {/* Custom Entry Keypad Modal */}
            <AnimatePresence>
                {showCustom && (
                    <motion.div
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="absolute inset-0 bg-white z-20 flex flex-col rounded-3xl overflow-hidden shadow-2xl"
                    >
                        {/* Header */}
                        <div className={`p-4 flex justify-between items-center ${isIncome ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                            <span className="text-sm font-medium text-slate-500">
                                {isIncome ? 'Add Income' : 'Add Expense'}
                            </span>
                            <button onClick={() => setShowCustom(false)} className="p-1 rounded-full hover:bg-black/5">
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        {/* Display */}
                        <div className="flex-1 flex items-center justify-center p-4">
                            <span className={`text-4xl font-bold ${isIncome ? 'text-emerald-600' : 'text-slate-800'}`}>
                                ${customAmount || '0'}
                            </span>
                        </div>

                        {/* Keypad */}
                        <div className="bg-slate-50 p-4 pb-6">
                            <div className="grid grid-cols-3 gap-3">
                                {keys.map((key) => (
                                    <motion.button
                                        key={key}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleKeypadPress(key)}
                                        className="h-14 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-xl font-medium text-slate-700 active:bg-slate-100"
                                    >
                                        {key === 'backspace' ? <Delete size={20} /> : key}
                                    </motion.button>
                                ))}
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleCustomSubmit}
                                className={`w-full mt-4 py-3 rounded-xl font-semibold text-white shadow-lg
                                    ${isIncome ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            >
                                Confirm
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium z-30 whitespace-nowrap ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                            }`}
                    >
                        {toast.type === 'success' && <Check size={16} />}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CashGrid;
