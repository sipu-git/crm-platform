import React, { useState, useEffect } from 'react';
import { KeyRound, Loader2, ArrowLeft, RefreshCw, Mail, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { SignupFormData } from '@/features/auth/types/signup.types';
import { sendSignupOtpApi, verifySignupOtpApi } from '@/features/auth/apis/signup.api';

interface Props {
  formData: SignupFormData;
  updateFormData: (patch: Partial<SignupFormData>) => void;
  onSuccess: () => void;
  onBack: () => void;
}

export const Step2EmailOtp: React.FC<Props> = ({ formData, updateFormData, onSuccess, onBack }) => {
  const [otp, setOtp] = useState(formData.otp || '');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    try {
      await sendSignupOtpApi(formData.email);
      toast.success('A new verification code has been sent to your inbox!');
      setCountdown(60);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      const res = await verifySignupOtpApi(formData.email, otp);
      updateFormData({
        otp,
        is_email_verified: true,
        verification_token: res.verificationToken,
      });
      toast.success('Email verified successfully!');
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleVerify} className="space-y-6">
      <div>
        <div className="text-indigo-400 font-bold text-xs tracking-widest uppercase mb-1">
          STEP 2 OF 8
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Verify your email address</h2>
        <p className="text-sm text-slate-400 mt-1">
          We sent a 6-digit verification code to <span className="font-semibold text-slate-200">{formData.email}</span>.
        </p>
      </div>

      <div className="bg-[#13172E]/60 border border-indigo-500/20 rounded-2xl p-6 text-center space-y-5">
        <div className="mx-auto w-14 h-14 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] border border-indigo-400/30">
          <KeyRound className="h-7 w-7" />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-3">
            Enter 6-Digit Code
          </label>
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            className="w-56 text-center text-3xl font-mono tracking-[0.3em] px-4 py-3.5 border-2 border-indigo-500/30 rounded-xl bg-[#13172E] text-white placeholder:text-slate-600 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none font-extrabold shadow-none transition-all"
          />
        </div>

        <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5 pt-1">
          <Mail className="h-3.5 w-3.5 text-slate-500" />
          Didn't receive the email?{' '}
          {countdown > 0 ? (
            <span className="text-indigo-400 font-semibold">Resend code in {countdown}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-indigo-400 font-bold hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${resending ? 'animate-spin' : ''}`} />
              Resend Code Now
            </button>
          )}
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
          disabled={loading || otp.length !== 6}
          className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-sm shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] transition-all flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying...
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
