import { useEffect, useState } from 'react';
import Head from 'next/head';

const Meta = ({ author, description, keywords, noIndex, title }) => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUrl(window.location.origin);
    }
  }, []);

  const defaultTitle = 'LembarKerja – Platform Edukasi Digital';
  const defaultDescription =
    'Platform edukasi digital untuk guru, pelajar, dan kreator. Ribuan template interaktif siap dipakai.';

  const finalTitle = title ? `${title} | LembarKerja` : defaultTitle;
  const finalDescription = description || defaultDescription;

  return (
    <Head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="title" content={finalTitle} />
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />

      <title>{finalTitle}</title>

      {/* Favicon */}
      <link rel="icon" href="images/favicon.png" />

      {/* Font Awesome (for <i className="fa-solid fa-...") */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />

      {/* OpenGraph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={`${url}/images/seo-cover.png`} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={finalTitle} />
      <meta property="twitter:description" content={finalDescription} />
      <meta property="twitter:image" content={`${url}/images/seo-cover.png`} />

      {noIndex && <meta name="robots" content="noindex" />}
    </Head>
  );
};

Meta.defaultProps = {
  author: 'LembarKerja',
  description: '',
  keywords: 'lembar kerja, edukasi, guru, template, belajar online',
  noIndex: false,
};

export default Meta;
