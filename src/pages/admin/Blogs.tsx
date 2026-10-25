"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { getDynamicData, saveDynamicData, uploadMediaFile } from "@/lib/dynamicDataService";
import {
  BookOpen,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  FileText,
  Calendar,
  User,
  Tag,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Share2,
  Table as TableIcon,
  LayoutGrid,
  Heading1,
  Heading2,
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Image as ImageIcon,
  Quote,
  Link2,
  Upload,
} from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

export interface BlogPost {
  id: string;
  title: string;
  slug?: string;
  category: string;
  author: string;
  excerpt: string;
  content: string;
  image_url: string | null;
  published: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

const SEED_BLOG_POSTS: BlogPost[] = [
  {
    id: "ai-web-dev",
    title: "The Future of AI in Web Development",
    category: "AI & Technology",
    author: "Aayush Pandey",
    excerpt:
      "How AI tools are reshaping developer workflows, testing, and personalized user experiences in modern web apps.",
    content: `Artificial intelligence is revolutionizing web development by automating repetitive tasks, improving developer productivity, and enabling smarter, personalized user experiences.

In this expanded article we look at concrete areas where AI is making an impact: automated testing and code generation, intelligent content personalization, accessibility improvements, and enhanced analytics. For example, AI-assisted testing can generate unit tests and find regressions faster, while code assistants speed up scaffolding and refactors.

Practical integration tips:
- Start small: use AI to automate linting, formatting, and test coverage generation.
- Use personalization cautiously: combine ML-driven suggestions with human review to avoid incorrect content.
- Monitor and log: add observability to AI-powered features so you can detect regressions and bias.

Tooling examples include LLM-based code helpers, anomaly-detection libraries for analytics, and personalization services that deliver tailored content to logged-in users. As these tools mature, developers who learn to orchestrate them will move faster and ship higher-quality experiences.`,
    image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop",
    published: true,
    created_at: "2026-06-01T10:00:00Z",
    updated_at: "2026-06-01T10:00:00Z",
  },
  {
    id: "mobile-best-practices",
    title: "Best Practices for Mobile App Development",
    category: "Mobile Development",
    author: "Sarthak Verma",
    excerpt:
      "Practical strategies for building resilient, fast, and user-centered mobile apps — performance, offline support, and monitoring.",
    content: `Creating high-performance mobile applications requires careful planning, efficient coding, and a focus on user experience.

This post dives deeper into measurable strategies: use performance budgets, prioritize time-to-interactive, and use synthetic + real user monitoring (RUM) to identify bottlenecks. Implement graceful offline behavior using service workers or local caching patterns and design sync strategies to avoid data conflicts.

Testing recommendations: run automated UI tests, integrate crash reporting, and collect real user metrics like LCP and TTFB. Finally, iterate frequently — small UX improvements compound over time to increase retention and satisfaction.`,
    image_url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop",
    published: true,
    created_at: "2026-06-05T12:00:00Z",
    updated_at: "2026-06-05T12:00:00Z",
  },
  {
    id: "communication-skills-tech",
    title: "Communication Skills for Tech Professionals",
    category: "Career Development",
    author: "Akanksha Pandey",
    excerpt:
      "Actionable tips for engineers to improve collaboration, documentation, and presentation skills in cross-functional teams.",
    content: `Clear communication is as crucial to engineering success as clean code. When engineers can articulate technical trade-offs to business stakeholders, project velocity surges.

Key focus areas:
1. Executive Summaries: Lead with the 'Why' and the business impact before the technical details.
2. Architecture Decision Records (ADRs): Document design decisions concisely for future team members.
3. Active Listening: Ensure mutual understanding during sprint planning and retrospective discussions.`,
    image_url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop",
    published: true,
    created_at: "2026-06-10T14:30:00Z",
    updated_at: "2026-06-10T14:30:00Z",
  },
];

const LOCAL_STORAGE_BLOGS = "aayup_dynamic_blog_posts";

export default function AdminBlogs() {
  const { toast } = useToast();
  const [blogs, setBlogs] = useState<BlogPost[]>(SEED_BLOG_POSTS);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Rich Text Editor formatting helper
  const insertFormatting = (prefix: string, suffix: string = "", placeholder: string = "text") => {
    const textarea = document.getElementById("blog-content-editor") as HTMLTextAreaElement | null;
    if (!textarea) {
      setFormData((prev) => ({ ...prev, content: prev.content + `\n${prefix}${placeholder}${suffix}\n` }));
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end) || placeholder;
    const replacement = `${prefix}${selected}${suffix}`;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setFormData((prev) => ({ ...prev, content: newContent }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 50);
  };

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [viewingBlog, setViewingBlog] = useState<BlogPost | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<BlogPost | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "AI & Technology",
    author: "Aayush Pandey",
    excerpt: "",
    content: "",
    image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop",
    published: true,
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const data = await getDynamicData<BlogPost[]>(LOCAL_STORAGE_BLOGS, SEED_BLOG_POSTS);
      setBlogs(data);
    } catch {
      setBlogs(SEED_BLOG_POSTS);
    } finally {
      setLoading(false);
    }
  };

  const persistUpdatedBlogs = async (updated: BlogPost[]) => {
    setBlogs(updated);
    await saveDynamicData(LOCAL_STORAGE_BLOGS, updated);
  };

  const handleOpenAddModal = () => {
    setEditingBlog(null);
    setFormData({
      title: "",
      category: "AI & Technology",
      author: "Aayush Pandey",
      excerpt: "",
      content: "",
      image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop",
      published: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (blog: BlogPost) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      category: blog.category,
      author: blog.author,
      excerpt: blog.excerpt,
      content: blog.content,
      image_url: blog.image_url || "",
      published: blog.published ?? true,
    });
    setIsModalOpen(true);
  };

  const handleTogglePublish = async (blog: BlogPost) => {
    const newStatus = !blog.published;
    try {
      await supabase
        .from("blog_posts")
        .update({ published: newStatus })
        .eq("id", blog.id);
    } catch {
      // Local sync fallback
    }

    const updated = blogs.map((b) => (b.id === blog.id ? { ...b, published: newStatus } : b));
    persistUpdatedBlogs(updated);
    toast({
      title: newStatus ? "Article Published" : "Moved to Drafts",
      description: `"${blog.title}" is now ${newStatus ? "live on the website" : "hidden as draft"}.`,
    });
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({ title: "Validation Error", description: "Title is required", variant: "destructive" });
      return;
    }

    if (editingBlog) {
      // Update
      const updatedPost: BlogPost = {
        ...editingBlog,
        title: formData.title,
        category: formData.category,
        author: formData.author,
        excerpt: formData.excerpt,
        content: formData.content,
        image_url: formData.image_url || null,
        published: formData.published,
        updated_at: new Date().toISOString(),
      };

      try {
        await supabase
          .from("blog_posts")
          .update({
            title: formData.title,
            category: formData.category,
            author: formData.author,
            excerpt: formData.excerpt,
            content: formData.content,
            image_url: formData.image_url,
            published: formData.published,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingBlog.id);
      } catch {
        // Fallback
      }

      const updated = blogs.map((b) => (b.id === editingBlog.id ? updatedPost : b));
      persistUpdatedBlogs(updated);
      toast({ title: "Updated", description: `"${formData.title}" updated successfully.` });
    } else {
      // Create
      const newId =
        formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4);
      const newPost: BlogPost = {
        id: newId,
        title: formData.title,
        category: formData.category,
        author: formData.author,
        excerpt: formData.excerpt,
        content: formData.content,
        image_url: formData.image_url || null,
        published: formData.published,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      try {
        await supabase.from("blog_posts").insert([
          {
            id: newId,
            title: formData.title,
            category: formData.category,
            author: formData.author,
            excerpt: formData.excerpt,
            content: formData.content,
            image_url: formData.image_url,
            published: formData.published,
          },
        ]);
      } catch {
        // Fallback
      }

      const updated = [newPost, ...blogs];
      persistUpdatedBlogs(updated);
      toast({ title: "Published", description: `"${formData.title}" is saved and live.` });
    }

    setIsModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!blogToDelete) return;
    try {
      await supabase.from("blog_posts").delete().eq("id", blogToDelete.id);
    } catch {
      // Fallback
    }

    const updated = blogs.filter((b) => b.id !== blogToDelete.id);
    persistUpdatedBlogs(updated);
    toast({ title: "Deleted", description: `"${blogToDelete.title}" removed.` });
    setIsDeleteDialogOpen(false);
    setBlogToDelete(null);
  };

  // Stats Calculations
  const totalArticles = blogs.length;
  const publishedCount = blogs.filter((b) => b.published).length;
  const draftCount = totalArticles - publishedCount;
  const categoriesList = Array.from(new Set(blogs.map((b) => b.category)));

  // Category Bar Chart Data
  const categoryCounts: Record<string, number> = {};
  blogs.forEach((b) => {
    categoryCounts[b.category] = (categoryCounts[b.category] || 0) + 1;
  });
  const categoryChartData = Object.entries(categoryCounts).map(([name, count]) => ({
    name: name.length > 15 ? name.slice(0, 15) + "…" : name,
    fullName: name,
    count,
  }));

  // Status Donut Chart Data
  const statusChartData = [
    { name: "Published Live", value: publishedCount, color: "#10B981" },
    { name: "Drafts", value: draftCount, color: "#F59E0B" },
  ].filter((item) => item.value > 0);

  // Filtering
  const filteredBlogs = blogs.filter((blog) => {
    if (selectedCategory !== "all" && blog.category !== selectedCategory) return false;
    if (statusFilter === "published" && !blog.published) return false;
    if (statusFilter === "draft" && blog.published) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        blog.title.toLowerCase().includes(q) ||
        blog.author.toLowerCase().includes(q) ||
        blog.excerpt.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AdminLayout
      activePath="/admin/blogs"
      title="Blog & Articles CMS"
      subtitle="Write, edit, and publish technical insights, tutorials, and company announcements"
    >
      <div className="space-y-6">
        {/* TOP KPI STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Articles */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-[#1769AA]/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Articles
                </p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{totalArticles}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1769AA] flex items-center justify-center font-bold">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{categoriesList.length}</span> Active Topic Categories
            </div>
          </div>

          {/* Card 2: Published Live */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-emerald-400/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Published Live
                </p>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">{publishedCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Visible to website visitors</span>
            </div>
          </div>

          {/* Card 3: Drafts / In Review */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-amber-400/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Drafts & Review
                </p>
                <h3 className="text-2xl font-black text-amber-600 mt-1">{draftCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-700">
              <span>Unpublished editorial posts</span>
            </div>
          </div>

          {/* Card 4: Quick Add Action */}
          <div className="bg-gradient-to-br from-[#0D4F85] to-[#1769AA] rounded-2xl p-5 shadow-sm text-white flex flex-col justify-between group hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-sky-200">
                  Content Publishing
                </p>
                <h3 className="text-lg font-bold mt-0.5">Write New Article</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-sky-200" />
              </div>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="mt-3 w-full py-2 px-3 rounded-xl bg-white text-[#0D4F85] font-bold text-xs hover:bg-sky-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Article
            </button>
          </div>
        </div>

        {/* HIGH-CHART ANALYTICS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Articles by Category */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Articles by Category Domain</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Content distribution across AI, Web Development, Mobile, and Career topics
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#1769AA] text-[11px] font-bold">
                Topic Breakdown
              </span>
            </div>

            <div className="h-64 w-full">
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fill: "#64748B", fontSize: 11 }} />
                    <Tooltip
                      formatter={(val: any) => [`${val} Articles`, "Total"]}
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
                    <Bar dataKey="count" fill="url(#blueBlogGrad)" radius={[6, 6, 0, 0]} />
                    <defs>
                      <linearGradient id="blueBlogGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1769AA" />
                        <stop offset="100%" stopColor="#2D86C9" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  No blog categories found
                </div>
              )}
            </div>
          </div>

          {/* Chart 2: Publication Status Ratio */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-slate-900">Publishing Ratio</h3>
                <span className="text-xs font-bold text-slate-500">{totalArticles} Total</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">Live articles vs editorial drafts</p>
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
                    <span className="text-xl font-black text-slate-800">{publishedCount}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Live
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-xs text-slate-400">No data</div>
              )}
            </div>

            <div className="space-y-1.5 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  Published Live
                </span>
                <span className="font-bold text-slate-900">{publishedCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  Drafts
                </span>
                <span className="font-bold text-slate-900">{draftCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTROLS HEADER */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Category Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                selectedCategory === "all"
                  ? "bg-[#1769AA] text-white shadow-md shadow-[#1769AA]/30"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Topics
            </button>
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-[#1769AA] text-white shadow-md shadow-[#1769AA]/30"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar & Status Filter */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1769AA]/30"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1769AA]/30"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>

            {/* View Mode Switcher (Default: Table) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "table"
                    ? "bg-white text-[#1769AA] shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Table View (Default)"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "cards"
                    ? "bg-white text-[#1769AA] shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="py-2 px-4 rounded-xl bg-[#1769AA] text-white font-bold text-xs hover:bg-[#0D4F85] transition-colors flex items-center gap-1.5 shadow-md shadow-[#1769AA]/20 shrink-0"
            >
              <Plus className="w-4 h-4" />
              New Article
            </button>
          </div>
        </div>

        {/* LOADING INDICATOR */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#1769AA]" />
          </div>
        ) : (
          <>
            {/* VIEW MODE 1: DATA TABLE (DEFAULT) */}
            {viewMode === "table" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                      <TableRow>
                        <TableHead className="text-xs font-bold text-slate-700 py-3.5">Article</TableHead>
                        <TableHead className="text-xs font-bold text-slate-700 py-3.5">Category</TableHead>
                        <TableHead className="text-xs font-bold text-slate-700 py-3.5">Author</TableHead>
                        <TableHead className="text-xs font-bold text-slate-700 py-3.5">Date</TableHead>
                        <TableHead className="text-xs font-bold text-slate-700 py-3.5 text-center">Status</TableHead>
                        <TableHead className="text-xs font-bold text-slate-700 py-3.5 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBlogs.map((post) => (
                        <TableRow key={post.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
                          {/* Article Thumbnail & Title */}
                          <TableCell className="py-3 max-w-md">
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-11 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-xs">
                                <img
                                  src={post.image_url || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop"}
                                  alt={post.title}
                                  className="w-full h-full object-cover"
                                  onError={(e: any) => {
                                    e.currentTarget.src = "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop";
                                  }}
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate hover:text-[#1769AA] cursor-pointer" onClick={() => setViewingBlog(post)}>
                                  {post.title}
                                </p>
                                <p className="text-[11px] text-slate-500 truncate mt-0.5 line-clamp-1">
                                  {post.excerpt}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Category */}
                          <TableCell className="py-3">
                            <span className="px-2.5 py-1 rounded-md bg-blue-50 text-[#1769AA] font-bold text-[10px] tracking-wide uppercase inline-block">
                              {post.category}
                            </span>
                          </TableCell>

                          {/* Author */}
                          <TableCell className="py-3">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                              <User className="w-3.5 h-3.5 text-[#1769AA]" />
                              <span>{post.author}</span>
                            </div>
                          </TableCell>

                          {/* Date */}
                          <TableCell className="py-3 text-xs text-slate-500 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{post.created_at ? new Date(post.created_at).toLocaleDateString() : "Recent"}</span>
                            </div>
                          </TableCell>

                          {/* Status */}
                          <TableCell className="py-3 text-center">
                            <button
                              onClick={() => handleTogglePublish(post)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shadow-xs inline-flex items-center gap-1 ${
                                post.published
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                  : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                              }`}
                              title="Click to toggle publish status"
                            >
                              {post.published ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Live
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 text-amber-600" /> Draft
                                </>
                              )}
                            </button>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setViewingBlog(post)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-[#1769AA] hover:bg-blue-50 transition-colors"
                                title="View Full Article"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenEditModal(post)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                title="Edit Article"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setBlogToDelete(post);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete Article"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* VIEW MODE 2: CARDS GRID */}
            {viewMode === "cards" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBlogs.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#1769AA]/40 transition-all flex flex-col group"
                  >
                    {/* Image Banner */}
                    <div className="relative h-44 bg-slate-100 overflow-hidden">
                      <img
                        src={post.image_url || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop"}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white font-bold text-[10px] tracking-wide uppercase">
                          {post.category}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <button
                          onClick={() => handleTogglePublish(post)}
                          className={`px-2.5 py-1 rounded-lg text-white font-bold text-[10px] flex items-center gap-1 shadow-sm transition-all ${
                            post.published
                              ? "bg-emerald-500 hover:bg-emerald-600"
                              : "bg-amber-500 hover:bg-amber-600"
                          }`}
                          title="Click to toggle publish status"
                        >
                          {post.published ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Live
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" /> Draft
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-2">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-[#1769AA]" />
                            {post.author}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {post.created_at ? new Date(post.created_at).toLocaleDateString() : "Recent"}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-slate-900 group-hover:text-[#1769AA] transition-colors line-clamp-2">
                          {post.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>

                      {/* Card Actions */}
                      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => handleTogglePublish(post)}
                          className="text-xs font-semibold flex items-center gap-1 text-slate-500 hover:text-slate-800"
                        >
                          {post.published ? (
                            <span className="text-emerald-700">● Published</span>
                          ) : (
                            <span className="text-amber-700">○ Hidden in Draft</span>
                          )}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setViewingBlog(post)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#1769AA] hover:bg-blue-50 transition-colors"
                            title="View Full Article"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(post)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Edit Article"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setBlogToDelete(post);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Article"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!loading && filteredBlogs.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">No Articles Found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No blog articles match your active filter or search query.
            </p>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {editingBlog ? "Edit Article" : "Write New Article"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Publish tech tutorials, guides, and architectural case studies.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveBlog} className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Article Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Scaling Microservices with Node.js & Docker"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#1769AA]/30 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>Topic Category *</span>
                  <span className="text-[10px] font-normal text-slate-500">Select or type custom</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    list="blog-category-list"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Next.js Architecture / Cyber Security"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs font-semibold focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] focus:outline-none transition-all shadow-sm"
                  />
                  <datalist id="blog-category-list">
                    {Array.from(new Set(["AI & Technology", "Web Development", "Mobile Development", "Cloud & DevOps", "Career Development", ...categoriesList])).map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Author Name *</label>
                <input
                  type="text"
                  required
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="e.g. Aayush Pandey"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#1769AA]/30 focus:outline-none"
                />
              </div>
            </div>

            {/* Thumbnail Image: Direct File Upload or Image URL */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800">
                  Blog Post Thumbnail *
                </label>
                <span className="text-[11px] text-slate-500 font-medium">
                  Upload file or enter URL
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                {/* Upload Button */}
                <label className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:border-[#1769AA] text-slate-700 hover:text-[#1769AA] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Image File</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const tempUrl = URL.createObjectURL(file);
                        setFormData((prev) => ({ ...prev, image_url: tempUrl }));

                        const uploadRes = await uploadMediaFile(file);
                        if (uploadRes.success && uploadRes.url) {
                          setFormData((prev) => ({ ...prev, image_url: uploadRes.url! }));
                        }
                      }
                    }}
                  />
                </label>

                {/* URL Input */}
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] focus:outline-none shadow-sm"
                />

                {/* Image Preview Thumbnail */}
                {formData.image_url && (
                  <div className="w-16 h-11 rounded-lg overflow-hidden bg-slate-100 border border-slate-300 shrink-0 shadow-xs relative group">
                    <img
                      src={formData.image_url}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                      onError={(e: any) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Short Excerpt *</label>
              <textarea
                required
                rows={2}
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief summary shown on blog list cards..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#1769AA]/30 focus:outline-none"
              />
            </div>

            {/* Rich Content Editor with Formatting Toolbar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Full Article Content & Rich Editor *
                </label>
                <span className="text-[10px] text-slate-400 font-medium">
                  Supports Markdown & Inline Images
                </span>
              </div>

              {/* Formatting Toolbar */}
              <div className="flex flex-wrap items-center gap-1 p-1.5 bg-slate-100 rounded-t-xl border border-b-0 border-slate-200 text-slate-700">
                <button
                  type="button"
                  onClick={() => insertFormatting("## ", "", "Heading 2")}
                  className="px-2 py-1 rounded bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold flex items-center gap-1 shadow-2xs"
                  title="Heading 2"
                >
                  <Heading2 className="w-3.5 h-3.5" /> H2
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("### ", "", "Subheading")}
                  className="px-2 py-1 rounded bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold flex items-center gap-1 shadow-2xs"
                  title="Heading 3"
                >
                  <Heading1 className="w-3.5 h-3.5" /> H3
                </button>
                <div className="w-[1px] h-4 bg-slate-300 mx-1" />
                <button
                  type="button"
                  onClick={() => insertFormatting("**", "**", "bold text")}
                  className="p-1 rounded bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold shadow-2xs"
                  title="Bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("*", "*", "italic text")}
                  className="p-1 rounded bg-white hover:bg-slate-50 border border-slate-200 text-xs shadow-2xs"
                  title="Italic"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("\n> ", "\n", "Quote callout text")}
                  className="p-1 rounded bg-white hover:bg-slate-50 border border-slate-200 text-xs shadow-2xs"
                  title="Blockquote"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <div className="w-[1px] h-4 bg-slate-300 mx-1" />
                <button
                  type="button"
                  onClick={() => insertFormatting("\n- ", "\n", "List item")}
                  className="p-1 rounded bg-white hover:bg-slate-50 border border-slate-200 text-xs shadow-2xs"
                  title="Bullet List"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("\n1. ", "\n", "Numbered item")}
                  className="p-1 rounded bg-white hover:bg-slate-50 border border-slate-200 text-xs shadow-2xs"
                  title="Numbered List"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("```\n", "\n```", "// code snippet here")}
                  className="p-1 rounded bg-white hover:bg-slate-50 border border-slate-200 text-xs shadow-2xs"
                  title="Code Block"
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const url = prompt("Enter image URL:", "https://images.unsplash.com/photo-...");
                    if (url) {
                      insertFormatting(`\n![Image description](${url})\n`, "", "");
                    }
                  }}
                  className="px-2 py-1 rounded bg-white hover:bg-blue-50 text-[#1769AA] border border-blue-200 text-xs font-semibold flex items-center gap-1 shadow-2xs ml-auto"
                  title="Insert Inline Image"
                >
                  <ImageIcon className="w-3.5 h-3.5" /> Add Pic
                </button>
              </div>

              {/* Editor Textarea */}
              <textarea
                id="blog-content-editor"
                required
                rows={9}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write full article body paragraphs, bullet points, headers, and code snippets..."
                className="w-full px-3 py-2.5 rounded-b-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-[#1769AA]/30 focus:outline-none bg-white leading-relaxed"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="pubCheck"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="rounded text-[#1769AA] focus:ring-[#1769AA]"
              />
              <label htmlFor="pubCheck" className="text-xs font-semibold text-slate-700">
                Publish immediately to website (uncheck to save as draft)
              </label>
            </div>

            <DialogFooter className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#1769AA] hover:bg-[#0D4F85] text-white rounded-xl text-xs font-bold"
              >
                {editingBlog ? "Save Changes" : "Publish Article"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* VIEW MODAL */}
      <Dialog open={!!viewingBlog} onOpenChange={() => setViewingBlog(null)}>
        {viewingBlog && (
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#1769AA] font-bold text-[10px] uppercase">
                  {viewingBlog.category}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-lg font-bold text-[10px] ${
                    viewingBlog.published
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {viewingBlog.published ? "Published Live" : "Draft"}
                </span>
              </div>
              <DialogTitle className="text-xl font-black text-slate-900 mt-2">
                {viewingBlog.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                By {viewingBlog.author} •{" "}
                {viewingBlog.created_at ? new Date(viewingBlog.created_at).toLocaleDateString() : "Recent"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              {viewingBlog.image_url && (
                <div className="h-52 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={viewingBlog.image_url}
                    alt={viewingBlog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Summary Excerpt
                </h5>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {viewingBlog.excerpt}
                </p>
              </div>

              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Full Article Content
                </h5>
                <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line space-y-2">
                  {viewingBlog.content}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setViewingBlog(null)}
                className="rounded-xl text-xs"
              >
                Close Preview
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Delete Article?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Are you sure you want to delete{" "}
              <strong className="text-slate-800">"{blogToDelete?.title}"</strong>? This will remove the
              article from the website.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="rounded-xl text-xs font-bold"
            >
              Delete Article
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
