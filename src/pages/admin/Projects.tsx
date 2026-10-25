"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Globe,
  Smartphone,
  Cpu,
  BarChart3,
  X,
  Upload,
  Table as TableIcon,
  LayoutGrid,
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

export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  image: string;
  images: string[];
  tags: string[];
  problem: string;
  solution: string;
  features: string[];
  technologies: { name: string; role: string }[];
  duration: string;
  team: string;
  status: string;
  demoUrl?: string;
  demoType: "Live Demo" | "Case Study" | "Demo on request";
}

const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: "ecommerce",
    title: "Enterprise E-Commerce Platform",
    category: "Websites",
    shortDescription:
      "Modern full-stack commerce platform engineered with Next.js & Node.js featuring real-time inventory management.",
    fullDescription:
      "A comprehensive digital commerce solution built to deliver high-converting, fast shopping experiences. The platform features advanced catalogue management, secure payment gateway processing, automated inventory synchronization, and intuitive admin dashboards.",
    image: "/project-web-development.webp",
    images: ["/project-web-development.webp", "/project-crm-dashboard.webp"],
    tags: ["React / Next.js", "Node.js", "MongoDB", "Stripe API"],
    problem:
      "Legacy e-commerce store suffered from slow page loads, stock discrepancy during peak traffic, and high checkout drop-offs.",
    solution:
      "Engineered an API-first serverless architecture with real-time stock sync, localized payments, and sub-second page performance.",
    features: [
      "Real-time inventory and SKU management",
      "Secure multi-currency payment checkout",
      "Dynamic product search and filtering",
      "Order status tracking & instant notifications",
      "Role-based administrative operations portal",
    ],
    technologies: [
      { name: "Next.js / React", role: "Frontend UI" },
      { name: "Node.js & Express", role: "Backend API" },
      { name: "MongoDB Atlas", role: "Database" },
      { name: "Tailwind CSS", role: "Styling" },
    ],
    duration: "4 Months",
    team: "4 Engineers",
    status: "Completed",
    demoType: "Case Study",
  },
  {
    id: "bhoommetra",
    title: "Bhoommetra Mobile & IoT Solution",
    category: "Mobile Apps",
    shortDescription:
      "Agricultural intelligence platform with IoT soil monitoring sensors and mobile crop recommendations.",
    fullDescription:
      "Bhoommetra bridges hardware sensor telemetry with an intuitive mobile application for farm supervisors. Provides real-time soil moisture and nutrient readings, weather forecasts, and automated crop disease diagnostics.",
    image: "/project-mobile-app.webp",
    images: ["/project-mobile-app.webp", "/portfolio-hero-showcase.webp"],
    tags: ["Flutter", "IoT Telemetry", "AI Analytics", "Cloud Services"],
    problem:
      "Farmers lacked actionable soil insights, leading to over-fertilization and inefficient water consumption.",
    solution:
      "Developed a cross-platform mobile application connected via Bluetooth and Cloud IoT gateways to visualize real-time field diagnostics.",
    features: [
      "Live sensor data telemetry and alerts",
      "Offline-first mobile data synchronization",
      "Automated crop health & fertilizer guidelines",
      "Multilingual UI for regional users",
      "Weather integration with localized forecasting",
    ],
    technologies: [
      { name: "Flutter", role: "Mobile Application" },
      { name: "Python / FastAPI", role: "Telemetry Backend" },
      { name: "PostgreSQL", role: "Time-Series Data" },
      { name: "AWS IoT Core", role: "Device Gateway" },
    ],
    duration: "6 Months",
    team: "5 Engineers",
    status: "In Production",
    demoType: "Demo on request",
  },
  {
    id: "enterprise-crm",
    title: "SynergyFlow Enterprise CRM / ERP",
    category: "CRM / ERP",
    shortDescription:
      "Comprehensive business sales pipeline, customer management, and team activity analytics software.",
    fullDescription:
      "Custom internal CRM engineered for mid-market business operations. Replaces scattered spreadsheets with automated sales pipeline stages, client communication logs, invoice generation, and revenue forecasting.",
    image: "/project-crm-dashboard.webp",
    images: ["/project-crm-dashboard.webp", "/project-ai-analytics.webp"],
    tags: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    problem:
      "Fragmented sales operations and manual reporting caused delayed client follow-ups and lost revenue visibility.",
    solution:
      "Created a centralized modular web platform with role permissions, automated reminders, and interactive executive reporting.",
    features: [
      "Customizable deal pipeline with drag-and-drop",
      "Client conversation timeline and document storage",
      "Automated PDF quotation & invoicing engine",
      "Granular team access & permission controls",
      "Revenue forecast reporting and exportable analytics",
    ],
    technologies: [
      { name: "React / TypeScript", role: "Frontend" },
      { name: "Node.js", role: "RESTful Backend" },
      { name: "PostgreSQL", role: "Relational Database" },
      { name: "Docker", role: "Containerization" },
    ],
    duration: "5 Months",
    team: "4 Engineers",
    status: "Deployed",
    demoType: "Case Study",
  },
  {
    id: "ai-dev-tools",
    title: "Aether AI Analytics & Automation",
    category: "AI & Automation",
    shortDescription:
      "Predictive machine learning models and intelligent automated workflows for data-intensive operations.",
    fullDescription:
      "Enterprise automation suite integrating large language models and machine learning classifiers to extract unstructured data, monitor operational anomalies, and generate predictive intelligence.",
    image: "/project-ai-analytics.webp",
    images: ["/project-ai-analytics.webp", "/aayup-hero-tech.webp"],
    tags: ["Python", "FastAPI", "Machine Learning", "React"],
    problem:
      "Client team spent hundreds of hours weekly manually categorizing high-volume support requests and monitoring anomalies.",
    solution:
      "Built custom classification models and automated routing pipelines that process tickets and telemetry in real time.",
    features: [
      "Automated document and query classification",
      "Real-time anomaly detection alerts",
      "Interactive model confidence dashboards",
      "FastAPI microservice endpoints for high throughput",
      "Audit trail and human-in-the-loop review workflow",
    ],
    technologies: [
      { name: "Python / PyTorch", role: "ML Models" },
      { name: "FastAPI", role: "API Microservices" },
      { name: "React", role: "Telemetry Dashboard" },
      { name: "Redis", role: "Message Queue" },
    ],
    duration: "5 Months",
    team: "3 Engineers",
    status: "Active",
    demoType: "Case Study",
  },
  {
    id: "evm-systems",
    title: "EVM Secure Electronic Verification",
    category: "Websites",
    shortDescription:
      "Secure digital voting and election verification web system engineered with cryptographic audit trails.",
    fullDescription:
      "High-integrity digital voting management system with end-to-end cryptographic verification, tamper-evident ballots, and administrative oversight consoles.",
    image: "/project-web-development.webp",
    images: ["/project-web-development.webp"],
    tags: ["React", "Security", "Node.js", "Cryptographic Hash"],
    problem:
      "Institutions required transparent, verifiable ballot management with zero risk of duplicated or altered entries.",
    solution:
      "Implemented a secure multi-step verification portal with immutable audit records and voter privacy guards.",
    features: [
      "Voter biometric & two-factor authorization",
      "Tamper-evident cryptographically signed records",
      "Real-time voter turnout and audit dashboards",
      "Air-gapped verification compliance",
    ],
    technologies: [
      { name: "React", role: "Client App" },
      { name: "Node.js", role: "Security Layer" },
      { name: "PostgreSQL", role: "Audit Storage" },
    ],
    duration: "6 Months",
    team: "5 Developers",
    status: "Completed",
    demoType: "Case Study",
  },
];

const STORAGE_KEY = "aayup_dynamic_portfolio_projects";

export default function AdminProjects() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [viewingProject, setViewingProject] = useState<ProjectItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "Websites",
    shortDescription: "",
    fullDescription: "",
    image: "/project-web-development.webp",
    tags: "React, Next.js, Node.js",
    problem: "",
    solution: "",
    features: "Secure authentication, Real-time sync, Analytics dashboard",
    duration: "3 Months",
    team: "4 Engineers",
    status: "Completed",
    demoType: "Case Study" as ProjectItem["demoType"],
    demoUrl: "",
  });

  // Dynamically derived project categories + default options
  const projectCategoryOptions = Array.from(
    new Set([
      "Websites",
      "Mobile Apps",
      "CRM / ERP",
      "AI & Automation",
      ...projects.map((p) => p.category).filter(Boolean),
    ])
  );

  // Load from localStorage on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setProjects(JSON.parse(stored));
        } else {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROJECTS));
        }
      } catch (e) {
        console.error("Failed to load local projects", e);
      }
    }
  }, []);

  const saveProjectsToStorage = (updated: ProjectItem[]) => {
    setProjects(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event("portfolio_projects_updated"));
      } catch (e) {
        console.error("Failed to save projects", e);
      }
    }
  };

  const handleOpenAddModal = () => {
    setEditingProject(null);
    setFormData({
      title: "",
      category: "Websites",
      shortDescription: "",
      fullDescription: "",
      image: "/project-web-development.webp",
      tags: "React, Next.js, Node.js",
      problem: "",
      solution: "",
      features: "High throughput architecture, Modern UI/UX, Cloud telemetry",
      duration: "3 Months",
      team: "4 Engineers",
      status: "Completed",
      demoType: "Case Study",
      demoUrl: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: ProjectItem) => {
    setEditingProject(p);
    setFormData({
      title: p.title,
      category: p.category,
      shortDescription: p.shortDescription,
      fullDescription: p.fullDescription,
      image: p.image,
      tags: p.tags.join(", "),
      problem: p.problem,
      solution: p.solution,
      features: p.features.join(", "),
      duration: p.duration,
      team: p.team,
      status: p.status,
      demoType: p.demoType,
      demoUrl: p.demoUrl || "",
    });
    setIsModalOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({ title: "Validation Error", description: "Project title is required", variant: "destructive" });
      return;
    }

    const tagArray = formData.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const featureArray = formData.features.split(",").map((f) => f.trim()).filter(Boolean);

    if (editingProject) {
      // Update
      const updated = projects.map((p) =>
        p.id === editingProject.id
          ? {
              ...p,
              title: formData.title,
              category: formData.category,
              shortDescription: formData.shortDescription,
              fullDescription: formData.fullDescription,
              image: formData.image,
              images: [formData.image],
              tags: tagArray,
              problem: formData.problem,
              solution: formData.solution,
              features: featureArray,
              duration: formData.duration,
              team: formData.team,
              status: formData.status,
              demoType: formData.demoType,
              demoUrl: formData.demoUrl || undefined,
            }
          : p
      );
      saveProjectsToStorage(updated);
      toast({ title: "Project Updated", description: `"${formData.title}" updated successfully.` });
    } else {
      // Create
      const newId = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4);
      const newProj: ProjectItem = {
        id: newId,
        title: formData.title,
        category: formData.category,
        shortDescription: formData.shortDescription,
        fullDescription: formData.fullDescription,
        image: formData.image,
        images: [formData.image],
        tags: tagArray,
        problem: formData.problem,
        solution: formData.solution,
        features: featureArray,
        technologies: tagArray.map((t) => ({ name: t, role: "Core Tech" })),
        duration: formData.duration,
        team: formData.team,
        status: formData.status,
        demoType: formData.demoType,
        demoUrl: formData.demoUrl || undefined,
      };
      saveProjectsToStorage([newProj, ...projects]);
      toast({ title: "Project Created", description: `"${formData.title}" added to showcase portfolio.` });
    }

    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!projectToDelete) return;
    const updated = projects.filter((p) => p.id !== projectToDelete.id);
    saveProjectsToStorage(updated);
    toast({ title: "Deleted", description: `"${projectToDelete.title}" has been removed.` });
    setIsDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  // Stats Calculations
  const totalProjects = projects.length;
  const webProjects = projects.filter((p) => p.category === "Websites").length;
  const mobileProjects = projects.filter((p) => p.category === "Mobile Apps").length;
  const crmProjects = projects.filter((p) => p.category === "CRM / ERP").length;
  const aiProjects = projects.filter((p) => p.category === "AI & Automation").length;
  const completedCount = projects.filter((p) => p.status.toLowerCase().includes("completed") || p.status.toLowerCase().includes("deployed")).length;

  // Category Bar Chart Data
  const categoryChartData = [
    { name: "Websites", count: webProjects },
    { name: "Mobile Apps", count: mobileProjects },
    { name: "CRM / ERP", count: crmProjects },
    { name: "AI & Autom.", count: aiProjects },
  ];

  // Status Donut Chart Data
  const statusCounts: Record<string, number> = {};
  projects.forEach((p) => {
    const s = p.status || "Completed";
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  });
  const statusChartData = Object.entries(statusCounts).map(([name, value], i) => ({
    name,
    value,
    color: ["#1769AA", "#2D86C9", "#10B981", "#F59E0B"][i % 4],
  }));

  // Filtering
  const filteredProjects = projects.filter((p) => {
    if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <AdminLayout
      activePath="/admin/projects"
      title="Portfolio Projects Management"
      subtitle="Publish, edit, and categorize client case studies & enterprise software projects"
    >
      <div className="space-y-6">
        {/* TOP KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Portfolio */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-[#1769AA]/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Projects
                </p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{totalProjects}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1769AA] flex items-center justify-center font-bold">
                <FolderKanban className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{completedCount}</span> Shipped •{" "}
              <span className="font-semibold text-slate-700">{totalProjects - completedCount}</span> In-Flight
            </div>
          </div>

          {/* Card 2: Web & Mobile Apps */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-sky-400/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Web & Mobile Platforms
                </p>
                <h3 className="text-2xl font-black text-sky-600 mt-1">
                  {webProjects + mobileProjects}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                <Globe className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-sky-700">
              <span>{webProjects} Web Portals</span> • <span>{mobileProjects} Mobile / IoT</span>
            </div>
          </div>

          {/* Card 3: CRM / ERP & AI */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-indigo-400/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Enterprise ERP & AI
                </p>
                <h3 className="text-2xl font-black text-indigo-600 mt-1">
                  {crmProjects + aiProjects}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Cpu className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-indigo-700">
              <span>{crmProjects} CRM Systems</span> • <span>{aiProjects} AI Automation</span>
            </div>
          </div>

          {/* Card 4: Quick Add Action */}
          <div className="bg-gradient-to-br from-[#0D4F85] to-[#1769AA] rounded-2xl p-5 shadow-sm text-white flex flex-col justify-between group hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-sky-200">
                  Showcase Portfolio
                </p>
                <h3 className="text-lg font-bold mt-0.5">Publish New Case Study</h3>
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
              Add Project
            </button>
          </div>
        </div>

        {/* HIGH-CHART ANALYTICS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Project Distribution by Domain */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Projects by Domain Category</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Portfolio balance between Websites, Mobile Apps, Enterprise CRM, and AI Automation
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#1769AA] text-[11px] font-bold">
                Live Portfolio
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: "#64748B", fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any) => [`${val} Projects`, "Count"]}
                    contentStyle={{
                      backgroundColor: "#0D4F85",
                      borderRadius: "12px",
                      color: "#fff",
                      border: "none",
                      fontSize: "12px",
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
                    }}
                  />
                  <Bar dataKey="count" fill="url(#blueProjGrad)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="blueProjGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1769AA" />
                      <stop offset="100%" stopColor="#2D86C9" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Deployment Status Donut */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-slate-900">Project Status</h3>
                <span className="text-xs font-bold text-slate-500">{totalProjects} Total</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">Production state across case studies</p>
            </div>

            <div className="h-48 w-full flex items-center justify-center relative">
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
                <span className="text-xl font-black text-slate-800">{completedCount}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Live
                </span>
              </div>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-slate-100">
              {statusChartData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <span className="font-bold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CONTROLS HEADER & SEARCH */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Category Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            {["all", ...projectCategoryOptions].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-[#1769AA] text-white shadow-md shadow-[#1769AA]/30"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            ))}
          </div>

          {/* Search Bar + Add Button */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects, tags..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1769AA]/30"
              />
            </div>
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
              Add Project
            </button>
          </div>
        </div>

        {/* VIEW MODE 1: DATA TABLE (DEFAULT) */}
        {viewMode === "table" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                  <TableRow>
                    <TableHead className="text-xs font-bold text-slate-700 py-3.5">Project</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 py-3.5">Category</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 py-3.5">Tech Stack</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 py-3.5">Timeline & Team</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 py-3.5 text-center">Status</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 py-3.5 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
                      {/* Thumbnail & Title */}
                      <TableCell className="py-3 max-w-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-11 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-xs">
                            <img
                              src={project.image || "/project-web-development.webp"}
                              alt={project.title}
                              className="w-full h-full object-cover"
                              onError={(e: any) => {
                                e.currentTarget.src = "/project-web-development.webp";
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <p
                              className="text-xs font-bold text-slate-900 truncate hover:text-[#1769AA] cursor-pointer"
                              onClick={() => setViewingProject(project)}
                            >
                              {project.title}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {project.shortDescription}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Category */}
                      <TableCell className="py-3">
                        <span className="px-2.5 py-1 rounded-md bg-blue-50 text-[#1769AA] font-bold text-[10px] tracking-wide uppercase inline-block">
                          {project.category}
                        </span>
                      </TableCell>

                      {/* Tech Stack Tags */}
                      <TableCell className="py-3">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {project.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold"
                            >
                              {tag}
                            </span>
                          ))}
                          {project.tags.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-medium">
                              +{project.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Duration & Team */}
                      <TableCell className="py-3 text-xs text-slate-600 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{project.duration}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{project.team}</div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px] inline-block shadow-2xs">
                          {project.status}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingProject(project)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#1769AA] hover:bg-blue-50 transition-colors"
                            title="Preview Case Study"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(project)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Edit Project"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setProjectToDelete(project);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Project"
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

        {/* VIEW MODE 2: CARDS GRID SHOWCASE */}
        {viewMode === "cards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#1769AA]/40 transition-all flex flex-col group"
              >
                {/* Project Card Image Banner */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={project.image || "/project-web-development.webp"}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e: any) => {
                      e.currentTarget.src = "/project-web-development.webp";
                    }}
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white font-bold text-[10px] tracking-wide uppercase">
                      {project.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/90 text-white font-bold text-[10px] shadow-sm">
                      {project.status}
                    </span>
                  </div>
                </div>

                {/* Project Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-[#1769AA] transition-colors line-clamp-1">
                      {project.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {project.shortDescription}
                    </p>

                    {/* Technology Tags */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {project.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold"
                        >
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-semibold">
                          +{project.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer / Actions */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="text-[11px] text-slate-400 font-medium">
                      ⏳ {project.duration} • 👥 {project.team}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setViewingProject(project)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#1769AA] hover:bg-blue-50 transition-colors"
                        title="Preview Case Study"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(project)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        title="Edit Project"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setProjectToDelete(project);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Project"
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

        {filteredProjects.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">No Projects Found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No portfolio projects matched your search or category filter.
            </p>
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {editingProject ? "Edit Portfolio Project" : "Add New Portfolio Project"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Fill in case study specifics, category, tags, and architecture details.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProject} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. SynergyFlow Enterprise CRM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] focus:outline-none transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span>Category *</span>
                  <span className="text-[10px] font-normal text-slate-500">Select or type custom</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    list="project-category-list"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. SaaS Platform / Fintech App / IoT"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs font-semibold focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] focus:outline-none transition-all shadow-sm"
                  />
                  <datalist id="project-category-list">
                    {projectCategoryOptions.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Short Description *</label>
              <textarea
                required
                rows={2}
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="1-2 sentences summarizing the client project..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] focus:outline-none transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Full Description</label>
              <textarea
                rows={3}
                value={formData.fullDescription}
                onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                placeholder="In-depth explanation of system engineering..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] focus:outline-none transition-all shadow-sm"
              />
            </div>

            {/* Project Thumbnail Image: Direct File Upload or Image URL */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800">
                  Project Thumbnail Image *
                </label>
                <span className="text-[11px] text-slate-500 font-medium">
                  Upload file or paste URL
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
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) {
                            setFormData((prev) => ({ ...prev, image: ev.target!.result as string }));
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>

                {/* URL Input */}
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="Or enter URL: https://... or /project.webp"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] focus:outline-none shadow-sm"
                />

                {/* Image Preview Thumbnail */}
                {formData.image && (
                  <div className="w-16 h-11 rounded-lg overflow-hidden bg-slate-100 border border-slate-300 shrink-0 shadow-xs relative group">
                    <img
                      src={formData.image}
                      alt="Project Thumbnail"
                      className="w-full h-full object-cover"
                      onError={(e: any) => {
                        e.currentTarget.src = "/project-web-development.webp";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Live Project URL & Demo Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-[#1769AA]" />
                  Live Website / Project Demo Link
                </label>
                <input
                  type="url"
                  value={formData.demoUrl}
                  onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                  placeholder="https://example.com or https://app.client.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] focus:outline-none transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Demo Action Type</label>
                <select
                  value={formData.demoType}
                  onChange={(e) =>
                    setFormData({ ...formData, demoType: e.target.value as ProjectItem["demoType"] })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] focus:outline-none transition-all shadow-sm"
                >
                  <option value="Live Demo" className="text-slate-900 py-1 bg-white">Live Demo</option>
                  <option value="Case Study" className="text-slate-900 py-1 bg-white">Case Study</option>
                  <option value="Demo on request" className="text-slate-900 py-1 bg-white">Demo on request</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="React, Next.js, Node.js, Stripe"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] focus:outline-none transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Key Features (comma-separated)</label>
                <input
                  type="text"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Real-time stock sync, Multi-currency checkout, Admin dashboard"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] focus:outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Client Problem / Challenge</label>
                <textarea
                  rows={2}
                  value={formData.problem}
                  onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                  placeholder="What bottlenecks did the client face?"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] focus:outline-none transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Our Solution</label>
                <textarea
                  rows={2}
                  value={formData.solution}
                  onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                  placeholder="How our engineering team solved it..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] focus:outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Duration</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="4 Months"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] focus:outline-none transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Team Size</label>
                <input
                  type="text"
                  value={formData.team}
                  onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                  placeholder="4 Engineers"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] focus:outline-none transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Status</label>
                <input
                  type="text"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  placeholder="Completed / Active"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] focus:outline-none transition-all shadow-sm"
                />
              </div>
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
                {editingProject ? "Update Project" : "Publish Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* VIEW MODAL */}
      <Dialog open={!!viewingProject} onOpenChange={() => setViewingProject(null)}>
        {viewingProject && (
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#1769AA] font-bold text-[10px] uppercase">
                  {viewingProject.category}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                  {viewingProject.status}
                </span>
              </div>
              <DialogTitle className="text-xl font-black text-slate-900 mt-2">
                {viewingProject.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {viewingProject.shortDescription}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              <div className="h-48 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={viewingProject.image}
                  alt={viewingProject.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Architecture & Details
                </h5>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {viewingProject.fullDescription}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <h6 className="text-[11px] font-bold text-rose-700">Problem Addressed:</h6>
                  <p className="text-xs text-slate-600 mt-0.5">{viewingProject.problem}</p>
                </div>
                <div>
                  <h6 className="text-[11px] font-bold text-emerald-700">Engineering Solution:</h6>
                  <p className="text-xs text-slate-600 mt-0.5">{viewingProject.solution}</p>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Core Features
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {viewingProject.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setViewingProject(null)}
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
              Delete Portfolio Project?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Are you sure you want to remove{" "}
              <strong className="text-slate-800">"{projectToDelete?.title}"</strong> from the website
              showcase? This action cannot be undone.
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
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
