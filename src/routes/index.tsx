import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/chat" });
  },
  head: () => ({
    meta: [
      { title: "Opening chat · Software Vala Enterprise Workspace" },
      {
        name: "description",
        content:
          "Opening the Software Vala enterprise chat workspace with real-time messaging, receipts, translation and secure attachments.",
      },
      { property: "og:title", content: "Opening chat · Software Vala Enterprise Workspace" },
      {
        property: "og:description",
        content: "Real-time enterprise messaging with receipts, translation and secure attachments.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
