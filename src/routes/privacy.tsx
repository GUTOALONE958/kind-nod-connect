import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-20 px-4 prose dark:prose-invert">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <p>We respect your privacy. This policy explains how we collect and use your data.</p>
    </div>
  );
}
