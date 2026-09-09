import { createFileRoute } from "@tanstack/react-router";
import { MemberLoginPage } from "./firehacks.member.login";

export const Route = createFileRoute("/member/login")({
  head: () => ({
    meta: [
      { title: "Fire Hacks Scanner — Sign In" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: MemberLoginPage,
});
