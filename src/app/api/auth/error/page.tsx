"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, { title: string; description: string }> = {
    Configuration: {
      title: "Configuration Error",
      description: "There is a problem with the server configuration. Please contact support.",
    },
    AccessDenied: {
      title: "Access Denied",
      description: "You do not have permission to sign in.",
    },
    Verification: {
      title: "Verification Error",
      description: "The verification token has expired or has already been used.",
    },
    OAuthSignin: {
      title: "OAuth Sign-In Error",
      description: "There was an error signing in with your OAuth provider. Please try again.",
    },
    OAuthCallback: {
      title: "OAuth Callback Error",
      description: "There was an error during the OAuth callback. Please try again.",
    },
    OAuthCreateAccount: {
      title: "Account Creation Error",
      description: "Could not create your account. Please try again or contact support.",
    },
    EmailCreateAccount: {
      title: "Email Account Error",
      description: "Could not create your email account. Please try again.",
    },
    Callback: {
      title: "Callback Error",
      description: "There was an error during the authentication callback. Please try again.",
    },
    OAuthAccountNotLinked: {
      title: "Account Not Linked",
      description: "This email is already associated with another account. Please sign in with your original method.",
    },
    EmailSignin: {
      title: "Email Sign-In Error",
      description: "There was an error sending the verification email. Please try again.",
    },
    CredentialsSignin: {
      title: "Sign-In Error",
      description: "The credentials you provided are incorrect. Please try again.",
    },
    SessionRequired: {
      title: "Session Required",
      description: "You must be signed in to access this page.",
    },
    Default: {
      title: "Authentication Error",
      description: "An unexpected error occurred during authentication. Please try again.",
    },
  };

  const errorInfo = errorMessages[error || "Default"] || errorMessages.Default;

  return (
    <div className="min-h-screen bg-[#04060c] relative flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Decorative backdrop */}
      <div className="absolute top-1/4 left-1/4 w-[40%] h-[40%] rounded-full bg-red-500/5 blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[40%] h-[40%] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#0c111d] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Sleek top border */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-red-500 via-orange-500 to-transparent"></div>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="/Connectin.webp"
              alt="ConnectIn"
              className="h-16 w-auto object-contain"
            />
          </div>

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white uppercase mb-2">
            {errorInfo.title}
          </h2>
          <p className="text-slate-400 text-sm font-semibold leading-relaxed">
            {errorInfo.description}
          </p>

          {error && (
            <div className="mt-4 p-3 bg-slate-900/50 border border-white/5 rounded-xl">
              <p className="text-xs font-mono text-slate-500">
                Error Code: <span className="text-red-400">{error}</span>
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Link
            href="/login"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black uppercase text-xs py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </Link>

          <Link
            href="/"
            className="w-full bg-[#05070c] hover:bg-[#080d16] border border-white/5 hover:border-white/10 text-white font-bold text-xs py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Need help?{" "}
            <a
              href="mailto:support@connectin.pk"
              className="text-emerald-400 hover:text-emerald-300 font-bold underline"
            >
              Contact Support
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#04060c] flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}

// Made with Bob
