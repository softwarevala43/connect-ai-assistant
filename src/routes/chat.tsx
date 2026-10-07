import { createFileRoute } from "@tanstack/react-router";
import { ChatWorkspace } from "@/components/chat/user/ChatWorkspace";

export const Route = createFileRoute("/chat")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Enterprise Chat — Software Vala" },
      { name: "description", content: "Secure real-time communication for Software Vala teams and clients." },
      { property: "og:title", content: "Enterprise Chat — Software Vala" },
      { property: "og:description", content: "Secure real-time communication for Software Vala teams and clients." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  return <ChatWorkspace />;
}