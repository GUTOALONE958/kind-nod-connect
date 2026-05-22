import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "@tanstack/react-router";

export default function Index() {
  const { user } = useAuth();
  const [url, setUrl] = useState("");
  const navigate = useNavigate();

  const handleShorten = async () => {
    if (!user) return navigate({ to: "/login" });
    
    const slug = Math.random().toString(36).substring(7);
    const { data, error } = await supabase.from("links").insert({
      user_id: user.id,
      original_url: url,
      short_slug: slug,
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
