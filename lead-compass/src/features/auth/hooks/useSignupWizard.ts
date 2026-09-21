import { useState, useEffect } from 'react';
import type { SignupFormData } from '../types/signup.types';

const STORAGE_KEY = 'crm_signup_wizard_state';

const initialFormData: SignupFormData = {
  full_name: '',
  email: '',
  password: '',
  confirm_password: '',
  terms_accepted: false,

  otp: '',
  is_email_verified: false,
  verification_token: '',

  tenant_name: '',
  tenant_slug: '',
  industry: 'Technology',
  company_size: '1-10',
  location: '',
  website: '',

  crm_goals: ['Lead Management', 'Sales Pipeline'],

  departments: ['Sales', 'Marketing', 'Customer Support'],

  team_invites: [],
};

export function useSignupWizard() {
  const [currentStep, setCurrentStep] = useState<number>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.currentStep || 1;
      }
    } catch (e) {
      console.error('Failed to parse wizard step:', e);
    }
    return 1;
  });

  const [formData, setFormData] = useState<SignupFormData>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...initialFormData, ...(parsed.formData || {}) };
      }
    } catch (e) {
      console.error('Failed to parse wizard data:', e);
    }
    return initialFormData;
  });

  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ currentStep, formData })
      );
    } catch (e) {
      console.error('Failed to save wizard state:', e);
    }
  }, [currentStep, formData]);

  const updateFormData = (patch: Partial<SignupFormData>) => {
    setFormData((prev) => {
      const updated = { ...prev, ...patch };

      // Auto-generate slug if tenant_name changed and slug hasn't been manually touched
      if (patch.tenant_name !== undefined && !isSlugManuallyEdited) {
        const generatedSlug = patch.tenant_name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-');
        updated.tenant_slug = generatedSlug;
      }

      return updated;
    });
  };

  const setManualSlug = (slug: string) => {
    setIsSlugManuallyEdited(true);
    const cleaned = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    updateFormData({ tenant_slug: cleaned });
  };

  const nextStep = () => {
    setCurrentStep((step) => Math.min(8, step + 1));
  };

  const prevStep = () => {
    setCurrentStep((step) => Math.max(1, step - 1));
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 8) {
      setCurrentStep(step);
    }
  };

  const resetWizard = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear wizard state:', e);
    }
    setFormData(initialFormData);
    setCurrentStep(1);
    setIsSlugManuallyEdited(false);
  };

  return {
    currentStep,
    formData,
    updateFormData,
    setManualSlug,
    nextStep,
    prevStep,
    goToStep,
    resetWizard,
  };
}

