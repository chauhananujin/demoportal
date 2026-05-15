import { Nav } from "@/components/marketing/nav";
import { Footer } from "@/components/marketing/footer";
import { MarketingChatbot } from "@/components/marketing/chatbot";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main>{children}</main>
      <Footer />
      <MarketingChatbot />
    </>
  );
}
