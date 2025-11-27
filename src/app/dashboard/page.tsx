import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";
import { DashboardContent } from "~/components/dashboard/dashboard-content";
import { Header } from "~/components/layout/header";

export default async function DashboardPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <DashboardContent />
      </main>
    </div>
  );
}
