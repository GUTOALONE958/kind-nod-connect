import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api-docs")({
  component: ApiDocs,
});

function ApiDocs() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">API Documentation</h1>
      <p className="text-gray-600 mb-8">Verified users can use our private API to shorten links programmatically.</p>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">Shorten Link</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm">
            POST /api/shorten
            Authorization: Bearer YOUR_API_KEY
            {"{"}
              "url": "https://example.com"
            {"}"}
          </pre>
        </section>
      </div>
    </div>
  );
}
