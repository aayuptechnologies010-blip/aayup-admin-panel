"use client";

import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "@/lib/router-bridge";
import {
  LayoutDashboard,
  Briefcase,
  FileCheck2,
  GraduationCap,
  MessageSquare,
  Mail,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  FolderKanban,
  BookOpen,
  HelpCircle,
  Users,
} from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useToast } from "@/hooks/use-toast";
import AdminLoginPage from "@/components/admin/AdminLoginPage";
import AdminSkeletonLoader from "@/components/admin/AdminSkeletonLoader";

interface AdminLayoutProps {
  children: React.ReactNode;
  activePath?: string;
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
}

export default function AdminLayout({
  children,
  activePath,
  title,
  subtitle,
  isLoading,
}: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading: authLoading, mounted, signOut, checkUser } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const currentPath = activePath || location.pathname;

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been logged out of Admin Portal",
      });
      navigate("/");
    } catch {
      navigate("/");
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Job Openings", href: "/admin/jobs", icon: Briefcase },
    { name: "Applications", href: "/admin/applications", icon: FileCheck2 },
    { name: "Student Enquiries", href: "/admin/enquiry", icon: GraduationCap },
    { name: "Testimonials", href: "/admin/testimonals", icon: MessageSquare },
    { name: "Portfolio Projects", href: "/admin/projects", icon: FolderKanban },
    { name: "Blog & Articles", href: "/admin/blogs", icon: BookOpen },
    { name: "FAQ Knowledgebase", href: "/admin/faqs", icon: HelpCircle },
    { name: "Team & Leadership", href: "/admin/team", icon: Users },
    { name: "Contact Submissions", href: "/admin/contact", icon: Mail },
  ];

  const bottomItems = [
    { name: "Profile", href: "/admin/profile", icon: User },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  // Dedicated Full-Page Login Screen only when user is definitely not logged in after mount
  if (mounted && !authLoading && !user) {
    return (
      <AdminLoginPage
        onSuccess={() => {
          checkUser();
        }}
      />
    );
  }

  // Sidebar and Header STAY FIXED: on initial mount or page load, the layout stays alive and only the main workspace displays the skeleton loader!
  const showContentSkeleton = !mounted || (authLoading && !user) || isLoading;

  return (
    <div className="min-h-screen bg-[#F4F8FA] text-slate-800 flex overflow-hidden font-sans">
      {/* MOBILE BACKDROP */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-[#0D4F85]/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* AAYUP WEBSITE-THEMED CRM SIDEBAR (Always Stable, never unmounts) */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 flex flex-col bg-[#0D4F85] text-white border-r border-[#1769AA]/40 transition-all duration-300 select-none shadow-2xl lg:shadow-none ${
          collapsed ? "w-20" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Sidebar Header / Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 bg-white">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src="/footer.png"
              alt="Aayup Technologies"
              className="h-10 w-auto object-contain shrink-0"
            />
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-7 h-7 rounded-lg bg-black/10 hover:bg-blue-500/10 text-sky-800 hover:text-sky-900 items-center justify-center transition-colors"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sidebar Navigation Links */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto no-scrollbar">
          {!collapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-sky-200/70">
              Main Operations
            </div>
          )}

          {navItems.map((item) => {
            const active = currentPath === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  active
                    ? "bg-gradient-to-r from-[#1769AA] to-[#2D86C9] text-white shadow-lg shadow-[#1769AA]/40 font-bold border border-white/20"
                    : "text-sky-100/80 hover:text-white hover:bg-white/10"
                }`}
                title={collapsed ? item.name : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    active ? "text-white" : "text-sky-300 group-hover:text-white"
                  }`}
                />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}

          {!collapsed && (
            <div className="pt-6 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-sky-200/70">
              Account & Settings
            </div>
          )}

          {bottomItems.map((item) => {
            const active = currentPath === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  active
                    ? "bg-gradient-to-r from-[#1769AA] to-[#2D86C9] text-white shadow-lg shadow-[#1769AA]/40 font-bold border border-white/20"
                    : "text-sky-100/80 hover:text-white hover:bg-white/10"
                }`}
                title={collapsed ? item.name : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    active ? "text-white" : "text-sky-300 group-hover:text-white"
                  }`}
                />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* User Card & Sign Out at Bottom */}
        <div className="p-3 border-t border-white/10 bg-[#0A3D66]">
          <div
            className={`flex items-center gap-3 p-2 rounded-xl bg-white/10 border border-white/15 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div
              suppressHydrationWarning
              className="w-8 h-8 rounded-lg bg-sky-400/25 border border-sky-300/40 text-sky-200 flex items-center justify-center shrink-0 font-bold text-xs"
            >
              {(user?.email?.[0] || "A").toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex-1 truncate" suppressHydrationWarning>
                <p className="text-xs font-bold text-white truncate" suppressHydrationWarning>
                  {user?.user_metadata?.full_name || "Super Admin"}
                </p>
                <p className="text-[10px] text-sky-200/80 truncate" suppressHydrationWarning>
                  {user?.email || "admin@aayuptechnologies.com"}
                </p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="w-7 h-7 rounded-lg text-sky-200 hover:text-rose-300 hover:bg-rose-500/20 flex items-center justify-center transition-colors"
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN ADMIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen bg-[#F4F8FA]">
        {/* Top Sticky CRM Bar */}
        <header className="h-16 shrink-0 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-9 h-9 rounded-xl bg-[#0D4F85] text-white flex items-center justify-center shadow-md"
            >
              <Menu size={18} />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-[#0D4F85] tracking-wide">
                {title || "Dashboard Overview"}
              </h1>
              {subtitle && (
                <p className="text-[11px] text-slate-500 hidden sm:block">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Right Header Quick Links */}
          <div className="flex items-center gap-2.5">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-[#1769AA] hover:text-[#0D4F85] text-xs font-bold border border-slate-200 shadow-sm transition-colors"
            >
              <span>View Website</span>
              <ExternalLink size={12} />
            </a>

            <div className="w-[1px] h-6 bg-slate-200 hidden sm:block" />

            <div className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Live</span>
            </div>
          </div>
        </header>

        {/* Content Area with Inner Skeleton on Loading instead of whole page flash */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {showContentSkeleton ? <AdminSkeletonLoader /> : children}
        </main>
      </div>
    </div>
  );
}
