import React, { useState } from 'react';
import GlassCard from '../components/GlassCard';
import { Search, Filter, Check, AlertTriangle, ShoppingCart } from 'lucide-react';

// Mock data mirroring backend/data/meals.json
const MEALS_DATA = {
    "Spaghetti & Meatballs": [
        {
            "ingredient": "Pasta",
            "cheapest": { "brand": "Great Value", "price": 0.98, "store": "Walmart", "dietary": ["vegan", "dairy_free"] },
            "name_brand": { "brand": "Barilla", "price": 1.84 }
        },
        {
            "ingredient": "Marinara Sauce",
            "cheapest": { "brand": "Great Value", "price": 1.50, "store": "Walmart", "dietary": ["gluten_free", "vegan", "dairy_free"] },
            "name_brand": { "brand": "Rao's", "price": 6.80 }
        },
        {
            "ingredient": "Ground Beef",
            "cheapest": { "brand": "Marketside", "price": 5.97, "store": "Walmart", "dietary": ["gluten_free", "dairy_free"] },
            "name_brand": { "brand": "Laura's Lean", "price": 9.48 }
        },
        {
            "ingredient": "Parmesan Cheese",
            "cheapest": { "brand": "Great Value", "price": 2.22, "store": "Walmart", "dietary": ["gluten_free"] },
            "name_brand": { "brand": "Kraft", "price": 3.98 }
        }
    ],
    "Chicken Stir Fry": [
        {
            "ingredient": "Chicken Breast",
            "cheapest": { "brand": "Kirkland", "price": 12.99, "store": "Costco", "dietary": ["gluten_free", "dairy_free"] },
            "name_brand": { "brand": "Perdue", "price": 16.50 }
        },
        {
            "ingredient": "Frozen Veggies",
            "cheapest": { "brand": "Great Value", "price": 2.50, "store": "Walmart", "dietary": ["vegan", "gluten_free", "dairy_free"] },
            "name_brand": { "brand": "Birds Eye", "price": 4.20 }
        },
        {
            "ingredient": "Soy Sauce",
            "cheapest": { "brand": "Great Value", "price": 1.88, "store": "Walmart", "dietary": ["vegan", "dairy_free"] },
            "name_brand": { "brand": "Kikkoman", "price": 3.48 }
        },
        {
            "ingredient": "Rice",
            "cheapest": { "brand": "Great Value", "price": 1.34, "store": "Walmart", "dietary": ["vegan", "gluten_free", "dairy_free"] },
            "name_brand": { "brand": "Uncle Ben's", "price": 2.48 }
        }
    ],
    "Tacos": [
        {
            "ingredient": "Taco Shells",
            "cheapest": { "brand": "Great Value", "price": 1.48, "store": "Walmart", "dietary": ["gluten_free", "vegan", "dairy_free"] },
            "name_brand": { "brand": "Old El Paso", "price": 2.98 }
        },
        {
            "ingredient": "Ground Beef",
            "cheapest": { "brand": "Marketside", "price": 5.97, "store": "Walmart", "dietary": ["gluten_free", "dairy_free"] },
            "name_brand": { "brand": "Laura's Lean", "price": 9.48 }
        },
        {
            "ingredient": "Salsa",
            "cheapest": { "brand": "Great Value", "price": 1.98, "store": "Walmart", "dietary": ["vegan", "gluten_free", "dairy_free"] },
            "name_brand": { "brand": "Tostitos", "price": 3.50 }
        },
        {
            "ingredient": "Shredded Cheese",
            "cheapest": { "brand": "Great Value", "price": 2.22, "store": "Walmart", "dietary": ["gluten_free"] },
            "name_brand": { "brand": "Kraft", "price": 3.98 }
        }
    ]
};

const GroceryMealPlanner = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [filters, setFilters] = useState({
        gluten_free: false,
        vegan: false,
        dairy_free: false
    });

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (term && MEALS_DATA[term]) {
            setSelectedMeal(term);
        } else {
            // Simple fuzzy match or exact match logic
            const match = Object.keys(MEALS_DATA).find(m => m.toLowerCase().includes(term.toLowerCase()));
            if (match) setSelectedMeal(match);
            else setSelectedMeal(null);
        }
    };

    const toggleFilter = (filter) => {
        setFilters(prev => ({ ...prev, [filter]: !prev[filter] }));
    };

    const activeFilters = Object.keys(filters).filter(k => filters[k]);

    const isCompatible = (ingredient) => {
        if (activeFilters.length === 0) return true;
        const dietary = ingredient.cheapest.dietary || [];
        return activeFilters.every(f => dietary.includes(f));
    };

    const ingredients = selectedMeal ? MEALS_DATA[selectedMeal] : [];

    const totalCost = ingredients.reduce((sum, item) => sum + item.cheapest.price, 0);
    const totalSavings = ingredients.reduce((sum, item) => sum + (item.name_brand.price - item.cheapest.price), 0);

    return (
        <div className="max-w-2xl mx-auto mt-6 pb-24 space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-800">Grocery Meal Planner</h2>
                <p className="text-slate-500">Optimize your ingredients for maximum savings</p>
            </div>

            {/* Search and Filters */}
            <GlassCard className="p-6">
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search for a meal (e.g., Spaghetti, Tacos)"
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                    />
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-slate-500 mr-2">
                        <Filter size={16} />
                        <span className="text-sm font-medium">Dietary:</span>
                    </div>
                    {[
                        { key: 'gluten_free', label: 'Gluten-Free' },
                        { key: 'vegan', label: 'Vegan' },
                        { key: 'dairy_free', label: 'Dairy-Free' }
                    ].map((filter) => (
                        <button
                            key={filter.key}
                            onClick={() => toggleFilter(filter.key)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${filters[filter.key]
                                    ? 'bg-indigo-100 border-indigo-200 text-indigo-700'
                                    : 'bg-white/40 border-slate-200 text-slate-600 hover:bg-white/60'
                                }`}
                        >
                            {filters[filter.key] && <Check size={12} className="inline mr-1" />}
                            {filter.label}
                        </button>
                    ))}
                </div>
            </GlassCard>

            {/* Results */}
            {selectedMeal && (
                <>
                    <div className="space-y-4">
                        {ingredients.map((item, index) => {
                            const compatible = isCompatible(item);
                            const savings = item.name_brand.price - item.cheapest.price;

                            return (
                                <GlassCard key={index} className={`p-4 transition-opacity ${compatible ? 'opacity-100' : 'opacity-60'}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg">{item.ingredient}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-sm text-slate-500">Best Option:</span>
                                                <span className="text-sm font-medium text-indigo-600">{item.cheapest.brand}</span>
                                                <span className="text-xs text-slate-400">({item.cheapest.store})</span>
                                            </div>
                                            {!compatible && (
                                                <div className="flex items-center gap-1 text-amber-600 text-xs mt-2 font-medium">
                                                    <AlertTriangle size={12} />
                                                    <span>May not match dietary preferences</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-slate-800">${item.cheapest.price.toFixed(2)}</div>
                                            <div className="text-xs text-emerald-600 font-medium bg-emerald-100 px-2 py-1 rounded-full mt-1 inline-block">
                                                Save ${savings.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            );
                        })}
                    </div>

                    {/* Footer Totals */}
                    <GlassCard className="p-6 sticky bottom-24 bg-white/90 backdrop-blur-xl border-t-4 border-indigo-500">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-slate-500 text-sm">Total Meal Cost</p>
                                <p className="text-3xl font-bold text-slate-800">${totalCost.toFixed(2)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-slate-500 text-sm">Total Savings</p>
                                <p className="text-2xl font-bold text-emerald-600">${totalSavings.toFixed(2)}</p>
                            </div>
                        </div>
                        <button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                            <ShoppingCart size={20} />
                            Add All to Cart
                        </button>
                    </GlassCard>
                </>
            )}

            {!selectedMeal && searchTerm && (
                <div className="text-center py-12 text-slate-400">
                    <p>No meal found matching "{searchTerm}"</p>
                </div>
            )}
        </div>
    );
};

export default GroceryMealPlanner;
