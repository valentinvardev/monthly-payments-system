import { AppHeader } from "@/components/AppHeader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <div className="mx-auto w-full max-w-6xl flex-1 p-6">{children}</div>
    </>
  );
}
