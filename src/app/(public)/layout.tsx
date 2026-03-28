import Footer from "@/components/shared/footer";
import Navbar from "@/components/shared/navbar";
import { getAllCategories } from "@/lib/data/categories";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getAllCategories();
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
