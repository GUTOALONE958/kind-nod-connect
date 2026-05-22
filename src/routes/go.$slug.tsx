import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/go/$slug")({
  component: RedirectionPage,
});

function RedirectionPage() {
  const { slug } = useParams({ from: "/go/$slug" });
  const [step, setStep] = useState(1);
  const [totalSteps, setTotalSteps] = useState(0);
  const [timer, setTimer] = useState(10);
  const [loading, setLoading] = useState(true);
  const [originalUrl, setOriginalUrl] = useState("");

  useEffect(() => {
    const init = async () => {
      // Record visit and get data
      const { data, error } = await supabase.rpc('process_link_visit', {
        p_slug: slug,
        p_ip: '127.0.0.1', // Real implementation needs real IP
        p_user_agent: navigator.userAgent,
        p_country: 'BR',
        p_device: 'desktop',
        p_referrer: document.referrer
      });

      if (error || !data.success) {
        alert("Link not found");
        return;
      }

      setOriginalUrl(data.original_url);
      setTotalSteps(data.steps_count);
      setLoading(false);
    };

    init();
  }, [slug]);

  useEffect(() => {
    if (!loading && timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [loading, timer]);

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(prev => prev + 1);
      setTimer(10);
    } else {
      window.location.href = originalUrl;
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="max-w-xl w-full space-y-8 text-center">
        <h1 className="text-2xl font-bold">Step {step} of {totalSteps}</h1>
        <Progress value={(step / totalSteps) * 100} />
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="text-lg mb-4">Wait {timer} seconds to continue...</p>
          
          {/* Ad Placeholder */}
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center mb-6">
            Adsterra Ad Space
          </div>

          <Button 
            disabled={timer > 0} 
            onClick={handleNext}
            size="lg"
            className="w-full"
          >
            {step < totalSteps ? "Continue" : "Go to Link"}
          </Button>
        </div>
      </div>
    </div>
  );
}
