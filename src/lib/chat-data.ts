import logoAsset from "@/assets/software-vala-logo.jpg.asset.json";
import client1 from "@/assets/client-1.jpg";
import client2 from "@/assets/client-2.jpg";
import client3 from "@/assets/client-3.jpg";
import client4 from "@/assets/client-4.jpg";
import client5 from "@/assets/client-5.jpg";

export const valaLogo = logoAsset.url;

export type MsgKind = "text" | "list" | "file";

export interface Message {
  id: string;
  from: "ai" | "me";
  kind: MsgKind;
  text?: string;
  items?: string[];
  file?: { name: string; meta: string };
  time: string;
  read?: boolean;
  reactions?: string[];
}

export interface ClientProfile {
  name: string;
  company: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  since: string;
  plan: string;
  language: string;
  tags: string[];
  notes: string;
  stats: { openTickets: number; projects: number; satisfaction: string };
}

export interface Conversation {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  avatar: string;
  tint: string;
  when: string;
  unread: number;
  favorite: boolean;
  online: boolean;
  channel: "AI Assistant" | "Support" | "Billing" | "Product" | "Automation";
  profile: ClientProfile;
  messages: Message[];
}

export const now = (): string =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export const conversations: Conversation[] = [
  {
    id: "vala-ai",
    title: "Software Vala AI",
    subtitle: "Hello! How can I assist you today?",
    emoji: "🤖",
    avatar: valaLogo,
    tint: "from-[oklch(0.72_0.17_265)] to-[oklch(0.62_0.2_285)]",
    when: "10:30 AM",
    unread: 2,
    favorite: true,
    online: true,
    channel: "AI Assistant",
    profile: {
      name: "Amit Sharma",
      company: "Sharma Global Academy",
      role: "Director · Decision Maker",
      email: "amit@sharmaacademy.in",
      phone: "+91 98220 41188",
      location: "Pune, Maharashtra",
      since: "Jan 2024",
      plan: "Enterprise Suite",
      language: "English / हिन्दी",
      tags: ["School ERP", "High Value", "Renewal 2026"],
      notes: "Prefers WhatsApp-style updates. Demo shared, awaiting board approval.",
      stats: { openTickets: 1, projects: 3, satisfaction: "98%" },
    },
    messages: [
      {
        id: "m1",
        from: "ai",
        kind: "text",
        text: "Hello Amit! 👋 How can I assist you today?",
        time: "10:30 AM",
      },
      {
        id: "m2",
        from: "me",
        kind: "text",
        text: "I need help with my school management software. Can you give me the key features?",
        time: "10:31 AM",
        read: true,
      },
      {
        id: "m3",
        from: "ai",
        kind: "list",
        text: "Sure! Our School Management Software includes:",
        items: [
          "Student Management",
          "Attendance Tracking",
          "Fee Management",
          "Examination System",
          "Timetable Management",
          "Reports & Analytics",
          "Parent Communication",
        ],
        time: "10:32 AM",
      },
      { id: "m4", from: "me", kind: "text", text: "Yes, please share the demo.", time: "10:33 AM", read: true },
      {
        id: "m5",
        from: "ai",
        kind: "file",
        file: { name: "School_Management_Demo.pdf", meta: "PDF • 3.6 MB" },
        time: "10:34 AM",
      },
      {
        id: "m6",
        from: "ai",
        kind: "text",
        text: "Here is the demo. Let me know if you need anything else! 🙂",
        time: "10:34 AM",
        reactions: ["👍"],
      },
    ],
  },
  {
    id: "website",
    title: "Website Support",
    subtitle: "I need help with my website",
    emoji: "🌐",
    avatar: client1,
    tint: "from-[oklch(0.75_0.13_230)] to-[oklch(0.62_0.16_250)]",
    when: "Yesterday",
    unread: 0,
    favorite: false,
    online: true,
    channel: "Support",
    profile: {
      name: "Rohit Mehta",
      company: "Mehta Interiors",
      role: "Founder",
      email: "rohit@mehtainteriors.com",
      phone: "+91 98765 33021",
      location: "Ahmedabad, Gujarat",
      since: "Mar 2025",
      plan: "Website Care Plan",
      language: "English",
      tags: ["Website", "SEO", "Support"],
      notes: "Domain diagnostic scan pending from client side.",
      stats: { openTickets: 2, projects: 1, satisfaction: "94%" },
    },
    messages: [
      { id: "w1", from: "me", kind: "text", text: "I need help with my website", time: "09:12 AM", read: true },
      {
        id: "w2",
        from: "ai",
        kind: "text",
        text: "Of course. Share the domain and I will run a full diagnostic scan for you.",
        time: "09:14 AM",
      },
    ],
  },
  {
    id: "billing",
    title: "Billing Question",
    subtitle: "Payment failed, please help",
    emoji: "💳",
    avatar: client2,
    tint: "from-[oklch(0.85_0.15_85)] to-[oklch(0.72_0.17_60)]",
    when: "Yesterday",
    unread: 1,
    favorite: false,
    online: false,
    channel: "Billing",
    profile: {
      name: "Neha Kulkarni",
      company: "Kulkarni Traders",
      role: "Accounts Head",
      email: "accounts@kulkarnitraders.in",
      phone: "+91 90210 77452",
      location: "Nashik, Maharashtra",
      since: "Aug 2024",
      plan: "CRM Standard",
      language: "हिन्दी / English",
      tags: ["Billing", "Auto-Renew"],
      notes: "Invoice re-issued, card update requested.",
      stats: { openTickets: 1, projects: 1, satisfaction: "91%" },
    },
    messages: [
      { id: "b1", from: "me", kind: "text", text: "Payment failed, please help", time: "04:40 PM", read: true },
      {
        id: "b2",
        from: "ai",
        kind: "text",
        text: "I re-issued the invoice and your subscription stays active. No action needed. ✅",
        time: "04:42 PM",
      },
    ],
  },
  {
    id: "feature",
    title: "Feature Request",
    subtitle: "Add new dashboard feature",
    emoji: "💡",
    avatar: client3,
    tint: "from-[oklch(0.8_0.15_310)] to-[oklch(0.65_0.19_300)]",
    when: "May 20",
    unread: 0,
    favorite: true,
    online: false,
    channel: "Product",
    profile: {
      name: "Vikram Singh",
      company: "Singh Logistics Pvt Ltd",
      role: "Operations Manager",
      email: "vikram@singhlogistics.com",
      phone: "+91 99300 12874",
      location: "Delhi NCR",
      since: "Nov 2024",
      plan: "ERP Growth",
      language: "English",
      tags: ["Product", "Dashboard", "Roadmap"],
      notes: "Feature VALA-1284 queued for next sprint.",
      stats: { openTickets: 0, projects: 2, satisfaction: "96%" },
    },
    messages: [
      { id: "f1", from: "me", kind: "text", text: "Add new dashboard feature", time: "11:02 AM", read: true },
      { id: "f2", from: "ai", kind: "text", text: "Logged as VALA-1284 for the next sprint. 🚀", time: "11:05 AM" },
    ],
  },
  {
    id: "plugin",
    title: "Plugin Help",
    subtitle: "How to install the plugin?",
    emoji: "🧩",
    avatar: client4,
    tint: "from-[oklch(0.83_0.12_350)] to-[oklch(0.68_0.18_10)]",
    when: "May 19",
    unread: 0,
    favorite: false,
    online: true,
    channel: "Automation",
    profile: {
      name: "Priya Nair",
      company: "Nair EdTech Labs",
      role: "Technical Lead",
      email: "priya@nairedtech.com",
      phone: "+91 87990 45510",
      location: "Kochi, Kerala",
      since: "Feb 2025",
      plan: "Automation Pro",
      language: "English",
      tags: ["Plugin", "API Key", "Automation"],
      notes: "Needs help with API key connection step.",
      stats: { openTickets: 1, projects: 2, satisfaction: "93%" },
    },
    messages: [
      { id: "p1", from: "me", kind: "text", text: "How to install the plugin?", time: "01:20 PM", read: true },
      {
        id: "p2",
        from: "ai",
        kind: "list",
        text: "Three steps and you are live:",
        items: ["Download the .zip package", "Upload it in Admin → Plugins", "Activate and connect your API key"],
        time: "01:22 PM",
      },
    ],
  },
  {
    id: "general",
    title: "General Query",
    subtitle: "Tell me about your services",
    emoji: "💬",
    avatar: client5,
    tint: "from-[oklch(0.82_0.14_150)] to-[oklch(0.66_0.16_165)]",
    when: "May 18",
    unread: 0,
    favorite: false,
    online: true,
    channel: "Support",
    profile: {
      name: "Arjun Patel",
      company: "Patel Retail Group",
      role: "Business Owner",
      email: "arjun@patelretail.in",
      phone: "+91 93450 88123",
      location: "Surat, Gujarat",
      since: "Jul 2026",
      plan: "Prospect · Trial",
      language: "English / ગુજરાતી",
      tags: ["New Lead", "Services", "Pre-Sales"],
      notes: "Exploring ERP + CRM bundle for 4 retail outlets.",
      stats: { openTickets: 0, projects: 0, satisfaction: "—" },
    },
    messages: [
      { id: "g1", from: "me", kind: "text", text: "Tell me about your services", time: "06:02 PM", read: true },
      {
        id: "g2",
        from: "ai",
        kind: "text",
        text: "Software Vala builds ERP, school management, CRM and AI automation suites for enterprises. 🏢",
        time: "06:03 PM",
      },
    ],
  },
];

export const aiReplies = [
  "Got it — I am processing that on the Vala AI engine right now. ⚡",
  "Understood. I have routed this to the right workspace and notified the team. ✅",
  "Here is what I found in your workspace. Anything else you need? 🙂",
  "Noted. I have saved this to your conversation memory for future context. 🧠",
];

export const quickMessages = [
  "Hello Software Vala 👋",
  "How are you? 🙂",
  "I need a demo of your software 💻",
  "Please share the pricing details 💰",
  "Thank you for your support 🙏",
] as const;

export const emojiGroups: { label: string; emojis: string[] }[] = [
  {
    label: "Business",
    emojis: ["🤝", "💼", "📈", "📊", "💰", "🧾", "📝", "📅", "⏱️", "🎯", "🏆", "🏢", "🖥️", "💻", "📱", "🌐"],
  },
  {
    label: "Approvals",
    emojis: ["✅", "☑️", "👍", "👏", "🙌", "💯", "🔔", "📌", "🔒", "✍️", "🚀", "⚡"],
  },
  {
    label: "Polite",
    emojis: ["🙏", "😊", "🙂", "😇", "🤗", "😉", "👋", "🫶", "❤️", "✨", "🎉", "🥳"],
  },
  {
    label: "Support",
    emojis: ["🤖", "🧠", "💡", "🛠️", "🗂️", "📎", "📄", "📷", "🔍", "⚙️", "❓", "⚠️"],
  },
];


export const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
] as const;

export type LangCode = (typeof languages)[number]["code"];
