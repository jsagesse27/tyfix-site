'use client';

import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { Vehicle, SiteSettings } from '@/lib/types';
import VehicleCard from '@/components/public/VehicleCard';
import {
  BODY_TYPES, TRANSMISSIONS, FUEL_TYPES, DRIVETRAINS,
  PRICE_RANGES, MILEAGE_RANGES, YEAR_RANGES,
} from '@/lib/constants';

interface InventoryClientProps {
  vehicles: Vehicle[];
  settings: SiteSettings | null;
  initialFilters?: {
    bodyType?: string;
    maxPrice?: string;
  };
}

export default function InventoryClient({ vehicles, settings, initialFilters }: InventoryClientProps) {
  const [search, setSearch] = useState('');
  const [selectedMake, setSelectedMake] = useState('All');
  const [selectedBodyType, setSelectedBodyType] = useState(initialFilters?.bodyType || 'All');
  const [selectedTransmission, setSelectedTransmission] = useState('All');
  const [selectedFuel, setSelectedFuel] = useState('All');
  const [selectedDrivetrain, setSelectedDrivetrain] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');
  const [maxPrice, setMaxPrice] = useState(initialFilters?.maxPrice ? parseInt(initialFilters.maxPrice) : 99999);
  const [maxMileage, setMaxMileage] = useState(999999);
  const [minYear, setMinYear] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const makes = useMemo(() => ['All', ...new Set(vehicles.map((v) => v.make))].sort(), [vehicles]);
  const colors = useMemo(() => ['All', ...new Set(vehicles.map((v) => v.exterior_color).filter(Boolean) as string[])].sort(), [vehicles]);

  const filtered = useMemo(() => {
    let result = vehicles.filter((v) => {
      if (selectedMake !== 'All' && v.make !== selectedMake) return false;
      if (selectedBodyType !== 'All' && v.body_type !== selectedBodyType) return false;
      if (selectedTransmission !== 'All' && v.transmission !== selectedTransmission) return false;
      if (selectedFuel !== 'All' && v.fuel_type !== selectedFuel) return false;
      if (selectedDrivetrain !== 'All' && v.drivetrain !== selectedDrivetrain) return false;
      if (selectedColor !== 'All' && v.exterior_color !== selectedColor) return false;
      if (v.price > maxPrice) return false;
      if (v.mileage > maxMileage) return false;
      if (minYear > 0 && parseInt(v.year) < minYear) return false;
      if (search) {
        const q = search.toLowerCase();
        const match = `${v.year} ${v.make} ${v.model} ${v.trim || ''}`.toLowerCase();
        if (!match.includes(q)) return false;
      }
      return true;
    });

    // Sort
    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'mileage-low': result.sort((a, b) => a.mileage - b.mileage); break;
      case 'year-new': result.sort((a, b) => parseInt(b.year) - parseInt(a.year)); break;
      case 'year-old': result.sort((a, b) => parseInt(a.year) - parseInt(b.year)); break;
      default: break; // newest first (DB order)
    }
    return result;
  }, [vehicles, selectedMake, selectedBodyType, selectedTransmission, selectedFuel, selectedDrivetrain, selectedColor, maxPrice, maxMileage, minYear, search, sortBy]);

  const activeFilterCount = [
    selectedMake !== 'All',
    selectedBodyType !== 'All',
    selectedTransmission !== 'All',
    selectedFuel !== 'All',
    selectedDrivetrain !== 'All',
    selectedColor !== 'All',
    maxPrice < 99999,
    maxMileage < 999999,
    minYear > 0,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedMake('All');
    setSelectedBodyType('All');
    setSelectedTransmission('All');
    setSelectedFuel('All');
    setSelectedDrivetrain('All');
    setSelectedColor('All');
    setMaxPrice(99999);
    setMaxMileage(999999);
    setMinYear(0);
    setSearch('');
    setSortBy('newest');
  };

  return (
    <div>
      {/* Search + Filter Toggle */}
      <div className="mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by year, make, or model..."
              className="input-field pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-admin-outline flex items-center gap-2 ${showFilters ? 'bg-gray-100' : ''}`}
          >
            <SlidersHorizontal size={18} />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Filter Panel */}
      {showFilters && (
        <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Filter Inventory</h3>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-primary text-sm font-bold flex items-center gap-1">
                <X size={14} /> Clear All
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Make</label>
              <select className="input-field" value={selectedMake} onChange={(e) => setSelectedMake(e.target.value)}>
                {makes.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Body Type</label>
              <select className="input-field" value={selectedBodyType} onChange={(e) => setSelectedBodyType(e.target.value)}>
                <option value="All">All</option>
                {BODY_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Max Price</label>
              <select className="input-field" value={maxPrice} onChange={(e) => setMaxPrice(parseInt(e.target.value))}>
                {PRICE_RANGES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Max Mileage</label>
              <select className="input-field" value={maxMileage} onChange={(e) => setMaxMileage(parseInt(e.target.value))}>
                {MILEAGE_RANGES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Year</label>
              <select className="input-field" value={minYear} onChange={(e) => setMinYear(parseInt(e.target.value))}>
                {YEAR_RANGES.map((y) => <option key={y.value} value={y.value}>{y.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Transmission</label>
              <select className="input-field" value={selectedTransmission} onChange={(e) => setSelectedTransmission(e.target.value)}>
                <option value="All">All</option>
                {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Fuel Type</label>
              <select className="input-field" value={selectedFuel} onChange={(e) => setSelectedFuel(e.target.value)}>
                <option value="All">All</option>
                {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Drivetrain</label>
              <select className="input-field" value={selectedDrivetrain} onChange={(e) => setSelectedDrivetrain(e.target.value)}>
                <option value="All">All</option>
                {DRIVETRAINS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Exterior Color</label>
              <select className="input-field" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
                {colors.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Sort By</label>
              <select className="input-field" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Newest Listed</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="mileage-low">Mileage: Low to High</option>
                <option value="year-new">Year: Newest</option>
                <option value="year-old">Year: Oldest</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Body type pills */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {['All', ...BODY_TYPES].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedBodyType(type)}
            className={`px-5 py-2 rounded-full font-bold transition-all whitespace-nowrap text-sm ${
              selectedBodyType === type
                ? 'bg-primary text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-500 text-sm">
          <span className="font-bold text-gray-900">{filtered.length}</span> vehicle{filtered.length !== 1 ? 's' : ''} found
        </p>
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="text-primary text-sm font-bold">
            Clear all filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg mb-4">No vehicles match your filters.</p>
          <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((vehicle) => (
            <VehicleCard 
              key={vehicle.id} 
              vehicle={vehicle} 
              autoCarousel={settings?.auto_carousel_enabled ?? true}
              interval={(settings?.auto_carousel_interval ?? 4) * 1000}
            />
          ))}
        </div>
      )}
    </div>
  );
}
