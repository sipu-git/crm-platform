import React, { useState, useEffect } from 'react';
import { Building2, Globe, MapPin, Users, Check, AlertCircle, Loader2, ArrowLeft, Monitor, ChevronRight } from 'lucide-react';
import { SignupFormData } from '@/features/auth/types/signup.types';
import { checkSlugApi } from '@/features/auth/apis/signup.api';

interface Props {
  formData: SignupFormData;
  updateFormData: (patch: Partial<SignupFormData>) => void;
  setManualSlug: (slug: string) => void;
  onSuccess: () => void;
  onBack: () => void;
}

export const Step3Company: React.FC<Props> = ({
  formData,
  updateFormData,
  setManualSlug,
  onSuccess,
  onBack,
}) => {
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugReason, setSlugReason] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!formData.tenant_slug || formData.tenant_slug.length < 2) {
      setSlugAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setSlugChecking(true);
      try {
        const res = await checkSlugApi(formData.tenant_slug);
        setSlugAvailable(res.available);
        setSlugReason(res.reason || '');
      } catch (e: any) {
        setSlugAvailable(false);
        setSlugReason('Failed to check slug availability');
      } finally {
        setSlugChecking(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.tenant_slug]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.tenant_name.trim()) errs.tenant_name = 'Workspace name is required';
    if (!formData.tenant_slug.trim() || formData.tenant_slug.length < 2) errs.tenant_slug = 'Workspace URL slug is required (min 2 chars)';
    if (slugAvailable === false) errs.tenant_slug = slugReason || 'Workspace URL slug is unavailable';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSuccess();
  };

  return (
    <form onSubmit={handleNext} className="space-y-6">
      <div>
        <div className="text-indigo-400 font-bold text-xs tracking-widest uppercase mb-1">
          STEP 3 OF 8
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Tell us about your company</h2>
        <p className="text-sm text-slate-400 mt-1">We'll customize your CRM workspace based on your business structure.</p>
      </div>

      <div className="space-y-4">
        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Company / Workspace Name</label>
          <div className="relative">
            <Building2 className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={formData.tenant_name}
              onChange={(e) => updateFormData({ tenant_name: e.target.value })}
              placeholder="Enter company name (e.g. Acme Corp)"
              className={`pl-11 w-full rounded-xl bg-[#13172E]/80 border ${
                errors.tenant_name ? 'border-red-500/80 ring-1 ring-red-500/30' : 'border-slate-700/80'
              } px-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all`}
            />
          </div>
          {errors.tenant_name && <p className="text-xs text-red-400 mt-1">{errors.tenant_name}</p>}
        </div>

        {/* Workspace URL */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Workspace Domain URL</label>
          <div className="flex rounded-xl border border-slate-700/80 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-500 bg-[#13172E]/80 transition-all">
            <span className="bg-[#0B0E21] text-slate-400 text-xs flex items-center px-3.5 border-r border-slate-700/80 font-mono select-none">
              app.leadcompass.com/
            </span>
            <input
              type="text"
              value={formData.tenant_slug}
              onChange={(e) => setManualSlug(e.target.value)}
              placeholder="acme-corp"
              className="flex-1 px-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none bg-transparent font-mono"
            />
            <div className="flex items-center pr-3.5">
              {slugChecking && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
              {!slugChecking && slugAvailable === true && <Check className="h-4 w-4 text-emerald-400 font-bold" />}
              {!slugChecking && slugAvailable === false && <AlertCircle className="h-4 w-4 text-red-400" />}
            </div>
          </div>
          {slugAvailable === true && (
            <p className="text-xs text-emerald-400 font-medium mt-1.5 flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> URL slug <strong className="font-mono">{formData.tenant_slug}</strong> is available!
            </p>
          )}
          {errors.tenant_slug && (
            <p className="text-xs text-red-400 mt-1">{errors.tenant_slug}</p>
          )}
        </div>

        {/* Workspace Live Preview Mockup Card */}
        {formData.tenant_slug && (
          <div className="bg-[#0B0E21] text-white rounded-xl p-3 text-xs border border-indigo-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-indigo-400" />
              <span className="text-slate-400">Workspace Address:</span>
              <span className="font-mono text-emerald-400 font-semibold">
                https://app.leadcompass.com/<span className="underline">{formData.tenant_slug}</span>
              </span>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border border-emerald-500/30">
              Live Preview
            </span>
          </div>
        )}

        {/* Industry & Company Size */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Industry</label>
            <select
              value={formData.industry}
              onChange={(e) => updateFormData({ industry: e.target.value })}
              className="w-full rounded-xl bg-[#13172E]/80 border border-slate-700/80 px-4 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
            >
              <option value="Technology" className="bg-[#13172E]">Technology & Software</option>
              <option value="Real Estate" className="bg-[#13172E]">Real Estate</option>
              <option value="Financial Services" className="bg-[#13172E]">Financial Services</option>
              <option value="Healthcare" className="bg-[#13172E]">Healthcare & Bio</option>
              <option value="E-Commerce" className="bg-[#13172E]">E-Commerce & Retail</option>
              <option value="Consulting" className="bg-[#13172E]">Consulting & Professional Services</option>
              <option value="Manufacturing" className="bg-[#13172E]">Manufacturing</option>
              <option value="Education" className="bg-[#13172E]">Education</option>
              <option value="Other" className="bg-[#13172E]">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Company Size</label>
            <div className="relative">
              <Users className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
              <select
                value={formData.company_size}
                onChange={(e) => updateFormData({ company_size: e.target.value })}
                className="pl-11 w-full rounded-xl bg-[#13172E]/80 border border-slate-700/80 px-4 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
              >
                <option value="1-10" className="bg-[#13172E]">1-10 employees</option>
                <option value="11-50" className="bg-[#13172E]">11-50 employees</option>
                <option value="51-200" className="bg-[#13172E]">51-200 employees</option>
                <option value="201-500" className="bg-[#13172E]">201-500 employees</option>
                <option value="500+" className="bg-[#13172E]">500+ employees</option>
              </select>
            </div>
          </div>
        </div>

        {/* Website & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Website (Optional)</label>
            <div className="relative">
              <Globe className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={formData.website}
                onChange={(e) => updateFormData({ website: e.target.value })}
                placeholder="https://acme.com"
                className="pl-11 w-full rounded-xl bg-[#13172E]/80 border border-slate-700/80 px-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Location / HQ (Optional)</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => updateFormData({ location: e.target.value })}
                placeholder="San Francisco, CA"
                className="pl-11 w-full rounded-xl bg-[#13172E]/80 border border-slate-700/80 px-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
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
          disabled={slugChecking || slugAvailable === false}
          className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-sm shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] transition-all flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-50"
        >
          Continue
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </form>
  );
};
