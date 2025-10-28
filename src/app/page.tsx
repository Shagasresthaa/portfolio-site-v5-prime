import { auth } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import HomeComponent from "./_components/HomeComponent";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
  }

  return (
    <HydrateClient>
      <main>
        <HomeComponent />
      </main>
    </HydrateClient>
  );
}
