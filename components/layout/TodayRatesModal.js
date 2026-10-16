'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function TodayRatesModal({ isOpen, onClose, rates }) {
  const popoverRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };
    // Use timeout so current click event doesn't trigger it immediately
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Format currency with Indian grouping: e.g. 13,515
  const formatPrice = (val) => {
    const num = Number(val);
    if (!num || isNaN(num)) return '—';
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Format timestamp matching: "16 Oct 2026, 09:57 am"
  const formatLastUpdated = (dateVal) => {
    if (!dateVal) return 'Recently updated';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return 'Recently updated';

      const day = d.getDate().toString().padStart(2, '0');
      const month = d.toLocaleDateString('en-GB', { month: 'short' });
      const year = d.getFullYear();

      let hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const formattedHours = hours.toString().padStart(2, '0');

      return `${day} ${month} ${year}, ${formattedHours}:${minutes} ${ampm}`;
    } catch (_) {
      return 'Recently updated';
    }
  };

  const g22 = Number(rates?.gold22k) || 0;
  const g24 = Number(rates?.gold24k) || 0;
  const s925 = Number(rates?.silver925) || 0;

  return (
    <>
      {/* Subtle backdrop on mobile screens */}
      <div
        className="fixed inset-0 z-40 bg-black/15 sm:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Pop-up Card */}
      <div
        ref={popoverRef}
        role="dialog"
        aria-label="Today's Gold & Silver Rates"
        className="fixed top-18 right-3 sm:right-0 sm:top-full sm:mt-2 sm:absolute z-50 w-[310px] sm:w-[340px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-gray-200/90 p-4 sm:p-5 animate-fadeIn"
        style={{
          boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.18), 0 8px 16px -4px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Header with Title & Close button */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-gray-800 tracking-wide uppercase font-serif">
              Today&apos;s Rates
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Rates List */}
        <div className="space-y-2.5">
          {/* Row 1: Gold (22K / 1g) */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#FFFDF0] border border-[#FDE68A] transition-colors">
            <span className="text-[13px] sm:text-sm font-medium text-gray-800">
              Gold (22K / 1g)
            </span>
            <span className="text-sm sm:text-base font-bold text-[#B45309]">
              ₹{formatPrice(g22)}
            </span>
          </div>

          {/* Row 2: Gold (24K / 1g) */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#FFFDF0] border border-[#FDE68A] transition-colors">
            <span className="text-[13px] sm:text-sm font-medium text-gray-800">
              Gold (24K / 1g)
            </span>
            <span className="text-sm sm:text-base font-bold text-[#B45309]">
              ₹{formatPrice(g24)}
            </span>
          </div>

          {/* Row 3: Silver (1g) */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] transition-colors">
            <span className="text-[13px] sm:text-sm font-medium text-gray-800">
              Silver (1g)
            </span>
            <span className="text-sm sm:text-base font-bold text-gray-800">
              ₹{formatPrice(s925)}
            </span>
          </div>
        </div>

        {/* Footer: Last Updated */}
        <div className="mt-3.5 pt-3 border-t border-gray-100 text-center">
          <p className="text-[11px] sm:text-xs text-gray-500 font-normal">
            Last updated: {formatLastUpdated(rates?.updatedAt)}
          </p>
        </div>
      </div>
    </>
  );
}
