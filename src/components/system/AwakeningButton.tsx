import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const AwakeningButton = () => {
  const navigate = useNavigate();
  const [isActivating, setIsActivating] = useState(false);

  const handleClick = () => {
    setIsActivating(true);
    
    // Vibration effect (if supported)
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
    
    // Brief delay for the awakening effect
    setTimeout(() => {
      setIsActivating(false);
      navigate("/routines");
    }, 400);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "relative group cursor-pointer transition-all duration-300",
        "w-full sm:w-auto",
        isActivating && "scale-105"
      )}
    >
      {/* Main Container */}
      <div className="relative flex items-center justify-center h-[120px] min-w-[280px]">
        {/* Left Side Panel */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-slate-950 to-transparent border-l border-t border-b border-slate-700/30" />
          <div className="absolute inset-0 bg-gradient-radial from-cyan-500/10 via-transparent to-transparent opacity-50" />
          {/* Decorative Lines */}
          <div className="absolute top-2 left-2 w-8 h-px bg-gradient-to-r from-cyan-400/60 to-transparent" />
          <div className="absolute bottom-2 left-2 w-8 h-px bg-gradient-to-r from-cyan-400/60 to-transparent" />
        </div>

        {/* Right Side Panel */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-16 h-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-l from-black via-slate-950 to-transparent border-r border-t border-b border-slate-700/30" />
          <div className="absolute inset-0 bg-gradient-radial from-blue-500/10 via-transparent to-transparent opacity-50" />
          {/* Japanese-style vertical text (decorative) */}
          <div className="absolute top-1/2 right-3 -translate-y-1/2 flex flex-col items-center gap-1 text-[8px] text-slate-500 font-light tracking-widest">
            <span className="rotate-0">覚</span>
            <span className="rotate-0">醒</span>
          </div>
        </div>

        {/* Central Panel */}
        <div
          className={cn(
            "relative z-10 bg-gradient-to-b from-black via-slate-950 to-black",
            "border border-slate-700/50 shadow-2xl",
            "px-12 py-6 h-full flex items-center justify-center",
            "transition-all duration-300",
            "group-hover:border-cyan-500/50 group-hover:shadow-cyan-500/20",
            isActivating && "border-cyan-400/80 shadow-cyan-400/40"
          )}
        >
          {/* Inner glow effect */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-b from-cyan-900/0 via-cyan-900/5 to-blue-900/0",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              isActivating && "opacity-100"
            )}
          />
          
          {/* Top accent line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
          
          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />

          {/* Vertical Text */}
          <div className="relative flex flex-col items-center justify-center gap-3 text-slate-200 font-light tracking-[0.3em]">
            <span className="text-[13px] uppercase">A</span>
            <span className="text-[13px] uppercase">W</span>
            <span className="text-[13px] uppercase">A</span>
            <span className="text-[13px] uppercase">K</span>
            <span className="text-[13px] uppercase">E</span>
            <span className="text-[13px] uppercase">N</span>
            <span className="text-[13px] uppercase">I</span>
            <span className="text-[13px] uppercase">N</span>
            <span className="text-[13px] uppercase">G</span>
          </div>

          {/* Glow overlay when activating */}
          {isActivating && (
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 via-blue-500/10 to-cyan-500/20 animate-pulse pointer-events-none" />
          )}
        </div>

        {/* Corner decorations on main panel */}
        <div className="absolute z-20 top-0 left-[68px] w-3 h-3 border-t border-l border-slate-600/50" />
        <div className="absolute z-20 top-0 right-[68px] w-3 h-3 border-t border-r border-slate-600/50" />
        <div className="absolute z-20 bottom-0 left-[68px] w-3 h-3 border-b border-l border-slate-600/50" />
        <div className="absolute z-20 bottom-0 right-[68px] w-3 h-3 border-b border-r border-slate-600/50" />

        {/* Outer glow effect */}
        <div
          className={cn(
            "absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl",
            "bg-gradient-to-b from-cyan-500/10 via-blue-500/5 to-cyan-500/10",
            isActivating && "opacity-100"
          )}
        />
      </div>

      {/* Subtle hint text below */}
      <div className="text-center mt-2 text-[10px] text-slate-600 uppercase tracking-[0.2em] font-light">
        Transcend
      </div>
    </button>
  );
};

export default AwakeningButton;
