import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * 크롤러에게 주는 안내문.
 * 숨길 것이 없는 서비스라 전부 허용하고, sitemap 위치만 알려준다.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
