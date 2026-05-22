import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useLocation, Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Menu, X, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Public pages that shouldn't show the sidebar
  const publicRoutes = ["/login", "/register", "/go/"];
  const isHomePage = location.pathname === "/";
  const isPublicRoute = publicRoutes.some(path => location.pathname.startsWith(path));
  
  const showSidebar = user && !isHomePage && !isPublicRoute;

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      {showSidebar && (
        <>
          <Sidebar className="hidden lg:flex" />
          <div className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b bg-card/80 backdrop-blur-lg z-40 px-4 flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <LinkIcon className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold tracking-tight">AlphaLink</span>
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <Sidebar className="w-full border-none" />
              </SheetContent>
            </Sheet>
          </div>
        </>
      )}
      <main className={cn(
        "flex-1 overflow-y-auto w-full", 
        showSidebar ? "lg:p-8 p-4 pt-20 lg:pt-8" : ""
      )}>
        {children}
      </main>
    </div>
  );
};
