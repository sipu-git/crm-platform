import React from 'react';
import type { SignupFormData } from '@/features/auth/types/signup.types';
import { Target, Check, ArrowLeft, Users, TrendingUp, Receipt, Mail, BarChart3, ChevronRight } from 'lucide-react';

interface Props {
  formData: SignupFormData;
  updateFormData: (patch: Partial<SignupFormData>) => void;
  onSuccess: () => void;
  onBack: () => void;
}

const GOALS_OPTIONS = [
  {
    id: 'Lead Management',
    label: 'Lead Capture & Tracking',
    desc: 'Manage incoming leads, sources, and status updates',
    icon: Target,
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  },
  {
    id: 'Sales Pipeline',
    label: 'Sales Deals & Pipelines',
    desc: 'Track deals through custom visual pipeline stages',
    icon: TrendingUp,
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  {
    id: 'Invoicing',
    label: 'Invoicing & Payments',
    desc: 'Generate quotes, send invoices, and track buyer billing',
    icon: Receipt,
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  },
  {
    id: 'Team Collaboration',
    label: 'Team & Project Management',
    desc: 'Assign tasks, manage rep activities, and track projects',
    icon: Users,
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  },
  {
    id: 'Email Automation',
    label: 'Email Integration & Outreach',
    desc: 'Connect Google/SMTP email accounts for team messaging',
    icon: Mail,
    color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  },
  {
    id: 'Reporting & Analytics',
    label: 'Reports & Revenue Analytics',
    desc: 'Gain real-time insights on sales performance and conversion',
    icon: BarChart3,
    color: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  },
];

export const Step4CrmSetup: React.FC<Props> = ({ formData, updateFormData, onSuccess, onBack }) => {
  const toggleGoal = (goalId: string) => {
    const current = formData.crm_goals || [];
    const exists = current.includes(goalId);
    const updated = exists ? current.filter((g) => g !== goalId) : [...current, goalId];
    updateFormData({ crm_goals: updated });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess();
  };

  return (
    <form onSubmit={handleNext} className="space-y-6">
      <div>
        <div className="text-indigo-400 font-bold text-xs tracking-widest uppercase mb-1">
          STEP 4 OF 8
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">What are your primary CRM goals?</h2>
        <p className="text-sm text-slate-400 mt-1">Select all that apply. We'll optimize your workspace navigation accordingly.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {GOALS_OPTIONS.map((item) => {
          const selected = (formData.crm_goals || []).includes(item.id);
          const IconComp = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => toggleGoal(item.id)}
              className={`cursor-pointer rounded-2xl border p-4 transition-all duration-300 transform hover:-translate-y-0.5 ${
                selected
                  ? 'bg-gradient-to-br from-indigo-950/80 via-[#13172E] to-purple-950/50 border-indigo-500 ring-2 ring-indigo-500/30 shadow-[0_0_20px_rgba(79,70,229,0.25)]'
                  : 'bg-[#13172E]/60 border-slate-700/80 hover:border-indigo-500/50 hover:bg-[#181D3B]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl border ${item.color} flex-shrink-0`}>
                  <IconComp className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white truncate">{item.label}</h4>
                    <div
                      className={`h-5 w-5 rounded-md flex items-center justify-center border transition-all flex-shrink-0 ml-2 ${
                        selected ? 'bg-indigo-600 border-indigo-500 text-white scale-105' : 'border-slate-700 bg-slate-900/60'
                      }`}
                    >
                      {selected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
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
