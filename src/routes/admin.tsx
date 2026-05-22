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
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Users, 
  Link as LinkIcon, 
  Settings, 
  DollarSign, 
  ShieldCheck, 
  Globe, 
  Database,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Plus,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import { format } from "date-fns";

export const Route = createFileRoute("/admin")({
  component: AdminPanel,
});

function AdminPanel() {
  const { profile, loading } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subdomains, setSubdomains] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (profile?.is_admin) {
      fetchAllData();
    }
  }, [profile]);

  const fetchAllData = async () => {
    const [u, w, c, s, a] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("withdrawals").select("*, profiles(display_name)").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("step_count", { ascending: true }),
      supabase.from("subdomains").select("*").order("created_at", { ascending: false }),
      supabase.from("ads_config").select("*").order("created_at", { ascending: false })
    ]);

    setUsers(u.data || []);
    setWithdrawals(w.data || []);
    setCategories(c.data || []);
    setSubdomains(s.data || []);
    setAds(a.data || []);
  };

  const approveWithdrawal = async (id: string, userId: string, amount: number) => {
    const { error } = await supabase
      .from("withdrawals")
      .update({ status: "completed" })
      .eq("id", id);

    if (error) toast.error(error.message);
    else {
      toast.success("Withdrawal approved!");
      fetchAllData();
    }
  };

  const toggleVerification = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_verified: !current })
      .eq("id", id);

    if (error) toast.error(error.message);
    else {
      toast.success("Verification status updated!");
      fetchAllData();
    }
  };

  const updateAdStatus = async (id: string, active: boolean) => {
    const { error } = await supabase
      .from("ads_config")
      .update({ is_active: active })
      .eq("id", id);

    if (error) toast.error(error.message);
    else {
      toast.success("Ad status updated!");
      fetchAllData();
    }
  };

  const deleteAd = async (id: string) => {
    const { error } = await supabase
      .from("ads_config")
      .delete()
      .eq("id", id);

    if (error) toast.error(error.message);
    else {
      toast.success("Ad deleted!");
      fetchAllData();
    }
  };

  const updateCategory = async (id: string, updates: any) => {
    const { error } = await supabase
      .from("categories")
      .update(updates)
      .eq("id", id);

    if (error) toast.error(error.message);
    else {
      toast.success("Category updated!");
      fetchAllData();
    }
  };

  if (loading) return null;
  if (!profile?.is_admin) return (
    <div className="h-screen flex items-center justify-center p-8 text-center">
      <div className="max-w-md space-y-4">
        <XCircle className="h-16 w-16 text-destructive mx-auto" />
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">Only system administrators can access this area. Your attempt has been logged for security purposes.</p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Admin</h1>
            <p className="text-muted-foreground">Global platform management and monitoring.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchAllData}>Refresh Data</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">Export Report</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1 border">
          <TabsTrigger value="overview" className="gap-2"><Database className="h-4 w-4" /> Overview</TabsTrigger>
          <TabsTrigger value="users" className="gap-2"><Users className="h-4 w-4" /> Users</TabsTrigger>
          <TabsTrigger value="withdrawals" className="gap-2"><DollarSign className="h-4 w-4" /> Payouts</TabsTrigger>
          <TabsTrigger value="ads" className="gap-2"><Plus className="h-4 w-4" /> Anúncios</TabsTrigger>
          <TabsTrigger value="settings" className="gap-2"><Settings className="h-4 w-4" /> Platform</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-none shadow-md bg-card/50">
              <CardContent className="pt-6">
                <div className="text-sm font-bold text-muted-foreground mb-2">Platform Revenue</div>
                <div className="text-2xl font-black">R$ 0.00</div>
                <div className="text-[10px] text-muted-foreground font-bold flex items-center gap-1 mt-1">
                  0% from last month
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md bg-card/50">
              <CardContent className="pt-6">
                <div className="text-sm font-bold text-muted-foreground mb-2">Active Users</div>
                <div className="text-2xl font-black">{users.length}</div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md bg-card/50">
              <CardContent className="pt-6">
                <div className="text-sm font-bold text-muted-foreground mb-2">Pending Payouts</div>
                <div className="text-2xl font-black text-amber-500">
                  {withdrawals.filter(w => w.status === 'pending').length}
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md bg-card/50">
              <CardContent className="pt-6">
                <div className="text-sm font-bold text-muted-foreground mb-2">Total Clicks</div>
                <div className="text-2xl font-black">0</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card className="border-none shadow-md bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and verification status.</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search users..." className="pl-10" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Verification</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-bold">{u.display_name || "New User"}</TableCell>
                        <TableCell className="text-muted-foreground">{u.id.substring(0, 15)}...</TableCell>
                        <TableCell>
                          <Badge variant={u.is_admin ? "default" : "secondary"}>
                            {u.is_admin ? "Admin" : "Publisher"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold text-emerald-500">{formatCurrency(u.balance || 0)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={cn(u.is_verified ? "text-emerald-500" : "text-amber-500")}
                            onClick={() => toggleVerification(u.id, u.is_verified)}
                          >
                            {u.is_verified ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Clock className="h-4 w-4 mr-2" />}
                            {u.is_verified ? "Verified" : "Verify Now"}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          <Card className="border-none shadow-md bg-card/50">
            <CardHeader>
              <CardTitle>Payout Requests</CardTitle>
              <CardDescription>Review and process pending withdrawal requests.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.map((w) => (
                      <TableRow key={w.id}>
                        <TableCell className="font-bold">{w.profiles?.display_name || "User"}</TableCell>
                        <TableCell className="font-bold text-emerald-500">{formatCurrency(w.amount)}</TableCell>
                        <TableCell className="uppercase text-xs font-bold">{w.payment_method}</TableCell>
                        <TableCell>
                          <Badge className={cn(
                            w.status === 'completed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          )}>
                            {w.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{format(new Date(w.created_at), "MMM d, HH:mm")}</TableCell>
                        <TableCell className="text-right">
                          {w.status === 'pending' && (
                            <Button size="sm" onClick={() => approveWithdrawal(w.id, w.user_id, w.amount)}>
                              Approve
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads">
          <Card className="border-none shadow-md bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Ad Management (Adsterra)</CardTitle>
                <CardDescription>Configure Popunders, Social Bars and Banners.</CardDescription>
              </div>
              <Button size="sm" className="gap-2" onClick={() => {
                const name = prompt("Nome do anúncio:");
                const type = prompt("Tipo (popunder, banner, social-bar):");
                const code = prompt("URL ou Script:");
                if (name && type && code) {
                  supabase.from("ads_config").insert({ name, ad_type: type, script_code: code, provider: 'Adsterra', is_active: true }).then(() => fetchAllData());
                }
              }}><Plus className="h-4 w-4" /> Add Ad Script</Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ads.map((ad) => (
                  <div key={ad.id} className="p-4 rounded-xl border bg-background/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="uppercase">{ad.ad_type}</Badge>
                      <Badge variant={ad.is_active ? "default" : "secondary"}>{ad.is_active ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold">{ad.name || ad.provider}</p>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">{ad.script_code}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => updateAdStatus(ad.id, !ad.is_active)}>
                        {ad.is_active ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteAd(ad.id)}>Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Categories Management */}
            <Card className="border-none shadow-md bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Categories (CPM)</CardTitle>
                  <CardDescription>Configure steps and rates per category.</CardDescription>
                </div>
                <Button size="icon" variant="outline"><Plus className="h-4 w-4" /></Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map((c) => (
                    <div key={c.id} className="p-4 rounded-xl border bg-background/50 flex items-center justify-between">
                      <div>
                        <p className="font-bold">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.step_count} Etapas • {c.time_per_step}s por etapa</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-primary">R$ {c.cpm_value.toFixed(2)} CPM</p>
                        <Button variant="link" size="sm" className="h-auto p-0">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Subdomains Management */}
            <Card className="border-none shadow-md bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Subdomains</CardTitle>
                  <CardDescription>Manage available domains for shortening.</CardDescription>
                </div>
                <Button size="icon" variant="outline"><Plus className="h-4 w-4" /></Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subdomains.map((s) => (
                    <div key={s.id} className="p-4 rounded-xl border bg-background/50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                          <Globe className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold">{s.domain}</p>
                          {s.is_default && <Badge className="text-[8px] h-4">DEFAULT</Badge>}
                        </div>
                      </div>
                      <Badge variant={s.is_active ? "outline" : "destructive"}>
                        {s.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
