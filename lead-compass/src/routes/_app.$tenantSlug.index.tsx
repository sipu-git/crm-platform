import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$tenantSlug/")({
  ssr: false,
  beforeLoad: ({ params }) => {
    throw redirect({ to: `/${params.tenantSlug}/dashboard` });
  },
  component: () => null,
});
