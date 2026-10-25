// Dynamic Job Taxonomy & Predefined Master List for Aayup Technologies Job Postings
// Admin can dynamically add new items in the form, and they persist in localStorage!

export interface DynamicOption {
  id: string;
  label: string;
}

export const DEFAULT_DEPARTMENTS: string[] = [
  "Engineering & Technology",
  "Product & UI/UX Design",
  "Marketing & Growth",
  "Business Strategy & Sales",
  "Human Resources & Talent",
  "Operations & Project Management",
  "Quality Assurance & DevOps",
  "AI & Machine Learning",
  "Mobile App Development",
  "Cybersecurity",
];

export const DEFAULT_QUALIFICATIONS: string[] = [
  "B.Tech / B.E. in Computer Science or IT",
  "B.Sc / M.Sc in Computer Science / IT",
  "BCA / MCA (Computer Applications)",
  "Diploma in Computer Engineering / Poly",
  "MBA / PGDM in Marketing or Operations",
  "Bachelor of Design (B.Des) or equivalent",
  "Any Graduate with Proven Software Experience",
  "Freshers with Strong Project Portfolio",
];

export const DEFAULT_SKILLS: string[] = [
  "React.js & Next.js",
  "Node.js & Express",
  "TypeScript",
  "Flutter & Dart",
  "Tailwind CSS",
  "Supabase / PostgreSQL",
  "MongoDB",
  "Python & AI Workflows",
  "Docker & CI/CD",
  "REST APIs & GraphQL",
  "Git & GitHub",
  "Figma & Prototyping",
  "SEO & Google Analytics",
  "Lead Generation & Cold Outreach",
  "Client Communication",
  "Agile / Scrum Methodologies",
];

export const DEFAULT_EMPLOYMENT_TYPES: string[] = [
  "Full-time",
  "Part-time",
  "Internship",
  "Contract",
  "Freelance",
];

export const DEFAULT_WORK_MODES: string[] = [
  "Remote",
  "Hybrid",
  "On-site",
];

export const DEFAULT_SENIORITY_LEVELS: string[] = [
  "Intern",
  "Junior (0-2 Yrs)",
  "Mid-level (2-4 Yrs)",
  "Senior (4-7 Yrs)",
  "Lead / Staff (7+ Yrs)",
];

export const DEFAULT_LOCATIONS: string[] = [
  "Remote (India)",
  "Remote (Worldwide)",
  "Bangalore, Karnataka, India",
  "Greater Noida / Delhi NCR",
  "Mumbai, Maharashtra, India",
  "Hyderabad, Telangana, India",
  "Pune, Maharashtra, India",
];

export const DEFAULT_PERKS: string[] = [
  "Flexible Working Hours & Remote Culture",
  "Direct Mentorship under Lead Architects",
  "Performance & Target Bonuses",
  "Health & Wellness Allowances",
  "Paid Learning Subscriptions & Certifications",
  "Rapid Career Progression & Annual Appraisals",
  "MacBook / Workstation Allowance for Full-time",
];

// Helper to get options with fallback to defaults and localStorage persistence
export const getTaxonomyList = (key: string, defaultList: string[]): string[] => {
  if (typeof window === "undefined") return defaultList;
  try {
    const saved = localStorage.getItem(`aayup_job_${key}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge with defaults so defaults are never lost
        return Array.from(new Set([...defaultList, ...parsed]));
      }
    }
  } catch (e) {
    console.error("Error reading taxonomy:", e);
  }
  return defaultList;
};

// Helper to add a new dynamic option to a category
export const addTaxonomyItem = (key: string, newItem: string, currentList: string[]): string[] => {
  const trimmed = newItem.trim();
  if (!trimmed) return currentList;
  const updated = Array.from(new Set([...currentList, trimmed]));
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`aayup_job_${key}`, JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving taxonomy:", e);
    }
  }
  return updated;
};
