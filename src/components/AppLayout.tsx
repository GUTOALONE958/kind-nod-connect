import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@tanstack/react-router";

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  const isPublicPage = ["/", "/login", "/register", "/go/"].some(path => location.pathname.startsWith(path)) && location.pathname !== "/dashboard" && !location.pathname.startsWith("/admin");
  
  // Dashboard, Admin, Profile etc. are private
  const showSidebar = user && !isPublicPage;

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      {showSidebar && <Sidebar className="hidden lg:flex" />}
      <main className={cn("flex-1 overflow-y-auto", showSidebar ? "lg:p-8 p-4" : "")}>
        {children}
      </main>
    </div>
  );
};

import { cn } from "@/lib/utils";
