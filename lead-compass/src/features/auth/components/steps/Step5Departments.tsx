import React, { useState } from 'react';
import type { SignupFormData } from '@/features/auth/types/signup.types';
import { Plus, X, ArrowLeft, Check, Building, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  formData: SignupFormData;
  updateFormData: (patch: Partial<SignupFormData>) => void;
  onSuccess: () => void;
  onBack: () => void;
}

const DEFAULT_DEPARTMENTS = [
  'Sales',
  'Marketing',
  'Customer Support',
  'Operations',
  'Finance & Accounting',
  'Product & Engineering',
  'Human Resources',
];

export const Step5Departments: React.FC<Props> = ({ formData, updateFormData, onSuccess, onBack }) => {
  const [customInput, setCustomInput] = useState('');

  const toggleDept = (dept: string) => {
    const current = formData.departments || [];
    const exists = current.includes(dept);
    const updated = exists ? current.filter((d) => d !== dept) : [...current, dept];
    updateFormData({ departments: updated });
  };

  const addCustomDept = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = customInput.trim();
    if (!cleaned) return;
    const current = formData.departments || [];
    if (current.includes(cleaned)) {
      toast.error('Department already added');
      return;
    }
    updateFormData({ departments: [...current, cleaned] });
    setCustomInput('');
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.departments || formData.departments.length === 0) {
      toast.error('Please select at least one department');
      return;
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleNext} className="space-y-6">
      <div>
        <div className="text-indigo-400 font-bold text-xs tracking-widest uppercase mb-1">
          STEP 5 OF 8
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Select your company departments</h2>
        <p className="text-sm text-slate-400 mt-1">Departments help organize lead routing, task assignments, and rep access.</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">
            Suggested Departments
          </label>
          <div className="flex flex-wrap gap-2.5">
            {DEFAULT_DEPARTMENTS.map((dept) => {
              const selected = (formData.departments || []).includes(dept);
              return (
                <button
                  type="button"
                  key={dept}
                  onClick={() => toggleDept(dept)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 border transform hover:-translate-y-0.5 active:scale-95 ${
                    selected
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                      : 'bg-[#13172E]/60 border-slate-700/80 text-slate-300 hover:text-white hover:border-indigo-500/50 hover:bg-[#181D3B]'
                  }`}
                >
                  <div
                    className={`h-4.5 w-4.5 rounded-md flex items-center justify-center border transition-all ${
                      selected ? 'bg-white/20 border-transparent text-white' : 'border-slate-600 bg-slate-900/60'
                    }`}
                  >
                    {selected && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                  {dept}
                </button>
              );
            })}
          </div>
        </div>

        {/* Add custom department box */}
        <div className="bg-[#13172E]/60 border border-indigo-500/20 rounded-xl p-4 space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            Need a custom department name?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Enter custom department (e.g. Enterprise Sales)"
              className="flex-1 rounded-xl bg-[#0B0E21] border border-slate-700 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
            <button
              type="button"
              onClick={addCustomDept}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all flex items-center gap-1.5 shadow-md"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </div>

        {/* Selected Departments List */}
        {formData.departments && formData.departments.length > 0 && (
          <div className="pt-2">
            <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
              Selected ({formData.departments.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {formData.departments.map((dept) => (
                <span
                  key={dept}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition-all"
                >
                  <Building className="h-3 w-3 text-indigo-400" />
                  {dept}
                  <button
                    type="button"
                    onClick={() => toggleDept(dept)}
                    className="hover:text-red-400 focus:outline-none transition-colors ml-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <button
          type="submit"
          className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-sm shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
        >
          Continue
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </form>
  );
};
