import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { X, Plus, Trash2, Check, Sparkles, Building2, MapPin, Briefcase, GraduationCap, Code2, HeartHandshake } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_DEPARTMENTS,
  DEFAULT_QUALIFICATIONS,
  DEFAULT_SKILLS,
  DEFAULT_EMPLOYMENT_TYPES,
  DEFAULT_WORK_MODES,
  DEFAULT_SENIORITY_LEVELS,
  DEFAULT_LOCATIONS,
  DEFAULT_PERKS,
  getTaxonomyList,
  addTaxonomyItem,
} from "@/lib/jobTaxonomy";

interface JobFormModalProps {
  open: boolean;
  onClose: () => void;
  job?: any;
  onSuccess: () => void;
}

const JobFormModal: React.FC<JobFormModalProps> = ({ open, onClose, job, onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Dynamic Options Master Lists
  const [departments, setDepartments] = useState<string[]>([]);
  const [qualificationsList, setQualificationsList] = useState<string[]>([]);
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [locationsList, setLocationsList] = useState<string[]>([]);
  const [perksList, setPerksList] = useState<string[]>([]);

  // Modals for creating new dynamic options on the fly
  const [newDepartmentInput, setNewDepartmentInput] = useState("");
  const [showAddDept, setShowAddDept] = useState(false);

  const [newLocationInput, setNewLocationInput] = useState("");
  const [showAddLocation, setShowAddLocation] = useState(false);

  const [newQualInput, setNewQualInput] = useState("");
  const [newSkillInput, setNewSkillInput] = useState("");
  const [newPerkInput, setNewPerkInput] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    department: "",
    employment_type: "Full-time",
    work_mode: "Hybrid",
    location: "Remote (India)",
    seniority_level: "Mid-level (2-4 Yrs)",
    salary_range: "",
    last_date: "",
    role_summary: "",
    responsibilities: [""],
    projects: "",
    required_qualifications: [""],
    required_technical_skills: [""],
    required_soft_skills: [""],
    required_experience: "",
    preferred_qualifications: [""],
    perks_benefits: [""],
    total_openings: 1,
    openings_filled: 0,
    is_active: true,
  });

  // Initialize Taxonomy lists
  useEffect(() => {
    setDepartments(getTaxonomyList("departments", DEFAULT_DEPARTMENTS));
    setQualificationsList(getTaxonomyList("qualifications", DEFAULT_QUALIFICATIONS));
    setSkillsList(getTaxonomyList("skills", DEFAULT_SKILLS));
    setLocationsList(getTaxonomyList("locations", DEFAULT_LOCATIONS));
    setPerksList(getTaxonomyList("perks", DEFAULT_PERKS));
  }, []);

  // Set form data on edit or new
  useEffect(() => {
    if (job) {
      setFormData({
        ...job,
        last_date: job.last_date ? job.last_date.split("T")[0] : "",
        responsibilities: job.responsibilities?.length ? job.responsibilities : [""],
        required_qualifications: job.required_qualifications?.length ? job.required_qualifications : [""],
        required_technical_skills: job.required_technical_skills?.length ? job.required_technical_skills : [""],
        required_soft_skills: job.required_soft_skills?.length ? job.required_soft_skills : [""],
        preferred_qualifications: job.preferred_qualifications?.length ? job.preferred_qualifications : [""],
        perks_benefits: job.perks_benefits?.length ? job.perks_benefits : [""],
        total_openings: job.total_openings ?? 1,
        openings_filled: job.openings_filled ?? 0,
      });
    } else {
      setFormData({
        title: "",
        department: departments[0] || "Engineering & Technology",
        employment_type: "Full-time",
        work_mode: "Hybrid",
        location: "Remote (India)",
        seniority_level: "Mid-level (2-4 Yrs)",
        salary_range: "Competitive / Market Standard",
        last_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        role_summary: "",
        responsibilities: [""],
        projects: "",
        required_qualifications: [""],
        required_technical_skills: [""],
        required_soft_skills: [""],
        required_experience: "1-3 years of industry experience",
        preferred_qualifications: [""],
        perks_benefits: [""],
        total_openings: 1,
        openings_filled: 0,
        is_active: true,
      });
    }
  }, [job, open, departments]);

  if (!open) return null;

  // Handlers for adding newly created taxonomy values
  const handleAddNewDepartment = () => {
    if (!newDepartmentInput.trim()) return;
    const updated = addTaxonomyItem("departments", newDepartmentInput.trim(), departments);
    setDepartments(updated);
    setFormData((prev) => ({ ...prev, department: newDepartmentInput.trim() }));
    setNewDepartmentInput("");
    setShowAddDept(false);
    toast({ title: "Department Created", description: `"${newDepartmentInput.trim()}" added to master list.` });
  };

  const handleAddNewLocation = () => {
    if (!newLocationInput.trim()) return;
    const updated = addTaxonomyItem("locations", newLocationInput.trim(), locationsList);
    setLocationsList(updated);
    setFormData((prev) => ({ ...prev, location: newLocationInput.trim() }));
    setNewLocationInput("");
    setShowAddLocation(false);
    toast({ title: "Location Added", description: `"${newLocationInput.trim()}" added to location choices.` });
  };

  const handleAddNewQualificationPreset = (field: "required_qualifications" | "preferred_qualifications") => {
    if (!newQualInput.trim()) return;
    const updated = addTaxonomyItem("qualifications", newQualInput.trim(), qualificationsList);
    setQualificationsList(updated);
    // Add to current form field
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].some((q) => !q)
        ? prev[field].map((q, idx) => (idx === prev[field].length - 1 && !q ? newQualInput.trim() : q))
        : [...prev[field], newQualInput.trim()],
    }));
    setNewQualInput("");
  };

  const handleAddNewSkillPreset = (field: "required_technical_skills" | "required_soft_skills") => {
    if (!newSkillInput.trim()) return;
    const updated = addTaxonomyItem("skills", newSkillInput.trim(), skillsList);
    setSkillsList(updated);
    // Add to current form field
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].some((s) => !s)
        ? prev[field].map((s, idx) => (idx === prev[field].length - 1 && !s ? newSkillInput.trim() : s))
        : [...prev[field], newSkillInput.trim()],
    }));
    setNewSkillInput("");
  };

  const handleAddNewPerkPreset = () => {
    if (!newPerkInput.trim()) return;
    const updated = addTaxonomyItem("perks", newPerkInput.trim(), perksList);
    setPerksList(updated);
    setFormData((prev) => ({
      ...prev,
      perks_benefits: prev.perks_benefits.some((p) => !p)
        ? prev.perks_benefits.map((p, idx) => (idx === prev.perks_benefits.length - 1 && !p ? newPerkInput.trim() : p))
        : [...prev.perks_benefits, newPerkInput.trim()],
    }));
    setNewPerkInput("");
  };

  // Dynamic Array helpers
  const handleArrayInput = (field: string, index: number, value: string) => {
    const newArray = [...(formData as any)[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayField = (field: string) => {
    setFormData({ ...formData, [field]: [...(formData as any)[field], ""] });
  };

  const removeArrayField = (field: string, index: number) => {
    const newArray = (formData as any)[field].filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, [field]: newArray.length > 0 ? newArray : [""] });
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanedData = {
        ...formData,
        responsibilities: formData.responsibilities.filter((r) => r.trim()),
        required_qualifications: formData.required_qualifications.filter((q) => q.trim()),
        required_technical_skills: formData.required_technical_skills.filter((s) => s.trim()),
        required_soft_skills: formData.required_soft_skills.filter((s) => s.trim()),
        preferred_qualifications: formData.preferred_qualifications.filter((q) => q.trim()),
        perks_benefits: formData.perks_benefits.filter((p) => p.trim()),
      };

      if (job) {
        const { error } = await supabase.from("jobs").update(cleanedData).eq("id", job.id);
        if (error) throw error;
        toast({ title: "Success", description: "Job opening updated successfully!" });
      } else {
        const { error } = await supabase.from("jobs").insert([cleanedData]);
        if (error) throw error;
        toast({ title: "Success", description: "New job opening posted live!" });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Save job error:", error);
      toast({
        title: "Action Failed",
        description: error.message || "Failed to save job opening to database",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative z-10 w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1769AA]" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {job ? "Edit Job Opening" : "Create New Dynamic Job Opening"}
              </h2>
              <p className="text-xs text-slate-500">
                Customize department, qualifications, skills, and parameters dynamically.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 text-slate-800"
        >
          {/* Section 1: Basic Position Info */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0D4F85] flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-[#1769AA]" />
              Position & Department Taxonomy
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Job Title *</label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., Senior Full Stack Next.js Engineer"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] font-medium"
                />
              </div>

              {/* Dynamic Department with "+ Create New" */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Department / Category *</label>
                  <button
                    type="button"
                    onClick={() => setShowAddDept(!showAddDept)}
                    className="text-[11px] font-bold text-[#1769AA] hover:text-[#0D4F85] flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    {showAddDept ? "Cancel" : "+ Add New Department"}
                  </button>
                </div>

                {showAddDept ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newDepartmentInput}
                      onChange={(e) => setNewDepartmentInput(e.target.value)}
                      placeholder="e.g., Cloud & Infrastructure"
                      className="flex-1 px-3 py-2 bg-white border border-[#1769AA] rounded-xl text-xs text-slate-900 focus:outline-none"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddNewDepartment}
                      className="bg-[#1769AA] hover:bg-[#0D4F85] text-white text-xs px-3 rounded-xl"
                    >
                      Save
                    </Button>
                  </div>
                ) : (
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1769AA]/30 font-medium"
                  >
                    {departments.map((dept, i) => (
                      <option key={i} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Employment Type, Work Mode, Seniority */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Employment Type *</label>
                <select
                  value={formData.employment_type}
                  onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1769AA]/30"
                >
                  {DEFAULT_EMPLOYMENT_TYPES.map((t, i) => (
                    <option key={i} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Work Mode *</label>
                <select
                  value={formData.work_mode}
                  onChange={(e) => setFormData({ ...formData, work_mode: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1769AA]/30"
                >
                  {DEFAULT_WORK_MODES.map((m, i) => (
                    <option key={i} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Seniority Level *</label>
                <select
                  value={formData.seniority_level}
                  onChange={(e) => setFormData({ ...formData, seniority_level: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1769AA]/30"
                >
                  {DEFAULT_SENIORITY_LEVELS.map((s, i) => (
                    <option key={i} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location, Salary, Deadline, and Openings / Seats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Location *</label>
                  <button
                    type="button"
                    onClick={() => setShowAddLocation(!showAddLocation)}
                    className="text-[10px] text-[#1769AA] font-bold hover:underline"
                  >
                    {showAddLocation ? "Cancel" : "+ New City"}
                  </button>
                </div>
                {showAddLocation ? (
                  <div className="flex gap-1.5">
                    <input
                      value={newLocationInput}
                      onChange={(e) => setNewLocationInput(e.target.value)}
                      placeholder="City, State"
                      className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-[#1769AA] rounded-lg"
                    />
                    <Button type="button" size="sm" onClick={handleAddNewLocation} className="text-xs px-2.5 h-8">
                      Add
                    </Button>
                  </div>
                ) : (
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
                  >
                    {locationsList.map((loc, i) => (
                      <option key={i} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Salary / Compensation</label>
                <input
                  value={formData.salary_range}
                  onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                  placeholder="e.g., ₹6 LPA - ₹10 LPA or Target Bonus"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Total Openings / Seats *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.total_openings}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      total_openings: Math.max(1, parseInt(e.target.value) || 1),
                    })
                  }
                  required
                  placeholder="e.g. 5"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#0D4F85] focus:outline-none focus:ring-2 focus:ring-[#1769AA]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Last Date to Apply *</label>
                <input
                  type="date"
                  value={formData.last_date}
                  onChange={(e) => setFormData({ ...formData, last_date: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Role Overview */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0D4F85] mb-1.5">
                Role Summary / Overview *
              </label>
              <textarea
                value={formData.role_summary}
                onChange={(e) => setFormData({ ...formData, role_summary: e.target.value })}
                required
                rows={3}
                placeholder="Give a brief 2-3 sentence overview of this role and why it matters at Aayup Technologies..."
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1769AA]/30"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#0D4F85]">
                  Key Responsibilities (Dynamic List) *
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayField("responsibilities")}
                  className="h-7 text-[11px] font-bold text-[#1769AA] border-[#1769AA]/30 hover:bg-sky-50"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Responsibility
                </Button>
              </div>

              <div className="space-y-2">
                {formData.responsibilities.map((resp, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <span className="w-5 text-center text-xs font-bold text-slate-400">{i + 1}.</span>
                    <input
                      value={resp}
                      onChange={(e) => handleArrayInput("responsibilities", i, e.target.value)}
                      placeholder="e.g., Architect, build and deploy scalable Next.js and Supabase web applications..."
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1769AA]/30"
                    />
                    {formData.responsibilities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField("responsibilities", i)}
                        className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Dynamic Qualifications & Experience */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0D4F85] flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-[#1769AA]" />
              Qualifications & Eligibility
            </h3>

            {/* Quick Presets for Qualifications */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-slate-700">Choose or Create Qualifications:</span>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newQualInput}
                    onChange={(e) => setNewQualInput(e.target.value)}
                    placeholder="New Degree/Qualification..."
                    className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg w-48"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleAddNewQualificationPreset("required_qualifications")}
                    className="h-7 text-xs px-2.5 bg-[#1769AA]"
                  >
                    + Add
                  </Button>
                </div>
              </div>

              {/* Preset Badges for easy one-click add */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {qualificationsList.map((q, idx) => {
                  const isSelected = formData.required_qualifications.includes(q);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setFormData({
                            ...formData,
                            required_qualifications: formData.required_qualifications.filter((item) => item !== q),
                          });
                        } else {
                          setFormData({
                            ...formData,
                            required_qualifications: [
                              ...formData.required_qualifications.filter(Boolean),
                              q,
                            ],
                          });
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1 ${
                        isSelected
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-emerald-600" />}
                      {q}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic input list for custom qualification details */}
              <div className="space-y-2">
                {formData.required_qualifications.map((qual, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      value={qual}
                      onChange={(e) => handleArrayInput("required_qualifications", i, e.target.value)}
                      placeholder="e.g., B.Tech / B.E. in Computer Science with 60%+ marks"
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayField("required_qualifications", i)}
                      className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayField("required_qualifications")}
                  className="h-7 text-xs font-bold text-[#1769AA]"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Custom Qualification
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Required Experience *</label>
              <input
                value={formData.required_experience}
                onChange={(e) => setFormData({ ...formData, required_experience: e.target.value })}
                required
                placeholder="e.g., 2+ years of professional full-stack development experience"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 4: Dynamic Technical & Soft Skills */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0D4F85] flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-[#1769AA]" />
              Technical & Soft Skills
            </h3>

            {/* Quick Add Custom Skill */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-sky-50/50 rounded-xl border border-sky-100">
              <span className="text-xs font-bold text-[#0D4F85]">Quick Click Skills to Toggle:</span>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  placeholder="Create new skill (e.g., Rust, AWS)..."
                  className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg w-52"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleAddNewSkillPreset("required_technical_skills")}
                  className="h-7 text-xs px-2.5 bg-[#1769AA]"
                >
                  + Add Skill
                </Button>
              </div>
            </div>

            {/* Skill Presets */}
            <div className="flex flex-wrap gap-1.5">
              {skillsList.map((skill, idx) => {
                const isSelected = formData.required_technical_skills.includes(skill);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setFormData({
                          ...formData,
                          required_technical_skills: formData.required_technical_skills.filter((s) => s !== skill),
                        });
                      } else {
                        setFormData({
                          ...formData,
                          required_technical_skills: [
                            ...formData.required_technical_skills.filter(Boolean),
                            skill,
                          ],
                        });
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1 ${
                      isSelected
                        ? "bg-[#1769AA] text-white border-[#1769AA] font-bold shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                    {skill}
                  </button>
                );
              })}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Selected Technical Skills ({formData.required_technical_skills.filter(Boolean).length})
                </label>
                <div className="space-y-1.5">
                  {formData.required_technical_skills.map((skill, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        value={skill}
                        onChange={(e) => handleArrayInput("required_technical_skills", i, e.target.value)}
                        placeholder="Technical skill name..."
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayField("required_technical_skills", i)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayField("required_technical_skills")}
                    className="h-7 text-[11px] font-bold text-[#1769AA]"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Custom Skill
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Required Soft Skills</label>
                <div className="space-y-1.5">
                  {formData.required_soft_skills.map((skill, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        value={skill}
                        onChange={(e) => handleArrayInput("required_soft_skills", i, e.target.value)}
                        placeholder="e.g., Problem Solving, Team Collaboration..."
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayField("required_soft_skills", i)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayField("required_soft_skills")}
                    className="h-7 text-[11px] font-bold text-[#1769AA]"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Soft Skill
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Perks & Benefits */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Perks & Benefits (Dynamic)
              </h3>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newPerkInput}
                  onChange={(e) => setNewPerkInput(e.target.value)}
                  placeholder="Add custom perk..."
                  className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg w-48"
                />
                <Button type="button" size="sm" onClick={handleAddNewPerkPreset} className="h-7 text-xs bg-emerald-600">
                  + Add Perk
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {perksList.map((perk, idx) => {
                const isSelected = formData.perks_benefits.includes(perk);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setFormData({
                          ...formData,
                          perks_benefits: formData.perks_benefits.filter((p) => p !== perk),
                        });
                      } else {
                        setFormData({
                          ...formData,
                          perks_benefits: [...formData.perks_benefits.filter(Boolean), perk],
                        });
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1 ${
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-600 font-bold"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                    {perk}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Status Toggle */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              id="job_active_toggle"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-[#1769AA] rounded focus:ring-[#1769AA]"
            />
            <label htmlFor="job_active_toggle" className="text-xs font-bold text-slate-800 cursor-pointer">
              Publish job opening as Active on the careers portal immediately
            </label>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 sticky bottom-0 bg-white py-2">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-[#1769AA] to-[#2D86C9] hover:from-[#0D4F85] hover:to-[#1769AA] text-white font-bold text-xs px-5 shadow-md shadow-[#1769AA]/20"
            >
              {loading ? "Saving to Database..." : job ? "Update Job Opening" : "Publish Job Opening"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default JobFormModal;
