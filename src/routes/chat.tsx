import { createFileRoute } from "@tanstack/react-router";
import { ChatWorkspace } from "@/components/chat/user/ChatWorkspace";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Team Chat · Software Vala Enterprise Workspace" },
      {
        name: "description",
        content:
          "Real-time enterprise chat with immutable message history, attachments, mentions, receipts, presence and live translation.",
      },
      { property: "og:title", content: "Team Chat · Software Vala Enterprise Workspace" },
      {
        property: "og:description",
        content:
          "Real-time enterprise messaging with attachments, mentions, read receipts and live translation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatRoute,
});

function ChatRoute() {
  return <ChatWorkspace />;
}
