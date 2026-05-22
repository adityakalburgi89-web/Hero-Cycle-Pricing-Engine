import React, { useEffect, useState } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  Edit2,
  Activity,
  CheckCircle,
  Database,
  RefreshCw,
  Calculator,
  Sliders,
  DollarSign,
  AlertCircle,
  Info,
  Layers,
  Settings,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { usePricingStore } from './store/usePricingStore.js';
import { PricingRule, RuleType, ValueType } from './types/pricing.types.js';

// Pre-defined mock data to act as initial/fallback state if backend DB is not configured,
const MOCK_RULES: PricingRule[] = [
  {
    id: 'mock-1',
    name: 'Monsoon Cycle Discount',
    description: 'Special seasonal price deduction for Mountain Bikes during heavy rainfall seasons.',
    ruleType: 'DISCOUNT',
    valueType: 'PERCENTAGE',
    value: 12,
    conditions: { minQuantity: 2, cycleType: 'Mountain' },
    priority: 10,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    name: 'Premium Alloy Markup',
    description: 'Standard adjustment for customized lightweight alloy structural parts.',
    ruleType: 'MARKUP',
    valueType: 'FIXED',
    value: 45.0,
    conditions: { frameMaterial: 'Alloy' },
    priority: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-3',
    name: 'Export Tax surcharge',
    description: 'Cross-border logistical compliance and standard transport duties.',
    ruleType: 'TAX',
    valueType: 'PERCENTAGE',
    value: 8.5,
    conditions: { shippingZone: 'International' },
    priority: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function App() {
  const {
    rules,
    isLoading,
    error,
    successMessage,
    fetchRules,
    addRule,
    updateRule,
    deleteRule,
    clearStatus,
  } = usePricingStore();

  // App States
  const [activeTab, setActiveTab] = useState<'rules' | 'calculator'>('rules');
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [backendHealth, setBackendHealth] = useState<{ status: string; service: string } | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ruleType: 'DISCOUNT' as RuleType,
    valueType: 'PERCENTAGE' as ValueType,
    value: 0,
    priority: 0,
    isActive: true,
    minQuantity: 1,
    cycleType: 'All',
  });

  // Simulator Calculator States
  const [basePrice, setBasePrice] = useState<number>(350);
  const [calcQuantity, setCalcQuantity] = useState<number>(1);
  const [calcCycleType, setCalcCycleType] = useState<string>('Mountain');
  const [calcFrameMaterial, setCalcFrameMaterial] = useState<string>('Alloy');
  const [calcShippingZone, setCalcShippingZone] = useState<string>('Domestic');
  const [simulationResult, setSimulationResult] = useState<{
    originalSubtotal: number;
    finalTotal: number;
    appliedRules: Array<{ name: string; type: RuleType; adjustment: number }>;
  } | null>(null);

  // Fetch data on load
  useEffect(() => {
    const init = async () => {
      try {
        await fetchRules();
      } catch (e) {
        console.error('Database unreachable, switching to mock simulations.');
      }
      
      // Test Backend Health
      try {
        const res = await fetch('http://localhost:5000/api/v1/health');
        if (res.ok) {
          const data = await res.json();
          setBackendHealth(data.data);
        }
      } catch (err) {
        console.warn('Backend API connection offline.');
      }
    };
    init();
  }, [fetchRules]);

  // Check if store has rules or needs mock fallback
  const activeRulesList = rules.length > 0 ? rules : MOCK_RULES;

  useEffect(() => {
    if (rules.length === 0) {
      setIsUsingMockData(true);
    } else {
      setIsUsingMockData(false);
    }
  }, [rules]);

  // Manage Status Message auto-clear
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => clearStatus(), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, clearStatus]);

  // Form handling
  const openCreateModal = () => {
    setEditingRule(null);
    setFormData({
      name: '',
      description: '',
      ruleType: 'DISCOUNT',
      valueType: 'PERCENTAGE',
      value: 10,
      priority: 1,
      isActive: true,
      minQuantity: 1,
      cycleType: 'All',
    });
    setShowModal(true);
  };

  const openEditModal = (rule: PricingRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || '',
      ruleType: rule.ruleType,
      valueType: rule.valueType,
      value: Number(rule.value),
      priority: rule.priority,
      isActive: rule.isActive,
      minQuantity: rule.conditions?.minQuantity || 1,
      cycleType: rule.conditions?.cycleType || 'All',
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const conditions: Record<string, any> = {};
    if (formData.minQuantity > 1) conditions.minQuantity = formData.minQuantity;
    if (formData.cycleType !== 'All') conditions.cycleType = formData.cycleType;

    const payload = {
      name: formData.name,
      description: formData.description,
      ruleType: formData.ruleType,
      valueType: formData.valueType,
      value: Number(formData.value),
      priority: Number(formData.priority),
      isActive: formData.isActive,
      conditions,
    };

    if (isUsingMockData) {
      // Simulate on Mock list
      if (editingRule) {
        const index = MOCK_RULES.findIndex((r) => r.id === editingRule.id);
        if (index !== -1) {
          MOCK_RULES[index] = {
            ...editingRule,
            ...payload,
            updatedAt: new Date().toISOString(),
          };
        }
      } else {
        MOCK_RULES.unshift({
          id: `mock-${Date.now()}`,
          ...payload,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      setShowModal(false);
      runSimulation();
      return;
    }

    let success = false;
    if (editingRule) {
      success = await updateRule(editingRule.id, payload);
    } else {
      success = await addRule(payload);
    }

    if (success) {
      setShowModal(false);
      fetchRules();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this pricing rule?')) {
      if (isUsingMockData) {
        const idx = MOCK_RULES.findIndex((r) => r.id === id);
        if (idx !== -1) MOCK_RULES.splice(idx, 1);
        runSimulation();
        return;
      }
      const success = await deleteRule(id);
      if (success) fetchRules();
    }
  };

  const toggleRuleActive = async (rule: PricingRule) => {
    if (isUsingMockData) {
      rule.isActive = !rule.isActive;
      runSimulation();
      return;
    }
    const success = await updateRule(rule.id, { isActive: !rule.isActive });
    if (success) fetchRules();
  };

  // Pricing Engine Simulation Math
  const runSimulation = () => {
    const originalSubtotal = basePrice * calcQuantity;
    let finalTotal = originalSubtotal;
    const appliedRules: Array<{ name: string; type: RuleType; adjustment: number }> = [];

    // Sort active rules by priority desc
    const executableRules = [...activeRulesList]
      .filter((r) => r.isActive)
      .sort((a, b) => b.priority - a.priority);

    executableRules.forEach((rule) => {
      let isMatch = true;

      // Check conditions
      if (rule.conditions) {
        if (rule.conditions.minQuantity && calcQuantity < Number(rule.conditions.minQuantity)) {
          isMatch = false;
        }
        if (rule.conditions.cycleType && rule.conditions.cycleType !== 'All' && calcCycleType !== rule.conditions.cycleType) {
          isMatch = false;
        }
        if (rule.conditions.frameMaterial && calcFrameMaterial !== rule.conditions.frameMaterial) {
          isMatch = false;
        }
        if (rule.conditions.shippingZone && calcShippingZone !== rule.conditions.shippingZone) {
          isMatch = false;
        }
      }

      if (isMatch) {
        let adjustment = 0;
        const val = Number(rule.value);

        if (rule.ruleType === 'DISCOUNT') {
          adjustment = rule.valueType === 'PERCENTAGE' ? finalTotal * (val / 100) : val;
          finalTotal -= adjustment;
          appliedRules.push({ name: rule.name, type: rule.ruleType, adjustment: -adjustment });
        } else if (rule.ruleType === 'MARKUP') {
          adjustment = rule.valueType === 'PERCENTAGE' ? finalTotal * (val / 100) : val;
          finalTotal += adjustment;
          appliedRules.push({ name: rule.name, type: rule.ruleType, adjustment });
        } else if (rule.ruleType === 'TAX') {
          adjustment = rule.valueType === 'PERCENTAGE' ? finalTotal * (val / 100) : val;
          finalTotal += adjustment;
          appliedRules.push({ name: rule.name, type: rule.ruleType, adjustment });
        } else if (rule.ruleType === 'SURCHARGE') {
          adjustment = rule.valueType === 'PERCENTAGE' ? finalTotal * (val / 100) : val;
          finalTotal += adjustment;
          appliedRules.push({ name: rule.name, type: rule.ruleType, adjustment });
        }
      }
    });

    setSimulationResult({
      originalSubtotal,
      finalTotal,
      appliedRules,
    });
  };

  // Re-run simulation when dependencies change
  useEffect(() => {
    runSimulation();
  }, [basePrice, calcQuantity, calcCycleType, calcFrameMaterial, calcShippingZone, activeRulesList]);

  // Statistics summaries
  const statTotalRules = activeRulesList.length;
  const statActiveRules = activeRulesList.filter((r) => r.isActive).length;
  const statDiscounts = activeRulesList.filter((r) => r.ruleType === 'DISCOUNT').length;
  const statMarkups = activeRulesList.filter((r) => r.ruleType === 'MARKUP').length;

  return (
    <div className="min-h-screen flex flex-col radial-glow">
      {/* Top Banner Alert when using Local Mock Simulations */}
      {isUsingMockData && (
        <div className="bg-amber-950/40 border-b border-amber-500/20 px-4 py-2 text-center text-sm flex items-center justify-center gap-2 text-amber-300">
          <Info size={16} />
          <span>Showing local database simulation. To connect live PostgreSQL tables, set your database URL in the backend <code>.env</code> file.</span>
        </div>
      )}

      {/* Global Status Notifications */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 glass-panel border-emerald-500/30 text-emerald-400 px-6 py-4 rounded-xl flex items-center gap-3 shadow-glass shadow-emerald-950/20 animate-bounce">
          <CheckCircle size={20} className="text-emerald-400" />
          <span className="font-semibold text-sm">{successMessage}</span>
        </div>
      )}
      {error && (
        <div className="fixed bottom-6 right-6 z-50 glass-panel border-red-500/30 text-red-400 px-6 py-4 rounded-xl flex items-center gap-3 shadow-glass shadow-red-950/20 animate-pulse">
          <AlertCircle size={20} className="text-red-400" />
          <span className="font-semibold text-sm">{error}</span>
        </div>
      )}

      {/* Navigation Topbar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-900/30">
            🚲
          </div>
          <div>
            <h1 className="font-outfit text-xl font-bold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
              Hero Cycle Pricing Engine
            </h1>
            <p className="text-xs text-slate-400">Enterprise Dashboard & Rules Compiler</p>
          </div>
        </div>

        {/* System Server Connections Indicators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-800">
            <Activity size={14} className={backendHealth ? "text-emerald-400 animate-pulse" : "text-red-400"} />
            <span className="text-slate-400">API Gateway:</span>
            <span className={backendHealth ? "text-emerald-400 font-medium" : "text-red-400 font-medium"}>
              {backendHealth ? "ONLINE" : "OFFLINE"}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-800">
            <Database size={14} className={rules.length > 0 ? "text-emerald-400" : "text-amber-400"} />
            <span className="text-slate-400">PostgreSQL:</span>
            <span className={rules.length > 0 ? "text-emerald-400 font-medium" : "text-amber-400 font-medium"}>
              {rules.length > 0 ? "CONNECTED" : "SIMULATED"}
            </span>
          </div>

          <button
            onClick={() => fetchRules()}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh database records"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Controls */}
        <aside className="w-full md:w-64 border-r border-slate-800 bg-slate-950/30 p-6 flex flex-col gap-6">
          <div className="text-xs font-bold text-slate-500 tracking-widest uppercase">Navigation</div>
          
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('rules')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'rules'
                  ? 'bg-brand-600 text-white shadow-lg shadow-indigo-900/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Sliders size={18} />
              Rules Configuration
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'calculator'
                  ? 'bg-brand-600 text-white shadow-lg shadow-indigo-900/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Calculator size={18} />
              Pricing Simulator
            </button>
          </nav>

          <div className="border-t border-slate-800 pt-6 mt-auto">
            <div className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-4">Architecture Stack</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Frontend:</span>
                <span className="font-semibold text-slate-200">React + Vite</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Styles:</span>
                <span className="font-semibold text-slate-200">Tailwind CSS</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>State manager:</span>
                <span className="font-semibold text-slate-200">Zustand</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>ORM Layer:</span>
                <span className="font-semibold text-slate-200">Prisma</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Dashboard Canvas */}
        <main className="flex-1 p-6 md:p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full">
          {/* Glowing Metrics Cards Banner */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
              <div className="absolute right-4 top-4 opacity-10 text-indigo-400 group-hover:scale-110 transition-transform">
                <Sliders size={40} />
              </div>
              <span className="text-xs text-slate-400 font-semibold tracking-wide">Total Configured Rules</span>
              <span className="text-3xl font-bold font-outfit text-white">{statTotalRules}</span>
            </div>

            <div className="glass-panel p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
              <div className="absolute right-4 top-4 opacity-10 text-emerald-400 group-hover:scale-110 transition-transform">
                <CheckCircle size={40} />
              </div>
              <span className="text-xs text-slate-400 font-semibold tracking-wide">Active Rules</span>
              <span className="text-3xl font-bold font-outfit text-emerald-400">{statActiveRules}</span>
            </div>

            <div className="glass-panel p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
              <div className="absolute right-4 top-4 opacity-10 text-indigo-400 group-hover:scale-110 transition-transform">
                <TrendingDown size={40} />
              </div>
              <span className="text-xs text-slate-400 font-semibold tracking-wide">Active Discounts</span>
              <span className="text-3xl font-bold font-outfit text-white">{statDiscounts}</span>
            </div>

            <div className="glass-panel p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
              <div className="absolute right-4 top-4 opacity-10 text-indigo-400 group-hover:scale-110 transition-transform">
                <TrendingUp size={40} />
              </div>
              <span className="text-xs text-slate-400 font-semibold tracking-wide">Active Markups</span>
              <span className="text-3xl font-bold font-outfit text-white">{statMarkups}</span>
            </div>
          </section>

          {/* Rules Management Tab */}
          {activeTab === 'rules' && (
            <section className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-outfit text-2xl font-bold text-white">Pricing Rules Directory</h2>
                  <p className="text-sm text-slate-400">Establish, manage, and prioritize active business conditions.</p>
                </div>
                
                <button
                  onClick={openCreateModal}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-900/30 self-start"
                >
                  <Plus size={18} />
                  Add Pricing Rule
                </button>
              </div>

              {/* Grid / List Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeRulesList.map((rule) => {
                  const valTypeSymbol = rule.valueType === 'PERCENTAGE' ? '%' : '$';
                  const isDiscount = rule.ruleType === 'DISCOUNT';
                  
                  return (
                    <div
                      key={rule.id}
                      className={`glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between gap-6 relative ${
                        !rule.isActive ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex flex-col gap-4">
                        {/* Header Details and Toggle */}
                        <div className="flex items-start justify-between gap-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                              isDiscount
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20'
                                : 'bg-brand-950/60 text-brand-200 border border-brand-500/20'
                            }`}
                          >
                            {rule.ruleType}
                          </span>

                          <button
                            onClick={() => toggleRuleActive(rule)}
                            className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 border ${
                              rule.isActive
                                ? 'bg-emerald-500/30 border-emerald-500'
                                : 'bg-slate-900 border-slate-800'
                            }`}
                          >
                            <span
                              className={`w-4.5 h-4.5 rounded-full transition-transform ${
                                rule.isActive
                                  ? 'translate-x-5 bg-emerald-400 shadow-glow'
                                  : 'translate-x-0 bg-slate-500'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Title and Body */}
                        <div>
                          <h3 className="font-outfit text-lg font-bold text-white line-clamp-1">{rule.name}</h3>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2 h-8 leading-relaxed">
                            {rule.description || 'No description supplied.'}
                          </p>
                        </div>

                        {/* Calculations adjustments details */}
                        <div className="flex items-baseline gap-2 bg-slate-950/40 p-3.5 rounded-xl border border-slate-900">
                          <span
                            className={`text-2xl font-bold font-outfit ${
                              isDiscount ? 'text-emerald-400' : 'text-slate-100'
                            }`}
                          >
                            {isDiscount ? '-' : '+'}
                            {rule.value}
                            {valTypeSymbol}
                          </span>
                          <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Adjustment</span>
                        </div>

                        {/* Conditions Tags list */}
                        {rule.conditions && Object.keys(rule.conditions).length > 0 && (
                          <div className="flex flex-col gap-2 pt-2 border-t border-slate-900/60">
                            <span className="text-xxs text-slate-500 uppercase font-bold tracking-widest">Active Criteria</span>
                            <div className="flex flex-wrap gap-1.5">
                              {Object.entries(rule.conditions).map(([key, val]) => (
                                <span
                                  key={key}
                                  className="text-xxs font-semibold bg-slate-900/60 text-indigo-300 border border-indigo-500/10 px-2 py-0.5 rounded-md"
                                >
                                  {key}: {val}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card actions */}
                      <div className="flex items-center justify-between border-t border-slate-900/60 pt-4 mt-2">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <span className="text-xxs uppercase tracking-wider font-semibold">Priority:</span>
                          <span className="text-xs font-bold text-slate-300">{rule.priority}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(rule)}
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
                            title="Edit rule config"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(rule.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors"
                            title="Delete rule"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Pricing Simulator Tab */}
          {activeTab === 'calculator' && (
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Controls Form panel */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div>
                  <h2 className="font-outfit text-2xl font-bold text-white">Pricing Simulator</h2>
                  <p className="text-sm text-slate-400">Test how the active priority rules compiler behaves on transactional products.</p>
                </div>

                <div className="glass-panel p-6 rounded-2xl flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Base Cycle Price ($)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <DollarSign size={16} />
                      </div>
                      <input
                        type="number"
                        value={basePrice}
                        onChange={(e) => setBasePrice(Math.max(0, Number(e.target.value)))}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-brand-500 focus:outline-none text-white text-sm font-semibold transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Quantity Ordered</label>
                    <input
                      type="number"
                      value={calcQuantity}
                      onChange={(e) => setCalcQuantity(Math.max(1, Number(e.target.value)))}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-brand-500 focus:outline-none text-white text-sm font-semibold transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cycle Category</label>
                    <select
                      value={calcCycleType}
                      onChange={(e) => setCalcCycleType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-brand-500 focus:outline-none text-white text-sm font-semibold transition-colors"
                    >
                      <option value="Mountain">Mountain Bike</option>
                      <option value="Road">Road Bike</option>
                      <option value="BMX">BMX Stunt Cycle</option>
                      <option value="City">City Cruiser</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Frame Material</label>
                    <select
                      value={calcFrameMaterial}
                      onChange={(e) => setCalcFrameMaterial(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-brand-500 focus:outline-none text-white text-sm font-semibold transition-colors"
                    >
                      <option value="Alloy">Lightweight Alloy</option>
                      <option value="Carbon">Carbon Fiber Premium</option>
                      <option value="Steel">Heavy Carbon Steel</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Shipping Destination</label>
                    <select
                      value={calcShippingZone}
                      onChange={(e) => setCalcShippingZone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-brand-500 focus:outline-none text-white text-sm font-semibold transition-colors"
                    >
                      <option value="Domestic">Domestic Mainland</option>
                      <option value="International">International Export Zone</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Simulation Result output */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div>
                  <h2 className="font-outfit text-2xl font-bold text-white">Calculation Breakdown</h2>
                  <p className="text-sm text-slate-400">Step-by-step resolution of applied pricing criteria.</p>
                </div>

                {simulationResult && (
                  <div className="glass-panel p-8 rounded-3xl flex flex-col gap-6 border-brand-500/20 bg-gradient-to-b from-indigo-950/10 to-slate-950/50">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-800/60">
                      <span className="text-sm text-slate-400 font-semibold uppercase tracking-wider">Subtotal:</span>
                      <span className="text-lg font-bold font-outfit text-slate-300">
                        ${simulationResult.originalSubtotal.toFixed(2)}
                      </span>
                    </div>

                    {/* Applied Rules Log list */}
                    <div className="flex-1 flex flex-col gap-4">
                      <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Applied Compiler Pipeline</span>
                      {simulationResult.appliedRules.length === 0 ? (
                        <div className="text-xs text-slate-400 py-6 text-center italic bg-slate-950/30 rounded-xl border border-slate-900 border-dashed">
                          No conditions matched the criteria. Final price is equal to subtotal.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {simulationResult.appliedRules.map((applied, idx) => {
                            const isNeg = applied.adjustment < 0;
                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3.5 bg-slate-950/50 border border-slate-900 rounded-xl"
                              >
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-white">{applied.name}</span>
                                  <span className="text-xxs font-semibold text-slate-500 uppercase">{applied.type}</span>
                                </div>
                                <span
                                  className={`text-sm font-bold font-outfit ${
                                    isNeg ? 'text-emerald-400' : 'text-indigo-300'
                                  }`}
                                >
                                  {isNeg ? '' : '+'}
                                  ${applied.adjustment.toFixed(2)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Grand Total output */}
                    <div className="pt-6 border-t border-slate-800/80 mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Total Calculated Cost</span>
                        <span className="text-xxs text-slate-500 italic mt-0.5">Includes seasonal discount and tax adjustments</span>
                      </div>
                      
                      <div className="text-4xl font-extrabold font-outfit text-brand-200 bg-brand-500/10 px-6 py-2.5 rounded-2xl border border-brand-500/30 shadow-glass-accent">
                        ${simulationResult.finalTotal.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/60 bg-slate-950/80 px-6 py-6 text-center text-xs text-slate-500 mt-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span>© 2026 Hero Cycle Pricing Systems. Ready for Enterprise Deployment.</span>
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-brand-500" />
          <span>Production Ready Boilerplate</span>
        </div>
      </footer>

      {/* DIALOG MODAL: ADD / EDIT RULE */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg glass-panel p-6 md:p-8 rounded-3xl flex flex-col gap-6 shadow-glass relative">
            <div className="flex items-center justify-between">
              <h3 className="font-outfit text-xl font-bold text-white">
                {editingRule ? 'Modify Pricing Rule' : 'Create Pricing Rule'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Rule Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Bulk Mountain bike markup"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-brand-500 focus:outline-none text-white text-sm font-semibold transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summarize the business context..."
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-brand-500 focus:outline-none text-white text-sm font-semibold transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Type</label>
                  <select
                    value={formData.ruleType}
                    onChange={(e) => setFormData({ ...formData, ruleType: e.target.value as RuleType })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-brand-500 focus:outline-none text-white text-sm font-semibold transition-colors"
                  >
                    <option value="DISCOUNT">Discount</option>
                    <option value="MARKUP">Markup</option>
                    <option value="TAX">Tax Surcharge</option>
                    <option value="SURCHARGE">Surcharge</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Formula Unit</label>
                  <select
                    value={formData.valueType}
                    onChange={(e) => setFormData({ ...formData, valueType: e.target.value as ValueType })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-brand-500 focus:outline-none text-white text-sm font-semibold transition-colors"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Flat Currency ($)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Value</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-brand-500 focus:outline-none text-white text-sm font-semibold transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Execution Priority</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-brand-500 focus:outline-none text-white text-sm font-semibold transition-colors"
                  />
                </div>
              </div>

              <div className="border-t border-slate-900/60 pt-4 flex flex-col gap-3">
                <span className="text-xxs text-slate-500 uppercase font-bold tracking-widest">Optional Activation Criteria</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-semibold">Min Quantity Required</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.minQuantity}
                      onChange={(e) => setFormData({ ...formData, minQuantity: Math.max(1, Number(e.target.value)) })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-semibold">Apply to Cycle Type</label>
                    <select
                      value={formData.cycleType}
                      onChange={(e) => setFormData({ ...formData, cycleType: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs font-semibold focus:outline-none"
                    >
                      <option value="All">All Cycles</option>
                      <option value="Mountain">Mountain Bike</option>
                      <option value="Road">Road Bike</option>
                      <option value="BMX">BMX Stunt Cycle</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4 border-t border-slate-800 pt-5 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition-colors text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-colors shadow-lg shadow-indigo-900/20"
                >
                  {editingRule ? 'Save Changes' : 'Compile Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
