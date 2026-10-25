import React from "react";
import ReactDOM from "react-dom";
import { X, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const ApplicationViewModal: React.FC<{
  open: boolean;
  onClose: () => void;
  application?: any;
  onStatusChange?: (id: string, newStatus: string) => void;
}> = ({ open, onClose, application: app, onStatusChange }) => {
  if (!open || !app) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1769AA]" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Application Details</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 flex items-center justify-center transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-foreground/70">Full Name</p>
                <p className="font-medium">{app.full_name}</p>
              </div>
              <div>
                <p className="text-foreground/70">Email</p>
                <p className="font-medium">{app.email}</p>
              </div>
              <div>
                <p className="text-foreground/70">Phone</p>
                <p className="font-medium">{app.phone}</p>
              </div>
              <div>
                <p className="text-foreground/70">Location</p>
                <p className="font-medium">
                  {app.current_location}
                  {app.willing_to_relocate && " (Willing to relocate)"}
                </p>
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Professional Details</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-foreground/70">Current Position</p>
                <p className="font-medium">{app.current_job_title}</p>
              </div>
              <div>
                <p className="text-foreground/70">Total Experience</p>
                <p className="font-medium">{app.total_experience}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-foreground/70 mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {app.relevant_skills?.map((skill: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            {app.linkedin_url && (
              <div className="mt-4">
                <p className="text-foreground/70">LinkedIn</p>
                <a
                  href={app.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  {app.linkedin_url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
            {app.portfolio_url && (
              <div className="mt-4">
                <p className="text-foreground/70">Portfolio</p>
                <a
                  href={app.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  {app.portfolio_url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Documents */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Documents</h3>
            <div className="space-y-2">
              <a
                href={app.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Download className="w-4 h-4" />
                Download Resume
              </a>
            </div>
            {app.cover_letter && (
              <div className="mt-4">
                <p className="text-foreground/70 mb-2">Cover Letter</p>
                <div className="p-4 bg-muted/30 rounded-lg text-sm whitespace-pre-wrap">
                  {app.cover_letter}
                </div>
              </div>
            )}
            {app.project_links && app.project_links.length > 0 && (
              <div className="mt-4">
                <p className="text-foreground/70 mb-2">Project Links</p>
                <div className="space-y-1">
                  {app.project_links.map((link: string, i: number) => (
                    <a
                      key={i}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-primary hover:underline text-sm flex items-center gap-1"
                    >
                      {link}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Education */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Education</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-foreground/70">Degree</p>
                <p className="font-medium">{app.highest_degree}</p>
              </div>
              <div>
                <p className="text-foreground/70">University</p>
                <p className="font-medium">{app.university}</p>
              </div>
              <div>
                <p className="text-foreground/70">Graduation Year</p>
                <p className="font-medium">{app.graduation_year}</p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {(app.how_did_you_hear || app.additional_info) && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Additional Information</h3>
              {app.how_did_you_hear && (
                <div className="mb-3">
                  <p className="text-foreground/70">How they heard about us</p>
                  <p className="text-sm">{app.how_did_you_hear}</p>
                </div>
              )}
              {app.additional_info && (
                <div>
                  <p className="text-foreground/70 mb-2">Additional Comments</p>
                  <div className="p-4 bg-muted/30 rounded-lg text-sm whitespace-pre-wrap">
                    {app.additional_info}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Application Info & Status Control */}
          <div className="pt-4 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-slate-600">
            <div>
              <p>Applied on {new Date(app.created_at).toLocaleString("en-IN")}</p>
              <p className="mt-1 flex items-center gap-2">
                <span>Current Status:</span>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    app.status === "pending"
                      ? "bg-amber-100 text-amber-800"
                      : app.status === "shortlisted"
                      ? "bg-emerald-100 text-emerald-800"
                      : app.status === "hired"
                      ? "bg-green-100 text-green-900 font-black border border-green-300"
                      : app.status === "rejected"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-sky-100 text-sky-800"
                  }`}
                >
                  {app.status || "pending"}
                </span>
              </p>
            </div>

            {onStatusChange && (
              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">Change Status:</span>
                <select
                  value={app.status || "pending"}
                  onChange={(e) => onStatusChange(app.id, e.target.value)}
                  className="px-2.5 py-1 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1769AA]/30"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="hired">Hired (Filled Seat)</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ApplicationViewModal;
