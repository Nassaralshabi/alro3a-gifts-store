"use client";

import { useEffect, useState } from "react";
import { AppProvider, useHashRoute } from "@/components/core";
import { ErrorBoundary } from "@/components/error-boundary";
import Storefront from "@/components/storefront";
import AdminPanel from "@/components/adminpanel";

function Router() {
  const route = useHashRoute();
  const isAdmin = route.seg[0] === "admin";
  useEffect(() => {
    document.title = isAdmin
      ? "لوحة التحكم | مطبعة الروعة"
      : "مطبعة الروعة | هدايا بطابعك — Al Rawaa Printing";
  }, [isAdmin]);
  return isAdmin ? <AdminPanel /> : <Storefront />;
}

export default function Home() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router />
      </AppProvider>
    </ErrorBoundary>
  );
}
