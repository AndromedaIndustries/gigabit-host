import type { Metadata } from "next";
import "./globals.css";
import "@fontsource/monaspace-krypton";
import "@fontsource/ubuntu";
import Footer from "@/components/navigation/footer";
import Navbar from "@/components/navigation/navbar";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import Sidebar from "@/components/navigation/sidebar";
import { createClient } from "@/utils/supabase/server";
config.autoAddCss = false;

export const metadata: Metadata = {
  title: "Admin | Gigabit.Host",
  description: "Community focused hosting.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabaseClent = await createClient();

  const user = (await supabaseClent.auth.getUser()).data.user;

  if (!user) {
    console.log("No user found");
  }

  return (
    <html lang="en">
      <body className="">
        <Navbar />
        <div className="flex md:flex-row ">
          <div className="hidden lg:flex lg:w-60 pt-16 h-screen bg-base-200">
            <div className="p-2">
              {Sidebar()}
            </div>

          </div >
          <div className="bg-base-100 flex-grow min-h-dvh b-48 pt-16">
            <div className="p-5">
              {children}
            </div>
          </div>
        </div >
        <Footer />
      </body>
    </html>
  );
}
