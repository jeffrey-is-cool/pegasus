import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://pegasusprep.education", changeFrequency: "monthly", priority: 1 }];
}
