import { AppHeader } from "@/components/AppHeader";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <div className="mx-auto w-full max-w-4xl flex-1 px-6 pt-8 pb-16">{children}</div>
    </>
  );
}
