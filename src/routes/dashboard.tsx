import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CardDescription
} from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { 
  TrendingUp, 
  MousePointer2, 
  DollarSign, 
  Link as LinkIcon,
  Plus,
  ArrowUpRight,
  Clock,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const data = [
  { name: "Mon", visits: 400, earnings: 2.4 },
  { name: "Tue", visits: 300, earnings: 1.8 },
  { name: "Wed", visits: 200, earnings: 1.2 },
  { name: "Thu", visits: 278, earnings: 1.6 },
  { name: "Fri", visits: 189, earnings: 1.1 },
  { name: "Sat", visits: 239, earnings: 1.4 },
  { name: "Sun", visits: 349, earnings: 2.1 },
];

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function StatCard({ title, value, icon: Icon, description, trend }: { title: string, value: string, icon: any, description: string, trend?: string }) {
  return (
    <Card className="overflow-hidden border-none shadow-md bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          {trend && <span className="text-emerald-500 font-bold flex items-center"><ArrowUpRight className="h-3 w-3" /> {trend}</span>}
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const { profile, loading, user } = useAuth();
  const [url, setUrl] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [isShortening, setIsShortening] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const { data: catRes } = await supabase.from('categories').select('*').eq('is_active', true);
      setCategories(catRes || []);
      if (catRes?.length) setSelectedCategory(catRes[0].id);
    };
    fetchData();
  }, []);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!url) return toast.error("Por favor, insira uma URL");

    setIsShortening(true);
    try {
      // Get default subdomain automatically
      const { data: subRes } = await supabase.from('subdomains').select('id').eq('is_default', true).single();
      
      const slug = Math.random().toString(36).substring(2, 9);
      const { error } = await supabase.from("links").insert({
        user_id: user.id,
        original_url: url,
        short_slug: slug,
        subdomain_id: subRes?.id,
        category_id: selectedCategory
      });

      if (error) throw error;
      toast.success("Link encurtado com sucesso!");
      setUrl("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsShortening(false);
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {profile?.display_name || "User"}!</h1>
          <p className="text-muted-foreground">Here's what's happening with your links today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate({ to: "/links" })}>View All Links</Button>
          <Button onClick={() => document.getElementById('shorten-input')?.focus()}>
            <Plus className="h-4 w-4 mr-2" />
            New Link
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Current Balance" 
          value={formatCurrency(profile?.balance || 0)} 
          icon={DollarSign} 
          description="Available for withdrawal"
          trend="+12.5%"
        />
        <StatCard 
          title="Total Clicks" 
          value="1,284" 
          icon={MousePointer2} 
          description="Clicks this month"
          trend="+8.2%"
        />
        <StatCard 
          title="Average eCPM" 
          value="R$ 42.50" 
          icon={TrendingUp} 
          description="Performance across all links"
        />
        <StatCard 
          title="Active Links" 
          value="24" 
          icon={LinkIcon} 
          description="Total links generating revenue"
        />
      </div>

      {/* Shorten Box */}
      <Card className="bg-primary/5 border-primary/20 shadow-lg">
        <CardContent className="p-6">
          <form onSubmit={handleShorten} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="shorten-input"
                  placeholder="Cole sua URL longa aqui..." 
                  className="pl-10 h-12 bg-background border-primary/20"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <Button size="lg" className="h-12 px-8" type="submit" disabled={isShortening}>
                {isShortening ? "Encurtando..." : "Encurtar Agora"}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Categoria de Ganhos</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-background border-primary/10">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} (CPM R$ {c.cpm_value.toFixed(2)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <Card className="lg:col-span-2 border-none shadow-md bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Earnings Overview</CardTitle>
            <CardDescription>Daily revenue performance for the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} tickFormatter={(value) => `R$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--primary))' }}
                />
                <Area type="monotone" dataKey="earnings" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorEarnings)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent Visits</CardTitle>
            <CardDescription>Latest clicks across your links.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                    <Globe className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Visit from Brazil</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {i * 2} mins ago
                    </p>
                  </div>
                  <div className="text-sm font-bold text-emerald-500">
                    +R$ 0.0240
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
