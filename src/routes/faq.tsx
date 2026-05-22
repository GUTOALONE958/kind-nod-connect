import { createFileRoute } from "@tanstack/react-router";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  component: FaqPage,
});

function FaqPage() {
  return (
    <div className="max-w-4xl mx-auto py-20 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>How does link monetization work?</AccordionTrigger>
          <AccordionContent>
            When you shorten a link and someone clicks it, they are shown a few short advertisements before reaching their destination. You earn money for every valid view.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>What is the minimum withdrawal?</AccordionTrigger>
          <AccordionContent>
            The minimum withdrawal is R$ 10.00. We process payments within 24-48 hours via PIX, PayPal, or Crypto.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Can I use multiple accounts?</AccordionTrigger>
          <AccordionContent>
            No. Our anti-fraud system will automatically detect and ban users with multiple accounts to ensure the platform remains fair for everyone.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
