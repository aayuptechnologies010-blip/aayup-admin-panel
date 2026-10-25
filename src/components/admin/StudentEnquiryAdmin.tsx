import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  Calendar,
  User,
  CheckCircle,
  PhoneCall,
  Trash2,
  Briefcase,
  Users,
  Target,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface StudentApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  college_university: string;
  degree: string;
  year_of_study: string;
  program_type: string;
  status: string;
  notes?: string;
  created_at: string;
}

const StudentEnquiryAdmin = () => {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<string | null>(
    null
  );
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("student_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setApplications(data || []);
    } catch (error: any) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("student_applications")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setApplications(
        applications.map((app) =>
          app.id === id ? { ...app, status: newStatus } : app
        )
      );

      toast({
        title: "Status Updated",
        description: `Application marked as ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!applicationToDelete) return;

    try {
      const { error } = await supabase
        .from("student_applications")
        .delete()
        .eq("id", applicationToDelete);

      if (error) throw error;

      setApplications(
        applications.filter((app) => app.id !== applicationToDelete)
      );

      toast({
        title: "Success",
        description: "Application deleted successfully",
      });

      setIsDeleteDialogOpen(false);
      setApplicationToDelete(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete application",
        variant: "destructive",
      });
    }
  };

  const getProgramIcon = (programType: string) => {
    switch (programType) {
      case "internship":
        return Briefcase;
      case "training":
        return BookOpen;
      case "workshop":
        return Users;
      case "mentorship":
        return Target;
      default:
        return GraduationCap;
    }
  };

  const getProgramColor = (programType: string) => {
    switch (programType) {
      case "internship":
        return "from-blue-500 to-cyan-500";
      case "training":
        return "from-purple-500 to-pink-500";
      case "workshop":
        return "from-orange-500 to-red-500";
      case "mentorship":
        return "from-green-500 to-teal-500";
      default:
        return "from-primary to-secondary";
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredApplications = applications.filter((app) => {
    if (statusFilter !== "all" && app.status !== statusFilter) return false;
    if (programFilter !== "all" && app.program_type !== programFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = app.full_name?.toLowerCase().includes(q);
      const matchEmail = app.email?.toLowerCase().includes(q);
      const matchCollege = app.college_university?.toLowerCase().includes(q);
      const matchPhone = app.phone?.toLowerCase().includes(q);
      return matchName || matchEmail || matchCollege || matchPhone;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage) || 1;
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 border border-amber-200/80";
      case "reviewing":
        return "bg-sky-50 text-sky-700 border border-sky-200/80";
      case "called":
        return "bg-purple-50 text-purple-700 border border-purple-200/80";
      case "shortlisted":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200/80";
      case "accepted":
        return "bg-emerald-100 text-emerald-800 border border-emerald-300";
      case "rejected":
        return "bg-rose-50 text-rose-700 border border-rose-200/80";
      default:
        return "bg-slate-50 text-slate-700 border border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-[#1769AA]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, email, college or phone..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-800 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] transition-all font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1769AA]/30"
          >
            <option value="all">All Statuses ({applications.length})</option>
            <option value="pending">Pending ({applications.filter(a => a.status === 'pending').length})</option>
            <option value="reviewing">Reviewed ({applications.filter(a => a.status === 'reviewing').length})</option>
            <option value="called">Called ({applications.filter(a => a.status === 'called').length})</option>
            <option value="shortlisted">Shortlisted ({applications.filter(a => a.status === 'shortlisted').length})</option>
            <option value="accepted">Accepted ({applications.filter(a => a.status === 'accepted').length})</option>
            <option value="rejected">Rejected ({applications.filter(a => a.status === 'rejected').length})</option>
          </select>

          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1769AA]/30"
          >
            <option value="all">All Programs</option>
            <option value="internship">Internship</option>
            <option value="training">Training</option>
            <option value="workshop">Workshop</option>
            <option value="mentorship">Mentorship</option>
          </select>

          {(searchQuery || statusFilter !== 'all' || programFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setProgramFilter("all");
              }}
              className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              Reset Filters
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
                <th className="py-3.5 px-4 font-bold text-[#0D4F85] uppercase tracking-wider">Student Name</th>
                <th className="py-3.5 px-4 font-bold text-[#0D4F85] uppercase tracking-wider">Program & College</th>
                <th className="py-3.5 px-4 font-bold text-[#0D4F85] uppercase tracking-wider">Degree & Year</th>
                <th className="py-3.5 px-4 font-bold text-[#0D4F85] uppercase tracking-wider">Status</th>
                <th className="py-3.5 px-4 font-bold text-[#0D4F85] uppercase tracking-wider">Applied Date</th>
                <th className="py-3.5 px-4 font-bold text-[#0D4F85] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedApplications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No student applications found for the selected criteria.
                  </td>
                </tr>
              ) : (
                paginatedApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-sky-50/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#1769AA]/10 text-[#1769AA] font-bold text-xs flex items-center justify-center shrink-0">
                          {(app.full_name?.[0] || "S").toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs sm:text-sm">{app.full_name}</div>
                          <div className="text-[11px] text-slate-500 font-medium">{app.email}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{app.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <span className="inline-block w-fit px-2.5 py-0.5 rounded-full bg-sky-50 text-[#0D4F85] font-bold text-[10px] border border-sky-100 uppercase tracking-wider">
                          {app.program_type}
                        </span>
                        <span className="text-slate-700 font-semibold truncate max-w-[200px]" title={app.college_university}>
                          {app.college_university}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      <div>{app.degree}</div>
                      <div className="text-[11px] text-slate-400">Year: {app.year_of_study}</div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={app.status}
                        onChange={(e) => updateStatus(app.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border focus:outline-none cursor-pointer uppercase tracking-wider ${getStatusColor(app.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="called">Called</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-medium whitespace-nowrap">
                      {new Date(app.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`tel:${app.phone}`}
                          title="Call Candidate"
                          className="w-7 h-7 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 flex items-center justify-center transition-colors"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`mailto:${app.email}`}
                          title="Email Candidate"
                          className="w-7 h-7 rounded-lg text-slate-500 hover:text-[#1769AA] hover:bg-sky-50 flex items-center justify-center transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => {
                            setApplicationToDelete(app.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          title="Delete Application"
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
        {/* Pagination bar */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <div>
            Showing <span className="font-bold text-slate-800">{filteredApplications.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-800">{Math.min(currentPage * itemsPerPage, filteredApplications.length)}</span> of <span className="font-bold text-slate-800">{filteredApplications.length}</span> enquiries
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
            <span className="px-3 py-1 font-bold text-slate-800">{currentPage} / {totalPages}</span>
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
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this application? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
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

export default StudentEnquiryAdmin;
