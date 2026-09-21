import React, { useState } from 'react';
import { Rocket, Loader2, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { SignupFormData } from '@/features/auth/types/signup.types';
import { completeSignupApi } from '@/features/auth/apis/signup.api';

interface Props {
  formData: SignupFormData;
  resetWizard: () => void;
  onBack: () => void;
}

export const Step8CreateWorkspace: React.FC<Props> = ({ formData, resetWizard, onBack }) => {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.verification_token) {
      toast.error('Email verification expired. Please go back to step 2 to verify email.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await completeSignupApi({
        verificationToken: formData.verification_token,
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        tenant_name: formData.tenant_name,
        tenant_slug: formData.tenant_slug,
        industry: formData.industry,
        company_size: formData.company_size,
        website: formData.website,
        location: formData.location,
        crm_goals: formData.crm_goals,
        departments: formData.departments,
        team_invites: formData.team_invites,
      });

      // Save tokens and session
      if (res.accessToken) {
        localStorage.setItem('crm.auth.token', res.accessToken);
      }
      if (res.refreshToken) {
        localStorage.setItem('crm.auth.refresh_token', res.refreshToken);
      }
      if (res.user) {
        localStorage.setItem('crm.auth.user', JSON.stringify(res.user));
      }

      toast.success('Workspace created successfully! Welcome to Lead Compass CRM.');
      resetWizard();

      // Redirect owner to their tenant dashboard
      const targetSlug = res.tenantSlug || formData.tenant_slug;
      navigate(`/${targetSlug}/dashboard`, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to create workspace';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleFinalSubmit} className="space-y-6 text-center">
      <div className="py-4">
        <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(99,102,241,0.5)] border border-indigo-400/30 mb-4 animate-pulse">
          <Rocket className="h-8 w-8" />
        </div>
        <div className="text-indigo-400 font-bold text-xs tracking-widest uppercase mb-1">
          FINAL STEP 8 OF 8
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">You're ready to launch!</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
          Click <strong className="text-white">Create Workspace</strong> below to initialize your database, seed custom pipeline stages, and launch your CRM workspace.
        </p>
      </div>

      <div className="bg-[#13172E]/60 border border-indigo-500/20 rounded-2xl p-6 text-left space-y-3">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
          <Sparkles className="h-4 w-4" />
          What happens next?
        </div>
        <ul className="text-xs text-slate-300 space-y-2.5">
          <li className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 text-indigo-400 flex-shrink-0" />
            Your isolated tenant database and default sales pipelines will be generated.
          </li>
          <li className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 text-indigo-400 flex-shrink-0" />
            Invitation emails will be dispatched to your invited team members.
          </li>
          <li className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 text-indigo-400 flex-shrink-0" />
            You'll be automatically logged in as Tenant Administrator at <strong className="font-mono text-emerald-400">app.leadcompass.com/{formData.tenant_slug}</strong>.
          </li>
        </ul>
      </div>

      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white flex items-center gap-1.5 disabled:opacity-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="group px-10 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold rounded-xl text-base shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:shadow-[0_0_40px_rgba(99,102,241,0.7)] transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:hover:scale-100"
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Creating Workspace...
            </>
          ) : (
            <>
              <Rocket className="h-5 w-5 group-hover:animate-bounce" />
              Create Workspace
            </>
          )}
        </button>
      </div>
    </form>
  );
};
