import React, { useState, useEffect } from 'react';
import { ledger } from './services/ledger';
import ManualForm from './components/ManualForm';
import ReceiptScanner from './components/ReceiptScanner';

function App() {
    const [balance, setBalance] = useState(0);
    const [activeTab, setActiveTab] = useState('manual');

    useEffect(() => {
        const sub = ledger.getBalance().subscribe(val => {
            setBalance(val);
        });
        return () => sub.unsubscribe();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-md mx-auto space-y-6">

                {/* Header / Balance Card */}
                <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg">
                    <h1 className="text-sm opacity-80 uppercase tracking-wider">Total Balance</h1>
                    <div className="text-4xl font-bold mt-2">
                        ${balance.toFixed(2)}
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex space-x-2 bg-white p-1 rounded-lg shadow">
                    <button
                        onClick={() => setActiveTab('manual')}
                        className={`flex-1 py-2 rounded-md transition-colors ${activeTab === 'manual' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        Manual
                    </button>
                    <button
                        onClick={() => setActiveTab('scan')}
                        className={`flex-1 py-2 rounded-md transition-colors ${activeTab === 'scan' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        Scan Receipt
                    </button>
                </div>

                {/* Content Area */}
                <div className="transition-all duration-300">
                    {activeTab === 'manual' ? <ManualForm /> : <ReceiptScanner />}
                </div>

            </div>
        </div>
    );
}

export default App;
