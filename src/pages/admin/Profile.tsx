"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "@/lib/router-bridge";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Calendar, Shield, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise<{ data: { session: any }; error: any }>((resolve) =>
        setTimeout(() => resolve({ data: { session: null }, error: null }), 1200)
      );
      const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);

      if (session) {
        setCurrentUser(session.user);
      }
    } catch (error) {
      console.error("Error checking user:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout
      activePath="/admin/profile"
      title="Admin Profile"
      subtitle="View your account information, role details & platform permissions"
    >
      <div className="max-w-4xl space-y-6">
        {/* Profile Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#0D4F85] via-[#1769AA] to-[#2D86C9] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-[#1769AA]/25 shrink-0">
              {(currentUser?.email?.[0] || "A").toUpperCase()}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold text-[#0D4F85] mb-1">
                {currentUser?.user_metadata?.full_name || "Super Admin"}
              </h2>
              <p className="text-slate-500 text-xs mb-3 font-medium">{currentUser?.email}</p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="px-3 py-0.5 rounded-full bg-sky-100 text-[#0D4F85] border border-sky-200 text-xs font-semibold">
                  Super Administrator
                </span>
                <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  Full Access
                </span>
              </div>
            </div>
            <Button
              onClick={() => navigate("/admin/settings")}
              className="bg-gradient-to-r from-[#1769AA] to-[#2D86C9] hover:from-[#0D4F85] hover:to-[#1769AA] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h3 className="text-base font-bold text-[#0D4F85] mb-4">Account Details</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <Mail className="w-5 h-5 text-[#1769AA]" />
              <div>
                <p className="text-[11px] text-slate-500 font-medium">Email Address</p>
                <p className="text-sm font-bold text-[#0D4F85]">{currentUser?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <Calendar className="w-5 h-5 text-[#2D86C9]" />
              <div>
                <p className="text-[11px] text-slate-500 font-medium">Registered On</p>
                <p className="text-sm font-bold text-[#0D4F85]">
                  {currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString() : "Active Member"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <Shield className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-[11px] text-slate-500 font-medium">System Role</p>
                <p className="text-sm font-bold text-[#0D4F85]">Super Administrator (Owner)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Profile;
