"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { getDynamicData, saveDynamicData } from "@/lib/dynamicDataService";
import {
  HelpCircle,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Code,
  Wrench,
  ChevronDown,
  Layers,
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

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  active?: boolean;
}

const SEED_FAQS: FAQItem[] = [
  {
    id: "faq-timeline-1",
    category: "Timeline & Delivery",
    question: "How long does it take to design and launch a website or application?",
    answer:
      "A standard corporate or business landing website typically takes 7 to 14 working days. Complex custom eCommerce or web portals usually take 3 to 6 weeks, while enterprise custom CRM/ERP platforms take 6 to 12 weeks depending on modular scope. We provide an exact sprint timeline before beginning.",
    active: true,
  },
  {
    id: "faq-code-1",
    category: "Code & Ownership",
    question: "Do I get 100% full ownership of the source code and designs?",
    answer:
      "Yes, absolutely. Once final delivery and milestone clearance take place, 100% intellectual property (IP), source code (GitHub/GitLab repository), database access, and Figma/design assets are transferred directly to your organization. There are zero hidden locks or vendor lock-in.",
    active: true,
  },
  {
    id: "faq-pricing-1",
    category: "Pricing & Payment",
    question: "What are your payment terms and milestones?",
    answer:
      "We operate strictly on milestone-based transparent phases: typically 30% advance on project kickoff, 40% after prototype/staging approval, and the final 30% upon final launch and code handover. For large enterprise builds, we structure bi-weekly sprint deliverables.",
    active: true,
  },
  {
    id: "faq-support-1",
    category: "Support & Tech",
    question: "What post-launch support and maintenance do you provide?",
    answer:
      "Every project delivered by AAYUP Technologies includes 30 days of complimentary technical warranty and bug-fixing support. After 30 days, we offer affordable Monthly Retainer Maintenance (AMC) plans covering security updates, server monitoring, backups, and feature iterations.",
    active: true,
  },
  {
    id: "faq-timeline-2",
    category: "Timeline & Delivery",
    question: "Can we sign a Non-Disclosure Agreement (NDA) before discussing details?",
    answer:
      "Yes. Client confidentiality and project secrecy are strictly respected. We can sign a standard mutual NDA before you share your proprietary project briefs, wireframes, or business logic.",
    active: true,
  },
  {
    id: "faq-support-2",
    category: "Support & Tech",
    question: "Will my website/app be mobile-friendly, secure, and fast?",
    answer:
      "Yes. Every build undergoes rigorous responsive testing across iPhones, Androids, tablets, and desktops. We use modern Next.js 15, TailwindCSS, SSL encryption, CDN caching, and database sanitation to ensure 90+ PageSpeed scores and bank-grade data security.",
    active: true,
  },
];

const LOCAL_STORAGE_FAQS = "aayup_dynamic_faqs";

export default function AdminFaqs() {
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<FAQItem[]>(SEED_FAQS);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [viewingFaq, setViewingFaq] = useState<FAQItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<FAQItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    category: "Timeline & Delivery",
    question: "",
    answer: "",
    active: true,
  });

  // Dynamically derived FAQ categories + default options
  const faqCategoryOptions = Array.from(
    new Set([
      "Timeline & Delivery",
      "Pricing & Payment",
      "Code & Ownership",
      "Support & Tech",
      ...faqs.map((f) => f.category).filter(Boolean),
    ])
  );

  useEffect(() => {
    let isMounted = true;
    getDynamicData<FAQItem[]>(LOCAL_STORAGE_FAQS, SEED_FAQS).then((data) => {
      if (isMounted && data) {
        setFaqs(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const persistFaqs = async (updated: FAQItem[]) => {
    setFaqs(updated);
    await saveDynamicData(LOCAL_STORAGE_FAQS, updated);
  };

  const handleOpenAddModal = () => {
    setEditingFaq(null);
    setFormData({
      category: "Timeline & Delivery",
      question: "",
      answer: "",
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (faq: FAQItem) => {
    setEditingFaq(faq);
    setFormData({
      category: faq.category,
      question: faq.question,
      answer: faq.answer,
      active: faq.active ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast({ title: "Validation Error", description: "Question and Answer are required", variant: "destructive" });
      return;
    }

    if (editingFaq) {
      const updated = faqs.map((f) =>
        f.id === editingFaq.id
          ? {
              ...f,
              category: formData.category,
              question: formData.question,
              answer: formData.answer,
              active: formData.active,
            }
          : f
      );
      persistFaqs(updated);
      toast({ title: "FAQ Updated", description: "The FAQ has been updated successfully." });
    } else {
      const newFaq: FAQItem = {
        id: "faq-" + Date.now(),
        category: formData.category,
        question: formData.question,
        answer: formData.answer,
        active: formData.active,
      };
      persistFaqs([newFaq, ...faqs]);
      toast({ title: "FAQ Created", description: "New FAQ published to the knowledgebase." });
    }

    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!faqToDelete) return;
    const updated = faqs.filter((f) => f.id !== faqToDelete.id);
    persistFaqs(updated);
    toast({ title: "Deleted", description: "The FAQ item has been removed." });
    setIsDeleteDialogOpen(false);
    setFaqToDelete(null);
  };

  const handleToggleActive = (faq: FAQItem) => {
    const updated = faqs.map((f) =>
      f.id === faq.id ? { ...f, active: !f.active } : f
    );
    persistFaqs(updated);
    toast({
      title: !faq.active ? "FAQ Activated" : "FAQ Deactivated",
      description: `"${faq.question.slice(0, 30)}…" is now ${!faq.active ? "visible" : "hidden"} on the website.`,
    });
  };

  // Stats Calculations
  const totalFaqs = faqs.length;
  const activeCount = faqs.filter((f) => f.active !== false).length;
  const hiddenCount = totalFaqs - activeCount;
  const timelineCount = faqs.filter((f) => f.category === "Timeline & Delivery").length;
  const pricingCount = faqs.filter((f) => f.category === "Pricing & Payment").length;
  const codeCount = faqs.filter((f) => f.category === "Code & Ownership").length;
  const supportCount = faqs.filter((f) => f.category === "Support & Tech").length;

  // Category Bar Chart Data
  const categoryChartData = [
    { name: "Timeline", count: timelineCount },
    { name: "Pricing", count: pricingCount },
    { name: "Code & IP", count: codeCount },
    { name: "Support", count: supportCount },
  ];

  // Category Donut Chart Data
  const donutChartData = [
    { name: "Timeline & Delivery", value: timelineCount, color: "#1769AA" },
    { name: "Pricing & Payment", value: pricingCount, color: "#2D86C9" },
    { name: "Code & Ownership", value: codeCount, color: "#10B981" },
    { name: "Support & Tech", value: supportCount, color: "#F59E0B" },
  ].filter((item) => item.value > 0);

  // Filtering
  const filteredFaqs = faqs.filter((faq) => {
    if (selectedCategory !== "all" && faq.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        faq.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AdminLayout
      activePath="/admin/faqs"
      title="FAQ Knowledgebase Manager"
      subtitle="Manage client questions, payment terms, intellectual property, and technical delivery guarantees"
    >
      <div className="space-y-6">
        {/* TOP KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total FAQs */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-[#1769AA]/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Questions
                </p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{totalFaqs}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1769AA] flex items-center justify-center font-bold">
                <HelpCircle className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{activeCount}</span> Active on Homepage
            </div>
          </div>

          {/* Card 2: Timeline & Pricing */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-sky-400/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Timeline & Pricing
                </p>
                <h3 className="text-2xl font-black text-sky-600 mt-1">
                  {timelineCount + pricingCount}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-sky-700">
              <span>{timelineCount} Timeline</span> • <span>{pricingCount} Pricing</span>
            </div>
          </div>

          {/* Card 3: Code Ownership & Support */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-emerald-400/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Code Ownership & Tech
                </p>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">
                  {codeCount + supportCount}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700">
              <span>{codeCount} IP Rights</span> • <span>{supportCount} Support/AMC</span>
            </div>
          </div>

          {/* Card 4: Quick Add Action */}
          <div className="bg-gradient-to-br from-[#0D4F85] to-[#1769AA] rounded-2xl p-5 shadow-sm text-white flex flex-col justify-between group hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-sky-200">
                  Knowledgebase
                </p>
                <h3 className="text-lg font-bold mt-0.5">Add New FAQ</h3>
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
              Create FAQ
            </button>
          </div>
        </div>

        {/* HIGH-CHART ANALYTICS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Questions by Category */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Knowledgebase Distribution</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Volume of questions answered across client trust and operational categories
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#1769AA] text-[11px] font-bold">
                Category Split
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: "#64748B", fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any) => [`${val} Questions`, "Count"]}
                    contentStyle={{
                      backgroundColor: "#0D4F85",
                      borderRadius: "12px",
                      color: "#fff",
                      border: "none",
                      fontSize: "12px",
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
                    }}
                  />
                  <Bar dataKey="count" fill="url(#blueFaqGrad)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="blueFaqGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1769AA" />
                      <stop offset="100%" stopColor="#2D86C9" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Category Donut Ratio */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-slate-900">Category Share</h3>
                <span className="text-xs font-bold text-slate-500">{totalFaqs} Total</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">Proportion of topics covered</p>
            </div>

            <div className="h-48 w-full flex items-center justify-center relative">
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

        {/* CONTROLS HEADER */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Category Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            {["all", ...faqCategoryOptions].map((cat) => (
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

          {/* Search Bar + Create Button */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions or answers..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1769AA]/30"
              />
            </div>

            <button
              onClick={handleOpenAddModal}
              className="py-2 px-4 rounded-xl bg-[#1769AA] text-white font-bold text-xs hover:bg-[#0D4F85] transition-colors flex items-center gap-1.5 shadow-md shadow-[#1769AA]/20 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add FAQ
            </button>
          </div>
        </div>

        {/* FAQS ACCORDION / LIST */}
        <div className="space-y-3">
          {filteredFaqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-[#1769AA]/40 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-[#1769AA] font-bold text-[10px] uppercase">
                    {faq.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      faq.active !== false
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {faq.active !== false ? "● Visible" : "○ Hidden"}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {faq.question}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {faq.answer}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-start shrink-0 pt-2 md:pt-0">
                <button
                  onClick={() => handleToggleActive(faq)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    faq.active !== false
                      ? "text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200"
                      : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                  }`}
                  title="Toggle visibility"
                >
                  {faq.active !== false ? "Hide" : "Show"}
                </button>
                <button
                  onClick={() => handleOpenEditModal(faq)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                  title="Edit FAQ"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setFaqToDelete(faq);
                    setIsDeleteDialogOpen(true);
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete FAQ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {filteredFaqs.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-800">No Questions Found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No FAQ matched your active category filter or search query.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl rounded-2xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {editingFaq ? "Edit FAQ" : "Add New FAQ"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Create answers for prospective clients regarding delivery, payment, IP, or technical support.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveFaq} className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                <span>Category *</span>
                <span className="text-[10px] font-normal text-slate-500">Select or type custom</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  list="faq-category-list"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Security & Compliance / AI Solutions"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs font-semibold focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] focus:outline-none transition-all shadow-sm"
                />
                <datalist id="faq-category-list">
                  {faqCategoryOptions.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Question *</label>
              <input
                type="text"
                required
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="e.g. Do I receive full ownership of the source code?"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#1769AA]/30 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Answer *</label>
              <textarea
                required
                rows={5}
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                placeholder="Clear, authoritative explanation addressing client inquiries..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#1769AA]/30 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="activeCheck"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="rounded text-[#1769AA] focus:ring-[#1769AA]"
              />
              <label htmlFor="activeCheck" className="text-xs font-semibold text-slate-700">
                Display live in homepage FAQ accordion
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
                {editingFaq ? "Save Changes" : "Create FAQ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Delete FAQ Question?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Are you sure you want to delete this FAQ question? It will be removed from the public website.
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
              Delete FAQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
