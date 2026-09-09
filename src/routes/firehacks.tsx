import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/firehacks")({
  component: FirehacksLayout,
});

// firehacks.tsx is the parent layout for /firehacks/* routes.
// Redirect bare /firehacks to /firehacks/member in the component,
// not in beforeLoad (which would also block child routes).
function FirehacksLayout() {
  return <Outlet />;
}
