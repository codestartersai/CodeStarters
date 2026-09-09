import { createFileRoute } from "@tanstack/react-router";
import { FireHacksPortalLoginPage } from "./firehacks.portal.login";

export const Route = createFileRoute("/portal/login")({
  head: () => ({
    meta: [
      { title: "Fire Hacks Portal — Sign In" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: FireHacksPortalLoginPage,
});
