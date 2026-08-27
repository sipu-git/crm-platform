import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  sendForgotOtpThunk, verifyForgotOtpThunk, resetPasswordThunk, setRecoveryStep,
  setRecoveryEmail, resetRecoveryState, clearRecoveryError,
} from "@/features/auth/recovery.slice";
import { RequestOtpFormSchema, VerifyOtpFormSchema, ResetPasswordFormSchema, validate } from "@/lib/validations/recovery.validation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import {
  ArrowLeft, Check, CheckCircle2, Eye, EyeOff, KeyRound, Loader2,
  Mail, RefreshCw, ShieldCheck, X as XIcon,
} from "lucide-react";

export function ForgotPasswordPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { step, email, resetToken, status, error } = useAppSelector(
    (state) => state.recovery,
  );

  // Form states
  const [emailInput, setEmailInput] = useState(email || "");
  const [otpInput, setOtpInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Field validation errors
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});

  // Resend OTP countdown timer
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    return () => {
      // Clean up when unmounting if on success or navigating away
      if (step === "SUCCESS") {
        dispatch(resetRecoveryState());
      }
    };
  }, [dispatch, step]);

  // Keep local email input in sync if slice state changes
  useEffect(() => {
    if (email) setEmailInput(email);
  }, [email]);

  // Handle countdown tick
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Real-time password criteria checks
  const passwordRules = [
    { label: "At least 8 characters", met: newPassword.length >= 8 },
    { label: "One uppercase letter (A-Z)", met: /[A-Z]/.test(newPassword) },
    { label: "One lowercase letter (a-z)", met: /[a-z]/.test(newPassword) },
    { label: "One number (0-9)", met: /[0-9]/.test(newPassword) },
    {
      label: "One special character (!@#$%^&*)",
      met: /[!@#$%^&*]/.test(newPassword),
    },
  ];

  const allRulesMet = passwordRules.every((rule) => rule.met);

  // Handlers for Step 1: Send OTP
  async function handleSendOtp(e: FormEvent) {
    e.preventDefault();
    dispatch(clearRecoveryError());

    const result = validate(RequestOtpFormSchema, { email: emailInput.trim() });
    if (!result.success) {
      setFieldErrors(result.errors);
      return;
    }
    setFieldErrors({});

    const res = await dispatch(sendForgotOtpThunk(result.data.email));
    if (sendForgotOtpThunk.fulfilled.match(res)) {
      toast.success("Verification code sent to your email!");
      setCountdown(60);
    } else {
      toast.error((res.payload as string) || "Failed to send verification code");
    }
  }

  // Handler for Resending OTP in Step 2
  async function handleResendOtp() {
    if (countdown > 0 || !email) return;
    dispatch(clearRecoveryError());
    const res = await dispatch(sendForgotOtpThunk(email));
    if (sendForgotOtpThunk.fulfilled.match(res)) {
      toast.success("A new verification code has been sent!");
      setCountdown(60);
      setOtpInput("");
    } else {
      toast.error((res.payload as string) || "Failed to resend code");
    }
  }

  // Handlers for Step 2: Verify OTP
  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    dispatch(clearRecoveryError());

    const result = validate(VerifyOtpFormSchema, {
      email,
      otp: otpInput.trim(),
    });
    if (!result.success) {
      setFieldErrors(result.errors);
      return;
    }
    setFieldErrors({});

    const res = await dispatch(
      verifyForgotOtpThunk({ email, otp: result.data.otp }),
    );
    if (verifyForgotOtpThunk.fulfilled.match(res)) {
      toast.success("Code verified successfully!");
    } else {
      toast.error((res.payload as string) || "Invalid verification code");
    }
  }

  // Handlers for Step 3: Reset Password
  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    dispatch(clearRecoveryError());

    if (!resetToken) {
      toast.error("Session expired. Please restart the recovery process.");
      dispatch(setRecoveryStep("EMAIL"));
      return;
    }

    const result = validate(ResetPasswordFormSchema, {
      newPassword,
      confirmPassword,
    });
    if (!result.success) {
      setFieldErrors(result.errors);
      return;
    }
    setFieldErrors({});

    const res = await dispatch(
      resetPasswordThunk({
        resetToken,
        newPassword: result.data.newPassword,
      }),
    );
    if (resetPasswordThunk.fulfilled.match(res)) {
      toast.success("Password reset successfully!");
    } else {
      toast.error((res.payload as string) || "Failed to reset password");
    }
  }

  function handleBackToLogin() {
    dispatch(resetRecoveryState());
    navigate("/login");
  }

  // Layout headings per step
  const titles: Record<typeof step, { title: string; subtitle: string }> = {
    EMAIL: {
      title: "Forgot password?",
      subtitle: "Enter your registered email address to receive a verification code.",
    },
    OTP: {
      title: "Enter verification code",
      subtitle: `We sent a 6-digit verification code to ${email || "your email"}.`,
    },
    RESET: {
      title: "Set new password",
      subtitle: "Create a secure password with at least 8 characters.",
    },
    SUCCESS: {
      title: "Password updated!",
      subtitle: "Your password has been changed successfully.",
    },
  };

  return (
    <AuthLayout
      title={titles[step].title}
      subtitle={titles[step].subtitle}
    >
      {/* STEP 1: REQUEST OTP */}
      {step === "EMAIL" && (
        <form onSubmit={handleSendOtp} noValidate className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="recovery-email">Email address</Label>
            <div className="relative">
              <Input
                id="recovery-email"
                type="email"
                placeholder="you@company.com"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  dispatch(setRecoveryEmail(e.target.value));
                  if (fieldErrors.email) setFieldErrors({});
                }}
                autoFocus
              />
            </div>
            {fieldErrors.email && (
              <p className="text-sm text-destructive">{fieldErrors.email}</p>
            )}
          </div>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Sending code...
              </span>
            ) : (
              "Send verification code"
            )}
          </Button>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back to sign in
            </Link>
          </div>
        </form>
      )}

      {/* STEP 2: VERIFY OTP */}
      {step === "OTP" && (
        <form onSubmit={handleVerifyOtp} noValidate className="space-y-6">
          {/* Icon + context header */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code sent to{" "}
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-medium text-foreground">
                <Mail className="h-3 w-3" />
                {email || "your email"}
              </span>
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otpInput}
                onChange={(value) => {
                  setOtpInput(value);
                  if (fieldErrors.otp) setFieldErrors({});
                  // Auto-submit once all 6 digits are entered
                  if (value.length === 6 && status !== "loading") {
                    const fakeEvent = { preventDefault: () => { } } as FormEvent;
                    void handleVerifyOtp(fakeEvent);
                  }
                }}
              >
                <InputOTPGroup className="gap-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className={`h-12 w-11 rounded-lg border-2 text-lg font-semibold transition-colors sm:h-14 sm:w-12 ${fieldErrors.otp || error
                        ? "border-destructive/60 bg-destructive/5"
                        : "border-border data-[active=true]:border-primary"
                        }`}
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            {fieldErrors.otp && (
              <p className="text-center text-sm text-destructive">
                {fieldErrors.otp}
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={status === "loading" || otpInput.length !== 6}
          >
            {status === "loading" ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
              </span>
            ) : (
              "Verify code"
            )}
          </Button>

          <div className="flex flex-col items-center gap-3 pt-1 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              {countdown > 0 ? (
                <span>
                  Resend available in{" "}
                  <span className="font-medium text-foreground">{countdown}s</span>
                </span>
              ) : (
                <>
                  <span>Didn&apos;t receive a code?</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={status === "loading"}
                    className="inline-flex items-center gap-1 font-medium text-primary hover:underline disabled:opacity-50"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Resend code
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  dispatch(setRecoveryStep("EMAIL"));
                  dispatch(clearRecoveryError());
                }}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Change email
              </button>
            </div>
          </div>
        </form>
      )}

      {/* STEP 3: RESET PASSWORD */}
      {step === "RESET" && (
        <form onSubmit={handleResetPassword} noValidate className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (fieldErrors.newPassword) setFieldErrors({});
                }}
                className="pr-10"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {fieldErrors.newPassword && (
              <p className="text-sm text-destructive">
                {fieldErrors.newPassword}
              </p>
            )}
          </div>

          {/* Real-time criteria checklist */}
          <div className="rounded-lg border border-border bg-card/60 p-3 space-y-1.5 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">
              Password requirements:
            </p>
            {passwordRules.map((rule, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {rule.met ? (
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-green-500/20 text-green-600">
                    <Check className="h-3 w-3" />
                  </span>
                ) : (
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-muted text-muted-foreground">
                    <XIcon className="h-2.5 w-2.5" />
                  </span>
                )}
                <span className={rule.met ? "text-foreground font-medium" : ""}>
                  {rule.label}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) setFieldErrors({});
                }}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-sm text-destructive">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={status === "loading" || !allRulesMet || !confirmPassword}
          >
            {status === "loading" ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Updating
                password...
              </span>
            ) : (
              "Save & update password"
            )}
          </Button>
        </form>
      )}

      {/* STEP 4: SUCCESS CONFIRMATION */}
      {step === "SUCCESS" && (
        <div className="space-y-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-green-500/10 text-green-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-1.5">
            <h3 className="font-semibold text-foreground">All set!</h3>
            <p className="text-sm text-muted-foreground">
              Your password has been changed securely. You can now use your new
              password to sign in to your workspace.
            </p>
          </div>

          <Button
            onClick={handleBackToLogin}
            className="w-full"
          >
            Proceed to Sign In
          </Button>
        </div>
      )}
    </AuthLayout>
  );
}

export default ForgotPasswordPage;

