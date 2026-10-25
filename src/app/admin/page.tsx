"use client";

import dynamic from "next/dynamic";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminSkeletonLoader from "@/components/admin/AdminSkeletonLoader";

const AdminDashboard = dynamic(() => import("@/pages/admin/Dashboard"), {
  ssr: false,
  loading: () => (
    <AdminLayout isLoading={true}>
      <AdminSkeletonLoader />
    </AdminLayout>
  ),
});

export default function AdminPage() {
  return <AdminDashboard />;
}
