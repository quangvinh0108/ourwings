import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";
import { ProfileContent } from "~/components/profile/profile-content";
import { Header } from "~/components/layout/header";

export default async function ProfilePage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <ProfileContent />
      </main>
    </div>
  );
}
