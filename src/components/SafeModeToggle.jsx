import React from 'react';
import { useSafeMode } from '../context/SafeModeContext';
import { Eye, EyeOff } from 'lucide-react';

const SafeModeToggle = () => {
    const { isSafeMode, setIsSafeMode } = useSafeMode();

    return (
        <button
            onClick={() => setIsSafeMode(!isSafeMode)}
            className={`p-3 rounded-full transition-all duration-300 shadow-lg flex items-center gap-2 ${isSafeMode
                    ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                    : 'bg-white text-slate-400 hover:text-slate-600'
                }`}
            title={isSafeMode ? "Disable Safe Mode" : "Enable Safe Mode"}
        >
            {isSafeMode ? <EyeOff size={24} /> : <Eye size={24} />}
            <span className="font-medium text-sm hidden sm:inline">
                {isSafeMode ? "Safe Mode On" : "Safe Mode Off"}
            </span>
        </button>
    );
};

export default SafeModeToggle;
