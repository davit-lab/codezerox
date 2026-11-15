const postimagesShareLinks: Record<string, string> = {
  fJd7vZXB: 'https://i.postimg.cc/HsZSdkLD/image.png',
  VJjRz1LT: 'https://i.postimg.cc/T3sHq38R/image.png',
  R6XHz3dX: 'https://i.postimg.cc/FzQg33L5/360-F-513485625-w-Wnxe-Ndk-Z3SNSt-Efc-CAz-Mhn-Es4IGLDe-G.webp',
};

export const getBlogCoverImageUrl = (coverUrl: string | null | undefined) => {
  if (!coverUrl) return null;

  try {
    const url = new URL(coverUrl);
    if (url.protocol !== 'https:') return null;

    if (url.hostname === 'postimg.cc' || url.hostname === 'www.postimg.cc') {
      return postimagesShareLinks[url.pathname.split('/').filter(Boolean).at(-1) || ''] || coverUrl;
    }

    return url.toString();
  } catch {
    return null;
  }
};
