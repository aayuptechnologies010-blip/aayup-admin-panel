"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "@/lib/router-bridge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import FeedbackAdmin from "@/components/admin/TestimonalAdmin";
import AdminLayout from "@/components/admin/AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare,
  Star,
  CheckCircle2,
  Clock,
  ThumbsUp,
  BarChart3,
  PieChart as PieIcon,
  Sparkles,
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

const Testimonials = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [testimonials, setTestimonials] = useState<any[]>([]);

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
      fetchTestimonials();
    } catch {
      // AdminLayout handles auth state
    } finally {
      setLoading(false);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setTestimonials(data);
      }
    } catch (e) {
      console.warn("Error fetching testimonials:", e);
    }
  };

  // Compute Metrics & KPI Stats
  const totalReviews = testimonials.length;
  const approvedCount = testimonials.filter((t) => t.approved === true).length;
  const pendingCount = testimonials.filter((t) => t.approved !== true).length;
  const fiveStarCount = testimonials.filter((t) => (t.rating || 5) === 5).length;
  const averageRating = totalReviews > 0
    ? (testimonials.reduce((acc, t) => acc + (t.rating || 5), 0) / totalReviews).toFixed(1)
    : "5.0";

  // Rating Distribution for Bar Chart (5 Stars down to 1 Star)
  const ratingChartData = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    testimonials.forEach((t) => {
      const r = Math.min(5, Math.max(1, Math.round(t.rating || 5)));
      counts[r] = (counts[r] || 0) + 1;
    });
    return [
      { name: "5 Stars", rating: "★★★★★", count: counts[5] || 0 },
      { name: "4 Stars", rating: "★★★★☆", count: counts[4] || 0 },
      { name: "3 Stars", rating: "★★★☆☆", count: counts[3] || 0 },
      { name: "2 Stars", rating: "★★☆☆☆", count: counts[2] || 0 },
      { name: "1 Star", rating: "★☆☆☆☆", count: counts[1] || 0 },
    ];
  }, [testimonials]);

  // Approval Status Distribution for Donut Chart
  const approvalChartData = useMemo(() => {
    return [
      { name: "Approved (Live)", value: approvedCount, color: "#10B981" },
      { name: "Pending Approval", value: pendingCount, color: "#F59E0B" },
    ].filter((d) => d.value > 0);
  }, [approvedCount, pendingCount]);

  return (
    <AdminLayout
      activePath="/admin/testimonals"
      title="Testimonials & Client Feedback"
      subtitle="Client trust ratings, endorsement approvals & website showcase analytics"
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
            {/* Card 1: Total Reviews */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Reviews
                </span>
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-[#1769AA] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  {totalReviews}
                </span>
                <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                  All Time
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                Customer and partner endorsements
              </p>
            </div>

            {/* Card 2: Average Rating */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Average Rating
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Star className="w-5 h-5 fill-amber-400" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-amber-600">
                  {averageRating}
                </span>
                <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Out of 5.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                {fiveStarCount} five-star customer reviews
              </p>
            </div>

            {/* Card 3: Live on Website */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Published Live
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                  {approvedCount}
                </span>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  {totalReviews > 0 ? `${Math.round((approvedCount / totalReviews) * 100)}%` : "0%"} Approved
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                Actively featured in scrolling marquee
              </p>
            </div>

            {/* Card 4: Pending Moderation */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Pending Review
                </span>
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-purple-700">
                  {pendingCount}
                </span>
                <span className="text-xs text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                  Moderation
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                Awaiting approval before publishing
              </p>
            </div>
          </div>

          {/* HIGH-VISUAL CHARTS ANALYTICS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Chart 1: Rating Distribution (Bar Chart) */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Client Star Rating Distribution
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Volume of customer reviews categorized by score (1-5 Stars)
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  {averageRating} ★ Avg
                </span>
              </div>

              <div className="h-64 w-full">
                {testimonials.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                    No testimonials submitted yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={ratingChartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#64748B", fontSize: 11, fontWeight: 500 }}
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
                        formatter={(value: any) => [`${value} Client Reviews`, "Reviews"]}
                      />
                      <Bar
                        dataKey="count"
                        radius={[8, 8, 0, 0]}
                        fill="url(#ratingBarGradient)"
                      />
                      <defs>
                        <linearGradient id="ratingBarGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#F59E0B" />
                          <stop offset="100%" stopColor="#FBBF24" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Chart 2: Publication Status Ratio (Donut Chart) */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#1769AA] flex items-center justify-center">
                      <PieIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Showcase Status</h3>
                      <p className="text-[11px] text-slate-400">Approved vs Pending reviews</p>
                    </div>
                  </div>
                </div>

                <div className="h-52 w-full relative flex items-center justify-center">
                  {approvalChartData.length === 0 ? (
                    <div className="text-slate-400 text-xs">No reviews data</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={approvalChartData}
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {approvalChartData.map((entry, index) => (
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
                  {approvalChartData.length > 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-black text-slate-800">{totalReviews}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">
                        Reviews
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Legend Badges */}
              <div className="flex items-center justify-center gap-3 pt-3 border-t border-slate-100 text-[11px] flex-wrap">
                {approvalChartData.map((item, idx) => (
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
            <FeedbackAdmin />
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Testimonials;
