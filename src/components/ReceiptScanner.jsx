import React, { useState } from 'react';
import { ai } from '../services/ai';
import { ledger } from '../services/ledger';

export default function ReceiptScanner() {
    const [scanning, setScanning] = useState(false);
    const [parsedData, setParsedData] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setScanning(true);
        setError('');
        setParsedData(null);

        try {
            const base64 = await convertToBase64(file);
            const result = await ai.parseReceipt(base64);
            setParsedData(result);
        } catch (err) {
            console.error(err);
            setError('Failed to parse receipt. Is LM Studio running?');
        } finally {
            setScanning(false);
        }
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const handleConfirm = async () => {
        if (!parsedData) return;

        try {
            await ledger.addTransaction({
                amount: parsedData.total || 0,
                merchant: parsedData.merchant || 'Unknown',
                category: 'Groceries', // Default for receipts
                type: 'expense',
                date: new Date().toISOString()
            });
            setParsedData(null);
            alert('Receipt saved!');
        } catch (err) {
            console.error(err);
            alert('Error saving receipt');
        }
    };

    return (
        <div className="p-4 bg-white rounded shadow">
            <h2 className="text-xl font-bold mb-4">Scan Receipt</h2>

            <div className="mb-4">
                <label className="block w-full p-4 border-2 border-dashed border-gray-300 rounded text-center cursor-pointer hover:bg-gray-50">
                    <span className="text-gray-600">Tap to Capture</span>
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </label>
            </div>

            {scanning && <p className="text-center text-blue-600">Analyzing receipt with AI...</p>}
            {error && <p className="text-center text-red-600">{error}</p>}

            {parsedData && (
                <div className="mt-4 border p-4 rounded bg-gray-50">
                    <h3 className="font-bold mb-2">Verified Data</h3>
                    <div className="space-y-2">
                        <p><strong>Merchant:</strong> {parsedData.merchant}</p>
                        <p><strong>Total:</strong> ${parsedData.total}</p>
                        {parsedData.items && (
                            <div>
                                <strong>Items:</strong>
                                <ul className="list-disc pl-5 text-sm">
                                    {parsedData.items.map((item, i) => (
                                        <li key={i}>{item.name} - ${item.price}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleConfirm}
                        className="mt-4 w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
                    >
                        Confirm & Save
                    </button>
                </div>
            )}
        </div>
    );
}
