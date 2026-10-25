"use client";

import dynamic from "next/dynamic";

const AdminDashboard = dynamic(() => import("@/pages/admin/Dashboard"), {
  ssr: false,
});

export default function AdminRootPage() {
  return <AdminDashboard />;
}
