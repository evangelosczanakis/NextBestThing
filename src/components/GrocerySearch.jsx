import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import ComparisonCard from './ComparisonCard';

const GrocerySearch = () => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Debounce logic
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim()) {
                fetchData(query);
            } else {
                setResult(null);
                setError(null);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const fetchData = async (searchQuery) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:8000/search-item?query=${encodeURIComponent(searchQuery)}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            if (data.message === "No match found") {
                setResult(null);
                // Optional: set a "no results" state if we want to show a specific message
            } else {
                setResult(data);
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setError("Failed to fetch results");
            setResult(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-4">
            <div className="relative mb-8">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-11 pr-4 py-4 bg-white/30 backdrop-blur-md border border-white/20 rounded-full text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent shadow-lg transition-all duration-300 text-lg"
                    placeholder="Search for an item (e.g., 'Ketchup')..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                {loading && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
                    </div>
                )}
            </div>

            <div className="transition-all duration-500 ease-in-out">
                {result ? (
                    <ComparisonCard
                        nameBrand={result.name_brand}
                        genericBrand={result.generic_brand}
                        priceGap={result.price_gap}
                        store={result.store}
                    />
                ) : query && !loading && !result ? (
                    <div className="text-center text-slate-500 mt-4">
                        No swaps found for "{query}".
                    </div>
                ) : null}

                {error && (
                    <div className="text-center text-red-500 mt-4">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GrocerySearch;
