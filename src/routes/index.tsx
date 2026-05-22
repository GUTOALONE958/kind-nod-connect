import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user } = useAuth();
  const [url, setUrl] = useState("");
  const navigate = useNavigate();

  const handleShorten = async () => {
    if (!user) return navigate({ to: "/login" });
    
    // Get default subdomain and category
    const { data: sub } = await supabase.from("subdomains").select("id").eq("is_default", true).single();
    const { data: cat } = await supabase.from("categories").select("id").eq("name", "Easy").single();

    const slug = Math.random().toString(36).substring(7);
    const { data, error } = await supabase.from("links").insert({
      user_id: user.id,
      original_url: url,
      short_slug: slug,
      subdomain_id: sub?.id,
      category_id: cat?.id
    });
    
    if (error) alert(error.message);
    else alert("Link created: " + slug);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">Premium Link Shortener</h1>
      <input 
        value={url} 
        onChange={(e) => setUrl(e.target.value)}
        className="border p-2 rounded mb-4 w-full max-w-md"
        placeholder="Enter URL to shorten"
      />
      <button 
        onClick={handleShorten}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Shorten
      </button>
    </div>
  );
}
