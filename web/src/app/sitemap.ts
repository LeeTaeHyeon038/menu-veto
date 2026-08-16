import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * 검색엔진에게 "이 사이트에 무엇이 있는지" 알려주는 목록.
 * 이 서비스는 페이지가 하나뿐이라 항목도 하나다.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      // 내용이 거의 바뀌지 않는 한 장짜리 서비스다
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
