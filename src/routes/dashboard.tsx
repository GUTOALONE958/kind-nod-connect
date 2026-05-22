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
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import { 
  TrendingUp, 
  MousePointer2, 
  DollarSign, 
  Link as LinkIcon,
  Plus,
  ArrowUpRight,
  Clock,
  Globe,
  Copy,
  ExternalLink
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const data = [
  { name: "Mon", visits: 0, earnings: 0 },
  { name: "Tue", visits: 0, earnings: 0 },
  { name: "Wed", visits: 0, earnings: 0 },
  { name: "Thu", visits: 0, earnings: 0 },
  { name: "Fri", visits: 0, earnings: 0 },
  { name: "Sat", visits: 0, earnings: 0 },
  { name: "Sun", visits: 0, earnings: 0 },
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
  const [recentLinks, setRecentLinks] = useState<any[]>([]);
  const [stats, setStats] = useState({ clicks: 0, links: 0, ecpm: 0 });
  const [isShortening, setIsShortening] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    if (!user) return;
    
    // Fetch categories
    const { data: catRes } = await supabase.from('categories').select('*').eq('is_active', true);
    setCategories(catRes || []);
    if (catRes?.length && !selectedCategory) setSelectedCategory(catRes[0].id);

    // Fetch recent links
    const { data: linksRes } = await supabase
      .from('links')
      .select('*, subdomains:subdomain_id(domain)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    setRecentLinks(linksRes || []);

    // Fetch stats
    const { count: linkCount } = await supabase.from('links').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    const { data: clickData } = await supabase.from('links').select('total_clicks').eq('user_id', user.id);
    const totalClicks = clickData?.reduce((acc, curr) => acc + Number(curr.total_clicks || 0), 0) || 0;
    
    setStats({
      clicks: totalClicks,
      links: linkCount || 0,
      ecpm: 0 // Will implement later with real tracking
    });
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!url) return toast.error("Por favor, insira uma URL");

    setIsShortening(true);
    try {
      const { data: subRes } = await supabase.from('subdomains').select('id').eq('is_default', true).limit(1).maybeSingle();
      
      const slug = Math.random().toString(36).substring(2, 9);
      const linkData: any = {
        user_id: user.id,
        original_url: url,
        short_slug: slug,
      };

      if (subRes?.id) linkData.subdomain_id = subRes.id;
      if (selectedCategory && selectedCategory !== "") linkData.category_id = selectedCategory;

      const { error } = await supabase.from("links").insert(linkData);

      if (error) throw error;
      toast.success("Link encurtado com sucesso!");
      setUrl("");
      fetchData(); // Refresh list
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsShortening(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copiado!");
  };

  if (loading) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bem-vindo, {profile?.display_name || "Usuário"}!</h1>
          <p className="text-muted-foreground">Veja o desempenho dos seus links hoje.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate({ to: "/links" })}>Ver Todos os Links</Button>
          <Button onClick={() => document.getElementById('shorten-input')?.focus()}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Link
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Saldo Atual" 
          value={formatCurrency(profile?.balance || 0)} 
          icon={DollarSign} 
          description="Disponível para saque"
          trend="0%"
        />
        <StatCard 
          title="Total de Cliques" 
          value={stats.clicks.toLocaleString()} 
          icon={MousePointer2} 
          description="Cliques este mês"
          trend="0%"
        />
        <StatCard 
          title="Média eCPM" 
          value={formatCurrency(stats.ecpm)} 
          icon={TrendingUp} 
          description="Performance global"
        />
        <StatCard 
          title="Links Ativos" 
          value={stats.links.toString()} 
          icon={LinkIcon} 
          description="Links gerando receita"
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
            <CardTitle>Visão Geral de Ganhos</CardTitle>
            <CardDescription>Desempenho diário nos últimos 7 dias.</CardDescription>
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
            <CardTitle>Links Recentes</CardTitle>
            <CardDescription>Seus últimos links encurtados.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLinks.length > 0 ? (
                recentLinks.map((link) => {
                  const fullUrl = `${link.subdomains?.domain || 'go.alphalink.com'}/go/${link.short_slug}`;
                  return (
                    <div key={link.id} className="p-3 rounded-lg border bg-background/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary truncate max-w-[150px]">{link.short_slug}</span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(fullUrl)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                            <a href={`http://${fullUrl}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">{link.original_url}</p>
                    </div>
                  )
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Globe className="h-8 w-8 text-muted-foreground mb-2 opacity-20" />
                  <p className="text-sm text-muted-foreground">Nenhum link recente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
