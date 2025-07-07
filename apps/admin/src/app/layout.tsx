import type { Metadata } from "next";
import "./globals.css";
import "@fontsource/monaspace-krypton";
import "@fontsource/ubuntu";
import Footer from "@/components/navigation/footer";
import Navbar from "@/components/navigation/navbar";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

export const metadata: Metadata = {
  title: "Portal | Gigabit.Host",
  description: "Community focused hosting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="">
        <Navbar />
        <div className="">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
