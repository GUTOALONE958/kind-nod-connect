import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-20 px-4 prose dark:prose-invert">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <p>Last updated: May 2026</p>
      <h2>1. Acceptance of Terms</h2>
      <p>By accessing AlphaLink, you agree to follow these rules...</p>
      <h2>2. User Obligations</h2>
      <p>You may not use our service for illegal content, spam, or misleading traffic.</p>
    </div>
  );
}
