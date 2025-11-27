import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";
import { Header } from "~/components/layout/header";
import { FlashcardsMode } from "~/components/modes/flashcards-mode";

export default async function FlashcardsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <FlashcardsMode studySetId={params.id} />
      </main>
    </div>
  );
}
