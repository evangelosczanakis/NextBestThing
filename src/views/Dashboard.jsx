import React, { useState } from 'react';
import GlassCard from '../components/GlassCard';
import { Upload, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

import SubscriptionSidebar from '../components/SubscriptionSidebar';

const Dashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [meta, setMeta] = useState({ ending_balance: 0, period: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8000/upload-pdf', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            // Expecting { meta: {...}, transactions: [...] }
            setMeta(data.meta || { ending_balance: 0 });
            setTransactions(data.transactions || []);
        } catch (err) {
            console.error(err);
            setError('Failed to upload and parse PDF');
        } finally {
            setLoading(false);
        }
    };

    // Calculate totals
    const totalIncome = transactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalSpend = transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0);

    const hasData = transactions.length > 0;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Financial Dashboard</h1>
                <div className="relative">
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="pdf-upload"
                    />
                    <label
                        htmlFor="pdf-upload"
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full cursor-pointer transition-colors shadow-lg font-medium"
                    >
                        {loading ? (
                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                            <Upload size={20} />
                        )}
                        Upload Statement
                    </label>
                </div>
            </header>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            <div className={`grid grid-cols-1 ${hasData ? 'lg:grid-cols-4' : ''} gap-6`}>
                {/* Main Content */}
                <div className={hasData ? 'lg:col-span-3 space-y-6' : 'max-w-4xl mx-auto w-full space-y-6'}>
                    {/* Balance Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <GlassCard className="p-6 flex flex-col items-center justify-center bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
                            <span className="text-slate-500 font-medium mb-2">Current Balance</span>
                            <div className="text-4xl font-bold text-slate-800 flex items-center">
                                <DollarSign className="text-slate-400 mr-1" size={24} />
                                {meta.ending_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </GlassCard>

                        <GlassCard className="p-6 flex flex-col items-center justify-center bg-green-500/5">
                            <span className="text-slate-500 font-medium mb-2 flex items-center gap-1">
                                <TrendingUp size={16} className="text-green-500" /> Income
                            </span>
                            <div className="text-2xl font-bold text-green-600">
                                +${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </GlassCard>

                        <GlassCard className="p-6 flex flex-col items-center justify-center bg-red-500/5">
                            <span className="text-slate-500 font-medium mb-2 flex items-center gap-1">
                                <TrendingDown size={16} className="text-red-500" /> Spend
                            </span>
                            <div className="text-2xl font-bold text-red-600">
                                -${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </GlassCard>
                    </div>

                    {/* Income vs Spend Chart (Simple Bar) */}
                    {(totalIncome > 0 || totalSpend > 0) && (
                        <GlassCard className="p-6">
                            <h3 className="text-lg font-semibold text-slate-700 mb-4">Cash Flow</h3>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 h-8 bg-slate-100 rounded-full overflow-hidden flex">
                                    <div
                                        className="bg-green-500 h-full transition-all duration-1000"
                                        style={{ width: `${(totalIncome / (totalIncome + totalSpend)) * 100}%` }}
                                    />
                                    <div
                                        className="bg-red-500 h-full transition-all duration-1000"
                                        style={{ width: `${(totalSpend / (totalIncome + totalSpend)) * 100}%` }}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between text-xs text-slate-500 mt-2">
                                <span>{(totalIncome / (totalIncome + totalSpend) * 100).toFixed(0)}% Income</span>
                                <span>{(totalSpend / (totalIncome + totalSpend) * 100).toFixed(0)}% Spend</span>
                            </div>
                        </GlassCard>
                    )}

                    {/* Transaction List */}
                    <GlassCard className="p-0 overflow-hidden">
                        <div className="p-4 border-b border-white/20 bg-white/5">
                            <h3 className="text-lg font-semibold text-slate-700">Recent Transactions</h3>
                        </div>
                        <div className="max-h-[500px] overflow-y-auto">
                            {transactions.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">
                                    No transactions loaded. Upload a PDF statement to see data.
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider sticky top-0 backdrop-blur-md">
                                        <tr>
                                            <th className="p-4 font-medium">Date</th>
                                            <th className="p-4 font-medium">Description</th>
                                            <th className="p-4 font-medium text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {transactions.map((t, index) => (
                                            <tr key={index} className="hover:bg-white/30 transition-colors">
                                                <td className="p-4 text-slate-600 text-sm whitespace-nowrap">{t.date}</td>
                                                <td className="p-4 text-slate-800 font-medium text-sm">{t.desc}</td>
                                                <td className={`p-4 text-sm font-bold text-right ${t.type === 'INCOME' ? 'text-green-600' : 'text-slate-800'}`}>
                                                    {t.type === 'INCOME' ? '+' : ''}${t.amount.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </GlassCard>
                </div>

                {/* Sidebar */}
                {hasData && (
                    <div className="lg:col-span-1">
                        <SubscriptionSidebar transactions={transactions} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
