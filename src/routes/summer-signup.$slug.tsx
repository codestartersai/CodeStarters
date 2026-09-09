import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/summer-signup/$slug")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => null,
});
