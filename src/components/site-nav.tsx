
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import SiteNavClient from "@/components/site-nav-client";

export default async function SiteNav() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return <SiteNavClient initialSession={session} />;
}
