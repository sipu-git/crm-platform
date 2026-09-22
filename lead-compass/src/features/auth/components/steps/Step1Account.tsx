import React, { useState } from 'react';
import { sendSignupOtpApi } from '@/features/auth/apis/signup.api';
import type { SignupFormData } from '@/features/auth/types/signup.types';
import { User, Mail, Lock, Loader2, Eye, EyeOff, ShieldCheck, Zap, Users, ChevronRight, AlertTriangle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface Props {
  formData: SignupFormData;
  updateFormData: (patch: Partial<SignupFormData>) => void;
  onSuccess: () => void;
}

export const Step1Account: React.FC<Props> = ({ formData, updateFormData, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [accountExistsError, setAccountExistsError] = useState<string | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.full_name.trim()) errs.full_name = 'Full name is required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Valid email is required';
    if (!formData.password || formData.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirm_password) errs.confirm_password = 'Passwords do not match';
    if (!formData.terms_accepted) errs.terms = 'You must accept the Terms and Conditions';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setAccountExistsError(null);
    try {
      await sendSignupOtpApi(formData.email);
      toast.success('Verification code sent to your email!');
      onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to send OTP';
      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exist') || err.response?.status === 409) {
        setAccountExistsError(msg);
        toast.error('An account with this email already exists. Please sign in.');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleNext} className="space-y-6">
      {/* Step Header */}
      <div>
        <div className="text-indigo-400 font-bold text-xs tracking-widest uppercase mb-1">
          STEP 1 OF 8
        </div>
        <h2 className="text-3xl font-semibold text-slate-400 tracking-tight">Create your admin account</h2>
        <p className="text-sm text-slate-50 mt-1">Start your 14-day free trial. No credit card required.</p>
      </div>

      {/* Already Have Account Wrapped Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-[#13172E] to-purple-950/40 border border-indigo-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-md">
        <div className="flex items-center gap-2.5 text-slate-300">
          <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400 flex-shrink-0">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-white block">Already registered your workspace?</span>
            <span className="text-slate-400 text-[11px]">Sign in directly to access your tenant dashboard.</span>
          </div>
        </div>
        <Link
          to="/login"
          className="px-4 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/40 text-indigo-300 hover:text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 flex-shrink-0"
        >
          Sign In Here <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Account Exists Validation Alert Banner */}
      {accountExistsError && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-200 space-y-3 shadow-lg">
          <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
            <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />
            Account Already Exists
          </div>
          <p className="text-slate-300 leading-relaxed">
            An account with the email <strong className="text-white font-mono">{formData.email}</strong> is already registered. If this is your account, please sign in.
          </p>
          <div className="pt-1">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-all"
            >
              Sign In to Your Workspace →
            </Link>
          </div>
        </div>
      )}
    
      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => updateFormData({ full_name: e.target.value })}
              placeholder="Enter your full name (e.g. John Doe)"
              className={`pl-11 w-full rounded-xl bg-[#13172E]/80 border ${
                errors.full_name ? 'border-red-500/80 ring-1 ring-red-500/30' : 'border-slate-700/80'
              } px-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all`}
            />
          </div>
          {errors.full_name && <p className="text-xs text-red-400 mt-1">{errors.full_name}</p>}
        </div>

        {/* Work Email */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Work Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
              placeholder="Enter your work email (e.g. john@company.com)"
              className={`pl-11 w-full rounded-xl bg-[#13172E]/80 border ${
                errors.email ? 'border-red-500/80 ring-1 ring-red-500/30' : 'border-slate-700/80'
              } px-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all`}
            />
          </div>
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
        </div>

        {/* Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => updateFormData({ password: e.target.value })}
                placeholder="Create a strong password"
                className={`pl-11 pr-11 w-full rounded-xl bg-[#13172E]/80 border ${
                  errors.password ? 'border-red-500/80 ring-1 ring-red-500/30' : 'border-slate-700/80'
                } px-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirm_password}
                onChange={(e) => updateFormData({ confirm_password: e.target.value })}
                placeholder="Confirm your password"
                className={`pl-11 pr-11 w-full rounded-xl bg-[#13172E]/80 border ${
                  errors.confirm_password ? 'border-red-500/80 ring-1 ring-red-500/30' : 'border-slate-700/80'
                } px-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirm_password && <p className="text-xs text-red-400 mt-1">{errors.confirm_password}</p>}
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Use at least 8 characters with a mix of letters, numbers and symbols.
        </p>

        {/* Checkbox Terms */}
        <div className="flex items-start gap-3 pt-2">
          <input
            type="checkbox"
            id="terms"
            checked={formData.terms_accepted}
            onChange={(e) => updateFormData({ terms_accepted: e.target.checked })}
            className="mt-0.5 h-5 w-5 rounded border-slate-700 bg-[#13172E] text-indigo-600 focus:ring-indigo-500/30 cursor-pointer"
          />
          <label htmlFor="terms" className="text-xs text-slate-300 leading-relaxed cursor-pointer select-none">
            I agree to the <span className="text-indigo-400 hover:text-indigo-300 font-semibold underline">Terms of Service</span> and{' '}
            <span className="text-indigo-400 hover:text-indigo-300 font-semibold underline">Privacy Policy</span>. Setting up workspace administrator privileges.
          </label>
        </div>
        {errors.terms && <p className="text-xs text-red-400">{errors.terms}</p>}
      </div>

      {/* Action Footer */}
      <div className="pt-4 flex items-center justify-between">
        <Link
          to="/login"
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          Already have an account? <span className="text-indigo-400 hover:underline">Sign In</span>
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-sm shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] transition-all flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending Code...
            </>
          ) : (
            <>
              Continue
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
