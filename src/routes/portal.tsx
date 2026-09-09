import { createFileRoute } from "@tanstack/react-router";
import { FireHacksPortalPage } from "./firehacks.portal.index";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Fire Hacks Portal" },
      { name: "description", content: "Participant portal for Fire Hacks 2026." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: FireHacksPortalPage,
});
