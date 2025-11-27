import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";
import { Header } from "~/components/layout/header";
import { FoldersView } from "~/components/folders/folders-view";

export default async function FoldersPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <FoldersView />
      </main>
    </div>
  );
}
