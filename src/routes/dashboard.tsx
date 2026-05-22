import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { profile, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Balance</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">R$ {profile?.balance?.toFixed(4) || "0.0000"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Withdrawn</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">R$ {profile?.total_withdrawn?.toFixed(4) || "0.0000"}</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
