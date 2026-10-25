import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Mail,
  User,
  Star,
  Calendar,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Testimonial {
  id: string;
  name: string;
  email: string;
  position: string;
  company?: string;
  avatar_url?: string;
  testimonial: string;
  rating: number;
  approved: boolean;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
}

const ITEMS_PER_PAGE = 7;

const TestimonalAdmin = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'approved' | 'pending' | 'featured'
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingTestimonial, setViewingTestimonial] = useState<Testimonial | null>(null);

  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error: any) {
      console.error("Error fetching testimonials:", error);
      toast({
        title: "Error",
        description: "Failed to load testimonials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("testimonials")
        .update({
          approved: !currentStatus,
          is_active: !currentStatus,
        })
        .eq("id", id);

      if (error) throw error;

      setTestimonials((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, approved: !currentStatus, is_active: !currentStatus } : t
        )
      );

      toast({
        title: "Success",
        description: `Testimonial ${!currentStatus ? "approved" : "unapproved"}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update testimonial status",
        variant: "destructive",
      });
    }
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("testimonials")
        .update({ is_featured: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      setTestimonials((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, is_featured: !currentStatus } : t
        )
      );

      toast({
        title: "Success",
        description: `Testimonial ${!currentStatus ? "featured" : "unfeatured"}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update featured status",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingTestimonial) return;

    try {
      const { error } = await supabase
        .from("testimonials")
        .update({
          name: editingTestimonial.name,
          email: editingTestimonial.email,
          position: editingTestimonial.position,
          company: editingTestimonial.company,
          testimonial: editingTestimonial.testimonial,
          rating: editingTestimonial.rating,
        })
        .eq("id", editingTestimonial.id);

      if (error) throw error;

      setTestimonials((prev) =>
        prev.map((t) => (t.id === editingTestimonial.id ? editingTestimonial : t))
      );

      toast({
        title: "Success",
        description: "Testimonial updated successfully",
      });

      setIsEditDialogOpen(false);
      setEditingTestimonial(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update testimonial",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!testimonialToDelete) return;

    try {
      const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", testimonialToDelete);

      if (error) throw error;

      setTestimonials((prev) => prev.filter((t) => t.id !== testimonialToDelete));

      toast({
        title: "Success",
        description: "Testimonial deleted successfully",
      });

      setIsDeleteDialogOpen(false);
      setTestimonialToDelete(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete testimonial",
        variant: "destructive",
      });
    }
  };

  // Filtered testimonials
  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.name?.toLowerCase().includes(q) ||
        item.email?.toLowerCase().includes(q) ||
        item.company?.toLowerCase().includes(q) ||
        item.position?.toLowerCase().includes(q) ||
        item.testimonial?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "approved" && item.approved) ||
        (statusFilter === "pending" && !item.approved) ||
        (statusFilter === "featured" && item.is_featured);

      return matchesSearch && matchesStatus;
    });
  }, [testimonials, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredTestimonials.length / ITEMS_PER_PAGE) || 1;
  const paginatedTestimonials = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTestimonials.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTestimonials, currentPage]);

  const approvedCount = testimonials.filter((f) => f.approved).length;
  const featuredCount = testimonials.filter((f) => f.is_featured).length;
  const pendingCount = testimonials.filter((f) => !f.approved).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-9 h-9 animate-spin text-[#1769AA]" />
        <p className="text-sm font-medium text-slate-500">Loading testimonials data table...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & KPI Summary */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Testimonials Management</h2>
          <p className="text-sm text-slate-500">
            Review client reviews, toggle public approval, and highlight featured ratings in Chakra UI table view.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-100 text-xs font-semibold text-[#0D4F85]">
            Total: <span className="font-bold">{testimonials.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-700">
            Approved: <span className="font-bold">{approvedCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100 text-xs font-semibold text-amber-700">
            Featured: <span className="font-bold">{featuredCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-100 text-xs font-semibold text-rose-700">
            Pending: <span className="font-bold">{pendingCount}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by client name, email, company, or feedback text..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 h-10 border-slate-200 focus-visible:ring-[#1769AA]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-lg border border-slate-200 text-xs font-medium">
            <button
              onClick={() => {
                setStatusFilter("all");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-md transition-all ${
                statusFilter === "all"
                  ? "bg-white text-[#0D4F85] shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({testimonials.length})
            </button>
            <button
              onClick={() => {
                setStatusFilter("approved");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-md transition-all ${
                statusFilter === "approved"
                  ? "bg-emerald-600 text-white shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Approved ({approvedCount})
            </button>
            <button
              onClick={() => {
                setStatusFilter("featured");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-md transition-all ${
                statusFilter === "featured"
                  ? "bg-amber-500 text-white shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Featured ({featuredCount})
            </button>
            <button
              onClick={() => {
                setStatusFilter("pending");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-md transition-all ${
                statusFilter === "pending"
                  ? "bg-rose-500 text-white shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Pending ({pendingCount})
            </button>
          </div>
        </div>
      </div>

      {/* Chakra UI-style Responsive Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/90 border-b border-slate-200">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[240px] text-xs font-bold uppercase tracking-wider text-[#0D4F85] py-3.5 pl-6">
                  Client & Role
                </TableHead>
                <TableHead className="w-[140px] text-xs font-bold uppercase tracking-wider text-[#0D4F85] py-3.5">
                  Rating
                </TableHead>
                <TableHead className="min-w-[280px] text-xs font-bold uppercase tracking-wider text-[#0D4F85] py-3.5">
                  Testimonial Feedback
                </TableHead>
                <TableHead className="w-[140px] text-xs font-bold uppercase tracking-wider text-[#0D4F85] py-3.5">
                  Status
                </TableHead>
                <TableHead className="w-[130px] text-xs font-bold uppercase tracking-wider text-[#0D4F85] py-3.5">
                  Date
                </TableHead>
                <TableHead className="w-[150px] text-right text-xs font-bold uppercase tracking-wider text-[#0D4F85] py-3.5 pr-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTestimonials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium">No testimonials found matching your filter criteria.</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try adjusting your search query or status filter.</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTestimonials.map((item) => (
                  <TableRow key={item.id} className="hover:bg-sky-50/30 transition-colors border-b border-slate-100">
                    {/* Client & Role */}
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.avatar_url ? (
                          <img
                            src={item.avatar_url}
                            alt={item.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#1769AA]/10 text-[#1769AA] font-bold flex items-center justify-center text-sm border border-[#1769AA]/20">
                            {item.name ? item.name.charAt(0).toUpperCase() : "U"}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 text-sm truncate flex items-center gap-1.5">
                            {item.name}
                            {item.is_featured && (
                              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                            )}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {item.position || "Client"}
                            {item.company ? ` • ${item.company}` : ""}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" />
                            <a href={`mailto:${item.email}`} className="hover:text-[#1769AA] truncate">
                              {item.email}
                            </a>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Rating */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= item.rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-200 fill-slate-200"
                            }`}
                          />
                        ))}
                        <span className="text-xs font-bold text-slate-700 ml-1.5">{item.rating}/5</span>
                      </div>
                    </TableCell>

                    {/* Testimonial Feedback */}
                    <TableCell className="py-4 max-w-sm">
                      <p
                        className="text-xs text-slate-600 line-clamp-2 italic cursor-pointer hover:text-slate-900"
                        title={item.testimonial}
                        onClick={() => setViewingTestimonial(item)}
                      >
                        "{item.testimonial}"
                      </p>
                    </TableCell>

                    {/* Status & Badges */}
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <button
                          onClick={() => toggleApproval(item.id, item.approved)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all ${
                            item.approved
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                          }`}
                        >
                          {item.approved ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              Approved
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-600" />
                              Pending
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => toggleFeatured(item.id, item.is_featured)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                            item.is_featured
                              ? "bg-amber-100 text-amber-800 font-bold"
                              : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <Star className={`w-3 h-3 ${item.is_featured ? "fill-amber-500 text-amber-500" : ""}`} />
                          {item.is_featured ? "Featured" : "Standard"}
                        </button>
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="py-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                          title="Edit Testimonial"
                          className="h-8 w-8 text-slate-600 hover:text-[#0D4F85] hover:bg-sky-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setTestimonialToDelete(item.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          title="Delete Testimonial"
                          className="h-8 w-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Chakra-style Pagination Footer */}
        <div className="px-6 py-3.5 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {filteredTestimonials.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-900">
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredTestimonials.length)}
            </span>{" "}
            of <span className="font-semibold text-slate-900">{filteredTestimonials.length}</span> entries
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="h-8 px-2.5 text-xs bg-white hover:bg-slate-50 border-slate-200"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Previous
            </Button>

            <span className="px-3 py-1 font-semibold text-slate-700 bg-white border border-slate-200 rounded-md">
              {currentPage} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="h-8 px-2.5 text-xs bg-white hover:bg-slate-50 border-slate-200"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Read Full Testimonial Modal */}
      {viewingTestimonial && (
        <Dialog open={!!viewingTestimonial} onOpenChange={() => setViewingTestimonial(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>{viewingTestimonial.name}</span>
                <span className="text-xs font-normal text-slate-500">
                  ({viewingTestimonial.position || "Client"}
                  {viewingTestimonial.company ? `, ${viewingTestimonial.company}` : ""})
                </span>
              </DialogTitle>
              <DialogDescription>Full testimonial feedback submission</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= viewingTestimonial.rating
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-200 fill-slate-200"
                    }`}
                  />
                ))}
                <span className="text-xs font-bold text-slate-700 ml-2">{viewingTestimonial.rating} of 5 Stars</span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 text-sm leading-relaxed italic">
                "{viewingTestimonial.testimonial}"
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                Submitted on {new Date(viewingTestimonial.created_at).toLocaleString()}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setViewingTestimonial(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Testimonial</DialogTitle>
            <DialogDescription>Make changes to the testimonial details</DialogDescription>
          </DialogHeader>
          {editingTestimonial && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editingTestimonial.name}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editingTestimonial.email}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={editingTestimonial.position}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, position: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={editingTestimonial.company || ""}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, company: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="rating">Rating</Label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditingTestimonial({ ...editingTestimonial, rating: star })}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= editingTestimonial.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="testimonial">Testimonial</Label>
                <Textarea
                  id="testimonial"
                  value={editingTestimonial.testimonial}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, testimonial: e.target.value })}
                  rows={5}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-[#0D4F85] hover:bg-[#1769AA]">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Testimonial</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this testimonial? This action cannot be undone.
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

export default TestimonalAdmin;
