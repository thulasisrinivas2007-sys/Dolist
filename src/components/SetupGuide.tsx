import React, { useState } from 'react';
import { Check, Copy, Database, KeyRound, ShieldCheck } from 'lucide-react';
import { SUPABASE_SCHEMA_SQL, isSupabaseConfigured } from '../lib/supabase';

interface SetupGuideProps {
  compact?: boolean;
}

export const SetupGuide: React.FC<SetupGuideProps> = ({ compact = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={compact ? 'space-y-6' : 'space-y-6 max-w-4xl'}>
      <div className="rounded-xl border border-[#E8E5F0] bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-[#EFEFF5]">
          <div>
            <h2 className="text-lg font-display font-bold text-[#181424]">
              Supabase Database &amp; Environment Setup
            </h2>
            <p className="mt-1 text-sm text-[#5B5670]">
              Connect DoList to your Supabase project with Email Auth and Row Level Security.
            </p>
          </div>
          <div className="text-xs font-medium text-[#5B5670] whitespace-nowrap shrink-0">
            {isSupabaseConfigured ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Client keys detected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-700">
                <KeyRound className="h-4 w-4" aria-hidden="true" />
                Environment keys needed
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-5 border-b border-[#EFEFF5]">
          <div>
            <p className="text-xs font-semibold text-[#6D28D9]">01. Environment Variables</p>
            <p className="mt-1.5 text-sm text-[#5B5670] leading-relaxed">
              Add <code className="font-mono-tabular text-xs bg-[#F5F3FF] px-1.5 py-0.5 rounded text-[#4C1D95]">VITE_SUPABASE_URL</code> and{' '}
              <code className="font-mono-tabular text-xs bg-[#F5F3FF] px-1.5 py-0.5 rounded text-[#4C1D95]">VITE_SUPABASE_ANON_KEY</code> from Supabase Project Settings &rarr; API.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6D28D9]">02. Run Table &amp; RLS SQL</p>
            <p className="mt-1.5 text-sm text-[#5B5670] leading-relaxed">
              Paste the SQL below into Supabase SQL Editor to create <code className="font-mono-tabular text-xs bg-[#F5F3FF] px-1.5 py-0.5 rounded text-[#4C1D95]">public.tasks</code> and enable per-user Row Level Security.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6D28D9]">03. Email Auth &amp; Safety</p>
            <p className="mt-1.5 text-sm text-[#5B5670] leading-relaxed">
              Enable Email/Password under Authentication &rarr; Providers. Never place your <code className="font-mono-tabular text-xs bg-[#F5F3FF] px-1.5 py-0.5 rounded text-[#4C1D95]">service_role</code> key in frontend variables.
            </p>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#181424]">
              <Database className="h-4 w-4 text-[#6D28D9]" aria-hidden="true" />
              <span>supabase/schema.sql</span>
            </div>
            <button
              type="button"
              onClick={handleCopySql}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8E5F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#181424] hover:bg-[#F5F3FF] hover:border-[#D6CCFA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D28D9] transition-colors whitespace-nowrap shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                  <span>Copied SQL</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-[#6D28D9]" aria-hidden="true" />
                  <span>Copy SQL</span>
                </>
              )}
            </button>
          </div>

          <pre className="overflow-x-auto rounded-lg border border-[#E8E5F0] bg-[#FAF9FD] p-4 text-xs font-mono-tabular text-[#2E2744] leading-relaxed">
            <code>{SUPABASE_SCHEMA_SQL}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
