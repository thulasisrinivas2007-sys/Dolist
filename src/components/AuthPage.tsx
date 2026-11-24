import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Database,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  getFriendlyErrorMessage,
  validateEmail,
  validatePassword,
} from '../lib/validation';
import { BrandMark } from './BrandMark';
import { SetupGuide } from './SetupGuide';

interface AuthPageProps {
  onSuccessToast: (title: string, description?: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccessToast }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const switchMode = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    setFormError(null);
    setInfoMessage(null);
    setFieldErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setInfoMessage(null);

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password, mode);
    const confirmErr =
      mode === 'register' && password !== confirmPassword
        ? 'Passwords do not match.'
        : undefined;

    if (emailErr || passwordErr || confirmErr) {
      setFieldErrors({
        email: emailErr ?? undefined,
        password: passwordErr ?? undefined,
        confirmPassword: confirmErr,
      });
      return;
    }

    setFieldErrors({});

    if (!supabase || !isSupabaseConfigured) {
      setFormError(
        'Supabase environment variables are not configured yet. Open the setup instructions below to connect your project.'
      );
      setShowSetup(true);
      return;
    }

    setSubmitting(true);
    try {
      const cleanEmail = email.trim();

      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (error) throw error;
        onSuccessToast('Signed in', `Welcome back, ${cleanEmail}`);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });
        if (error) throw error;

        if (data.session) {
          onSuccessToast(
            'Account created',
            'Your personal workspace is ready.'
          );
        } else {
          setInfoMessage(
            'Account created. Check your email inbox for a confirmation link before signing in.'
          );
          setPassword('');
          setConfirmPassword('');
          setMode('login');
        }
      }
    } catch (err) {
      setFormError(getFriendlyErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9FD] flex flex-col">
      <header className="w-full border-b border-[#E8E5F0] bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-8 h-16 flex items-center justify-between gap-6">
          <BrandMark />
          <button
            type="button"
            onClick={() => setShowSetup((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-lg border border-[#E8E5F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#181424] hover:bg-[#F5F3FF] hover:border-[#D6CCFA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D28D9] transition-colors whitespace-nowrap shrink-0"
          >
            <Database className="h-3.5 w-3.5 text-[#6D28D9]" aria-hidden="true" />
            <span>{showSetup ? 'Hide SQL & Setup' : 'Database & SQL Setup'}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-8 py-8 sm:py-12">
        {!isSupabaseConfigured && (
          <div
            role="status"
            className="mb-8 rounded-xl border border-amber-200 bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                className="h-5 w-5 text-amber-600 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-semibold text-[#181424]">
                  Supabase configuration required
                </p>
                <p className="mt-0.5 text-sm text-[#5B5670]">
                  Set <code className="font-mono-tabular text-xs bg-[#F5F3FF] px-1.5 py-0.5 rounded text-[#4C1D95]">VITE_SUPABASE_URL</code> and{' '}
                  <code className="font-mono-tabular text-xs bg-[#F5F3FF] px-1.5 py-0.5 rounded text-[#4C1D95]">VITE_SUPABASE_ANON_KEY</code> and run the tasks table SQL to enable authentication and live persistence.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowSetup(true)}
              className="rounded-lg bg-[#6D28D9] px-4 py-2 text-xs font-semibold text-white hover:bg-[#5B21B6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D28D9] transition-colors whitespace-nowrap shrink-0 self-start sm:self-center"
            >
              View Setup Steps
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-6 space-y-6 pt-2">
            <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-[#181424] [text-wrap:balance] leading-[1.15]">
              Organize daily work in a private, focused workspace.
            </h1>
            <p className="text-base text-[#5B5670] leading-relaxed max-w-xl">
              DoList keeps your priorities, due dates, and progress synchronized with your Supabase account. Every task is protected by authenticated Row Level Security so only you can view or update your list.
            </p>

            <div className="border-t border-[#E8E5F0] pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#181424]">
                  <ShieldCheck className="h-4 w-4 text-[#6D28D9]" aria-hidden="true" />
                  <span>Row Level Security</span>
                </div>
                <p className="mt-1.5 text-sm text-[#5B5670] leading-relaxed">
                  Database queries enforce <code className="font-mono-tabular text-xs text-[#4C1D95]">auth.uid() = user_id</code> on every read and write.
                </p>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#181424]">
                  <Lock className="h-4 w-4 text-[#6D28D9]" aria-hidden="true" />
                  <span>Public Anon Client Only</span>
                </div>
                <p className="mt-1.5 text-sm text-[#5B5670] leading-relaxed">
                  Uses Supabase Auth session tokens in the browser with zero exposed service-role credentials.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-xl border border-[#E8E5F0] bg-white p-6 sm:p-8">
              <div
                className="grid grid-cols-2 gap-1 rounded-lg bg-[#F5F3FF] p-1 mb-6"
                role="tablist"
                aria-label="Authentication mode"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'login'}
                  onClick={() => switchMode('login')}
                  className={`rounded-md py-2.5 text-sm font-semibold transition-colors whitespace-nowrap ${
                    mode === 'login'
                      ? 'bg-white text-[#181424] shadow-xs'
                      : 'text-[#5B5670] hover:text-[#181424]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'register'}
                  onClick={() => switchMode('register')}
                  className={`rounded-md py-2.5 text-sm font-semibold transition-colors whitespace-nowrap ${
                    mode === 'register'
                      ? 'bg-white text-[#181424] shadow-xs'
                      : 'text-[#5B5670] hover:text-[#181424]'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-display font-bold text-[#181424]">
                  {mode === 'login' ? 'Sign in to DoList' : 'Create your DoList account'}
                </h2>
                <p className="mt-1 text-sm text-[#5B5670]">
                  {mode === 'login'
                    ? 'Enter your email and password to access your tasks.'
                    : 'Register with your email and a password of at least 6 characters.'}
                </p>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50/70 p-3.5 text-sm text-red-800"
                >
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{formError}</span>
                </div>
              )}

              {infoMessage && (
                <div
                  role="status"
                  className="mb-5 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3.5 text-sm text-emerald-900"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{infoMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div>
                  <label
                    htmlFor="auth-email"
                    className="block text-sm font-medium text-[#181424] mb-1.5"
                  >
                    Email address
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                    placeholder="you@example.com"
                    aria-invalid={Boolean(fieldErrors.email)}
                    className="w-full rounded-lg border border-[#E8E5F0] bg-white px-3.5 py-2.5 text-sm text-[#181424] placeholder:text-[#8E88A3] focus:border-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 disabled:bg-[#FAF9FD] disabled:text-[#78718E]"
                  />
                  {fieldErrors.email && (
                    <p className="mt-1.5 text-xs text-red-600">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="auth-password"
                    className="block text-sm font-medium text-[#181424] mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={
                        mode === 'login' ? 'current-password' : 'new-password'
                      }
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={submitting}
                      placeholder={
                        mode === 'login' ? 'Enter your password' : 'At least 6 characters'
                      }
                      aria-invalid={Boolean(fieldErrors.password)}
                      className="w-full rounded-lg border border-[#E8E5F0] bg-white pl-3.5 pr-11 py-2.5 text-sm text-[#181424] placeholder:text-[#8E88A3] focus:border-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 disabled:bg-[#FAF9FD] disabled:text-[#78718E]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-2 text-[#78718E] hover:text-[#181424] focus-visible:outline-2 focus-visible:outline-[#6D28D9]"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                {mode === 'register' && (
                  <div>
                    <label
                      htmlFor="auth-confirm-password"
                      className="block text-sm font-medium text-[#181424] mb-1.5"
                    >
                      Confirm password
                    </label>
                    <input
                      id="auth-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={submitting}
                      placeholder="Re-enter your password"
                      aria-invalid={Boolean(fieldErrors.confirmPassword)}
                      className="w-full rounded-lg border border-[#E8E5F0] bg-white px-3.5 py-2.5 text-sm text-[#181424] placeholder:text-[#8E88A3] focus:border-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 disabled:bg-[#FAF9FD] disabled:text-[#78718E]"
                    />
                    {fieldErrors.confirmPassword && (
                      <p className="mt-1.5 text-xs text-red-600">
                        {fieldErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-[#6D28D9] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#5B21B6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D28D9] disabled:opacity-60 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  {submitting && (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  )}
                  <span>
                    {submitting
                      ? mode === 'login'
                        ? 'Signing in...'
                        : 'Creating account...'
                      : mode === 'login'
                        ? 'Sign In'
                        : 'Create Account'}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {showSetup && (
          <div className="mt-10">
            <SetupGuide />
          </div>
        )}
      </main>
    </div>
  );
};
