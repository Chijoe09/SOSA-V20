import "./globals.css";
import Script from "next/script";
import { Archivo } from "next/font/google";
import Providers from "@/components/Providers";
import ThemeToggle from "@/components/ThemeToggle";
import RewardsPoints from "@/components/RewardsPoints";
import CategoryBar from "@/components/CategoryBar";
import Footer from "@/components/Footer";
import { CartButton } from "@/components/CartDrawer";

const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });

export const metadata = { title: "SOSA — SOphisticated SAmples", description: "Made in Nigeria. Pay with Pi." };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const wide = { fontFamily: "var(--font-archivo), sans-serif", fontWeight: 900, letterSpacing: "0.5px", fontStretch: "125%", color: "#FFFFFF" } as const;
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={archivo.variable}>
        <Script src="https://sdk.minepi.com/pi-sdk.js" strategy="beforeInteractive" />
        <Providers>
          {/* dark top bar: title + category pointers (so they never cover content) */}
          <div className="bg-[#0A0A0A] text-white sticky top-0 z-30">
            <div className="flex items-center justify-between px-3 pt-2">
              <div className="leading-tight">
                <div className="text-sm sm:text-lg" style={wide}>SOPHISTICATED SAMPLES</div>
                <div className="text-xs sm:text-sm" style={wide}>SOSA-outfits</div>
              </div>
              <div className="flex items-center"><RewardsPoints /><ThemeToggle /><CartButton /></div>
            </div>
            <CategoryBar />
          </div>
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
