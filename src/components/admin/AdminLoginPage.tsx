"use client";

import React, { useState } from "react";
import {
  Globe,
  Smartphone,
  Palette,
  Brain,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Users,
  Layers,
  Award,
  BarChart3,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminLoginPageProps {
  onSuccess?: () => void;
}

export default function AdminLoginPage({ onSuccess }: AdminLoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing Fields",
        description: "Please enter your email and password.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      if (!data?.session) {
        throw new Error("Unable to establish SuperAdmin session");
      }

      toast({
        title: "Welcome Back!",
        description: "Authentication successful. Opening SuperAdmin Dashboard...",
      });

      if (onSuccess) {
        onSuccess();
      } else if (typeof window !== "undefined") {
        window.location.href = "/admin";
      }
    } catch (err: any) {
      const msg = err?.message?.includes("Invalid login credentials")
        ? "Invalid email or password. Please verify your SuperAdmin credentials."
        : err?.message || "An error occurred during authentication.";

      toast({
        title: "Sign in failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const featureCards = [
    {
      title: "Web Development",
      desc: "Modern, scalable web solutions",
      icon: Globe,
    },
    {
      title: "Mobile App Development",
      desc: "Powerful apps for every business",
      icon: Smartphone,
    },
    {
      title: "UI/UX Design",
      desc: "Beautiful & user-friendly design",
      icon: Palette,
    },
    {
      title: "AI & Digital Solutions",
      desc: "Intelligent solutions for real growth",
      icon: Brain,
    },
  ];

  const stats = [
    { icon: Users, value: "100+", label: "Happy Clients" },
    { icon: Layers, value: "250+", label: "Projects Delivered" },
    { icon: Award, value: "5+", label: "Years Experience" },
    { icon: BarChart3, value: "10+", label: "Digital Services" },
  ];

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-3 sm:p-6 md:p-10 overflow-hidden font-sans bg-[#050D1A]">
      {/* Background Ambience Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/admin-login-bg.jpg"
          alt="Office Background"
          className="w-full h-full object-cover object-center opacity-40 brightness-75 scale-105 filter blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#030914]/95 via-[#071329]/90 to-[#020712]/95" />
      </div>

      {/* Main Split Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Brand Showcase & Features */}
        <div className="lg:col-span-7 flex flex-col justify-between py-4 sm:py-8 text-white">
          {/* Header Brand */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <img
                src="/logo.webp"
                alt="Aayup Technologies"
                className="h-12 sm:h-14 w-auto object-contain drop-shadow-[0_4px_16px_rgba(2,132,199,0.4)]"
              />
              <div>
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-1.5">
                  AAYUP <span className="text-[#0284c7]">TECHNOLOGIES</span>
                </span>
                <p className="text-xs sm:text-sm text-sky-200/80 font-medium tracking-wide">
                  Innovating Tomorrow With Intelligent Digital Solutions
                </p>
              </div>
            </div>
          </div>

          {/* Bold Catchy Headline */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.08] text-white">
              Build. Innovate. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] via-[#0284c7] to-[#60a5fa]">
                Grow Together.
              </span>
            </h1>
            <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
              We deliver smart digital solutions to transform businesses with technology,
              creativity and innovation.
            </p>
          </div>

          {/* 4 Feature Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            {featureCards.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={i}
                  className="group relative rounded-2xl p-4 bg-gradient-to-b from-white/10 to-white/[0.03] backdrop-blur-md border border-white/15 hover:border-sky-400/50 transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-black/30"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-sky-500/30 transition-all">
                    <Icon className="w-5 h-5 text-sky-300" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white mb-1 leading-snug">
                    {feat.title}
                  </h3>
                  <p className="text-[11px] text-slate-300/80 leading-normal">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Bottom Trust Metrics Bar */}
          <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((st, i) => {
              const Icon = st.icon;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-sky-950/60 border border-sky-500/30 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-sky-400" />
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-black text-white leading-none">
                      {st.value}
                    </div>
                    <div className="text-[10px] sm:text-xs text-slate-400 font-medium">
                      {st.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Clean White Curved Login Card */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-[460px] bg-white/95 backdrop-blur-xl text-slate-900 rounded-[32px] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6)] p-8 sm:p-10 border border-white/40 relative overflow-hidden">
            {/* Soft decorative ambient glow */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-sky-200/40 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-blue-200/30 rounded-full blur-2xl pointer-events-none -ml-12 -mb-12" />

            {/* Top Brand & Headline */}
            <div className="relative text-center mb-7">
              <div className="inline-flex items-center justify-center gap-2 mb-3 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-100 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-[#0D4F85] uppercase tracking-wider">
                  Admin Portal • Secure Login
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Enter your SuperAdmin credentials to manage operations
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSignIn} className="relative space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 ml-1">Admin Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@aayuptechnologies.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white focus:bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] transition-all font-medium shadow-sm"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 ml-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white focus:bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] transition-all font-medium shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#1769AA] focus:ring-[#1769AA] cursor-pointer"
                  />
                  <span className="text-slate-600 font-semibold">Remember me</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    toast({
                      title: "Password Recovery",
                      description: "Please contact SuperAdmin (aayup.technologies.010@gmail.com) for password reset.",
                    });
                  }}
                  className="text-[#1769AA] hover:text-[#0D4F85] font-bold hover:underline"
                >
                  Forgot Password?
                </a>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#0D4F85] via-[#1769AA] to-[#2D86C9] hover:from-[#0A3D66] hover:to-[#1769AA] text-white font-bold text-sm shadow-lg shadow-[#1769AA]/30 hover:shadow-[#1769AA]/40 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group active:scale-[0.99]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to SuperAdmin</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Protected by Supabase Enterprise 256-bit SSL</span>
            </div>

            {/* Bottom Support Link */}
            <div className="mt-4 text-center text-xs text-slate-500">
              Need access?{" "}
              <a
                href="mailto:aayup.technologies.010@gmail.com"
                className="text-[#1769AA] hover:text-[#0D4F85] font-semibold hover:underline"
              >
                Contact SuperAdmin
              </a>
            </div>

            {/* Client Website link */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <span>AAYUP CRM Portal</span>
              <span className="mx-1">•</span>
              <a
                href="http://localhost:3000"
                target="_blank"
                rel="noreferrer"
                className="text-[#1769AA] hover:underline inline-flex items-center gap-0.5 font-medium"
              >
                Website <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
