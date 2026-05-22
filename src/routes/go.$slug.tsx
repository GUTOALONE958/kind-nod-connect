import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  AlertCircle,
  ChevronRight,
  MousePointer2,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/go/$slug")({
  component: RedirectionPage,
});

function AdPlaceholder({ type }: { type: string }) {
  return (
    <div className="w-full min-h-[250px] bg-muted/50 rounded-xl border-2 border-dashed border-primary/20 flex flex-col items-center justify-center p-6 text-center group hover:bg-muted/80 transition-all duration-300">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
        <MousePointer2 className="h-6 w-6 text-primary" />
      </div>
      <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Sponsored Ad</p>
      <p className="text-xs text-muted-foreground/60 mt-1 max-w-[200px]">Clicking on ads helps us maintain the service for free.</p>
      <div className="mt-4 w-full h-px bg-primary/10" />
      <p className="mt-2 text-[10px] text-muted-foreground/40 italic">Type: {type}</p>
    </div>
  );
}

function RedirectionPage() {
  const { slug } = useParams({ from: "/go/$slug" });
  const [step, setStep] = useState(1);
  const [totalSteps, setTotalSteps] = useState(0);
  const [timePerStep, setTimePerStep] = useState(10);
  const [timer, setTimer] = useState(10);
  const [loading, setLoading] = useState(true);
  const [originalUrl, setOriginalUrl] = useState("");
  const [visitId, setVisitId] = useState<string | null>(null);
  const [isBot, setIsBot] = useState(false);
  const [adScripts, setAdScripts] = useState<any[]>([]);
  const [hasTriggeredAd, setHasTriggeredAd] = useState(false);
  
  const timerRef = useRef<any>(null);

  const init = async () => {
    if (navigator.webdriver) {
      setIsBot(true);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.rpc('process_link_visit', {
      p_slug: slug,
      p_ip: 'visitor-ip-placeholder', 
      p_user_agent: navigator.userAgent,
      p_country: 'BR',
      p_device: window.innerWidth < 768 ? 'mobile' : 'desktop',
      p_referrer: document.referrer
    });

    if (error || !data || (data as any).error) {
      toast.error("Link inválido ou expirado");
      return;
    }

    const result = data as any;
    setOriginalUrl(result.original_url);
    setTotalSteps(result.step_count || 1);
    setVisitId(result.visit_id);
    
    const { data: linkData } = await supabase.from('links').select('category_id').eq('short_slug', slug).single();
    if (linkData?.category_id) {
      const { data: catData } = await supabase.from('categories').select('time_per_step').eq('id', linkData.category_id).single();
      if (catData && catData.time_per_step) {
        setTimePerStep(catData.time_per_step);
        setTimer(catData.time_per_step);
      }
    }

    // @ts-ignore
    const { data: ads } = await supabase.from("ads").select("*").eq("is_active", true);
    setAdScripts(ads || []);
    
    setLoading(false);
  };

  useEffect(() => {
    init();
  }, [slug]);

  useEffect(() => {
    if (adScripts.length > 0) {
      adScripts.forEach(ad => {
        if (ad.script_code && ad.is_active) {
          try {
            const script = document.createElement('script');
            script.innerHTML = ad.script_code;
            document.body.appendChild(script);
          } catch (e) {
            console.error("Error injecting ad script", e);
          }
        }
      });
    }
  }, [adScripts]);

  useEffect(() => {
    if (!loading && !isBot && timer > 0) {
      timerRef.current = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [loading, isBot, timer]);

  const handleNext = async () => {
    // Adsterra Popunder logic: open ad on first click
    if (!hasTriggeredAd) {
      const popunderAd = adScripts.find(ad => ad.ad_type === 'popunder' || ad.ad_type === 'pop');
      if (popunderAd && popunderAd.script_code) {
        // If it's a URL, open it. If it's a script, it might already be running.
        // For simple popunder behavior requested:
        if (popunderAd.script_code.startsWith('http')) {
          window.open(popunderAd.script_code, '_blank');
        }
      } else {
        // Default behavior if no ad configured: open a generic ad or just skip
        // window.open('https://www.highrevenuegate.com/example', '_blank');
      }
      setHasTriggeredAd(true);
      return; // Stop here on first click
    }

    setHasTriggeredAd(false); // Reset for next step

    if (step < totalSteps) {
      if (visitId) {
        await supabase.rpc('register_step_view', {
          p_visit_id: visitId,
          p_step_number: step + 1
        });
      }
      
      setStep(prev => prev + 1);
      setTimer(timePerStep);
      toast.info("Processando próxima etapa...", { duration: 1000 });
      
      if (Math.random() > 0.5) {
        toast.success("Anúncio visualizado!");
      }
    } else {
      window.location.href = originalUrl;
    }
  };

  if (isBot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="max-w-md border-destructive/20 bg-destructive/5">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold">Acesso Negado</h1>
            <p className="text-muted-foreground">Tráfego automatizado detectado. Se você for humano, desative sua VPN e tente novamente.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium animate-pulse">Protegendo sua conexão...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto mb-8 h-24 bg-card rounded-xl border border-muted flex items-center justify-center text-xs text-muted-foreground uppercase tracking-widest font-bold">
        Publicidade (728x90)
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-none shadow-2xl overflow-hidden bg-card/80 backdrop-blur-md">
            <div className="h-2 bg-muted w-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: "0%" }}
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            
            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h1 className="text-2xl font-bold tracking-tight">Etapa {step} de {totalSteps}</h1>
                      <p className="text-sm text-muted-foreground">Verifique que você é humano para prosseguir.</p>
                    </div>
                    <div className="h-14 w-14 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
                      <svg className="h-full w-full -rotate-90 absolute">
                        <circle
                          cx="28" cy="28" r="24"
                          fill="none" stroke="currentColor" strokeWidth="4"
                          className="text-primary"
                          strokeDasharray={150}
                          strokeDashoffset={150 - (timer / timePerStep) * 150}
                          style={{ transition: 'stroke-dashoffset 1s linear' }}
                        />
                      </svg>
                      <span className="text-lg font-bold">{timer}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AdPlaceholder type="Banner 300x250" />
                    <AdPlaceholder type="Conteúdo Nativo" />
                  </div>

                  <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-sm font-bold">Link Protegido</p>
                        <p className="text-xs text-muted-foreground">Criptografia: AES-256</p>
                      </div>
                    </div>
                    
                    <Button 
                      size="lg" 
                      disabled={timer > 0} 
                      onClick={handleNext}
                      className={cn(
                        "h-14 px-10 text-lg font-bold transition-all duration-300",
                        timer === 0 ? "scale-105 shadow-xl shadow-primary/30" : "opacity-50"
                      )}
                    >
                      {step < totalSteps ? "Continuar para Próxima Etapa" : "Acessar Link Final"}
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-muted-foreground mb-4">
                <Lock className="h-4 w-4" />
                <span className="text-sm font-medium">Por que esperar?</span>
              </div>
              <p className="text-sm leading-relaxed">
                Ao aguardar alguns segundos em cada etapa, você ajuda a apoiar os criadores de conteúdo que você gosta. 
                Nossa plataforma utiliza tecnologia Adsterra para garantir a máxima segurança e taxas de pagamento do mercado.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-lg bg-card/50">
            <CardContent className="p-4 space-y-4">
              <AdPlaceholder type="Skyscraper" />
              <div className="p-4 bg-muted/30 rounded-lg text-center">
                <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-widest">Guia de Navegação</p>
                <ul className="text-[10px] text-left space-y-2 text-muted-foreground">
                  <li className="flex gap-2"><ArrowRight className="h-3 w-3 text-primary" /> Não use AdBlockers</li>
                  <li className="flex gap-2"><ArrowRight className="h-3 w-3 text-primary" /> Aguarde o cronômetro</li>
                  <li className="flex gap-2"><ArrowRight className="h-3 w-3 text-primary" /> Clique em "Continuar" para prosseguir</li>
                </ul>
              </div>
              <AdPlaceholder type="Square Ad" />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-12 h-32 bg-card rounded-xl border border-muted flex items-center justify-center text-xs text-muted-foreground uppercase tracking-widest font-bold">
        Publicidade Rodapé (728x90)
      </div>
    </div>
  );
}