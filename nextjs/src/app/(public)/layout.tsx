import type { ReactNode } from "react";
import { getCategoriesWithSubs } from "@/lib/queries";
import { InquiryProvider } from "./inquiry-context";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { InquiryDrawer } from "@/components/inquiry-drawer";
import { FloatingInquiry } from "@/components/floating-inquiry";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const categories = await getCategoriesWithSubs();

  return (
    <InquiryProvider>
      <Nav categories={categories} />
      {children}
      <Footer categories={categories} />
      <InquiryDrawer />
      <FloatingInquiry />
    </InquiryProvider>
  );
}
