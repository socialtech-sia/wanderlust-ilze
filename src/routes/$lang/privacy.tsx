import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$lang/privacy")({
  component: () => (
    <div className="container-editorial py-16 md:py-24">
      <div className="mx-auto max-w-3xl prose prose-neutral">
        <h1 className="font-display">Privacy policy</h1>
        <p className="text-ink-muted">
          Placeholder — full policy will be added by the operator. Personal data submitted through
          the booking or contact forms is processed only to respond to your request and is stored in
          our backend. We do not share it with third parties beyond what is needed to fulfil the
          service you booked.
        </p>
        <h2>Data controller</h2>
        <p>
          social.tech SIA, Reg. 40203514705, Augusta Dombrovska 75k-2-8, Rīga LV-1015, Latvia. On
          behalf of Ilze Gulbe (SIA "Creatus Real Estate").
        </p>
      </div>
    </div>
  ),
});
