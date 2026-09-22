import React from 'react';
import { useSignupWizard } from '../hooks/useSignupWizard';
import { Step1Account } from './steps/Step1Account';
import { Step2EmailOtp } from './steps/Step2EmailOtp';
import { Step3Company } from './steps/Step3Company';
import { Step4CrmSetup } from './steps/Step4CrmSetup';
import { Step5Departments } from './steps/Step5Departments';
import { Step6Team } from './steps/Step6Team';
import { Step7Review } from './steps/Step7Review';
import { Step8CreateWorkspace } from './steps/Step8CreateWorkspace';
import { Compass, Check, Clock, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const STEPS_LIST = [
  { step: 1, title: 'ACCOUNT' },
  { step: 2, title: 'EMAIL' },
  { step: 3, title: 'COMPANY' },
  { step: 4, title: 'GOALS' },
  { step: 5, title: 'DEPARTMENTS' },
  { step: 6, title: 'TEAM' },
  { step: 7, title: 'REVIEW' },
  { step: 8, title: 'CREATE' },
];

export const SignupWizard: React.FC = () => {
  const {
    currentStep,
    formData,
    updateFormData,
    setManualSlug,
    nextStep,
    prevStep,
    goToStep,
    resetWizard,
  } = useSignupWizard();

  return (
    <div className="relative bg-[#070913] overflow-x-hidden flex flex-col justify-between p-4 sm:p-6 text-slate-100">
      {/* Background Ambient Glow Orbs */}
      {/* <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" /> */}

      {/* Top Header */}
      <header className="relative z-10 max-w-4xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center text-white">
            <img src="./favicon.ico" width={50} height={50} alt="ClearView Logo" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold text-white tracking-tight">ClearView CRM</span>
            </div>
            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium mt-0.5">
              <Clock className="h-3 w-3 text-indigo-400" /> ~2 min workspace setup
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-4">
          <span className="hidden md:flex items-center gap-1.5 text-slate-300 text-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Enterprise Isolation
          </span>
          <div>
            Already registered?{' '}
            <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Dark Glass Wizard Card */}
      <main className="relative z-10 max-w-3xl w-full mx-auto my-6 bg-[#0D1021]/90 backdrop-blur-xl rounded-2xl border border-indigo-500/20 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Step Progress Bar Header */}
        <div className="bg-[#0A0C19]/80 border-b border-indigo-500/15 px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between">
            {STEPS_LIST.map((s, idx) => {
              const isCompleted = s.step < currentStep;
              const isCurrent = s.step === currentStep;

              return (
                <React.Fragment key={s.step}>
                  <div
                    onClick={() => {
                      if (s.step < currentStep) goToStep(s.step);
                    }}
                    className={`flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-200 ${
                      s.step < currentStep ? 'hover:opacity-80' : 'cursor-default'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        isCompleted
                          ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                          : isCurrent
                          ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] ring-4 ring-indigo-500/20 scale-105'
                          : 'bg-slate-900/60 border border-slate-700/60 text-slate-400'
                      }`}
                    >
                      {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : s.step}
                    </div>
                    <span
                      className={`text-[10px] font-bold tracking-wider hidden md:block transition-colors duration-200 ${
                        isCurrent ? 'text-white' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>

                  {idx < STEPS_LIST.length - 1 && (
                    <div
                      className={`flex-1 h-[2px] mx-1 sm:mx-2 transition-all duration-500 ${
                        s.step < currentStep ? 'bg-indigo-500/70' : 'bg-slate-800'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step Content Wrapper */}
        <div className="p-6 sm:p-8 transition-all duration-300">
          {currentStep === 1 && (
            <Step1Account
              formData={formData}
              updateFormData={updateFormData}
              onSuccess={nextStep}
            />
          )}

          {currentStep === 2 && (
            <Step2EmailOtp
              formData={formData}
              updateFormData={updateFormData}
              onSuccess={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 3 && (
            <Step3Company
              formData={formData}
              updateFormData={updateFormData}
              setManualSlug={setManualSlug}
              onSuccess={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 4 && (
            <Step4CrmSetup
              formData={formData}
              updateFormData={updateFormData}
              onSuccess={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 5 && (
            <Step5Departments
              formData={formData}
              updateFormData={updateFormData}
              onSuccess={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 6 && (
            <Step6Team
              formData={formData}
              updateFormData={updateFormData}
              onSuccess={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 7 && (
            <Step7Review
              formData={formData}
              goToStep={goToStep}
              onSuccess={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 8 && (
            <Step8CreateWorkspace
              formData={formData}
              resetWizard={resetWizard}
              onBack={prevStep}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-4xl w-full mx-auto text-center text-xs text-slate-500 py-2">
        © {new Date().getFullYear()} Lead Compass CRM. Multi-tenant Enterprise Platform. All rights reserved.
      </footer>
    </div>
  );
};
