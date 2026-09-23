import { createFileRoute } from "@tanstack/react-router";
import { ChatPlatform } from "@/components/chat/ChatPlatform";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Software Vala · Enterprise AI Communication Platform" },
      {
        name: "description",
        content:
          "Futuristic 3D enterprise chat workspace for Software Vala admins — AI assistant, live translation, emoji reactions, file sharing and analytics in one premium console.",
      },
      { property: "og:title", content: "Software Vala · Enterprise AI Communication Platform" },
      {
        property: "og:description",
        content:
          "Premium 3D AI communication console with live translation, smart replies and enterprise-grade conversation management.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <ChatPlatform />;
}
