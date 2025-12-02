import React, { useState, useEffect } from 'react';
import { Search, Leaf, DollarSign } from 'lucide-react';
import ComparisonCard from './ComparisonCard';

const GrocerySearch = () => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('cheapest'); // 'cheapest' | 'organic'

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

    const getBestSwap = () => {
        if (!result || !result.alternatives) return null;

        let options = [...result.alternatives];

        if (filter === 'organic') {
            // Filter for items that are EITHER organic OR clean
            const cleanOptions = options.filter(opt => opt.is_organic || opt.is_clean);

            if (cleanOptions.length > 0) {
                options = cleanOptions;
            } else {
                return null;
            }
        }

        // Sort by price ascending (cheapest first)
        options.sort((a, b) => a.price - b.price);

        return options[0];
    };

    const swap = getBestSwap();
    const priceGap = swap ? result.price - swap.price : 0;

    return (
        <div className="w-full max-w-2xl mx-auto p-4">
            <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-11 pr-4 py-4 bg-white/30 backdrop-blur-md border border-white/20 rounded-full text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent shadow-lg transition-all duration-300 text-lg"
                    placeholder="Search for an item (e.g., 'Cheerios')..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                {loading && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
                    </div>
                )}
            </div>

            {/* Filter Toggles */}
            {result && (
                <div className="flex justify-center gap-4 mb-8">
                    <button
                        onClick={() => setFilter('cheapest')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all duration-300 ${filter === 'cheapest'
                            ? 'bg-green-100 text-green-700 shadow-sm ring-2 ring-green-500/20'
                            : 'bg-white/40 text-slate-500 hover:bg-white/60'
                            }`}
                    >
                        <DollarSign size={18} />
                        Cheapest Price
                    </button>
                    <button
                        onClick={() => setFilter('organic')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all duration-300 ${filter === 'organic'
                            ? 'bg-emerald-100 text-emerald-700 shadow-sm ring-2 ring-emerald-500/20'
                            : 'bg-white/40 text-slate-500 hover:bg-white/60'
                            }`}
                    >
                        <Leaf size={18} />
                        Clean / Organic
                    </button>
                </div>
            )}

            <div className="transition-all duration-500 ease-in-out">
                {result && swap ? (
                    <div className="space-y-4">
                        <ComparisonCard
                            nameBrand={result.name_brand}
                            genericBrand={swap.name}
                            priceGap={priceGap}
                            store={result.store}
                        />

                        {/* Win Message */}
                        <div className="text-center animate-fade-in-up">
                            <span className={`inline-block px-6 py-3 text-sm font-bold rounded-full shadow-lg backdrop-blur-md ${filter === 'organic'
                                    ? 'bg-emerald-600/90 text-white'
                                    : 'bg-indigo-600/90 text-white'
                                }`}>
                                {filter === 'organic'
                                    ? `✨ Switching to Clean saves $${priceGap.toFixed(2)}`
                                    : `💰 Switching to Store Brand saves $${priceGap.toFixed(2)}`
                                }
                            </span>
                        </div>
                    </div>
                ) : result && filter === 'organic' && !swap ? (
                    <div className="text-center text-slate-500 mt-4 bg-white/30 p-6 rounded-2xl backdrop-blur-sm border border-white/20">
                        <p className="text-lg mb-2">No clean alternative found for {result.name_brand}.</p>
                        <button
                            onClick={() => setFilter('cheapest')}
                            className="text-indigo-600 font-medium hover:underline"
                        >
                            Show cheapest option instead
                        </button>
                    </div>
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
