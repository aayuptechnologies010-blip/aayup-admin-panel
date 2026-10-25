"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "@/lib/router-bridge";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import ContactAdmin from "@/components/admin/ContactAdmin";
import AdminLayout from "@/components/admin/AdminLayout";
import { Mail, MessageSquare, Clock, CheckCircle2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";

const Contact = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);

  useEffect(() => {
    checkUser();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [cRes, eRes] = await Promise.all([
        supabase.from("contact").select("*"),
        supabase.from("enquiry").select("*"),
      ]);
      if (cRes.data) setContacts(cRes.data);
      if (eRes.data) setEnquiries(eRes.data);
    } catch {
      // Handled in subcomponent
    }
  };

  const checkUser = async () => {
    try {
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise<{ data: { session: any } }>((resolve) =>
        setTimeout(() => resolve({ data: { session: null } }), 1200)
      );
      await Promise.race([sessionPromise, timeoutPromise]);
    } catch {
      // AdminLayout handles auth state
    } finally {
      setLoading(false);
    }
  };

  // Stats Calculations
  const totalSubmissions = contacts.length + enquiries.length;
  const newUnread =
    contacts.filter((c) => c.status === "new" || !c.status).length +
    enquiries.filter((e) => e.status === "new" || !e.status).length;
  const inProgress =
    contacts.filter((c) => c.status === "in_progress" || c.status === "reviewing").length +
    enquiries.filter((e) => e.status === "in_progress" || e.status === "reviewing").length;
  const resolvedLeads =
    contacts.filter((c) => ["resolved", "closed", "quoted", "accepted"].includes(c.status)).length +
    enquiries.filter((e) => ["resolved", "closed", "quoted", "accepted"].includes(e.status)).length;
  const resolutionRate = totalSubmissions > 0 ? Math.round((resolvedLeads / totalSubmissions) * 100) : 0;

  // Chart 1: Service / Category Inflow
  const serviceMap: Record<string, number> = {};
  enquiries.forEach((e) => {
    const sName = e.service_type || "General Inquiry";
    serviceMap[sName] = (serviceMap[sName] || 0) + 1;
  });
  if (contacts.length > 0) {
    serviceMap["General Contact"] = contacts.length;
  }
  const serviceChartData = Object.entries(serviceMap)
    .map(([name, count]) => ({
      name: name.length > 18 ? name.slice(0, 18) + "…" : name,
      fullName: name,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Chart 2: Status Breakdown
  const statusCounts = {
    New: newUnread,
    "In Progress": inProgress,
    Resolved: resolvedLeads,
  };
  const statusChartData = [
    { name: "New", value: statusCounts.New || 0, color: "#1769AA" },
    { name: "In Progress", value: statusCounts["In Progress"] || 0, color: "#F59E0B" },
    { name: "Resolved", value: statusCounts.Resolved || 0, color: "#10B981" },
  ].filter((item) => item.value > 0);

  return (
    <AdminLayout
      activePath="/admin/contact"
      title="Contact Form Submissions"
      subtitle="View and manage customer enquiries sent via the website contact form"
    >
      <div className="space-y-6">
        {/* TOP KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Leads */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-[#1769AA]/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Inbound Leads
                </p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {totalSubmissions}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1769AA] flex items-center justify-center font-bold">
                <Mail className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{contacts.length}</span> Direct •{" "}
              <span className="font-semibold text-slate-700">{enquiries.length}</span> Project Queries
            </div>
          </div>

          {/* Card 2: New / Unaddressed */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-amber-400/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  New Unread
                </p>
                <h3 className="text-2xl font-black text-amber-600 mt-1">
                  {newUnread}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="font-medium">Awaiting primary response</span>
            </div>
          </div>

          {/* Card 3: In Progress / Counseling */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-sky-400/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Active In-Progress
                </p>
                <h3 className="text-2xl font-black text-[#1769AA] mt-1">
                  {inProgress}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#1769AA] flex items-center justify-center font-bold">
                <MessageSquare className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-sky-700">
              <span className="font-medium">Follow-up / quotation ongoing</span>
            </div>
          </div>

          {/* Card 4: Resolution & Close Rate */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-emerald-400/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Resolution Rate
                </p>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">
                  {resolutionRate}%
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-700">
              <span className="font-semibold text-emerald-800">{resolvedLeads}</span> leads completed
            </div>
          </div>
        </div>

        {/* HIGH-CHART ANALYTICS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Category / Service Inflow */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Lead Inflow by Service / Type</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Volume of enquiries and questions grouped by service domain
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#1769AA] text-[11px] font-bold">
                Live Distribution
              </span>
            </div>

            <div className="h-64 w-full">
              {serviceChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serviceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#64748B", fontSize: 11 }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis allowDecimals={false} tick={{ fill: "#64748B", fontSize: 11 }} />
                    <Tooltip
                      formatter={(val: any) => [`${val} Inquiries`, "Count"]}
                      labelFormatter={(_label, payload) =>
                        payload?.[0]?.payload?.fullName || _label
                      }
                      contentStyle={{
                        backgroundColor: "#0D4F85",
                        borderRadius: "12px",
                        color: "#fff",
                        border: "none",
                        fontSize: "12px",
                        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
                      }}
                    />
                    <Bar dataKey="count" fill="url(#blueLeadGrad)" radius={[6, 6, 0, 0]} />
                    <defs>
                      <linearGradient id="blueLeadGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1769AA" />
                        <stop offset="100%" stopColor="#2D86C9" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  No submissions recorded yet
                </div>
              )}
            </div>
          </div>

          {/* Chart 2: Pipeline Resolution Donut */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-slate-900">Lead Resolution</h3>
                <span className="text-xs font-bold text-slate-500">{totalSubmissions} Total</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">Pipeline status across all submissions</p>
            </div>

            <div className="h-48 w-full flex items-center justify-center relative">
              {statusChartData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                      >
                        {statusChartData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0D4F85",
                          borderRadius: "12px",
                          color: "#fff",
                          border: "none",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-black text-slate-800">{newUnread}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      New
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-xs text-slate-400">No data available</div>
              )}
            </div>

            <div className="space-y-1.5 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1769AA]" />
                  New Leads
                </span>
                <span className="font-bold text-slate-900">{newUnread}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  In Progress
                </span>
                <span className="font-bold text-slate-900">{inProgress}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  Resolved / Closed
                </span>
                <span className="font-bold text-slate-900">{resolvedLeads}</span>
              </div>
            </div>
          </div>
        </div>

        {/* DATA TABLE WORKSPACE */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
          <ContactAdmin />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Contact;
