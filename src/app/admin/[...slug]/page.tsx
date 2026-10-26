"use client";

import dynamic from "next/dynamic";
import { use } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminSkeletonLoader from "@/components/admin/AdminSkeletonLoader";

// Loading skeleton fallback wrapper inside the persistent AdminLayout
const LoadingFallback = () => (
  <AdminLayout isLoading={true}>
    <AdminSkeletonLoader />
  </AdminLayout>
);

const AdminDashboard = dynamic(() => import("@/pages/admin/Dashboard"), {
  ssr: false,
  loading: LoadingFallback,
});
const AdminJobs = dynamic(() => import("@/pages/admin/Jobs"), {
  ssr: false,
  loading: LoadingFallback,
});
const AdminApplications = dynamic(() => import("@/pages/admin/Applications"), {
  ssr: false,
  loading: LoadingFallback,
});
const AdminContact = dynamic(() => import("@/pages/admin/Contact"), {
  ssr: false,
  loading: LoadingFallback,
});
const AdminEnquiry = dynamic(() => import("@/pages/admin/Enquiry"), {
  ssr: false,
  loading: LoadingFallback,
});
const AdminTestimonials = dynamic(() => import("@/pages/admin/testimonals"), {
  ssr: false,
  loading: LoadingFallback,
});
const AdminProfile = dynamic(() => import("@/pages/admin/Profile"), {
  ssr: false,
  loading: LoadingFallback,
});
const AdminSettings = dynamic(() => import("@/pages/admin/Settings"), {
  ssr: false,
  loading: LoadingFallback,
});
const AdminProjects = dynamic(() => import("@/pages/admin/Projects"), {
  ssr: false,
  loading: LoadingFallback,
});
const AdminBlogs = dynamic(() => import("@/pages/admin/Blogs"), {
  ssr: false,
  loading: LoadingFallback,
});
const AdminFaqs = dynamic(() => import("@/pages/admin/Faqs"), {
  ssr: false,
  loading: LoadingFallback,
});
const AdminTeam = dynamic(() => import("@/pages/admin/team"), {
  ssr: false,
  loading: LoadingFallback,
});

export default function AdminSubPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams?.slug?.[0]?.toLowerCase() || "";

  switch (slug) {
    case "jobs":
      return <AdminJobs />;
    case "applications":
      return <AdminApplications />;
    case "contact":
      return <AdminContact />;
    case "enquiry":
      return <AdminEnquiry />;
    case "testimonals":
    case "testimonials":
      return <AdminTestimonials />;
    case "profile":
      return <AdminProfile />;
    case "projects":
      return <AdminProjects />;
    case "blogs":
    case "blog":
      return <AdminBlogs />;
    case "faqs":
    case "faq":
      return <AdminFaqs />;
    case "team":
    case "teams":
      return <AdminTeam />;
    case "settings":
      return <AdminSettings />;
    default:
      return <AdminDashboard />;
  }
}
