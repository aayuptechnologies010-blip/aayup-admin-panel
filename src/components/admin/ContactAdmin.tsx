import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Mail,
  User,
  MessageSquare,
  Calendar,
  Phone,
  Building,
  CheckCircle,
  Eye,
  Trash2,
  HelpCircle,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: string;
  created_at: string;
}

interface EnquirySubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service_type: string;
  project_description: string;
  status: string;
  notes?: string;
  created_at: string;
}

const ContactAdmin = () => {
  const [activeTab, setActiveTab] = useState<"contact" | "enquiry">("contact");
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [enquiries, setEnquiries] = useState<EnquirySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: "contact" | "enquiry" } | null>(null);
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [contactsResult, enquiriesResult] = await Promise.all([
        supabase.from("contact").select("*").order("created_at", { ascending: false }),
        supabase.from("enquiry").select("*").order("created_at", { ascending: false }),
      ]);

      if (contactsResult.error) throw contactsResult.error;
      if (enquiriesResult.error) throw enquiriesResult.error;

      setContacts(contactsResult.data || []);
      setEnquiries(enquiriesResult.data || []);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load submissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateContactStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("contact").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
      setContacts(contacts.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
      toast({ title: "Status Updated", description: `Marked as ${newStatus}` });
    } catch {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const updateEnquiryStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("enquiry").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
      setEnquiries(enquiries.map((e) => (e.id === id ? { ...e, status: newStatus } : e)));
      toast({ title: "Status Updated", description: `Marked as ${newStatus}` });
    } catch {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const { error } = await supabase.from(itemToDelete.type).delete().eq("id", itemToDelete.id);
      if (error) throw error;
      if (itemToDelete.type === "contact") {
        setContacts(contacts.filter((c) => c.id !== itemToDelete.id));
      } else {
        setEnquiries(enquiries.filter((e) => e.id !== itemToDelete.id));
      }
      toast({ title: "Success", description: "Item deleted successfully" });
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch {
      toast({ title: "Error", description: "Failed to delete item", variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-sky-50 text-sky-700 border border-sky-200/80";
      case "in_progress":
      case "reviewing":
        return "bg-amber-50 text-amber-700 border border-amber-200/80";
      case "resolved":
      case "quoted":
      case "accepted":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200/80";
      case "closed":
        return "bg-slate-50 text-slate-700 border border-slate-200";
      default:
        return "bg-slate-50 text-slate-700 border border-slate-200";
    }
  };

  const filteredContacts = contacts.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q) || c.message?.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredEnquiries = enquiries.filter((e) => {
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return e.name?.toLowerCase().includes(q) || e.email?.toLowerCase().includes(q) || e.company?.toLowerCase().includes(q) || e.service_type?.toLowerCase().includes(q) || e.project_description?.toLowerCase().includes(q);
    }
    return true;
  });

  const activeList = activeTab === "contact" ? filteredContacts : filteredEnquiries;
  const totalPages = Math.ceil(activeList.length / itemsPerPage) || 1;
  const paginatedList = activeList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-[#1769AA]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tab Switcher & Search Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Tab Pills */}
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-full md:w-auto border border-slate-200">
          <button
            onClick={() => {
              setActiveTab("contact");
              setCurrentPage(1);
            }}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-bold text-xs transition-all ${
              activeTab === "contact"
                ? "bg-[#1769AA] text-white shadow-md shadow-[#1769AA]/30"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            General Contacts ({contacts.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("enquiry");
              setCurrentPage(1);
            }}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-bold text-xs transition-all ${
              activeTab === "enquiry"
                ? "bg-[#1769AA] text-white shadow-md shadow-[#1769AA]/30"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Project Queries ({enquiries.length})
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-1 md:max-w-md items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={`Search in ${activeTab === "contact" ? "contacts" : "project queries"}...`}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1769AA]/30"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1769AA]/30 shrink-0"
          >
            <option value="all">All Status</option>
            {activeTab === "contact" ? (
              <>
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </>
            ) : (
              <>
                <option value="new">New</option>
                <option value="reviewing">Reviewing</option>
                <option value="quoted">Quoted</option>
                <option value="accepted">Accepted</option>
                <option value="closed">Closed</option>
              </>
            )}
          </select>

          {(searchQuery || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setCurrentPage(1);
              }}
              className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-2 py-2 rounded-lg"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Chakra-style Responsive Data Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4 font-bold text-[#0D4F85] uppercase tracking-wider">
                  Contact / Inquirer
                </th>
                <th className="py-3.5 px-4 font-bold text-[#0D4F85] uppercase tracking-wider">
                  {activeTab === "contact" ? "Phone & Info" : "Company & Service"}
                </th>
                <th className="py-3.5 px-4 font-bold text-[#0D4F85] uppercase tracking-wider">
                  Message / Requirements
                </th>
                <th className="py-3.5 px-4 font-bold text-[#0D4F85] uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3.5 px-4 font-bold text-[#0D4F85] uppercase tracking-wider">
                  Date
                </th>
                <th className="py-3.5 px-4 font-bold text-[#0D4F85] uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No submissions found for the selected criteria.
                  </td>
                </tr>
              ) : (
                paginatedList.map((item: any) => (
                  <tr key={item.id} className="hover:bg-sky-50/40 transition-colors">
                    {/* User info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#1769AA]/10 text-[#1769AA] font-bold text-xs flex items-center justify-center shrink-0">
                          {(item.name?.[0] || "U").toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs sm:text-sm">{item.name}</div>
                          <div className="text-[11px] text-slate-500 font-medium">{item.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Second column */}
                    <td className="py-3 px-4">
                      {activeTab === "contact" ? (
                        <div className="text-slate-600 font-mono text-[11px]">
                          {item.phone || "No phone provided"}
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="inline-block px-2 py-0.5 rounded bg-sky-50 text-[#0D4F85] text-[10px] font-bold border border-sky-100">
                            {item.service_type || "General Inquiry"}
                          </span>
                          {item.company && (
                            <div className="text-[11px] text-slate-500 font-medium">🏢 {item.company}</div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Message */}
                    <td className="py-3 px-4 max-w-[280px]">
                      <p className="text-slate-600 line-clamp-2 leading-relaxed" title={item.message || item.project_description}>
                        {item.message || item.project_description}
                      </p>
                    </td>

                    {/* Status dropdown */}
                    <td className="py-3 px-4">
                      {activeTab === "contact" ? (
                        <select
                          value={item.status}
                          onChange={(e) => updateContactStatus(item.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border focus:outline-none cursor-pointer uppercase tracking-wider ${getStatusColor(
                            item.status
                          )}`}
                        >
                          <option value="new">New</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      ) : (
                        <select
                          value={item.status}
                          onChange={(e) => updateEnquiryStatus(item.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border focus:outline-none cursor-pointer uppercase tracking-wider ${getStatusColor(
                            item.status
                          )}`}
                        >
                          <option value="new">New</option>
                          <option value="reviewing">Reviewing</option>
                          <option value="quoted">Quoted</option>
                          <option value="accepted">Accepted</option>
                          <option value="closed">Closed</option>
                        </select>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-500 font-medium whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {item.phone && (
                          <a
                            href={`tel:${item.phone}`}
                            title="Call Submitter"
                            className="w-7 h-7 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 flex items-center justify-center transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <a
                          href={`mailto:${item.email}`}
                          title="Reply via Email"
                          className="w-7 h-7 rounded-lg text-slate-500 hover:text-[#1769AA] hover:bg-sky-50 flex items-center justify-center transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => {
                            setItemToDelete({ id: item.id, type: activeTab });
                            setIsDeleteDialogOpen(true);
                          }}
                          title="Delete Submission"
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

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <div>
            Showing{" "}
            <span className="font-bold text-slate-800">
              {activeList.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold text-slate-800">
              {Math.min(currentPage * itemsPerPage, activeList.length)}
            </span>{" "}
            of <span className="font-bold text-slate-800">{activeList.length}</span> submissions
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Submission</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this submission? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactAdmin;
