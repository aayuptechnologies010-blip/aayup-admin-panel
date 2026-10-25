"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "@/lib/router-bridge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import StudentEnquiryAdmin from "@/components/admin/StudentEnquiryAdmin";
import AdminLayout from "@/components/admin/AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GraduationCap,
  Users,
  CheckCircle2,
  Clock,
  PhoneCall,
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Enquiry = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise<{ data: { session: any } }>((resolve) =>
        setTimeout(() => resolve({ data: { session: null } }), 1200)
      );
      await Promise.race([sessionPromise, timeoutPromise]);
      fetchEnquiries();
    } catch {
      // AdminLayout handles auth state
    } finally {
      setLoading(false);
    }
  };

  const fetchEnquiries = async () => {
    try {
      const { data, error } = await supabase
        .from("student_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setApplications(data);
      }
    } catch (e) {
      console.warn("Error fetching student enquiries:", e);
    }
  };

  // Compute Metrics
  const totalEnquiries = applications.length;
  const pendingCount = applications.filter((a) => !a.status || a.status === "pending").length;
  const calledCount = applications.filter((a) => a.status === "called" || a.status === "reviewing").length;
  const acceptedCount = applications.filter((a) => a.status === "accepted" || a.status === "shortlisted").length;

  // Program / Domain Breakdown for Bar Chart
  const programChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach((a) => {
      const prog = a.program_type || a.degree || "General";
      const cleanProg = prog.charAt(0).toUpperCase() + prog.slice(1);
      counts[cleanProg] = (counts[cleanProg] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({
        name: name.length > 14 ? `${name.slice(0, 12)}..` : name,
        fullName: name,
        students: count,
      }))
      .slice(0, 6);
  }, [applications]);

  // Status Distribution for Donut Chart
  const statusChartData = useMemo(() => {
    return [
      { name: "Pending", value: pendingCount, color: "#F59E0B" },
      { name: "In Touch / Called", value: calledCount, color: "#8B5CF6" },
      { name: "Enrolled / Accepted", value: acceptedCount, color: "#10B981" },
      { name: "Other / Closed", value: Math.max(0, totalEnquiries - (pendingCount + calledCount + acceptedCount)), color: "#64748B" },
    ].filter((d) => d.value > 0);
  }, [totalEnquiries, pendingCount, calledCount, acceptedCount]);

  return (
    <AdminLayout
      activePath="/admin/enquiry"
      title="Student Training & Internship Enquiries"
      subtitle="Candidate pipeline, college engagement metrics & follow-up analytics"
    >
      {loading ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <Skeleton className="h-10 w-full bg-slate-100 rounded-xl" />
          <Skeleton className="h-64 w-full bg-slate-50 rounded-xl" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* 4 EXECUTIVE KPI STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Enquiries */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Enquiries
                </span>
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-[#1769AA] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  {totalEnquiries}
                </span>
                <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                  Total Leads
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                Internship & college student submissions
              </p>
            </div>

            {/* Card 2: Contacted / Called */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Contacted / Called
                </span>
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PhoneCall className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-purple-700">
                  {calledCount}
                </span>
                <span className="text-xs text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                  {totalEnquiries > 0 ? `${Math.round((calledCount / totalEnquiries) * 100)}%` : "0%"} Contacted
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                Counselor phone follow-ups done
              </p>
            </div>

            {/* Card 3: Accepted / Enrolled */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Enrolled / Accepted
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                  {acceptedCount}
                </span>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  Confirmed
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                Confirmed batches & onboarded interns
              </p>
            </div>

            {/* Card 4: Action Required */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Pending Call
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-amber-600">
                  {pendingCount}
                </span>
                <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                  Pending
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                Awaiting first callback from team
              </p>
            </div>
          </div>

          {/* HIGH-VISUAL CHARTS ANALYTICS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Chart 1: Enquiries by Program / Domain (Bar Chart) */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#1769AA] flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Enquiries by Program & Specialization
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Student interest breakdown across training domains
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  {programChartData.length} Domains
                </span>
              </div>

              <div className="h-64 w-full">
                {programChartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                    No student applications recorded yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={programChartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#64748B", fontSize: 11, fontWeight: 500 }}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                      />
                      <YAxis
                        tick={{ fill: "#64748B", fontSize: 11 }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0D4F85",
                          borderRadius: "12px",
                          border: "none",
                          color: "#fff",
                          fontSize: "12px",
                          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
                        }}
                        labelFormatter={(value, payload) => {
                          const item = payload?.[0]?.payload;
                          return item?.fullName || value;
                        }}
                        formatter={(value: any) => [`${value} Students`, "Enquiries"]}
                      />
                      <Bar
                        dataKey="students"
                        radius={[8, 8, 0, 0]}
                        fill="url(#enquiryBarGradient)"
                      />
                      <defs>
                        <linearGradient id="enquiryBarGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#1769AA" />
                          <stop offset="100%" stopColor="#2D86C9" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Chart 2: Follow-up & Conversion Status (Donut Chart) */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#1769AA] flex items-center justify-center">
                      <PieIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Counseling Status</h3>
                      <p className="text-[11px] text-slate-400">Call follow-up resolution</p>
                    </div>
                  </div>
                </div>

                <div className="h-52 w-full relative flex items-center justify-center">
                  {statusChartData.length === 0 ? (
                    <div className="text-slate-400 text-xs">No status data available</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusChartData}
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {statusChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0D4F85",
                            borderRadius: "12px",
                            border: "none",
                            color: "#fff",
                            fontSize: "12px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                  {statusChartData.length > 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-black text-slate-800">{totalEnquiries}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">
                        Students
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Legend Badges */}
              <div className="flex items-center justify-center gap-3 pt-3 border-t border-slate-100 text-[11px] flex-wrap">
                {statusChartData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 font-medium">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-600">{item.name}:</span>
                    <span className="font-bold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
            <StudentEnquiryAdmin />
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Enquiry;
