import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BarChart3, 
  Shield, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  Link as LinkIcon,
  Globe,
  Lock
} from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <Card className="border-none bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="relative">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <LinkIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">AlphaLink</span>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  {profile?.is_admin && (
                    <Button variant="outline" onClick={() => navigate({ to: "/admin" })} className="border-primary text-primary hover:bg-primary/10">
                      Painel Admin
                    </Button>
                  )}
                  <Button onClick={() => navigate({ to: "/dashboard" })}>Meu Dashboard</Button>
                </div>
              ) : (
                <>
                  <Link to="/login" className="text-lg font-bold text-primary hover:underline transition-colors px-4">Login</Link>
                  <Button size="lg" onClick={() => navigate({ to: "/register" })} className="font-bold text-lg">Criar Conta Grátis</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-primary uppercase bg-primary/10 rounded-full">
              The Next Gen Link Monetization
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight">
              Shorten Links, <span className="text-primary">Earn Real Money</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              The highest CPM in the market. Advanced analytics, secure payments, and a premium experience for your audience.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 text-lg font-semibold shadow-lg shadow-primary/20" onClick={() => navigate({ to: "/register" })}>
                Get Started for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg font-semibold" onClick={() => navigate({ to: "/api-docs" })}>
                View API Docs
              </Button>
            </div>
          </motion.div>

          {/* Stats Bar */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-y py-12 bg-card/30 backdrop-blur-sm rounded-3xl">
            <div>
              <p className="text-4xl font-bold mb-1">50M+</p>
              <p className="text-muted-foreground uppercase tracking-widest text-xs font-bold">Total Links</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-1">$1.2M</p>
              <p className="text-muted-foreground uppercase tracking-widest text-xs font-bold">Paid to Users</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-1">100K+</p>
              <p className="text-muted-foreground uppercase tracking-widest text-xs font-bold">Active Users</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-1">$50+</p>
              <p className="text-muted-foreground uppercase tracking-widest text-xs font-bold">Max CPM</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose AlphaLink?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Built for creators who want to maximize their revenue with enterprise-grade security.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Zap} 
              title="Lightning Fast" 
              description="Proprietary redirection engine that ensures your links load instantly across the globe." 
            />
            <FeatureCard 
              icon={Shield} 
              title="Anti-Fraud Engine" 
              description="State-of-the-art protection against bots, VPNs, and proxies to ensure every click is valid." 
            />
            <FeatureCard 
              icon={BarChart3} 
              title="Deep Analytics" 
              description="Track every click with pinpoint accuracy. Real-time data on countries, devices, and browsers." 
            />
            <FeatureCard 
              icon={Lock} 
              title="Private API" 
              description="Integrate seamlessly with your own applications using our secure and documented API." 
            />
            <FeatureCard 
              icon={Globe} 
              title="Global Reach" 
              description="Localized monetization steps for different regions to maximize your eCPM." 
            />
            <FeatureCard 
              icon={CheckCircle2} 
              title="Fast Payouts" 
              description="Daily payments via PIX, Crypto, and Bank Transfer with a low minimum withdrawal." 
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t bg-card">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-6 bg-primary rounded-lg flex items-center justify-center">
                <LinkIcon className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold">AlphaLink</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">The premier destination for professional link monetization. Trusted by thousands of creators worldwide.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/api-docs">API Documentation</Link></li>
              <li><Link to="/withdrawals">Payout Rates</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/support">Help Center</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          © 2026 AlphaLink. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
