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
  title: "Gigabit.Host",
  description: "Community focused hosting.",
};

// const env = process.env.NODE_ENV
//   {(env == "production") ? (<div>test</div>) : null}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <a hidden rel="me" href="https://mastodon.lesbian.dev/@diana">Mastodon</a>
        <Navbar />
        <div className="container mx-auto pb-48 md:pb-24">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
