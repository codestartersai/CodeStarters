import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/firehacks/portal")({
  component: () => <Outlet />,
});
