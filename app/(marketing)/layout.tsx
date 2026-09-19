import { Nav } from "@/components/marketing/nav";
import { Footer } from "@/components/marketing/footer";
import { MarketingChatbot } from "@/components/marketing/chatbot";
import { ThemeToggle, themeBootstrapScript } from "@/components/marketing/theme-toggle";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      <Nav />
      <main>{children}</main>
      <Footer />
      <MarketingChatbot />
      <ThemeToggle />
    </>
  );
}
