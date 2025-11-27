import React, { useState } from 'react';
import { ledger } from '../services/ledger';

export default function ManualForm() {
    const [formData, setFormData] = useState({
        amount: '',
        merchant: '',
        category: '',
        type: 'expense'
    });
    const [status, setStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Saving...');
        try {
            await ledger.addTransaction(formData);
            setFormData({
                amount: '',
                merchant: '',
                category: '',
                type: 'expense'
            });
            setStatus('Saved!');
            setTimeout(() => setStatus(''), 2000);
        } catch (error) {
            console.error(error);
            setStatus('Error saving transaction');
        }
    };

    return (
        <div className="p-4 bg-white rounded shadow">
            <h2 className="text-xl font-bold mb-4">Add Transaction</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Amount</label>
                    <input
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Merchant</label>
                    <input
                        type="text"
                        value={formData.merchant}
                        onChange={e => setFormData({ ...formData, merchant: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Category</label>
                    <input
                        type="text"
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Type</label>
                    <select
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                        className="w-full p-2 border rounded"
                    >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                    </select>
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                >
                    Add Transaction
                </button>
                {status && <p className="text-center text-sm text-gray-600">{status}</p>}
            </form>
        </div>
    );
}
