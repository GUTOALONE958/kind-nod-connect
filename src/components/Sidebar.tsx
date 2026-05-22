import React from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  Link as LinkIcon, 
  DollarSign, 
  Users, 
  Settings, 
  LogOut, 
  ShieldCheck,
  Menu,
  X,
  User,
  Terminal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

interface SidebarProps {
  className?: string;
}

const SidebarItem = ({ icon: Icon, label, href, active }: { icon: any, label: string, href: string, active: boolean }) => (
  <Link 
    to={href} 
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
      active ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    )}
  >
    <Icon className={cn("h-5 w-5", active ? "text-white" : "group-hover:scale-110 transition-transform")} />
    <span className="font-medium">{label}</span>
  </Link>
);

export const Sidebar = ({ className }: SidebarProps) => {
  const { profile, signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: LinkIcon, label: "My Links", href: "/links" },
    { icon: DollarSign, label: "Earnings", href: "/withdrawals" },
    { icon: Users, label: "Referrals", href: "/referrals" },
    { icon: User, label: "Profile", href: "/profile" },
  ];

  if (profile?.is_verified) {
    menuItems.push({ icon: Terminal, label: "Private API", href: "/api-docs" });
  }

  if (profile?.is_admin && user?.email === 'sjoseoliveira98@gmail.com') {
    menuItems.push({ icon: ShieldCheck, label: "Admin Panel", href: "/admin" });
  }

  return (
    <div className={cn("flex flex-col h-screen w-64 border-r bg-card/50 backdrop-blur-xl", className)}>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <LinkIcon className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">AlphaLink</span>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <SidebarItem 
              key={item.href} 
              {...item} 
              active={location.pathname === item.href} 
            />
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t space-y-4">
        <ThemeToggle />
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};
