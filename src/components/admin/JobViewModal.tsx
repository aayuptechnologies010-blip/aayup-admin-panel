import React from "react";
import ReactDOM from "react-dom";
import { X, Calendar, MapPin, Briefcase, Award, CheckCircle, Sparkles } from "lucide-react";

const JobViewModal: React.FC<{ open: boolean; onClose: () => void; job?: any }> = ({ open, onClose, job }) => {
  if (!open || !job) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />
      
      <div className="relative z-10 w-full max-w-3xl bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1769AA]" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Job Opening Details</h2>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300">
          
          {/* Main Title & Badges */}
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{job.title}</h3>
            
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-3 py-1 bg-sky-100 text-[#0D4F85] font-bold rounded-lg text-xs uppercase tracking-wider">
                {job.department}
              </span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs">
                {job.employment_type}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 font-bold rounded-lg text-xs">
                {job.work_mode}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 font-medium rounded-lg text-xs flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-500" />
                {job.location}
              </span>
              <span className="px-3 py-1 bg-amber-50 text-amber-800 font-medium rounded-lg text-xs border border-amber-200">
                {job.seniority_level}
              </span>
              <span className="px-3 py-1 bg-teal-50 text-teal-800 font-bold rounded-lg text-xs border border-teal-200">
                🎯 {Math.max(0, (job.total_openings ?? 1) - (job.openings_filled ?? 0))} / {job.total_openings ?? 1} Openings Available
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-600">
              {job.salary_range && (
                <div className="font-semibold text-slate-800">
                  💰 Salary: <span className="text-[#1769AA]">{job.salary_range}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Last Date: <span className="font-semibold text-slate-700">{new Date(job.last_date).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Role Summary */}
          {job.role_summary && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D4F85] mb-2">Role Summary</h4>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                {job.role_summary}
              </p>
            </div>
          )}

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D4F85] mb-2">Key Responsibilities</h4>
              <ul className="space-y-2 text-sm text-slate-700">
                {job.responsibilities.map((resp: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1769AA] mt-2 shrink-0" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Projects/Products */}
          {job.projects && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D4F85] mb-2">Projects / Products Involved</h4>
              <p className="text-sm text-slate-700">{job.projects}</p>
            </div>
          )}

          {/* Qualifications & Experience */}
          <div className="grid md:grid-cols-2 gap-4">
            {job.required_qualifications && job.required_qualifications.length > 0 && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">Required Qualifications</h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {job.required_qualifications.map((qual: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{qual}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {job.required_experience && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">Experience Required</h4>
                <p className="text-sm font-semibold text-slate-800">{job.required_experience}</p>
              </div>
            )}
          </div>

          {/* Skills Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {job.required_technical_skills && job.required_technical_skills.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D4F85] mb-2">Technical Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {job.required_technical_skills.map((skill: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-md text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {job.required_soft_skills && job.required_soft_skills.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D4F85] mb-2">Soft Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {job.required_soft_skills.map((skill: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Perks & Benefits */}
          {job.perks_benefits && job.perks_benefits.length > 0 && (
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Perks & Benefits
              </h4>
              <ul className="grid sm:grid-cols-2 gap-2 text-xs text-slate-700">
                {job.perks_benefits.map((perk: string, i: number) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors shadow-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default JobViewModal;
