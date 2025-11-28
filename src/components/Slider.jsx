import React from 'react';

const Slider = ({ label, value, onChange, color = "blue" }) => {
    // Map color prop to Tailwind classes for the track
    const colorClasses = {
        blue: "accent-blue-500",
        green: "accent-green-500",
        purple: "accent-purple-500",
        red: "accent-red-500",
        indigo: "accent-indigo-500",
    };

    const accentClass = colorClasses[color] || "accent-blue-500";

    return (
        <div className="flex flex-col gap-2 w-full">
            <div className="flex justify-between items-center text-sm font-medium text-slate-700">
                <span>{label}</span>
                <span>{value}%</span>
            </div>
            <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${accentClass} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color}-500`}
                style={{
                    // Custom styles to ensure consistent cross-browser appearance if needed, 
                    // though Tailwind's accent-* utilities handle modern browsers well.
                    // For a true iOS look, we might need more custom CSS for the thumb if 'accent' isn't enough.
                    // But 'accent' is the modern standard way.
                }}
            />
            {/* 
        Note: To get a truly custom "iOS style" white thumb with shadow that works consistently 
        across browsers often requires complex CSS pseudo-elements (::-webkit-slider-thumb).
        Tailwind's `accent-` provides a native-like feel which is often sufficient and cleaner.
        However, if the user specifically requested "thumb should be white/shadowed", 
        we might need to add custom CSS in a style tag or a separate CSS file if we want to go beyond `accent-`.
        
        Let's add a style tag for the specific webkit-slider-thumb customization to ensure the "white/shadowed" requirement is met.
      */}
            <style jsx>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          cursor: pointer;
          margin-top: -6px; /* You need to specify a margin in Chrome, but in Firefox and IE it is automatic */
        }
        input[type=range]::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          cursor: pointer;
          border: none;
        }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%;
          height: 8px;
          cursor: pointer;
          background: #e2e8f0; /* slate-200 */
          border-radius: 9999px;
        }
        input[type=range]:focus::-webkit-slider-runnable-track {
          background: #cbd5e1; /* slate-300 */
        }
      `}</style>
        </div>
    );
};

export default Slider;
