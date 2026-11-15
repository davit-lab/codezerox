import { describe, expect, it } from "vitest";
import { getBlogCoverImageUrl } from "./blog-images";

describe("getBlogCoverImageUrl", () => {
  it("resolves saved Postimages share-page links to image files", () => {
    expect(getBlogCoverImageUrl("https://postimg.cc/fJd7vZXB")).toBe(
      "https://i.postimg.cc/HsZSdkLD/image.png",
    );
    expect(getBlogCoverImageUrl("https://postimg.cc/VJjRz1LT")).toBe(
      "https://i.postimg.cc/T3sHq38R/image.png",
    );
    expect(getBlogCoverImageUrl("https://postimg.cc/R6XHz3dX")).toBe(
      "https://i.postimg.cc/FzQg33L5/360-F-513485625-w-Wnxe-Ndk-Z3SNSt-Efc-CAz-Mhn-Es4IGLDe-G.webp",
    );
  });

  it("preserves direct image URLs and rejects non-HTTPS URLs", () => {
    expect(getBlogCoverImageUrl("https://i.postimg.cc/jd5XgY4F/image.png")).toBe(
      "https://i.postimg.cc/jd5XgY4F/image.png",
    );
    expect(getBlogCoverImageUrl("http://i.postimg.cc/image.png")).toBeNull();
    expect(getBlogCoverImageUrl(null)).toBeNull();
  });
});
