import React, { useState } from 'react';
import { UserPlus, Trash2, Mail, Shield, ArrowLeft, CheckCircle, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { SignupFormData, TeamInviteInput } from '@/features/auth/types/signup.types';

interface Props {
  formData: SignupFormData;
  updateFormData: (patch: Partial<SignupFormData>) => void;
  onSuccess: () => void;
  onBack: () => void;
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  ADMIN: 'Full workspace access & settings',
  MANAGER: 'Team pipeline & report management',
  SALES_REP: 'Lead capture & deal assignments',
  USER: 'Standard read/write access',
};

export const Step6Team: React.FC<Props> = ({ formData, updateFormData, onSuccess, onBack }) => {
  const [emailInput, setEmailInput] = useState('');
  const [roleInput, setRoleInput] = useState<TeamInviteInput['role']>('SALES_REP');

  const addInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = emailInput.trim().toLowerCase();
    if (!cleaned || !/\S+@\S+\.\S+/.test(cleaned)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (cleaned === formData.email.toLowerCase()) {
      toast.error('You are already the workspace owner!');
      return;
    }

    const current = formData.team_invites || [];
    if (current.some((inv) => inv.email.toLowerCase() === cleaned)) {
      toast.error('This email is already in your invite list');
      return;
    }

    updateFormData({
      team_invites: [...current, { email: cleaned, role: roleInput }],
    });
    setEmailInput('');
  };

  const removeInvite = (index: number) => {
    const current = formData.team_invites || [];
    const updated = current.filter((_, i) => i !== index);
    updateFormData({ team_invites: updated });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess();
  };

  return (
    <form onSubmit={handleNext} className="space-y-6">
      <div>
        <div className="text-indigo-400 font-bold text-xs tracking-widest uppercase mb-1">
          STEP 6 OF 8
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Invite your team (Optional)</h2>
        <p className="text-sm text-slate-400 mt-1">
          Invited members will receive an email link to set up their password and join your workspace.
        </p>
      </div>

      <div className="bg-[#13172E]/60 border border-indigo-500/20 rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1">Teammate Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter email address (e.g. colleague@company.com)"
                className="pl-9 w-full rounded-xl bg-[#0B0E21] border border-slate-700 px-3.5 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Assign Role</label>
            <div className="relative">
              <Shield className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <select
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value as any)}
                className="pl-9 w-full rounded-xl bg-[#0B0E21] border border-slate-700 px-3.5 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
              >
                <option value="ADMIN" className="bg-[#13172E]">Admin</option>
                <option value="MANAGER" className="bg-[#13172E]">Manager</option>
                <option value="SALES_REP" className="bg-[#13172E]">Sales Rep</option>
                <option value="USER" className="bg-[#13172E]">User</option>
              </select>
            </div>
            <p className="text-[10px] text-indigo-400 mt-1 font-medium">
              💡 {ROLE_DESCRIPTIONS[roleInput]}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={addInvite}
          className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 shadow-md"
        >
          <UserPlus className="h-4 w-4" />
          Add Teammate
        </button>
      </div>

      {formData.team_invites && formData.team_invites.length > 0 ? (
        <div className="border border-slate-700/80 rounded-xl overflow-hidden bg-[#13172E]/60">
          <div className="bg-[#0B0E21] border-b border-slate-700/80 px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Pending Team Invitations ({formData.team_invites.length})</span>
            <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px] lowercase">
              <CheckCircle className="h-3.5 w-3.5" /> Email invites ready
            </span>
          </div>
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-slate-800 bg-transparent">
              {formData.team_invites.map((invite, index) => (
                <tr key={index} className="hover:bg-[#181D3B] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold flex items-center justify-center text-xs uppercase">
                        {invite.email.slice(0, 2)}
                      </div>
                      <span className="font-medium text-white">{invite.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 border border-indigo-500/30 text-indigo-300">
                      {invite.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => removeInvite(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-lg transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-6 border border-dashed border-slate-700/80 rounded-xl bg-[#13172E]/40 text-slate-400 text-xs">
          No team members added yet. You can also invite team members anytime after workspace setup.
        </div>
      )}

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
