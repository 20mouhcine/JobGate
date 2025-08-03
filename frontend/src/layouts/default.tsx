import Navbar from "@/components/navbar";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden ">
      <Navbar />
      <main className="container mx-auto max-w-full flex-grow pt-16 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
