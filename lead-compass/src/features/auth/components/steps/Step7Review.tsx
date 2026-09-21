import React from 'react';
import type { SignupFormData } from '@/features/auth/types/signup.types';
import { Edit2, ArrowLeft, CheckCircle2, Building2, Users, Layers, ShieldCheck, ChevronRight } from 'lucide-react';

interface Props {
  formData: SignupFormData;
  goToStep: (step: number) => void;
  onSuccess: () => void;
  onBack: () => void;
}

export const Step7Review: React.FC<Props> = ({ formData, goToStep, onSuccess, onBack }) => {
  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess();
  };

  return (
    <form onSubmit={handleNext} className="space-y-6">
      <div>
        <div className="text-indigo-400 font-bold text-xs tracking-widest uppercase mb-1">
          STEP 7 OF 8
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Review workspace details</h2>
          <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1 shadow-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> 100% Ready
          </span>
        </div>
        <p className="text-sm text-slate-400 mt-1">Double check your details before launching your workspace.</p>
      </div>

      <div className="space-y-4">
        {/* Account Info */}
        <div className="bg-[#13172E]/60 border border-slate-700/80 hover:border-indigo-500/40 rounded-2xl p-4.5 space-y-2.5 relative transition-all">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-indigo-400" />
              Admin Account Details
            </h4>
            <button
              type="button"
              onClick={() => goToStep(1)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition-colors hover:bg-indigo-500/10 px-2.5 py-1 rounded-lg"
            >
              <Edit2 className="h-3 w-3" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div><span className="text-slate-400 block">Full Name:</span> <strong className="text-white text-sm">{formData.full_name}</strong></div>
            <div><span className="text-slate-400 block">Work Email:</span> <strong className="text-white text-sm">{formData.email}</strong></div>
            <div><span className="text-slate-400 block">Verification:</span> <span className="text-emerald-400 font-bold flex items-center gap-1 mt-0.5"><CheckCircle2 className="h-3.5 w-3.5" /> Verified</span></div>
          </div>
        </div>

        {/* Company & Workspace Info */}
        <div className="bg-[#13172E]/60 border border-slate-700/80 hover:border-indigo-500/40 rounded-2xl p-4.5 space-y-2.5 relative transition-all">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="h-4.5 w-4.5 text-indigo-400" />
              Company Profile & Domain
            </h4>
            <button
              type="button"
              onClick={() => goToStep(3)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition-colors hover:bg-indigo-500/10 px-2.5 py-1 rounded-lg"
            >
              <Edit2 className="h-3 w-3" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div><span className="text-slate-400 block">Company Name:</span> <strong className="text-white">{formData.tenant_name}</strong></div>
            <div><span className="text-slate-400 block">Workspace Slug:</span> <strong className="text-indigo-400 font-mono">app.leadcompass.com/{formData.tenant_slug}</strong></div>
            <div><span className="text-slate-400 block">Industry:</span> <span className="text-slate-200 font-medium">{formData.industry}</span></div>
            <div><span className="text-slate-400 block">Company Size:</span> <span className="text-slate-200 font-medium">{formData.company_size}</span></div>
            {formData.website && <div><span className="text-slate-400 block">Website:</span> <span className="text-slate-200">{formData.website}</span></div>}
            {formData.location && <div><span className="text-slate-400 block">HQ Location:</span> <span className="text-slate-200">{formData.location}</span></div>}
          </div>
        </div>

        {/* CRM Goals & Departments */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#13172E]/60 border border-slate-700/80 hover:border-indigo-500/40 rounded-2xl p-4 space-y-2 transition-all">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Primary CRM Goals</h4>
              <button
                type="button"
                onClick={() => goToStep(4)}
                className="text-xs text-indigo-400 font-bold hover:underline"
              >
                Edit
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(formData.crm_goals || []).map((g) => (
                <span key={g} className="px-2.5 py-1 bg-slate-800/80 text-slate-200 text-xs rounded-lg font-medium border border-slate-700">
                  {g}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[#13172E]/60 border border-slate-700/80 hover:border-indigo-500/40 rounded-2xl p-4 space-y-2 transition-all">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-indigo-400" /> Departments
              </h4>
              <button
                type="button"
                onClick={() => goToStep(5)}
                className="text-xs text-indigo-400 font-bold hover:underline"
              >
                Edit
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(formData.departments || []).map((d) => (
                <span key={d} className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded-lg font-semibold border border-indigo-500/30">
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Team Invites */}
        <div className="bg-[#13172E]/60 border border-slate-700/80 hover:border-indigo-500/40 rounded-2xl p-4 space-y-2 transition-all">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-indigo-400" />
              Pending Team Invitations ({formData.team_invites?.length || 0})
            </h4>
            <button
              type="button"
              onClick={() => goToStep(6)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition-colors hover:bg-indigo-500/10 px-2.5 py-1 rounded-lg"
            >
              <Edit2 className="h-3 w-3" /> Edit
            </button>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {formData.team_invites && formData.team_invites.length > 0
              ? `${formData.team_invites.length} teammate email invitation(s) will be automatically sent when your workspace is initialized.`
              : 'No team members added yet. You can invite team members anytime from workspace settings.'}
          </p>
        </div>
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
          Continue to Launch
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </form>
  );
};
