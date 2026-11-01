"use client";
import { ThemeProvider } from "next-themes";
import { CartProvider } from "@/lib/cart";
import { ShopProvider } from "@/lib/shop";
import CartDrawer from "./CartDrawer";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="sosa-theme">
      <ShopProvider>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </ShopProvider>
    </ThemeProvider>
  );
}
