"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "@/lib/router-bridge";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Eye,
  Download,
  Filter,
  Users,
  CheckCircle2,
  Clock,
  UserCheck,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Search,
  FileText,
} from "lucide-react";
import {
  AreaChart,
  Area,
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
import { Button } from "@/components/ui/button";
import ApplicationViewModal from "@/components/admin/ApplicationViewModal";
import { generateApplicationPDF } from "@/lib/pdfGenerator";
import AdminLayout from "@/components/admin/AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Applications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlJob = params.get("job");
      if (urlJob) {
        setJobFilter(urlJob);
      }
    }
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise<{ data: { session: any } }>((resolve) =>
        setTimeout(() => resolve({ data: { session: null } }), 1200)
      );
      const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);

      if (session) {
        fetchData();
      }
    } catch {
      // AdminLayout will show login modal if unauthenticated
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    // Fetch applications with job details
    const { data: appsData, error: appsError } = await supabase
      .from("applications")
      .select(`
        *,
        jobs (
          title,
          department,
          location
        )
      `)
      .order("created_at", { ascending: false });

    if (appsError) {
      toast({
        title: "Error",
        description: "Failed to fetch applications",
        variant: "destructive",
      });
      return;
    }

    setApplications(appsData || []);

    // Fetch jobs for filter
    const { data: jobsData } = await supabase
      .from("jobs")
      .select("id, title")
      .order("title");

    setJobs(jobsData || []);
  };

  const handleView = (application: any) => {
    setSelectedApplication(application);
    setViewOpen(true);
  };

  const handleDownloadPDF = async (application: any) => {
    try {
      await generateApplicationPDF(application);
      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const currentApp = applications.find((a) => a.id === id);
    const prevStatus = currentApp?.status;
    const jobId = currentApp?.job_id;

    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
      return;
    }

    // If status changed to or from "hired", sync the job opening seats!
    if (jobId && (newStatus === "hired" || prevStatus === "hired")) {
      try {
        const { data: jobData } = await supabase
          .from("jobs")
          .select("id, total_openings, openings_filled")
          .eq("id", jobId)
          .single();

        if (jobData) {
          const total = jobData.total_openings ?? 1;
          const currentFilled = jobData.openings_filled ?? 0;
          let newFilled = currentFilled;

          if (newStatus === "hired" && prevStatus !== "hired") {
            newFilled = currentFilled + 1;
          } else if (newStatus !== "hired" && prevStatus === "hired") {
            newFilled = Math.max(0, currentFilled - 1);
          }

          // Automatically set is_active = false if all seats filled!
          const shouldDeactivate = newFilled >= total;
          await supabase
            .from("jobs")
            .update({
              openings_filled: newFilled,
              is_active: !shouldDeactivate,
            })
            .eq("id", jobId);

          if (shouldDeactivate && newStatus === "hired") {
            toast({
              title: "All Seats Filled!",
              description: "All openings for this role are now filled. Job is automatically unlisted from website.",
            });
          }
        }
      } catch (seatErr) {
        console.warn("Seat sync warning:", seatErr);
      }
    }

    toast({
      title: "Success",
      description: "Application status updated",
    });
    fetchData();
  };

  const filteredApplications = applications.filter((app) => {
    if (statusFilter !== "all" && app.status !== statusFilter) return false;
    if (jobFilter !== "all" && app.job_id !== jobFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = app.full_name?.toLowerCase().includes(q);
      const matchEmail = app.email?.toLowerCase().includes(q);
      const matchJob = app.jobs?.title?.toLowerCase().includes(q);
      return matchName || matchEmail || matchJob;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage) || 1;
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      case "reviewed":
        return "bg-sky-50 text-sky-700 border-sky-200/80";
      case "shortlisted":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case "hired":
        return "bg-green-100 text-green-900 border-green-300 font-black";
      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-200/80";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  // Compute Application Pipeline Metrics dynamically
  const totalAppsCount = applications.length;
  const pendingCount = applications.filter((a) => !a.status || a.status === "pending").length;
  const shortlistedCount = applications.filter((a) => a.status === "shortlisted").length;
  const hiredCount = applications.filter((a) => a.status === "hired").length;
  const rejectedCount = applications.filter((a) => a.status === "rejected").length;
  const reviewedCount = applications.filter((a) => a.status === "reviewed").length;

  // Status Distribution for Donut Chart
  const statusChartData = React.useMemo(() => {
    return [
      { name: "Pending", value: pendingCount, color: "#F59E0B" },
      { name: "Reviewed", value: reviewedCount, color: "#0EA5E9" },
      { name: "Shortlisted", value: shortlistedCount, color: "#10B981" },
      { name: "Hired", value: hiredCount, color: "#15803D" },
      { name: "Rejected", value: rejectedCount, color: "#F43F5E" },
    ].filter((d) => d.value > 0);
  }, [pendingCount, reviewedCount, shortlistedCount, hiredCount, rejectedCount]);

  // Role Breakdown Bar Chart
  const roleChartData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach((a) => {
      const role = a.jobs?.title || "Direct Pool";
      counts[role] = (counts[role] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({
        name: name.length > 15 ? `${name.slice(0, 13)}..` : name,
        fullName: name,
        candidates: count,
      }))
      .slice(0, 6);
  }, [applications]);

  return (
    <AdminLayout
      activePath="/admin/applications"
      title="Candidate Applications Management"
      subtitle="Recruitment pipeline, candidate status controls & application analytics"
    >
      {loading ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <Skeleton className="h-10 w-full bg-slate-100 rounded-xl" />
          <Skeleton className="h-64 w-full bg-slate-50 rounded-xl" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI STATS CARDS STRIP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Candidates */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Submissions
                </span>
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-[#1769AA] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  {totalAppsCount}
                </span>
                <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                  Total
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                Received across all active roles
              </p>
            </div>

            {/* Card 2: Shortlisted Candidates */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Shortlisted
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                  {shortlistedCount}
                </span>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  Interview Stage
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                Candidates cleared for screening
              </p>
            </div>

            {/* Card 3: Hired (Seat Filled) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Hired Candidates
                </span>
                <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-200 text-green-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-green-800">
                  {hiredCount}
                </span>
                <span className="text-xs text-green-800 font-bold bg-green-100 px-2 py-0.5 rounded-full border border-green-300">
                  {totalAppsCount > 0
                    ? `${Math.round((hiredCount / totalAppsCount) * 100)}%`
                    : "0%"}{" "}
                  Hired
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                Successfully onboarded to teams
              </p>
            </div>

            {/* Card 4: Under Review / Pending */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Pending Review
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
                  Action Required
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                Resumes waiting for status change
              </p>
            </div>
          </div>

          {/* HIGH-VISUAL CHARTS ANALYTICS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Chart 1: Applications by Job Role (Bar Chart) */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#1769AA] flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Applications Distribution by Job Role
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Volume of candidates received per open position
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  {roleChartData.length} Roles Active
                </span>
              </div>

              <div className="h-64 w-full">
                {roleChartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                    No application data recorded yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={roleChartData}
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
                        formatter={(value: any) => [`${value} Candidates`, "Applicants"]}
                      />
                      <Bar
                        dataKey="candidates"
                        radius={[8, 8, 0, 0]}
                        fill="url(#appBarGradient)"
                      />
                      <defs>
                        <linearGradient id="appBarGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#1769AA" />
                          <stop offset="100%" stopColor="#2D86C9" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Chart 2: Candidate Pipeline Funnel (Donut Chart) */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#1769AA] flex items-center justify-center">
                      <PieIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Pipeline Status Ratio</h3>
                      <p className="text-[11px] text-slate-400">Hiring conversion breakdown</p>
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
                      <span className="text-xl font-black text-slate-800">{totalAppsCount}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">
                        Applied
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

          {/* Top Control Bar with Search & Filters */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search candidate by name, email or applied position..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white text-slate-800 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] transition-all font-medium"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1769AA]/30"
              >
                <option value="all">All Statuses ({applications.length})</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="hired">Hired (Accepted)</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={jobFilter}
                onChange={(e) => {
                  setJobFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1769AA]/30"
              >
                <option value="all">All Job Roles</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>

              {(searchQuery || statusFilter !== "all" || jobFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setJobFilter("all");
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Chakra UI-Style High Density Data Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/80 border-b border-slate-200/80">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-[#0D4F85] py-3.5 px-4">
                      Candidate Name
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-[#0D4F85] py-3.5 px-4">
                      Job Opening
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-[#0D4F85] py-3.5 px-4">
                      Contact Details
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-[#0D4F85] py-3.5 px-4">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-[#0D4F85] py-3.5 px-4">
                      Applied Date
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-[#0D4F85] py-3.5 px-4 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-slate-400 text-xs">
                        No candidate applications found for the selected criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedApplications.map((app) => (
                      <TableRow
                        key={app.id}
                        className="border-b border-slate-100 hover:bg-sky-50/40 transition-colors"
                      >
                        {/* Name */}
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#1769AA]/10 text-[#1769AA] font-bold text-xs flex items-center justify-center shrink-0">
                              {(app.full_name?.[0] || "C").toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                                {app.full_name}
                              </div>
                              <div className="text-[11px] text-slate-500 font-medium">
                                {app.current_location || "Not specified"}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Applied Job */}
                        <TableCell className="py-3 px-4">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-sky-50 text-[#0D4F85] text-xs font-bold border border-sky-100">
                            {app.jobs?.title || "Direct Application"}
                          </span>
                        </TableCell>

                        {/* Contact */}
                        <TableCell className="py-3 px-4 text-xs font-medium text-slate-600">
                          <div>{app.email}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">{app.phone}</div>
                        </TableCell>

                        {/* Status Select Badge */}
                        <TableCell className="py-3 px-4">
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border focus:outline-none cursor-pointer uppercase tracking-wider ${getStatusBadge(
                              app.status
                            )}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="hired">Hired (Filled Seat)</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </TableCell>

                        {/* Date */}
                        <TableCell className="py-3 px-4 text-xs text-slate-500 font-medium whitespace-nowrap">
                          {new Date(app.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleView(app)}
                              title="View Application Details"
                              className="w-8 h-8 rounded-lg text-slate-500 hover:text-[#1769AA] hover:bg-sky-50 flex items-center justify-center transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadPDF(app)}
                              title="Download Candidate PDF"
                              className="w-8 h-8 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
              <div>
                Showing{" "}
                <span className="font-bold text-slate-800">
                  {filteredApplications.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-bold text-slate-800">
                  {Math.min(currentPage * itemsPerPage, filteredApplications.length)}
                </span>{" "}
                of <span className="font-bold text-slate-800">{filteredApplications.length}</span>{" "}
                applications
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="h-8 px-2.5 rounded-lg border-slate-200 text-xs font-semibold"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Prev
                </Button>
                <span className="px-3 py-1 font-bold text-slate-800">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="h-8 px-2.5 rounded-lg border-slate-200 text-xs font-semibold"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>

          <ApplicationViewModal
            open={viewOpen}
            onClose={() => {
              setViewOpen(false);
              setSelectedApplication(null);
            }}
            application={selectedApplication}
            onStatusChange={async (id, newStatus) => {
              await handleStatusChange(id, newStatus);
              setSelectedApplication((prev: any) =>
                prev && prev.id === id ? { ...prev, status: newStatus } : prev
              );
            }}
          />
        </div>
      )}
    </AdminLayout>
  );
};

export default Applications;
