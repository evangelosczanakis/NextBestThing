import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, User, DollarSign, Calendar, ShieldAlert } from 'lucide-react';
import GlassCard from './GlassCard';

const OnboardingQuiz = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [archetype, setArchetype] = useState(null);

    const questions = [
        {
            id: 'payment_type',
            question: "How do you get paid?",
            options: [
                { value: 'W2', label: "Regular Paycheck (W2)", icon: <Calendar size={20} /> },
                { value: '1099', label: "Gig / Freelance (1099)", icon: <User size={20} /> },
                { value: 'Cash', label: "Cash / Tips", icon: <DollarSign size={20} /> },
            ]
        },
        {
            id: 'check_freq',
            question: "How often do you check your bank balance?",
            options: [
                { value: 'Daily', label: "Daily", icon: <Check size={20} /> },
                { value: 'Weekly', label: "When I have to", icon: <Calendar size={20} /> },
                { value: 'Never', label: "Never (I'm scared)", icon: <ShieldAlert size={20} /> },
            ]
        }
    ];

    const handleAnswer = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));

        if (step < questions.length - 1) {
            setStep(prev => prev + 1);
        } else {
            // Quiz finished, calculate archetype
            calculateArchetype({ ...answers, [questionId]: value });
        }
    };

    const calculateArchetype = (finalAnswers) => {
        let result = "The Family Manager"; // Default fallback

        const payment = finalAnswers['payment_type'];
        const freq = finalAnswers['check_freq'];

        if (freq === 'Never') {
            result = "The Ostrich";
        } else if (payment === '1099' && freq === 'Daily') {
            result = "The Gig Juggler";
        } else if (payment === 'Cash') {
            result = "The Cash Stuffer";
        } else if (payment === 'W2') {
            // Refine W2 logic if needed, for now default to Family Manager or maybe "The Steady Earner"
            // But user spec only listed 4 archetypes.
            result = "The Family Manager";
        }

        setArchetype(result);
        if (onComplete) {
            onComplete(result);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <AnimatePresence mode="wait">
                {!archetype ? (
                    <motion.div
                        key="quiz"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <GlassCard className="p-8">
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Question {step + 1} of {questions.length}
                                    </span>
                                    <div className="h-1 w-16 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 transition-all duration-500"
                                            style={{ width: `${((step + 1) / questions.length) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800">
                                    {questions[step].question}
                                </h2>
                            </div>

                            <div className="space-y-3">
                                {questions[step].options.map((option) => (
                                    <motion.button
                                        key={option.value}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleAnswer(questions[step].id, option.value)}
                                        className="w-full p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-500 hover:bg-indigo-50 transition-all flex items-center gap-4 text-left group shadow-sm"
                                    >
                                        <div className="p-2 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                            {option.icon}
                                        </div>
                                        <span className="font-medium text-slate-700 group-hover:text-indigo-900">
                                            {option.label}
                                        </span>
                                        <ArrowRight className="ml-auto text-slate-300 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all" size={18} />
                                    </motion.button>
                                ))}
                            </div>
                        </GlassCard>
                    </motion.div>
                ) : (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <GlassCard className="p-8 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: 0.2 }}
                                className="w-20 h-20 mx-auto bg-indigo-100 rounded-full flex items-center justify-center mb-6 text-indigo-600"
                            >
                                <User size={40} />
                            </motion.div>

                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Your Money Personality
                            </h3>
                            <h1 className="text-3xl font-bold text-slate-900 mb-4">
                                {archetype}
                            </h1>
                            <p className="text-slate-600 mb-8 leading-relaxed">
                                {archetype === "The Ostrich" && "You prefer to avoid looking at finances. We'll make it painless and automatic."}
                                {archetype === "The Gig Juggler" && "You have multiple income streams. We'll help you track taxes and irregular pay."}
                                {archetype === "The Cash Stuffer" && "You deal mostly in cash. We'll help you digitize your envelope system."}
                                {archetype === "The Family Manager" && "You're managing for the long haul. We'll help you optimize for stability."}
                            </p>

                            <button
                                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
                                onClick={() => console.log("Proceed to dashboard")}
                            >
                                Let's Get Started
                            </button>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OnboardingQuiz;
