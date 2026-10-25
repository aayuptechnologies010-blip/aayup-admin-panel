"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminSkeletonLoader() {
  return (
    <div className="space-y-6 w-full animate-fade-in">
      {/* Top Banner Skeleton */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 bg-slate-200 rounded-lg" />
          <Skeleton className="h-4 w-72 bg-slate-100 rounded-md" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 bg-slate-200 rounded-xl" />
          <Skeleton className="h-9 w-24 bg-sky-200 rounded-xl" />
        </div>
      </div>

      {/* 4 Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between"
          >
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-24 bg-slate-200 rounded" />
              <Skeleton className="h-8 w-16 bg-slate-300 rounded-lg" />
              <Skeleton className="h-3 w-20 bg-slate-100 rounded" />
            </div>
            <Skeleton className="w-12 h-12 rounded-xl bg-sky-100" />
          </div>
        ))}
      </div>

      {/* Main Table / Data Skeleton */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <Skeleton className="h-5 w-40 bg-slate-200 rounded" />
          <Skeleton className="h-8 w-32 bg-slate-100 rounded-lg" />
        </div>

        {/* Table rows */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 gap-4"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-lg bg-slate-200 shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-40 bg-slate-200 rounded" />
                  <Skeleton className="h-3 w-28 bg-slate-100 rounded" />
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-4">
                <Skeleton className="h-4 w-24 bg-slate-100 rounded" />
                <Skeleton className="h-6 w-16 bg-sky-100 rounded-full" />
              </div>

              <Skeleton className="h-8 w-20 bg-slate-200 rounded-lg shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminSkeletonLoader;
