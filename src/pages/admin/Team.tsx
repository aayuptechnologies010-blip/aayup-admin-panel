"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  Code,
  Briefcase,
  Github,
  Linkedin,
  Mail,
  Award,
  Globe,
  ChevronDown,
  Table as TableIcon,
  LayoutGrid,
  ExternalLink,
  Instagram,
  Facebook,
  Image as ImageIcon,
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

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  badge: string;
  bio: string;
  avatar?: string;
  email?: string;
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  github?: string;
  active?: boolean;
}

const SEED_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "member-aayush",
    name: "Aayush Pandey",
    role: "Lead Software Architect & Engineering Lead",
    department: "Leadership",
    badge: "Core Team",
    bio: "Guides full-stack engineering, cloud architecture, and technical innovation across client software engagements.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop",
    linkedin: "https://linkedin.com/in/aayush-pandey",
    instagram: "https://instagram.com/aayush_pandey",
    facebook: "https://facebook.com/aayush.pandey",
    active: true,
  },
  {
    id: "member-sarthak",
    name: "Sarthak Verma",
    role: "Senior Full-Stack & Mobile Developer",
    department: "Engineering",
    badge: "Engineering",
    bio: "Specializes in modern React/Next.js platforms, cross-platform mobile architecture, and resilient API systems.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop",
    linkedin: "https://linkedin.com/in/sarthak-verma",
    instagram: "https://instagram.com/sarthak_verma",
    facebook: "https://facebook.com/sarthak.verma",
    active: true,
  },
  {
    id: "member-collective",
    name: "Product & Engineering Collective",
    role: "Cross-Functional Software Developers & Designers",
    department: "Engineering",
    badge: "Technical Specialists",
    bio: "Dedicated team of UI/UX designers, backend developers, and quality engineers building high-performance digital products.",
    avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop",
    linkedin: "https://linkedin.com/company/aayup-technologies",
    instagram: "https://instagram.com/aayuptechnologies",
    facebook: "https://facebook.com/aayuptechnologies",
    active: true,
  },
];

const LOCAL_STORAGE_TEAM = "aayup_dynamic_team_members";

export default function AdminTeam() {
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>(SEED_TEAM_MEMBERS);
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    department: "Engineering",
    badge: "Engineering",
    bio: "",
    avatar: "",
    email: "",
    linkedin: "",
    instagram: "",
    facebook: "",
    github: "",
    active: true,
  });

  // Dynamically derived unique departments + default options
  const departmentOptions = Array.from(
    new Set(["Leadership", "Engineering", "Design & UX", "Product & Ops", ...members.map((m) => m.department).filter(Boolean)])
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_TEAM);
        if (stored) {
          setMembers(JSON.parse(stored));
        } else {
          localStorage.setItem(LOCAL_STORAGE_TEAM, JSON.stringify(SEED_TEAM_MEMBERS));
        }
      } catch (e) {
        console.error("Failed to load team members", e);
      }
    }
  }, []);

  const persistMembers = (updated: TeamMember[]) => {
    setMembers(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCAL_STORAGE_TEAM, JSON.stringify(updated));
        window.dispatchEvent(new Event("team_members_updated"));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setFormData({
      name: "",
      role: "",
      department: "Engineering",
      badge: "Core Team",
      bio: "",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop",
      email: "",
      linkedin: "",
      instagram: "",
      facebook: "",
      github: "",
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (m: TeamMember) => {
    setEditingMember(m);
    setFormData({
      name: m.name,
      role: m.role,
      department: m.department,
      badge: m.badge,
      bio: m.bio,
      avatar: m.avatar || "",
      email: m.email || "",
      linkedin: m.linkedin || "",
      instagram: m.instagram || "",
      facebook: m.facebook || "",
      github: m.github || "",
      active: m.active ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.role.trim()) {
      toast({ title: "Validation Error", description: "Name and Designation are required", variant: "destructive" });
      return;
    }

    if (editingMember) {
      const updated = members.map((m) =>
        m.id === editingMember.id
          ? {
              ...m,
              name: formData.name,
              role: formData.role,
              department: formData.department,
              badge: formData.badge,
              bio: formData.bio,
              avatar: formData.avatar || undefined,
              email: formData.email || undefined,
              linkedin: formData.linkedin || undefined,
              instagram: formData.instagram || undefined,
              facebook: formData.facebook || undefined,
              github: formData.github || undefined,
              active: formData.active,
            }
          : m
      );
      persistMembers(updated);
      toast({ title: "Profile Updated", description: `${formData.name}'s details saved.` });
    } else {
      const newMember: TeamMember = {
        id: "member-" + Date.now(),
        name: formData.name,
        role: formData.role,
        department: formData.department,
        badge: formData.badge,
        bio: formData.bio,
        avatar: formData.avatar || undefined,
        email: formData.email || undefined,
        linkedin: formData.linkedin || undefined,
        instagram: formData.instagram || undefined,
        facebook: formData.facebook || undefined,
        github: formData.github || undefined,
        active: formData.active,
      };
      persistMembers([...members, newMember]);
      toast({ title: "Member Added", description: `${formData.name} added to the team.` });
    }

    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!memberToDelete) return;
    const updated = members.filter((m) => m.id !== memberToDelete.id);
    persistMembers(updated);
    toast({ title: "Removed", description: `${memberToDelete.name} has been removed.` });
    setIsDeleteDialogOpen(false);
    setMemberToDelete(null);
  };

  const handleToggleActive = (member: TeamMember) => {
    const updated = members.map((m) =>
      m.id === member.id ? { ...m, active: !m.active } : m
    );
    persistMembers(updated);
    toast({
      title: !member.active ? "Profile Displayed" : "Profile Hidden",
      description: `${member.name} is now ${!member.active ? "visible" : "hidden"} on the website.`,
    });
  };

  // Stats Calculations
  const totalMembers = members.length;
  const activeCount = members.filter((m) => m.active !== false).length;
  const leadershipCount = members.filter((m) => m.department === "Leadership").length;
  const engineeringCount = members.filter((m) => m.department === "Engineering").length;
  const designCount = members.filter((m) => m.department === "Design & UX").length;
  const opsCount = members.filter((m) => m.department === "Product & Ops").length;

  // Department Bar Chart Data
  const deptChartData = [
    { name: "Leadership", count: leadershipCount },
    { name: "Engineering", count: engineeringCount },
    { name: "Design / UX", count: designCount },
    { name: "Product & Ops", count: opsCount },
  ];

  // Department Donut Chart Data
  const donutChartData = [
    { name: "Leadership", value: leadershipCount, color: "#1769AA" },
    { name: "Engineering", value: engineeringCount, color: "#2D86C9" },
    { name: "Design & UX", value: designCount, color: "#10B981" },
    { name: "Product & Ops", value: opsCount, color: "#F59E0B" },
  ].filter((item) => item.value > 0);

  // Filtering
  const filteredMembers = members.filter((m) => {
    if (selectedDept !== "all" && m.department !== selectedDept) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.bio.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AdminLayout
      activePath="/admin/team"
      title="Team & Leadership Hub"
      subtitle="Manage architects, developers, designers, social profiles, and company leadership"
    >
      <div className="space-y-6">
        {/* TOP KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Team */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-[#1769AA]/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Team
                </p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{totalMembers}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1769AA] flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{activeCount}</span> Displayed on Homepage
            </div>
          </div>

          {/* Card 2: Engineering & Tech */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-sky-400/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Engineering & Tech
                </p>
                <h3 className="text-2xl font-black text-sky-600 mt-1">{engineeringCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                <Code className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-sky-700">
              <span>Full-Stack & Mobile Architects</span>
            </div>
          </div>

          {/* Card 3: Leadership & Design */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-indigo-400/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Leadership & Design
                </p>
                <h3 className="text-2xl font-black text-indigo-600 mt-1">
                  {leadershipCount + designCount}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-indigo-700">
              <span>{leadershipCount} Core Lead</span> • <span>{designCount} UI/UX Specialists</span>
            </div>
          </div>

          {/* Card 4: Quick Action */}
          <div className="bg-gradient-to-br from-[#0D4F85] to-[#1769AA] rounded-2xl p-5 shadow-sm text-white flex flex-col justify-between group hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-sky-200">
                  Team Showcase
                </p>
                <h3 className="text-lg font-bold mt-0.5">Add Team Member</h3>
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
              Add Member
            </button>
          </div>
        </div>

        {/* HIGH-CHART ANALYTICS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Members by Department */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Team Composition by Department</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Talent distribution across Software Engineering, UI/UX, Leadership, and Product Ops
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#1769AA] text-[11px] font-bold">
                Department Split
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: "#64748B", fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any) => [`${val} Members`, "Count"]}
                    contentStyle={{
                      backgroundColor: "#0D4F85",
                      borderRadius: "12px",
                      color: "#fff",
                      border: "none",
                      fontSize: "12px",
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
                    }}
                  />
                  <Bar dataKey="count" fill="url(#blueTeamGrad)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="blueTeamGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1769AA" />
                      <stop offset="100%" stopColor="#2D86C9" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Department Donut */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-slate-900">Talent Share</h3>
                <span className="text-xs font-bold text-slate-500">{totalMembers} Total</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">Ratio of core disciplines</p>
            </div>

            <div className="h-48 w-full flex items-center justify-center relative">
              {donutChartData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                      >
                        {donutChartData.map((entry, idx) => (
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
                    <span className="text-xl font-black text-slate-800">{activeCount}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Active
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-xs text-slate-400">No data</div>
              )}
            </div>

            <div className="space-y-1.5 pt-3 border-t border-slate-100">
              {donutChartData.map((item, idx) => (
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

        {/* CONTROLS HEADER & VIEW TOGGLE */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Department Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            {["all", ...departmentOptions].map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                  selectedDept === dept
                    ? "bg-[#1769AA] text-white shadow-md shadow-[#1769AA]/30"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {dept === "all" ? "All Departments" : dept}
              </button>
            ))}
          </div>

          {/* Search Bar + View Toggle + Add Button */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 md:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, role..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1769AA]/30"
              />
            </div>

            {/* Default Table vs Cards Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  viewMode === "table"
                    ? "bg-white text-[#1769AA] shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Table View (Default)"
              >
                <TableIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  viewMode === "cards"
                    ? "bg-white text-[#1769AA] shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Cards Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="py-2 px-4 rounded-xl bg-[#1769AA] text-white font-bold text-xs hover:bg-[#0D4F85] transition-colors flex items-center gap-1.5 shadow-md shadow-[#1769AA]/20 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Member
            </button>
          </div>
        </div>

        {/* VIEW MODE 1: DATA TABLE (DEFAULT) */}
        {viewMode === "table" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                    <TableHead className="font-bold text-slate-700 text-xs py-3.5">Member / Profile</TableHead>
                    <TableHead className="font-bold text-slate-700 text-xs py-3.5">Designation</TableHead>
                    <TableHead className="font-bold text-slate-700 text-xs py-3.5">Department</TableHead>
                    <TableHead className="font-bold text-slate-700 text-xs py-3.5">Social Profiles</TableHead>
                    <TableHead className="font-bold text-slate-700 text-xs py-3.5">Website Display</TableHead>
                    <TableHead className="font-bold text-slate-700 text-xs py-3.5 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id} className="hover:bg-slate-50/60 transition-colors">
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-tr from-[#1769AA] to-[#2D86C9] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                            {member.avatar ? (
                              <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                            ) : (
                              member.name.split(" ").map((n) => n[0]).slice(0, 2).join("")
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-xs block leading-tight">
                              {member.name}
                            </span>
                            <span className="text-[11px] text-slate-500 line-clamp-1 max-w-[220px]">
                              {member.bio}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <span className="text-xs font-semibold text-[#1769AA]">{member.role}</span>
                        <span className="text-[10px] text-slate-400 block">{member.badge}</span>
                      </TableCell>

                      <TableCell className="py-3">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          {member.department}
                        </span>
                      </TableCell>

                      <TableCell className="py-3">
                        <div className="flex items-center gap-1.5">
                          {member.linkedin ? (
                            <a
                              href={member.linkedin}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                              title="LinkedIn"
                            >
                              <Linkedin className="w-3.5 h-3.5" />
                            </a>
                          ) : null}
                          {member.instagram ? (
                            <a
                              href={member.instagram}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-pink-50 text-pink-700 hover:bg-pink-100 transition-colors"
                              title="Instagram"
                            >
                              <Instagram className="w-3.5 h-3.5" />
                            </a>
                          ) : null}
                          {member.facebook ? (
                            <a
                              href={member.facebook}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                              title="Facebook"
                            >
                              <Facebook className="w-3.5 h-3.5" />
                            </a>
                          ) : null}
                          {!member.linkedin && !member.instagram && !member.facebook && (
                            <span className="text-[11px] text-slate-400 italic">None added</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <button
                          onClick={() => handleToggleActive(member)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all ${
                            member.active !== false
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          {member.active !== false ? "● Visible Live" : "○ Hidden"}
                        </button>
                      </TableCell>

                      <TableCell className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(member)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Edit Profile"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setMemberToDelete(member);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Remove Member"
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
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:border-[#1769AA]/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1769AA] to-[#2D86C9] text-white flex items-center justify-center font-bold text-lg shadow-md group-hover:scale-105 transition-transform overflow-hidden">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        member.name.split(" ").map((n) => n[0]).slice(0, 2).join("")
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#1769AA]/10 text-[#1769AA]">
                        {member.badge}
                      </span>
                      <button
                        onClick={() => handleToggleActive(member)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          member.active !== false
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                        title="Toggle active display"
                      >
                        {member.active !== false ? "● Visible" : "○ Hidden"}
                      </button>
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 group-hover:text-[#1769AA] transition-colors">
                    {member.name}
                  </h4>
                  <p className="text-xs font-semibold text-[#1769AA] mt-0.5">
                    {member.role}
                  </p>
                  <p className="text-xs text-slate-500 mt-2.5 leading-relaxed line-clamp-3">
                    {member.bio}
                  </p>

                  {/* Social icons */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded-md text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {member.instagram && (
                      <a
                        href={member.instagram}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded-md text-slate-400 hover:text-pink-600 transition-colors"
                      >
                        <Instagram className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {member.facebook && (
                      <a
                        href={member.facebook}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded-md text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        <Facebook className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {member.department}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(member)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      title="Edit Profile"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setMemberToDelete(member);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove Member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredMembers.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">No Team Members Found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No profiles match your active department filter or search query.
            </p>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {editingMember ? "Edit Team Member" : "Add Team Member"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Manage executive leadership, software architects, picture, designation, and social links.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveMember} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Aayush Pandey"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] focus:outline-none transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>Department *</span>
                  <span className="text-[10px] font-normal text-slate-500">Select or type custom</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    list="team-dept-list"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. AI Research / Sales / QA"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs font-semibold focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] focus:outline-none transition-all shadow-sm"
                  />
                  <datalist id="team-dept-list">
                    {departmentOptions.map((d) => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Designation / Role *</label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Lead Software Architect"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] focus:outline-none transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Badge Pill</label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="e.g. Core Team / Engineering"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] focus:outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Profile Picture: Direct File Upload or Image URL */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800">
                  Profile Picture *
                </label>
                <span className="text-[11px] text-slate-500 font-medium">
                  Upload file or enter URL
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                {/* Upload Button */}
                <label className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:border-[#1769AA] text-slate-700 hover:text-[#1769AA] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Photo File</span>
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
                            setFormData((prev) => ({ ...prev, avatar: ev.target!.result as string }));
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
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://images.unsplash.com/... or /avatar.png"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] focus:outline-none shadow-sm"
                />

                {/* Image Preview Thumbnail */}
                {formData.avatar && (
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-300 shrink-0 shadow-xs relative group">
                    <img
                      src={formData.avatar}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover"
                      onError={(e: any) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Social Media Links: LinkedIn, Instagram, Facebook */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 block">Social Media Handles</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <Linkedin className="w-3 h-3 text-blue-700" /> LinkedIn
                  </label>
                  <input
                    type="text"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#1769AA]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <Instagram className="w-3 h-3 text-pink-600" /> Instagram
                  </label>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="https://instagram.com/..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#1769AA]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <Facebook className="w-3 h-3 text-indigo-700" /> Facebook
                  </label>
                  <input
                    type="text"
                    value={formData.facebook}
                    onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                    placeholder="https://facebook.com/..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#1769AA]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">Short Bio *</label>
              <textarea
                required
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Guides engineering, cloud platforms, and architecture..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] focus:outline-none transition-all shadow-sm leading-relaxed"
              />
            </div>

            <div className="flex items-center gap-2.5 pt-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                id="activeMemberCheck"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 rounded text-[#1769AA] focus:ring-[#1769AA] cursor-pointer"
              />
              <label htmlFor="activeMemberCheck" className="text-xs font-semibold text-slate-800 cursor-pointer select-none">
                Display profile live in Homepage Team Section
              </label>
            </div>

            <DialogFooter className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-sm hover:border-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#1769AA] hover:bg-[#0D4F85] text-white text-xs font-bold transition-all shadow-md shadow-[#1769AA]/20 active:scale-95"
              >
                {editingMember ? "Save Profile" : "Add Member"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Remove Team Member?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Are you sure you want to remove{" "}
              <strong className="text-slate-800">"{memberToDelete?.name}"</strong> from the website?
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
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
