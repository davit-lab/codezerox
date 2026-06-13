import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: string;
  jsonLd?: Record<string, unknown>;
}

const BASE_URL =
  import.meta.env.VITE_SITE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : '');
const DEFAULT_TITLE = 'CodeZero Academy - პრემიუმ პროგრამირების წიგნები';
const DEFAULT_DESC = 'ისწავლე პროგრამირება ქართულ ენაზე. პრემიუმ წიგნები, კურსები, AI ტუტორი და Code Playground დამწყები და გამოცდილი დეველოპერებისთვის.';
const DEFAULT_IMAGE = `${BASE_URL}/favicon.png`;

const SEOHead = ({
  title,
  description = DEFAULT_DESC,
  path = '/',
  image = DEFAULT_IMAGE,
  type = 'website',
  jsonLd,
}: SEOHeadProps) => {
  const fullTitle = title ? `${title} | CodeZero Academy` : DEFAULT_TITLE;
  const canonicalUrl = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="CodeZero Academy" />
      <meta property="og:locale" content="ka_GE" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
