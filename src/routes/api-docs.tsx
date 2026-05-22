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
  Lock, 
  Key, 
  Terminal, 
  Copy, 
  Plus, 
  AlertTriangle,
  FileText,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/api-docs")({
  component: ApiDocsPage,
});

function ApiDocsPage() {
  const { profile, user, loading } = useAuth();
  const [tokens, setTokens] = useState<any[]>([]);
  const [newTokenName, setNewTokenName] = useState("");
  const [showKey, setShowKey] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && profile?.is_verified) {
      fetchTokens();
    }
  }, [user, profile]);

  const fetchTokens = async () => {
    const { data, error } = await supabase
      .from("api_tokens")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    if (!error) setTokens(data || []);
  };

  const generateToken = async () => {
    if (!newTokenName) return toast.error("Please enter a token name");
    
    const tokenValue = `ak_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    
    const { error } = await supabase.from("api_tokens").insert({
      user_id: user!.id,
      name: newTokenName,
      token: tokenValue
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("API token generated!");
      setNewTokenName("");
      fetchTokens();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (loading) return null;

  if (!profile?.is_verified) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6 animate-in fade-in duration-500">
        <div className="h-20 w-20 rounded-full bg-amber-500/10 flex items-center justify-center">
          <ShieldAlert className="h-10 w-10 text-amber-500" />
        </div>
        <div className="max-w-md">
          <h1 className="text-3xl font-bold mb-2">API Access Restricted</h1>
          <p className="text-muted-foreground mb-6">
            Private API access is only available for verified publishers. To get verified, please complete your profile and contact support.
          </p>
          <div className="grid grid-cols-1 gap-4 text-left mb-8">
            <div className="flex gap-3 p-4 rounded-lg bg-card border">
              <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-sm font-bold">Verification Requirement</p>
                <p className="text-xs text-muted-foreground">Manual review of your traffic source and volume.</p>
              </div>
            </div>
            <div className="flex gap-3 p-4 rounded-lg bg-card border">
              <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-sm font-bold">Account Maturity</p>
                <p className="text-xs text-muted-foreground">Account must be active for at least 7 days with valid clicks.</p>
              </div>
            </div>
          </div>
          <Button size="lg" onClick={() => navigate({ to: "/support" })}>Contact Support for Verification</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Developer API</h1>
          <p className="text-muted-foreground">Integrate AlphaLink into your own platform seamlessly.</p>
        </div>
        <Button variant="outline" asChild>
          <a href="https://docs.alphalink.com" target="_blank" rel="noopener noreferrer">
            <FileText className="h-4 w-4 mr-2" />
            Full API Docs
          </a>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Token Management */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                API Tokens
              </CardTitle>
              <CardDescription>Generate and manage your secret API keys.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tokenName">Token Name</Label>
                <Input 
                  id="tokenName" 
                  placeholder="e.g. Website Integration" 
                  value={newTokenName}
                  onChange={(e) => setNewTokenName(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={generateToken}>
                <Plus className="h-4 w-4 mr-2" />
                Generate New Token
              </Button>

              <div className="pt-4 space-y-3">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Active Tokens</p>
                {tokens.length > 0 ? tokens.map((t) => (
                  <div key={t.id} className="p-3 rounded-lg border bg-background/50 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">{t.name}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {/* handle delete */}}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-[10px] flex-1 p-1 bg-muted rounded truncate">
                        {showKey === t.id ? t.token : "••••••••••••••••••••••••••••"}
                      </code>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowKey(showKey === t.id ? null : t.id)}>
                        {showKey === t.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(t.token)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-muted-foreground italic">No tokens found.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardContent className="p-4 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-700">Security Warning</p>
                <p className="text-xs text-amber-600/80 leading-relaxed">Never share your API keys publicly. Anyone with access to your key can shorten links on your behalf and potentially access your statistics.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integration Quick Start */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-primary" />
                Quick Start Integration
              </CardTitle>
              <CardDescription>Shorten links programmatically using our REST API.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="bg-slate-950 p-6 font-mono text-sm overflow-x-auto">
                <div className="text-slate-400 mb-4"># Shorten a URL using cURL</div>
                <div className="flex gap-4">
                  <div className="text-slate-500 select-none">1<br/>2<br/>3<br/>4<br/>5<br/>6<br/>7<br/>8</div>
                  <div className="text-emerald-400">
                    curl -X POST "https://api.alphalink.com/v1/shorten" \<br/>
                    &nbsp;&nbsp;-H "Authorization: Bearer YOUR_API_KEY" \<br/>
                    &nbsp;&nbsp;-H "Content-Type: application/json" \<br/>
                    &nbsp;&nbsp;-d '{"{"}<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;"url": "https://google.com",<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;"category": "premium",<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;"alias": "my-custom-link"<br/>
                    &nbsp;&nbsp;{"}"}'
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <h3 className="font-bold">Request Parameters</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm py-1 border-b">
                        <code className="text-primary">url</code>
                        <span className="text-muted-foreground italic">Required</span>
                      </div>
                      <div className="flex justify-between text-sm py-1 border-b">
                        <code className="text-primary">category</code>
                        <span className="text-muted-foreground">Optional</span>
                      </div>
                      <div className="flex justify-between text-sm py-1 border-b">
                        <code className="text-primary">alias</code>
                        <span className="text-muted-foreground">Optional</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-bold">Success Response</h3>
                    <pre className="bg-muted p-3 rounded-lg text-[10px] text-muted-foreground">
                      {`{
  "status": "success",
  "data": {
    "short_url": "go.alphalink.com/my-custom-link",
    "slug": "my-custom-link",
    "original_url": "https://google.com"
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
