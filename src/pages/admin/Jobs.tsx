"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "@/lib/router-bridge";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Users,
  Briefcase,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Layers,
  Sparkles,
  BarChart3,
  PieChart as PieIcon,
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
  Legend,
} from "recharts";
import JobFormModal from "@/components/admin/JobFormModal";
import JobViewModal from "@/components/admin/JobViewModal";
import AdminLayout from "@/components/admin/AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";

const Jobs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise<{ data: { session: any } }>((resolve) =>
        setTimeout(() => resolve({ data: { session: null } }), 1200)
      );
      const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);
      
      if (!session) {
        setLoading(false);
        return;
      }

      setLoading(false);
      fetchJobs();
    } catch {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch jobs",
        variant: "destructive",
      });
      return;
    }

    setJobs(data || []);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    const { error } = await supabase.from("jobs").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Job deleted successfully",
    });
    fetchJobs();
  };

  const handleEdit = (job: any) => {
    setSelectedJob(job);
    setFormOpen(true);
  };

  const handleView = (job: any) => {
    setSelectedJob(job);
    setViewOpen(true);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredJobs = jobs.filter((job) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      job.title?.toLowerCase().includes(q) ||
      job.department?.toLowerCase().includes(q) ||
      job.location?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage) || 1;
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Compute Metrics & KPI stats dynamically from jobs
  const totalOpeningsCount = jobs.reduce((acc, j) => acc + (j.total_openings ?? 1), 0);
  const totalHiredCount = jobs.reduce((acc, j) => acc + (j.openings_filled ?? 0), 0);
  const activeRolesCount = jobs.filter((j) => j.is_active !== false).length;
  const remainingSeatsCount = Math.max(0, totalOpeningsCount - totalHiredCount);

  // Department Distribution for Bar Chart
  const departmentChartData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach((j) => {
      const dept = j.department || "General";
      counts[dept] = (counts[dept] || 0) + (j.total_openings ?? 1);
    });
    return Object.entries(counts).map(([name, openings]) => ({
      name: name.length > 14 ? `${name.slice(0, 12)}..` : name,
      fullName: name,
      openings,
    }));
  }, [jobs]);

  // Work Mode Distribution for Donut Chart
  const workModeChartData = React.useMemo(() => {
    const counts: Record<string, number> = { Remote: 0, Hybrid: 0, "On-site": 0 };
    jobs.forEach((j) => {
      const mode = j.work_mode || "Hybrid";
      if (counts[mode] !== undefined) counts[mode] += 1;
      else counts[mode] = (counts[mode] || 0) + 1;
    });
    return [
      { name: "Remote", value: counts["Remote"] || 0, color: "#1769AA" },
      { name: "Hybrid", value: counts["Hybrid"] || 0, color: "#2D86C9" },
      { name: "On-site", value: counts["On-site"] || 0, color: "#0D4F85" },
    ].filter((d) => d.value > 0);
  }, [jobs]);

  const COLORS = ["#1769AA", "#2D86C9", "#0D4F85", "#06B6D4", "#8B5CF6", "#10B981"];

  return (
    <AdminLayout
      activePath="/admin/jobs"
      title="Job Openings & Talent Acquisition"
      subtitle="Executive role management, candidate capacity metrics & real-time analytics"
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
            {/* Card 1: Total Job Roles */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Job Roles
                </span>
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-[#1769AA] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Briefcase className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  {jobs.length}
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                {activeRolesCount} roles actively hiring on website
              </p>
            </div>

            {/* Card 2: Total Open Seats */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Open Capacity
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                  {remainingSeatsCount}
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  / {totalOpeningsCount} seats
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                Remaining seats before auto-closing
              </p>
            </div>

            {/* Card 3: Candidates Hired */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Seats Filled
                </span>
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-purple-700">
                  {totalHiredCount}
                </span>
                <span className="text-xs text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                  {totalOpeningsCount > 0
                    ? `${Math.round((totalHiredCount / totalOpeningsCount) * 100)}%`
                    : "0%"}{" "}
                  Filled
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                Hired through candidate applications
              </p>
            </div>

            {/* Card 4: Quick Action Post */}
            <div className="bg-gradient-to-br from-[#0D4F85] to-[#1769AA] rounded-2xl p-5 text-white shadow-md shadow-[#0D4F85]/20 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-200 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Fast Action
                </span>
                <h4 className="text-sm font-bold mt-1 text-white">Create New Opening</h4>
                <p className="text-[11px] text-slate-200 mt-0.5 leading-relaxed">
                  Post with dynamic qualifications, perks, and seat allocation.
                </p>
              </div>
              <Button
                onClick={() => {
                  setSelectedJob(null);
                  setFormOpen(true);
                }}
                className="mt-3 w-full bg-white hover:bg-slate-100 text-[#0D4F85] font-black text-xs h-9 rounded-xl shadow-xs"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Opening
              </Button>
            </div>
          </div>

          {/* HIGH-VISUAL CHARTS ANALYTICS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Chart 1: Openings by Department (Bar Chart) */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#1769AA] flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Openings by Department Taxonomy
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Total allocated hiring seats across technology branches
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  {departmentChartData.length} Departments
                </span>
              </div>

              <div className="h-64 w-full">
                {departmentChartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                    No department data available yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={departmentChartData}
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
                        formatter={(value: any) => [`${value} Open Seats`, "Openings"]}
                      />
                      <Bar
                        dataKey="openings"
                        radius={[8, 8, 0, 0]}
                        fill="url(#deptBarGradient)"
                      />
                      <defs>
                        <linearGradient id="deptBarGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#1769AA" />
                          <stop offset="100%" stopColor="#2D86C9" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Chart 2: Work Mode Ratio (Donut Chart) */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#1769AA] flex items-center justify-center">
                      <PieIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Work Mode Ratio</h3>
                      <p className="text-[11px] text-slate-400">Remote vs Hybrid distribution</p>
                    </div>
                  </div>
                </div>

                <div className="h-52 w-full relative flex items-center justify-center">
                  {workModeChartData.length === 0 ? (
                    <div className="text-slate-400 text-xs">No work mode data</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={workModeChartData}
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {workModeChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
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
                  {workModeChartData.length > 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-black text-slate-800">{jobs.length}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">
                        Roles
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Legend Badges */}
              <div className="flex items-center justify-center gap-4 pt-3 border-t border-slate-100 text-xs">
                {workModeChartData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 font-medium">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-slate-600">{item.name}:</span>
                    <span className="font-bold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Control Bar with Search & Add Button */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="flex-1 relative max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search job title, department or location..."
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white text-slate-800 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] transition-all font-medium"
              />
            </div>

            <Button
              onClick={() => {
                setSelectedJob(null);
                setFormOpen(true);
              }}
              className="bg-gradient-to-r from-[#1769AA] to-[#2D86C9] hover:from-[#0D4F85] hover:to-[#1769AA] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-[#1769AA]/20 shrink-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Post New Job
            </Button>
          </div>

          {/* Chakra UI-Style High Density Data Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200/80">
                  <tr>
                    <th className="py-3.5 px-4 font-bold text-[#0D4F85] uppercase tracking-wider">
                      Position Title
                    </th>
                    <th className="py-3.5 px-4 font-bold text-[#0D4F85] uppercase tracking-wider">
                      Department
                    </th>
                    <th className="py-3.5 px-4 font-bold text-[#0D4F85] uppercase tracking-wider">
                      Type & Mode
                    </th>
                    <th className="py-3.5 px-4 font-bold text-[#0D4F85] uppercase tracking-wider">
                      Location
                    </th>
                    <th className="py-3.5 px-4 font-bold text-[#0D4F85] uppercase tracking-wider text-center">
                      Seats / Openings
                    </th>
                    <th className="py-3.5 px-4 font-bold text-[#0D4F85] uppercase tracking-wider">
                      Deadline
                    </th>
                    <th className="py-3.5 px-4 font-bold text-[#0D4F85] uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedJobs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        No job openings found. Click "Post New Job" to create your first listing.
                      </td>
                    </tr>
                  ) : (
                    paginatedJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-sky-50/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 text-xs sm:text-sm">
                            {job.title}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            ID: {job.id.slice(0, 8)}...
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-sky-50 text-[#0D4F85] font-bold text-[10px] border border-sky-100 uppercase tracking-wider">
                            {job.department}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200/80 rounded text-[10px] font-semibold">
                              {job.employment_type}
                            </span>
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded text-[10px] font-semibold">
                              {job.work_mode}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          📍 {job.location}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {(() => {
                            const total = job.total_openings ?? 1;
                            const filled = job.openings_filled ?? 0;
                            const remaining = Math.max(0, total - filled);
                            if (remaining === 0) {
                              return (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
                                  Full (0 Left)
                                </span>
                              );
                            }
                            return (
                              <div className="flex flex-col items-center">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black">
                                  {remaining} / {total} Open
                                </span>
                                {filled > 0 && (
                                  <span className="text-[10px] text-slate-400 mt-0.5">
                                    {filled} Hired
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
                          {new Date(job.last_date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => navigate(`/admin/applications?job=${job.id}`)}
                              title="View Applied Candidates & Manage Status"
                              className="w-7 h-7 rounded-lg text-slate-500 hover:text-[#0D4F85] hover:bg-sky-100 flex items-center justify-center transition-colors"
                            >
                              <Users className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleView(job)}
                              title="View Details"
                              className="w-7 h-7 rounded-lg text-slate-500 hover:text-[#1769AA] hover:bg-sky-50 flex items-center justify-center transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleEdit(job)}
                              title="Edit Job"
                              className="w-7 h-7 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 flex items-center justify-center transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(job.id)}
                              title="Delete Job"
                              className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
              <div>
                Showing{" "}
                <span className="font-bold text-slate-800">
                  {filteredJobs.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-bold text-slate-800">
                  {Math.min(currentPage * itemsPerPage, filteredJobs.length)}
                </span>{" "}
                of <span className="font-bold text-slate-800">{filteredJobs.length}</span> jobs
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="h-8 px-2.5 rounded-lg border-slate-200 text-xs font-semibold"
                >
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
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <JobFormModal 
        open={formOpen} 
        onClose={() => { setFormOpen(false); setSelectedJob(null); }}
        job={selectedJob}
        onSuccess={fetchJobs}
      />

      <JobViewModal
        open={viewOpen}
        onClose={() => { setViewOpen(false); setSelectedJob(null); }}
        job={selectedJob}
      />
    </AdminLayout>
  );
};

export default Jobs;
