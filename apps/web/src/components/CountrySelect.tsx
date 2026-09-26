'use client';

import { useState, useRef, useEffect } from 'react';
import { COUNTRIES, GLOBAL_REGIONS, searchCountries, type Country, type GlobalRegion } from '@antigravity/core';

interface CountrySelectProps {
  value?: string; // Country code (e.g. 'FR', 'DE')
  onChange: (country: Country) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  filterRegion?: GlobalRegion | 'All';
  className?: string;
}

export function CountrySelect({
  value = '',
  onChange,
  label = 'Select Country / Nationality',
  placeholder = 'Search country by name or code...',
  required = false,
  filterRegion = 'All',
  className = '',
}: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeRegion, setActiveRegion] = useState<GlobalRegion | 'All'>(filterRegion);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCountry = COUNTRIES.find(
    (c) => c.code === value.toUpperCase() || c.code3 === value.toUpperCase()
  );

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered countries based on search query and region tab
  const filteredCountries = searchCountries(query).filter(
    (c) => activeRegion === 'All' || c.region === activeRegion
  );

  const handleSelect = (c: Country) => {
    onChange(c);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className={`relative flex flex-col gap-1 text-white ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-semibold text-gray-300">
          {label} {required && <span className="text-[#FF5500]">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2.5 bg-surface border border-surface-border rounded-lg text-sm text-left flex items-center justify-between hover:border-gray-500 focus:outline-none focus:border-[#FF5500] transition"
      >
        <span className="flex items-center gap-2.5 truncate">
          {selectedCountry ? (
            <>
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="font-medium text-white">{selectedCountry.name}</span>
              <span className="text-xs text-gray-400 font-mono">({selectedCountry.code})</span>
            </>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expandable Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-[#12121A] border border-surface-border rounded-xl shadow-2xl p-3 flex flex-col gap-2 max-h-96">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              autoFocus
              placeholder="Type to filter 249+ countries..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-md text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5500]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-2.5 text-xs text-gray-400 hover:text-white"
              >
                ×
              </button>
            )}
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin text-[11px]">
            <button
              type="button"
              onClick={() => setActiveRegion('All')}
              className={`px-2 py-0.5 rounded font-semibold whitespace-nowrap transition ${
                activeRegion === 'All'
                  ? 'bg-[#FF5500] text-white'
                  : 'bg-surface text-gray-400 hover:text-white'
              }`}
            >
              All (249)
            </button>
            {GLOBAL_REGIONS.map((region) => (
              <button
                key={region}
                type="button"
                onClick={() => setActiveRegion(region)}
                className={`px-2 py-0.5 rounded font-semibold whitespace-nowrap transition ${
                  activeRegion === region
                    ? 'bg-[#FF5500] text-white'
                    : 'bg-surface text-gray-400 hover:text-white'
                }`}
              >
                {region}
              </button>
            ))}
          </div>

          {/* Country List */}
          <div className="overflow-y-auto max-h-64 flex flex-col gap-0.5 pr-1 scrollbar-thin divide-y divide-surface-border/50">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c) => {
                const isSelected = selectedCountry?.code === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelect(c)}
                    className={`w-full px-2.5 py-2 text-left rounded-md flex items-center justify-between text-xs transition ${
                      isSelected
                        ? 'bg-[#FF5500]/20 text-[#FF5500] font-bold'
                        : 'hover:bg-surface text-gray-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{c.flag}</span>
                      <span>{c.name}</span>
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {c.code} · {c.region}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-gray-500">
                No countries found for "{query}".
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
