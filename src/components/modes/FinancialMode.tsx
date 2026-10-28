import React, { useState, useMemo } from 'react';
import { FinanceTab, CompoundingFrequency } from '../../types/finance';
import { formatCurrency, getCurrencySymbol, FINANCIAL_CURRENCIES } from '../../utils/formatters';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Landmark, TrendingUp, Users, ChevronDown, ChevronUp, Coins } from 'lucide-react';
import { useHistory } from '../../context/HistoryContext';

export const FinancialMode: React.FC = () => {
  const { addHistory } = useHistory();
  const [activeTab, setActiveTab] = useState<FinanceTab>('loan');
  const [showAmortization, setShowAmortization] = useState<boolean>(false);

  // Currency Selection State (Default USD, supports INR ₹, EUR €, GBP £, etc.)
  const [currency, setCurrency] = useState<string>(() => {
    return localStorage.getItem('omni_calc_currency') || 'USD';
  });

  const handleCurrencyChange = (newCurr: string) => {
    setCurrency(newCurr);
    localStorage.setItem('omni_calc_currency', newCurr);
  };

  // ================= Loan / Mortgage State =================
  const [loanPrincipal, setLoanPrincipal] = useState<number>(300000);
  const [loanRate, setLoanRate] = useState<number>(6.5);
  const [loanYears, setLoanYears] = useState<number>(30);

  // EMI Calculation
  const loanResults = useMemo(() => {
    const p = Math.max(0, loanPrincipal);
    const r = Math.max(0, loanRate) / 100 / 12; // monthly rate
    const n = Math.max(1, loanYears * 12); // total months

    let emi = 0;
    if (r === 0) {
      emi = p / n;
    } else {
      emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const totalPayment = emi * n;
    const totalInterest = Math.max(0, totalPayment - p);

    // Yearly amortization summary (up to 30 years)
    const yearlySchedule = [];
    let balance = p;
    for (let year = 1; year <= loanYears; year++) {
      let interestThisYear = 0;
      let principalThisYear = 0;
      for (let m = 0; m < 12; m++) {
        if (balance <= 0) break;
        const interestMonth = balance * r;
        const principalMonth = Math.min(balance, emi - interestMonth);
        interestThisYear += interestMonth;
        principalThisYear += principalMonth;
        balance -= principalMonth;
      }
      yearlySchedule.push({
        year,
        principalPaid: Math.round(principalThisYear),
        interestPaid: Math.round(interestThisYear),
        balance: Math.max(0, Math.round(balance)),
      });
    }

    return {
      monthlyEMI: emi,
      totalPayment,
      totalInterest,
      yearlySchedule,
    };
  }, [loanPrincipal, loanRate, loanYears]);

  // ================= Compound Interest State =================
  const [initDeposit, setInitDeposit] = useState<number>(10000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(500);
  const [investmentRate, setInvestmentRate] = useState<number>(8);
  const [investmentYears, setInvestmentYears] = useState<number>(20);
  const [compoundFreq, setCompoundFreq] = useState<CompoundingFrequency>('monthly');

  const investmentResults = useMemo(() => {
    const freqMap: Record<CompoundingFrequency, number> = {
      annually: 1,
      'semi-annually': 2,
      quarterly: 4,
      monthly: 12,
    };
    const n = freqMap[compoundFreq];
    const r = investmentRate / 100;
    const t = investmentYears;

    const yearlyData = [];
    let currentBalance = initDeposit;
    let totalDeposited = initDeposit;

    yearlyData.push({
      year: 'Yr 0',
      balance: Math.round(currentBalance),
      contributions: Math.round(totalDeposited),
      interest: 0,
    });

    for (let yr = 1; yr <= t; yr++) {
      for (let m = 0; m < 12; m++) {
        currentBalance += monthlyContribution;
        totalDeposited += monthlyContribution;
        currentBalance += (currentBalance * r) / 12;
      }

      yearlyData.push({
        year: `Yr ${yr}`,
        balance: Math.round(currentBalance),
        contributions: Math.round(totalDeposited),
        interest: Math.round(Math.max(0, currentBalance - totalDeposited)),
      });
    }

    return {
      futureValue: currentBalance,
      totalDeposited,
      totalInterest: Math.max(0, currentBalance - totalDeposited),
      yearlyData,
    };
  }, [initDeposit, monthlyContribution, investmentRate, investmentYears, compoundFreq]);

  // ================= Tip Splitter State =================
  const [billAmount, setBillAmount] = useState<number>(120);
  const [tipPercent, setTipPercent] = useState<number>(18);
  const [peopleCount, setPeopleCount] = useState<number>(4);
  const [taxPercent, setTaxPercent] = useState<number>(8.5);

  const tipResults = useMemo(() => {
    const bill = Math.max(0, billAmount);
    const tax = bill * (Math.max(0, taxPercent) / 100);
    const tip = bill * (Math.max(0, tipPercent) / 100);
    const total = bill + tax + tip;
    const num = Math.max(1, peopleCount);

    return {
      tipAmount: tip,
      taxAmount: tax,
      total,
      perPersonBill: (bill + tax) / num,
      perPersonTip: tip / num,
      perPersonTotal: total / num,
    };
  }, [billAmount, tipPercent, peopleCount, taxPercent]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 flex flex-col gap-3 font-mono">
      {/* Outer Hardware Chassis */}
      <div className="hardware-chassis p-4 md:p-6 rounded-3xl space-y-4">
        {/* Currency Switcher & Sub-Tabs Navigation */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Sub-Tabs Navigation */}
          <div className="flex-1 flex items-center gap-1.5 p-1.5 rounded-2xl bg-[var(--dock-bg)] border border-[var(--dock-border)]">
            <button
              onClick={() => setActiveTab('loan')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'loan'
                  ? 'bg-[var(--dock-active-bg)] text-[var(--accent-primary)] border border-[var(--border-highlight)] shadow-sm'
                  : 'text-[var(--dock-item-text)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Mortgage & Loan</span>
            </button>

            <button
              onClick={() => setActiveTab('investment')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'investment'
                  ? 'bg-[var(--dock-active-bg)] text-[var(--accent-primary)] border border-[var(--border-highlight)] shadow-sm'
                  : 'text-[var(--dock-item-text)] hover:text-[var(--text-primary)]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Compound Growth</span>
            </button>

            <button
              onClick={() => setActiveTab('tip')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'tip'
                  ? 'bg-[var(--dock-active-bg)] text-[var(--accent-primary)] border border-[var(--border-highlight)] shadow-sm'
                  : 'text-[var(--dock-item-text)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Bill & Tip</span>
            </button>
          </div>

          {/* Currency Selector Ribbon */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[var(--dock-bg)] border border-[var(--dock-border)] shrink-0 self-end sm:self-auto">
            <Coins className="w-3.5 h-3.5 ml-1 text-[var(--accent-primary)]" />
            <span className="text-[10px] font-bold text-[var(--dock-item-text)] uppercase tracking-wider hidden md:inline">
              Currency:
            </span>

            {/* Quick-toggle pills: USD ($) and INR (₹) */}
            <button
              onClick={() => handleCurrencyChange('USD')}
              title="US Dollar ($)"
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                currency === 'USD'
                  ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] shadow-sm'
                  : 'bg-[var(--chip-bg)] text-[var(--chip-text)] hover:opacity-80'
              }`}
            >
              $ USD
            </button>

            <button
              onClick={() => handleCurrencyChange('INR')}
              title="Indian Rupee (₹)"
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                currency === 'INR'
                  ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] shadow-sm'
                  : 'bg-[var(--chip-bg)] text-[var(--chip-text)] hover:opacity-80'
              }`}
            >
              ₹ INR
            </button>

            {/* Other currencies dropdown */}
            <select
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="p-1 rounded-lg bg-[var(--chip-bg)] text-[var(--chip-text)] font-bold text-xs border border-[var(--border-color)] focus:outline-none cursor-pointer"
            >
              {FINANCIAL_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ================= TAB 1: LOAN & MORTGAGE ================= */}
        {activeTab === 'loan' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Input Controls */}
              <div className="instrument-display p-5 rounded-2xl space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--screen-text)] border-b border-[var(--border-color)] pb-2">
                  Loan Financing Parameters
                </h3>

                {/* Principal */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-[var(--screen-subtext)]">
                    <span className="font-semibold">Principal Amount</span>
                    <span className="font-bold text-[var(--accent-primary)] text-sm">
                      {formatCurrency(loanPrincipal, currency)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max="1500000"
                    step="5000"
                    value={loanPrincipal}
                    onChange={(e) => setLoanPrincipal(Number(e.target.value))}
                    className="w-full accent-[var(--accent-primary)] cursor-pointer"
                  />
                  <input
                    type="number"
                    step="5000"
                    value={loanPrincipal}
                    onChange={(e) => setLoanPrincipal(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--input-border)] font-bold text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                  />
                </div>

                {/* Rate */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-[var(--screen-subtext)]">
                    <span className="font-semibold">Annual Interest Rate (%)</span>
                    <span className="font-bold text-[var(--accent-primary)] text-sm">{loanRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.1"
                    value={loanRate}
                    onChange={(e) => setLoanRate(Number(e.target.value))}
                    className="w-full accent-[var(--accent-primary)] cursor-pointer"
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={loanRate}
                    onChange={(e) => setLoanRate(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--input-border)] font-bold text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                  />
                </div>

                {/* Term */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-[var(--screen-subtext)]">
                    <span className="font-semibold">Loan Duration</span>
                    <span className="font-bold text-[var(--accent-primary)] text-sm">{loanYears} Years</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[10, 15, 20, 25, 30].map((yr) => (
                      <button
                        key={yr}
                        onClick={() => setLoanYears(yr)}
                        className={`py-2 rounded-xl text-xs font-bold transition-colors border shadow-sm ${
                          loanYears === yr
                            ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] border-[var(--accent-primary)]'
                            : 'bg-[var(--chip-bg)] text-[var(--chip-text)] border-[var(--border-color)] hover:border-[var(--border-highlight)]'
                        }`}
                      >
                        {yr}y
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Monthly EMI & Ratio Card */}
              <div className="instrument-display p-5 rounded-2xl flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--screen-text)] border-b border-[var(--border-color)] pb-2">
                    Payment Breakdown
                  </h3>
                  <div className="mt-3">
                    <span className="text-[10px] text-[var(--screen-subtext)] uppercase tracking-wider font-semibold">
                      Fixed Monthly Payment (EMI)
                    </span>
                    <div className="text-3xl md:text-4xl font-extrabold text-[var(--accent-primary)] tracking-tight">
                      {formatCurrency(loanResults.monthlyEMI, currency)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 py-2 border-y border-[var(--border-color)] text-xs">
                  <div>
                    <span className="text-[var(--screen-subtext)] font-semibold">Principal:</span>
                    <div className="text-sm font-bold text-[var(--screen-text)]">
                      {formatCurrency(loanPrincipal, currency)}
                    </div>
                  </div>
                  <div>
                    <span className="text-[var(--screen-subtext)] font-semibold">Total Interest:</span>
                    <div className="text-sm font-bold text-[var(--accent-primary)]">
                      {formatCurrency(loanResults.totalInterest, currency)}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[var(--screen-subtext)] font-semibold">Total Cost of Loan:</span>
                    <div className="text-base font-bold text-[var(--screen-text)]">
                      {formatCurrency(loanResults.totalPayment, currency)}
                    </div>
                  </div>
                </div>

                {/* Donut Chart */}
                <div className="h-36 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Principal', value: loanPrincipal },
                          { name: 'Interest', value: Math.round(loanResults.totalInterest) },
                        ]}
                        innerRadius={40}
                        outerRadius={58}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#94a3b8" />
                        <Cell fill="var(--accent-primary)" />
                      </Pie>
                      <Tooltip
                        formatter={(val: number) => formatCurrency(val, currency)}
                        contentStyle={{
                          backgroundColor: 'var(--bg-card)',
                          borderColor: 'var(--border-color)',
                          borderRadius: '0.75rem',
                          color: 'var(--text-primary)',
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Collapsible Amortization Schedule Table */}
            <div className="p-4 rounded-2xl bg-[var(--dock-bg)] border border-[var(--border-color)] space-y-2">
              <button
                onClick={() => setShowAmortization(!showAmortization)}
                className="w-full flex items-center justify-between text-xs font-bold text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors"
              >
                <span>Annual Amortization Schedule ({loanYears} Years)</span>
                {showAmortization ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAmortization && (
                <div className="max-h-60 overflow-y-auto pt-2">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[var(--border-color)] text-[10px] text-[var(--text-muted)] uppercase">
                        <th className="py-1">Year</th>
                        <th className="py-1">Principal Paid</th>
                        <th className="py-1">Interest Paid</th>
                        <th className="py-1 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {loanResults.yearlySchedule.map((row) => (
                        <tr key={row.year} className="hover:bg-black/5 dark:hover:bg-white/5">
                          <td className="py-1.5 font-bold text-[var(--text-secondary)]">Yr {row.year}</td>
                          <td className="py-1.5 text-[var(--text-primary)] font-semibold">
                            {formatCurrency(row.principalPaid, currency)}
                          </td>
                          <td className="py-1.5 text-[var(--accent-primary)] font-semibold">
                            {formatCurrency(row.interestPaid, currency)}
                          </td>
                          <td className="py-1.5 text-right text-[var(--text-secondary)] font-semibold">
                            {formatCurrency(row.balance, currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: INVESTMENT & COMPOUND INTEREST ================= */}
        {activeTab === 'investment' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Inputs */}
              <div className="instrument-display p-5 rounded-2xl space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--screen-text)] border-b border-[var(--border-color)] pb-2">
                  Accumulation Inputs
                </h3>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-[var(--screen-subtext)]">
                    Initial Deposit ({getCurrencySymbol(currency)})
                  </span>
                  <input
                    type="number"
                    step="1000"
                    value={initDeposit}
                    onChange={(e) => setInitDeposit(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--input-border)] text-sm font-bold shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-[var(--screen-subtext)]">
                    Monthly Contribution ({getCurrencySymbol(currency)})
                  </span>
                  <input
                    type="number"
                    step="50"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--input-border)] text-sm font-bold shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-[var(--screen-subtext)]">Annual Yield Return (%)</span>
                  <input
                    type="number"
                    step="0.5"
                    value={investmentRate}
                    onChange={(e) => setInvestmentRate(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--input-border)] text-sm font-bold shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-[var(--screen-subtext)]">Horizon (Years)</span>
                  <input
                    type="number"
                    value={investmentYears}
                    onChange={(e) => setInvestmentYears(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--input-border)] text-sm font-bold shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                  />
                </div>
              </div>

              {/* Growth Curve Area Chart */}
              <div className="md:col-span-2 instrument-display p-5 rounded-2xl space-y-4 flex flex-col justify-between">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-color)] pb-2">
                  <div>
                    <span className="text-[10px] text-[var(--screen-subtext)] uppercase tracking-wider font-semibold">
                      Projected Portfolio Value
                    </span>
                    <div className="text-2xl md:text-3xl font-extrabold text-[var(--accent-primary)]">
                      {formatCurrency(investmentResults.futureValue, currency)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[var(--screen-subtext)] uppercase tracking-wider font-semibold">
                      Compound Interest Share
                    </span>
                    <div className="text-base md:text-lg font-bold text-emerald-500">
                      +{formatCurrency(investmentResults.totalInterest, currency)}
                    </div>
                  </div>
                </div>

                {/* Recharts AreaChart */}
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={investmentResults.yearlyData}>
                      <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.7} />
                          <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorContrib" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="year" stroke="var(--screen-subtext)" tick={{ fontSize: 9 }} />
                      <YAxis
                        stroke="var(--screen-subtext)"
                        tick={{ fontSize: 9 }}
                        tickFormatter={(val) => `${getCurrencySymbol(currency)}${(val / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        formatter={(val: number) => formatCurrency(val, currency)}
                        contentStyle={{
                          backgroundColor: 'var(--bg-card)',
                          borderColor: 'var(--border-color)',
                          borderRadius: '0.75rem',
                          color: 'var(--text-primary)',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="balance"
                        name="Total Portfolio"
                        stroke="var(--accent-primary)"
                        fillOpacity={1}
                        fill="url(#colorBalance)"
                      />
                      <Area
                        type="monotone"
                        dataKey="contributions"
                        name="Principal Contributed"
                        stroke="#94a3b8"
                        fillOpacity={1}
                        fill="url(#colorContrib)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: TIP & BILL SPLITTER ================= */}
        {activeTab === 'tip' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Inputs */}
            <div className="instrument-display p-5 rounded-2xl space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--screen-text)] border-b border-[var(--border-color)] pb-2">
                Gratuity & Party Split
              </h3>

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-[var(--screen-subtext)]">
                  Subtotal Bill Amount ({getCurrencySymbol(currency)})
                </span>
                <input
                  type="number"
                  step="5"
                  value={billAmount}
                  onChange={(e) => setBillAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--input-border)] font-mono text-xl font-bold shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[var(--screen-subtext)]">
                  <span className="font-semibold">Tip Rate (%)</span>
                  <span className="font-bold text-[var(--accent-primary)]">{tipPercent}%</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[10, 15, 18, 20, 25].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setTipPercent(pct)}
                      className={`py-2 rounded-xl text-xs font-bold transition-colors border shadow-sm ${
                        tipPercent === pct
                          ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] border-[var(--accent-primary)]'
                          : 'bg-[var(--chip-bg)] text-[var(--chip-text)] border-[var(--border-color)] hover:border-[var(--border-highlight)]'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[var(--screen-subtext)]">
                  <span className="font-semibold">Party Size</span>
                  <span className="font-bold text-[var(--accent-primary)]">{peopleCount} Guests</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(Number(e.target.value))}
                  className="w-full accent-[var(--accent-primary)] cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-[var(--screen-subtext)]">Local Sales Tax % (Optional)</span>
                <input
                  type="number"
                  step="0.5"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--input-border)] font-mono text-sm font-bold shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                />
              </div>
            </div>

            {/* Breakdown Per Person */}
            <div className="instrument-display p-5 rounded-2xl space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--screen-text)] border-b border-[var(--border-color)] pb-2">
                  Equal Split Allocation
                </h3>
                <div className="mt-4 p-4 rounded-xl bg-[var(--dock-bg)] border border-[var(--border-color)] text-center shadow-inner">
                  <span className="text-[10px] text-[var(--dock-item-text)] uppercase tracking-wider font-bold">
                    Amount Due Per Guest
                  </span>
                  <div className="text-3xl md:text-4xl font-extrabold text-[var(--accent-primary)] mt-1">
                    {formatCurrency(tipResults.perPersonTotal, currency)}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs border-t border-[var(--border-color)] pt-3">
                <div className="flex justify-between text-[var(--screen-subtext)] font-semibold">
                  <span>Tip Total:</span>
                  <span className="text-[var(--screen-text)] font-bold">{formatCurrency(tipResults.tipAmount, currency)}</span>
                </div>
                <div className="flex justify-between text-[var(--screen-subtext)] font-semibold">
                  <span>Tax Total:</span>
                  <span className="text-[var(--screen-text)] font-bold">{formatCurrency(tipResults.taxAmount, currency)}</span>
                </div>
                <div className="flex justify-between text-[var(--screen-subtext)] font-semibold">
                  <span>Grand Total:</span>
                  <span className="font-bold text-[var(--screen-text)] text-sm">
                    {formatCurrency(tipResults.total, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-[var(--screen-subtext)] border-t border-[var(--border-color)] pt-2 font-medium">
                  <span>Tip Per Person:</span>
                  <span className="text-[var(--accent-primary)] font-bold">
                    {formatCurrency(tipResults.perPersonTip, currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
