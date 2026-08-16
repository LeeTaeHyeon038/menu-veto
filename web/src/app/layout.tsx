import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
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
  // 상대 경로(예: opengraph-image)를 절대 주소로 바꿀 기준.
  // 이게 없으면 미리보기 이미지 주소가 상대 경로로 나가 카톡에서 안 뜬다
  metadataBase: new URL(SITE_URL),

  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  keywords: ["메뉴 추천", "점심 메뉴", "메뉴 정하기", "뭐 먹지", "메뉴 고르기"],

  // 카톡·슬랙 등에 링크를 붙여넣을 때 뜨는 미리보기.
  // 이미지는 app/opengraph-image.tsx가 자동으로 연결된다
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

// 주 사용 환경이 모바일이다. 주소창 색까지 서비스 색으로 맞춘다
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f1ea" },
    { media: "(prefers-color-scheme: dark)", color: "#171310" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // 값이 없으면 아예 넣지 않는다. 로컬 개발까지 GA4에 잡히면 지표가 오염된다
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

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
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}
