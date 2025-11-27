import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";
import { Header } from "~/components/layout/header";
import { FolderDetailView } from "~/components/folders/folder-detail-view";

export default async function FolderDetailPage({
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
        <FolderDetailView folderId={params.id} />
      </main>
    </div>
  );
}
