import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "우리 뭐 먹지?",
  description:
    "먹고 싶은 걸 고르지 말고, 먹기 싫은 걸 지우세요. 여러 명이 각자 싫은 메뉴를 하나씩 지워 빠르게 메뉴를 정하는 서비스.",
};

// 주 사용 환경이 모바일이다. 주소창 색까지 서비스 색으로 맞춘다
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f1ea" },
    { media: "(prefers-color-scheme: dark)", color: "#171310" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      {/*
       * 100vh가 아니라 100dvh를 쓴다. 모바일 브라우저는 주소창 높이까지 vh에
       * 포함해서, vh로 잡으면 화면 아래에 둔 버튼이 주소창에 가린다
       */}
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
