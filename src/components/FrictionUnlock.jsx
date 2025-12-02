import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { ChevronRight, Lock, Unlock } from 'lucide-react';

const FrictionUnlock = ({ onUnlock, label = "Slide to Confirm", warningText = "Are you sure? This is Rent money." }) => {
    const [unlocked, setUnlocked] = useState(false);
    const controls = useAnimation();
    const x = useMotionValue(0);
    const maxDrag = 250; // Maximum drag distance in pixels

    // Transform x value to opacity for the label (fade out as we drag)
    const labelOpacity = useTransform(x, [0, maxDrag / 2], [1, 0]);
    // Transform x value to opacity for the warning text (fade in as we drag)
    const warningOpacity = useTransform(x, [0, maxDrag / 2], [0, 1]);
    // Background color interpolation
    const bg = useTransform(x, [0, maxDrag], ["rgba(255, 255, 255, 0.1)", "rgba(239, 68, 68, 0.2)"]);

    const handleDragEnd = async () => {
        if (x.get() > maxDrag - 50) {
            // Threshold reached
            setUnlocked(true);
            controls.start({ x: maxDrag });
            if (onUnlock) {
                onUnlock();
            }
        } else {
            // Snap back
            controls.start({ x: 0 });
        }
    };

    return (
        <div className="w-full relative h-16 rounded-full overflow-hidden bg-slate-900/5 backdrop-blur-sm border border-white/10 shadow-inner">
            {/* Background Track */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ backgroundColor: bg }}
            >
                {/* Default Label */}
                <motion.span
                    style={{ opacity: labelOpacity }}
                    className="text-slate-500 font-medium text-sm tracking-wide"
                >
                    {label}
                </motion.span>

                {/* Warning Text */}
                <motion.span
                    style={{ opacity: warningOpacity }}
                    className="absolute text-red-500 font-semibold text-sm tracking-wide"
                >
                    {warningText}
                </motion.span>
            </motion.div>

            {/* Slider Handle */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: maxDrag }}
                dragElastic={0.1}
                dragMomentum={false}
                onDragEnd={handleDragEnd}
                animate={controls}
                style={{ x }}
                className="absolute top-1 left-1 bottom-1 w-14 rounded-full bg-white shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing z-10"
            >
                {unlocked ? (
                    <Unlock size={20} className="text-emerald-500" />
                ) : (
                    <div className="flex items-center justify-center">
                        <ChevronRight size={24} className="text-slate-400" />
                    </div>
                )}
            </motion.div>

            {/* Success Overlay (Optional, if we want to lock it in unlocked state) */}
            {unlocked && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center pointer-events-none"
                >
                    <span className="text-emerald-600 font-bold ml-8">CONFIRMED</span>
                </motion.div>
            )}
        </div>
    );
};

export default FrictionUnlock;
