import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nikboni",
  description: "Thoughtful digital work by Nikboni.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
