import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "镇安县生态产业协会管理中台",
  description: "镇安县生态产业协会管理中台",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
