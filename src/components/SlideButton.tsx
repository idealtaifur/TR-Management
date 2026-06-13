import React, { useState, useRef, useEffect } from 'react';

export function SlideButton({ onSlideComplete }: { onSlideComplete: () => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(0);
  const [success, setSuccess] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleDragStart = () => {
    if (success) return;
    setIsDragging(true);
  };
  
  const handleDragEnd = React.useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      if (!success) {
        setPosition(0);
      }
    }
  }, [isDragging, success]);

  useEffect(() => {
    const handleDrag = (clientX: number) => {
      if (!isDragging || !containerRef.current || success) return;
      const rect = containerRef.current.getBoundingClientRect();
      const maxPosition = rect.width - 52; // thumb width (44) + padding
      let newPosition = clientX - rect.left - 26; // center thumb
      
      // Boundary checks
      newPosition = Math.max(0, newPosition);
      newPosition = Math.min(newPosition, maxPosition);
      
      setPosition(newPosition);
      
      // If it reaches the end (95%+)
      if (newPosition >= maxPosition * 0.95) {
        setIsDragging(false);
        setPosition(maxPosition);
        setSuccess(true);
        
        onSlideComplete();
        
        // Reset after delay
        setTimeout(() => {
          setSuccess(false);
          setPosition(0);
        }, 1500);
      }
    };

    const handleMouseMove = (e: MouseEvent) => handleDrag(e.clientX);
    const handleTouchMove = (e: TouchEvent) => handleDrag(e.touches[0].clientX);
    
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchend', handleDragEnd);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, success, handleDragEnd, onSlideComplete]);

  const maxPos = containerRef.current ? containerRef.current.getBoundingClientRect().width - 52 : 1;
  const percentage = maxPos > 0 ? position / maxPos : 0;

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-[52px] border rounded-2xl overflow-hidden shadow-inner flex items-center justify-center select-none transition-colors duration-300 ${success ? 'bg-[#00e676]/20 border-[#00e676]/50' : 'bg-[#0b1621] border-slate-700/50'}`}
    >
      <div 
        className={`absolute inset-y-0 left-0 transition-all ${success ? 'duration-500 bg-[#00e676]/40' : 'duration-75 bg-gradient-to-r from-[#00e676]/10 to-[#00e676]/30'}`}
        style={{ width: success ? '100%' : `${position + 26}px` }}
      ></div>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 pl-8">
        <span 
          className={`text-[11px] font-bold uppercase tracking-wider drop-shadow-sm transition-all duration-300 ${success ? 'text-[#00e676] scale-110' : 'text-slate-400'}`}
          style={{ opacity: success ? 1 : Math.max(0, 1 - percentage * 2) }}
        >
          {success ? 'Session Started!' : 'Slide to Start New Session'}
        </span>
      </div>
      
      <div 
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        className={`absolute left-[4px] top-[4px] bottom-[4px] w-[44px] rounded-xl flex items-center justify-center text-[#0b1621] z-20 transition-all ${success ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] duration-500' : 'bg-gradient-to-br from-[#00e676] to-[#00b25c] shadow-[0_2px_8px_rgba(0,230,118,0.4)] duration-75 cursor-grab active:cursor-grabbing'}`}
        style={{ transform: `translateX(${position}px)` }}
      >
        {success ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        )}
      </div>
    </div>
  );
}
