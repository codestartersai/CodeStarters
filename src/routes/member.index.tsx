import { createFileRoute } from "@tanstack/react-router";
import { MemberScannerPage } from "./firehacks.member";

export const Route = createFileRoute("/member/")({
  head: () => ({
    meta: [{ title: "Fire Hacks Food Scanner" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: MemberScannerPage,
});
