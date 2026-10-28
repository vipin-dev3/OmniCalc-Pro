import React, { useState, useMemo } from 'react';
import { UnitCategory, UnitDefinition, CurrencyRate } from '../../types/converter';
import { ArrowLeftRight, Copy, Edit3, RotateCcw, Check, Sparkles, Sliders } from 'lucide-react';
import { copyTextToClipboard } from '../../utils/exportHelper';
import { useToast } from '../../context/ToastContext';
import { useHistory } from '../../context/HistoryContext';

// Standard unit definitions
const UNIT_DEFINITIONS: Record<Exclude<UnitCategory, 'currency'>, UnitDefinition[]> = {
  length: [
    { id: 'm', name: 'Meters', symbol: 'm', toBase: (v) => v, fromBase: (v) => v },
    { id: 'km', name: 'Kilometers', symbol: 'km', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { id: 'cm', name: 'Centimeters', symbol: 'cm', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
    { id: 'mm', name: 'Millimeters', symbol: 'mm', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { id: 'mi', name: 'Miles', symbol: 'mi', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
    { id: 'yd', name: 'Yards', symbol: 'yd', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
    { id: 'ft', name: 'Feet', symbol: 'ft', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    { id: 'in', name: 'Inches', symbol: 'in', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
    { id: 'nm', name: 'Nautical Miles', symbol: 'NM', toBase: (v) => v * 1852, fromBase: (v) => v / 1852 },
  ],
  mass: [
    { id: 'kg', name: 'Kilograms', symbol: 'kg', toBase: (v) => v, fromBase: (v) => v },
    { id: 'g', name: 'Grams', symbol: 'g', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { id: 'mg', name: 'Milligrams', symbol: 'mg', toBase: (v) => v / 1e6, fromBase: (v) => v * 1e6 },
    { id: 't', name: 'Metric Tons', symbol: 't', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { id: 'lb', name: 'Pounds', symbol: 'lb', toBase: (v) => v * 0.45359237, fromBase: (v) => v / 0.45359237 },
    { id: 'oz', name: 'Ounces', symbol: 'oz', toBase: (v) => v * 0.028349523, fromBase: (v) => v / 0.028349523 },
    { id: 'st', name: 'Stones', symbol: 'st', toBase: (v) => v * 6.350293, fromBase: (v) => v / 6.350293 },
  ],
  temperature: [
    { id: 'c', name: 'Celsius', symbol: '°C', toBase: (v) => v, fromBase: (v) => v },
    { id: 'f', name: 'Fahrenheit', symbol: '°F', toBase: (v) => ((v - 32) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 32 },
    { id: 'k', name: 'Kelvin', symbol: 'K', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    { id: 'r', name: 'Rankine', symbol: '°R', toBase: (v) => ((v - 491.67) * 5) / 9, fromBase: (v) => ((v + 273.15) * 9) / 5 },
  ],
  speed: [
    { id: 'mps', name: 'Meters/second', symbol: 'm/s', toBase: (v) => v, fromBase: (v) => v },
    { id: 'kph', name: 'Kilometers/hour', symbol: 'km/h', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
    { id: 'mph', name: 'Miles/hour', symbol: 'mph', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
    { id: 'knot', name: 'Knots', symbol: 'kn', toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
    { id: 'fps', name: 'Feet/second', symbol: 'ft/s', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
  ],
  data: [
    { id: 'b', name: 'Bytes', symbol: 'B', toBase: (v) => v, fromBase: (v) => v },
    { id: 'kb', name: 'Kilobytes', symbol: 'KB', toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
    { id: 'mb', name: 'Megabytes', symbol: 'MB', toBase: (v) => v * 1024 ** 2, fromBase: (v) => v / 1024 ** 2 },
    { id: 'gb', name: 'Gigabytes', symbol: 'GB', toBase: (v) => v * 1024 ** 3, fromBase: (v) => v / 1024 ** 3 },
    { id: 'tb', name: 'Terabytes', symbol: 'TB', toBase: (v) => v * 1024 ** 4, fromBase: (v) => v / 1024 ** 4 },
    { id: 'pb', name: 'Petabytes', symbol: 'PB', toBase: (v) => v * 1024 ** 5, fromBase: (v) => v / 1024 ** 5 },
    { id: 'bit', name: 'Bits', symbol: 'b', toBase: (v) => v / 8, fromBase: (v) => v * 8 },
  ],
  energy: [
    { id: 'j', name: 'Joules', symbol: 'J', toBase: (v) => v, fromBase: (v) => v },
    { id: 'kj', name: 'Kilojoules', symbol: 'kJ', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { id: 'cal', name: 'Calories', symbol: 'cal', toBase: (v) => v * 4.184, fromBase: (v) => v / 4.184 },
    { id: 'kcal', name: 'Kilocalories', symbol: 'kcal', toBase: (v) => v * 4184, fromBase: (v) => v / 4184 },
    { id: 'wh', name: 'Watt-hours', symbol: 'Wh', toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
    { id: 'kwh', name: 'Kilowatt-hours', symbol: 'kWh', toBase: (v) => v * 3.6e6, fromBase: (v) => v / 3.6e6 },
    { id: 'btu', name: 'BTU', symbol: 'BTU', toBase: (v) => v * 1055.06, fromBase: (v) => v / 1055.06 },
  ],
  area: [
    { id: 'sqm', name: 'Square Meters', symbol: 'm²', toBase: (v) => v, fromBase: (v) => v },
    { id: 'sqkm', name: 'Square Kilometers', symbol: 'km²', toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
    { id: 'sqft', name: 'Square Feet', symbol: 'ft²', toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
    { id: 'sqmi', name: 'Square Miles', symbol: 'mi²', toBase: (v) => v * 2.59e6, fromBase: (v) => v / 2.59e6 },
    { id: 'acre', name: 'Acres', symbol: 'ac', toBase: (v) => v * 4046.86, fromBase: (v) => v / 4046.86 },
    { id: 'ha', name: 'Hectares', symbol: 'ha', toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
  ],
  volume: [
    { id: 'l', name: 'Liters', symbol: 'L', toBase: (v) => v, fromBase: (v) => v },
    { id: 'ml', name: 'Milliliters', symbol: 'mL', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { id: 'cu_m', name: 'Cubic Meters', symbol: 'm³', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { id: 'gal', name: 'Gallons (US)', symbol: 'gal', toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
    { id: 'qt', name: 'Quarts', symbol: 'qt', toBase: (v) => v * 0.946353, fromBase: (v) => v / 0.946353 },
    { id: 'pt', name: 'Pints', symbol: 'pt', toBase: (v) => v * 0.473176, fromBase: (v) => v / 0.473176 },
    { id: 'cup', name: 'Cups', symbol: 'cup', toBase: (v) => v * 0.24, fromBase: (v) => v / 0.24 },
    { id: 'floz', name: 'Fluid Ounces', symbol: 'fl oz', toBase: (v) => v * 0.0295735, fromBase: (v) => v / 0.0295735 },
  ],
};

const DEFAULT_CURRENCY_RATES: CurrencyRate[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', ratePerUSD: 1.0 },
  { code: 'EUR', name: 'Euro', symbol: '€', ratePerUSD: 0.92 },
  { code: 'GBP', name: 'British Pound', symbol: '£', ratePerUSD: 0.79 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', ratePerUSD: 83.25 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', ratePerUSD: 154.5 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', ratePerUSD: 1.36 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', ratePerUSD: 1.52 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', ratePerUSD: 0.89 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', ratePerUSD: 7.23 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', ratePerUSD: 1.35 },
];

export const ConverterMode: React.FC = () => {
  const { showToast } = useToast();
  const { addHistory } = useHistory();

  const [category, setCategory] = useState<UnitCategory>('length');
  const [inputValue, setInputValue] = useState<string>('1');
  const [fromUnitId, setFromUnitId] = useState<string>('m');
  const [toUnitId, setToUnitId] = useState<string>('ft');

  // Currencies state
  const [currencyRates, setCurrencyRates] = useState<CurrencyRate[]>(() => {
    const saved = localStorage.getItem('omni_calc_currencies');
    return saved ? JSON.parse(saved) : DEFAULT_CURRENCY_RATES;
  });
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [isEditRatesOpen, setIsEditRatesOpen] = useState(false);
  const [tempRates, setTempRates] = useState<CurrencyRate[]>(currencyRates);
  const [copied, setCopied] = useState(false);

  // Update default units when category changes
  const handleCategoryChange = (cat: UnitCategory) => {
    setCategory(cat);
    if (cat !== 'currency') {
      const units = UNIT_DEFINITIONS[cat];
      setFromUnitId(units[0].id);
      setToUnitId(units[1] ? units[1].id : units[0].id);
    }
  };

  // Unit conversion logic
  const convertedValue = useMemo(() => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) return '0';

    if (category === 'currency') {
      const fromRate = currencyRates.find((c) => c.code === fromCurrency)?.ratePerUSD || 1;
      const toRate = currencyRates.find((c) => c.code === toCurrency)?.ratePerUSD || 1;
      const inUSD = val / fromRate;
      const result = inUSD * toRate;
      return result >= 1000 ? result.toFixed(2) : result.toFixed(4);
    } else {
      const units = UNIT_DEFINITIONS[category];
      const fromDef = units.find((u) => u.id === fromUnitId);
      const toDef = units.find((u) => u.id === toUnitId);
      if (!fromDef || !toDef) return '0';

      const baseVal = fromDef.toBase(val);
      const res = toDef.fromBase(baseVal);
      return Number(res.toPrecision(8)).toString();
    }
  }, [category, inputValue, fromUnitId, toUnitId, fromCurrency, toCurrency, currencyRates]);

  // Unit relation preview (1 From = ? To)
  const unitRelationPreview = useMemo(() => {
    if (category === 'currency') {
      const fromRate = currencyRates.find((c) => c.code === fromCurrency)?.ratePerUSD || 1;
      const toRate = currencyRates.find((c) => c.code === toCurrency)?.ratePerUSD || 1;
      const oneUnitTo = (1 / fromRate) * toRate;
      return `1 ${fromCurrency} = ${oneUnitTo.toFixed(4)} ${toCurrency}`;
    } else {
      const units = UNIT_DEFINITIONS[category];
      const fromDef = units.find((u) => u.id === fromUnitId);
      const toDef = units.find((u) => u.id === toUnitId);
      if (!fromDef || !toDef) return '';
      const baseVal = fromDef.toBase(1);
      const res = toDef.fromBase(baseVal);
      return `1 ${fromDef.symbol} = ${Number(res.toPrecision(6))} ${toDef.symbol}`;
    }
  }, [category, fromUnitId, toUnitId, fromCurrency, toCurrency, currencyRates]);

  // Swap units
  const handleSwap = () => {
    if (category === 'currency') {
      const temp = fromCurrency;
      setFromCurrency(toCurrency);
      setToCurrency(temp);
    } else {
      const temp = fromUnitId;
      setFromUnitId(toUnitId);
      setToUnitId(temp);
    }
  };

  const handleCopy = async () => {
    const success = await copyTextToClipboard(convertedValue);
    if (success) {
      setCopied(true);
      showToast(`Copied ${convertedValue}`, 'success');
      addHistory(
        `${inputValue} ${category === 'currency' ? fromCurrency : fromUnitId} to ${category === 'currency' ? toCurrency : toUnitId}`,
        convertedValue,
        'converter'
      );
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // Save edited currency rates
  const handleSaveRates = () => {
    setCurrencyRates(tempRates);
    localStorage.setItem('omni_calc_currencies', JSON.stringify(tempRates));
    setIsEditRatesOpen(false);
    showToast('Currency exchange rates updated', 'success');
  };

  const handleResetRates = () => {
    setTempRates(DEFAULT_CURRENCY_RATES);
    setCurrencyRates(DEFAULT_CURRENCY_RATES);
    localStorage.setItem('omni_calc_currencies', JSON.stringify(DEFAULT_CURRENCY_RATES));
    showToast('Currency rates reset to base defaults', 'info');
  };

  // All other units quick conversion list
  const allConversions = useMemo(() => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) return [];

    if (category === 'currency') {
      const fromRate = currencyRates.find((c) => c.code === fromCurrency)?.ratePerUSD || 1;
      const inUSD = val / fromRate;
      return currencyRates
        .filter((c) => c.code !== fromCurrency)
        .map((c) => ({
          id: c.code,
          name: c.name,
          symbol: c.symbol,
          value: (inUSD * c.ratePerUSD).toFixed(c.ratePerUSD > 10 ? 2 : 4),
        }));
    } else {
      const units = UNIT_DEFINITIONS[category];
      const fromDef = units.find((u) => u.id === fromUnitId);
      if (!fromDef) return [];
      const baseVal = fromDef.toBase(val);

      return units
        .filter((u) => u.id !== fromUnitId)
        .map((u) => ({
          id: u.id,
          name: u.name,
          symbol: u.symbol,
          value: Number(u.fromBase(baseVal).toPrecision(6)).toString(),
        }));
    }
  }, [category, inputValue, fromUnitId, fromCurrency, currencyRates]);

  const categories: { id: UnitCategory; code: string; label: string }[] = [
    { id: 'length', code: 'LEN', label: 'Length' },
    { id: 'mass', code: 'MAS', label: 'Mass & Weight' },
    { id: 'temperature', code: 'TMP', label: 'Temperature' },
    { id: 'speed', code: 'SPD', label: 'Speed' },
    { id: 'data', code: 'DAT', label: 'Data Storage' },
    { id: 'energy', code: 'ENG', label: 'Energy' },
    { id: 'area', code: 'ARE', label: 'Area' },
    { id: 'volume', code: 'VOL', label: 'Volume' },
    { id: 'currency', code: 'FX', label: 'Foreign FX' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 flex flex-col gap-3 font-mono">
      {/* Outer Hardware Chassis */}
      <div className="hardware-chassis p-4 md:p-6 rounded-3xl space-y-4">
        {/* Category Dock */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[var(--key-function)] border border-[var(--border-color)] overflow-x-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                category === cat.id
                  ? 'bg-[var(--key-default)] text-[var(--accent-primary)] border border-[var(--border-highlight)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              <span className="text-[9px] px-1 rounded bg-black/30 opacity-70">
                {cat.code}
              </span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Metrology & Conversion Instrument */}
        <div className="instrument-display p-5 md:p-6 rounded-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                {categories.find((c) => c.id === category)?.label} Engine
              </span>
              <span className="text-[10px] text-[var(--accent-primary)] bg-[var(--key-function)] px-2 py-0.5 rounded border border-[var(--border-color)]">
                {unitRelationPreview}
              </span>
            </div>

            {category === 'currency' && (
              <button
                onClick={() => {
                  setTempRates(currencyRates);
                  setIsEditRatesOpen(true);
                }}
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-[var(--key-default)] text-[var(--accent-primary)] border border-[var(--border-color)] hover:border-[var(--border-highlight)] transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Adjust FX Rates</span>
              </button>
            )}
          </div>

          {/* Interactive Conversion Flow */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
            {/* SOURCE INPUT */}
            <div className="space-y-2 p-4 rounded-xl bg-[var(--key-function)] border border-[var(--border-color)]">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span className="font-bold">INPUT VALUE</span>
                <span className="text-[10px]">SOURCE UNIT</span>
              </div>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter value"
                className="w-full text-2xl md:text-3xl font-bold bg-transparent text-[var(--screen-text)] focus:outline-none border-b border-[var(--border-color)] pb-1"
              />
              {category === 'currency' ? (
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full mt-2 p-2 rounded-lg bg-[var(--key-default)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                >
                  {currencyRates.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={fromUnitId}
                  onChange={(e) => setFromUnitId(e.target.value)}
                  className="w-full mt-2 p-2 rounded-lg bg-[var(--key-default)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                >
                  {UNIT_DEFINITIONS[category].map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.symbol})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* SWAP BUTTON */}
            <div className="flex justify-center">
              <button
                onClick={handleSwap}
                title="Swap Units"
                className="p-3 rounded-full bg-[var(--key-action)] text-[var(--key-action-text)] shadow-md keycap-3d active:scale-95"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
            </div>

            {/* TARGET RESULT */}
            <div className="space-y-2 p-4 rounded-xl bg-[var(--key-function)] border border-[var(--border-color)]">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span className="font-bold">CONVERTED RESULT</span>
                <button
                  onClick={handleCopy}
                  title="Copy result"
                  className="flex items-center gap-1 text-[11px] text-[var(--accent-primary)] hover:underline"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div
                onClick={handleCopy}
                title="Click to copy"
                className="text-2xl md:text-3xl font-bold text-[var(--accent-primary)] border-b border-[var(--border-color)] pb-1 break-all cursor-pointer hover:opacity-90"
              >
                {convertedValue}
              </div>
              {category === 'currency' ? (
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full mt-2 p-2 rounded-lg bg-[var(--key-default)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                >
                  {currencyRates.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={toUnitId}
                  onChange={(e) => setToUnitId(e.target.value)}
                  className="w-full mt-2 p-2 rounded-lg bg-[var(--key-default)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                >
                  {UNIT_DEFINITIONS[category].map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.symbol})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Quick Reference Metrology Matrix */}
        <div className="p-4 rounded-2xl bg-[var(--key-function)] border border-[var(--border-color)] space-y-2.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-bold uppercase tracking-wider text-[var(--text-secondary)] text-[10px]">
              Instant Relative Table ({category.toUpperCase()})
            </span>
            <span className="text-[10px] opacity-75">Click any card to select target</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {allConversions.map((conv) => (
              <div
                key={conv.id}
                onClick={() => {
                  if (category === 'currency') setToCurrency(conv.id);
                  else setToUnitId(conv.id);
                }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--key-default)] hover:bg-[var(--key-default-hover)] border border-[var(--border-color)] cursor-pointer transition-colors group"
              >
                <div className="min-w-0 pr-2">
                  <div className="text-[10px] text-[var(--text-muted)] truncate group-hover:text-[var(--text-secondary)]">
                    {conv.name}
                  </div>
                  <div className="text-sm font-bold text-[var(--screen-text)] truncate">
                    {conv.value}
                  </div>
                </div>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--key-function)] text-[var(--accent-primary)] border border-[var(--border-color)] shrink-0">
                  {conv.symbol}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Editable Rates Modal */}
      {isEditRatesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setIsEditRatesOpen(false)}
          />
          <div className="relative w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-highlight)] rounded-3xl p-6 shadow-2xl z-10 text-[var(--text-primary)] max-h-[85vh] flex flex-col hardware-chassis">
            <h3 className="text-base font-bold mb-1">Currency Exchange Matrix</h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Configured against 1.00 USD base currency.
            </p>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {tempRates.map((rate, idx) => (
                <div
                  key={rate.code}
                  className="flex items-center justify-between p-2 rounded-xl bg-[var(--key-function)] border border-[var(--border-color)]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--accent-primary)] w-10">
                      {rate.code}
                    </span>
                    <span className="text-[11px] text-[var(--text-secondary)] truncate max-w-[120px]">
                      {rate.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-[var(--text-muted)]">1 USD =</span>
                    <input
                      type="number"
                      step="0.01"
                      value={rate.ratePerUSD}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        const copy = [...tempRates];
                        copy[idx].ratePerUSD = val;
                        setTempRates(copy);
                      }}
                      className="w-24 px-2 py-1 rounded bg-[var(--key-default)] border border-[var(--border-color)] font-mono text-xs text-right text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-[var(--border-color)]">
              <button
                onClick={handleResetRates}
                className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditRatesOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-[var(--key-function)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRates}
                  className="px-4 py-1.5 rounded-xl bg-[var(--key-action)] text-[var(--key-action-text)] text-xs font-bold shadow-md"
                >
                  Save Rates
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
