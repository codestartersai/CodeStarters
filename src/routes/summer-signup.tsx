import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/summer-signup")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => null,
});
