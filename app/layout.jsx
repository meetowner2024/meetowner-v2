import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientWrapper from "../components/ClientWrapper";
import Script from "next/script";
import { cookies } from "next/headers";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});
export const metadata = {
  title: {
    default:
      "MeetOwner | Buy, Sell & Rent Properties in Hyderabad & Major Cities",
    template: "%s | MeetOwner",
  },
  description:
    "Find apartments, villas, plots & commercial properties in Hyderabad, Chennai, Bengaluru, and Andhra Pradesh cities. Connect directly with owners.",
  keywords:
    "real estate Hyderabad, buy property Hyderabad, sell property Hyderabad, apartments Hyderabad, villas Hyderabad, plots Hyderabad, Chennai properties, Bengaluru properties, AP real estate, rent property, 2 bhk apartment hitech city, auro reality hyderabad",
  authors: [{ name: "MeetOwner" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title:
      "MeetOwner | Buy, Sell & Rent Properties in Hyderabad & Major Cities",
    description:
      "Explore top apartments, villas, plots & commercial properties in Hyderabad, Chennai, Bengaluru, and AP cities. Buy, sell, or rent directly with owners. Direct owner deals—no brokers!",
    url: "https://www.meetowner.in",
    siteName: "MeetOwner",
    images: [
      {
        url: "https://www.meetowner.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Hyderabad Real Estate: Apartments, Villas & Plots for Sale/Rent",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "MeetOwner | Buy, Sell & Rent Properties in Hyderabad & Major Cities",
    description:
      "Discover 2 BHK apartments in Hitech City, Auro Realty projects & more. Direct owner contact in Hyderabad, Chennai, Bengaluru.",
    images: ["https://www.meetowner.in/twitter-image.jpg"],
    creator: "@meetowner",
  },
  verification: {
    google: "your-google-site-verification-code",
    yandex: "your-yandex-code",
  },
  alternates: {
    canonical: "https://www.meetowner.in",
    languages: {
      "en-IN": "https://www.meetowner.in",
    },
  },
};
const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Meet Owner",
    url: "https://www.meetowner.in",
    logo: "https://www.meetowner.in/favicon.ico",
    image: "https://www.meetowner.in/og-image.jpg",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-9553919919",
      contactType: "Customer Service",
      areaServed: ["Hyderabad", "Chennai", "Bengaluru"],
      availableLanguage: ["English", "Telugu", "Hindi"],
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Hyderabad",
      addressRegion: "Telangana",
      postalCode: "500001",
      addressCountry: "IN",
    },
    sameAs: [
      "https://www.facebook.com/meetowner",
      "https://twitter.com/meetowner",
      "https://www.instagram.com/meetowner",
    ],
    makesOffer: {
      "@type": "AggregateOffer",
      name: "Real Estate Properties in Hyderabad & Cities",
      description:
        "Apartments, villas, plots for sale/rent in Hitech City, Auro Realty & more.",
      lowPrice: "10000",
      highPrice: "10Cr",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      offerCount: 1000,
      itemOffered: {
        "@type": "Product",
        "@id": "https://www.meetowner.in/listings",
        name: "Properties for Sale/Rent",
        url: "https://www.meetowner.in/listings",
      },
    },
    areaServed: {
      "@type": "Place",
      name: ["Hyderabad", "Chennai", "Bengaluru"],
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MeetOwner",
    url: "https://www.meetowner.in",
    logo: "https://www.meetowner.in/favicon.ico",
    foundingDate: "2023",
    legalName: "MeetOwner Real Estate Pvt Ltd",
    knowsAbout: ["Real Estate", "Hyderabad Properties", "2 BHK Apartments"],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Property Listings",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Apartment",
            name: "2 BHK Apartments in Hitech City",
            url: "https://www.meetowner.in/listings/2-bhk-residential-apartment-for-sale-in-hitech-city-hyderabad",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Apartment",
            name: "Auro Realty Projects",
            url: "https://www.meetowner.in/property?project=auro-reality",
          },
        },
      ],
    },
  },
];
export default async function RootLayout({ children, params }) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");
  let userId = null;
  if (userCookie) {
    try {
      const parsed = JSON.parse(userCookie.value);
      userId = parsed?.user_details?.user_id || null;
    } catch (err) {
      console.error("Failed to parse user cookie:", err);
    }
  }
  let profileData = null;
  if (userId) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/getProfile?user_id=${userId}`,
        { credentials: "include" }
      );
      if (res.ok) {
        profileData = await res.json();
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
    }
  }
  const canonicalUrl = params?.canonical || "https://www.meetowner.in";
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {}
        <link rel="canonical" href={canonicalUrl} />
        {}
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        {}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          fetchPriority="high"
          href="https://www.googletagmanager.com"
        />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        {}
        {structuredData.map((schema, idx) => (
          <script
            key={idx}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
        {}
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="language" content="en-IN" />
        {}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-P8HMN9BJ"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="GTM"
          />
        </noscript>
        {}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-PQ3F0L8PGL"
          strategy="afterInteractive"
          fetchPriority="low"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-PQ3F0L8PGL', { send_page_view: false });
            `,
          }}
        />
        {}
        <Script
          id="gtm"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-P8HMN9BJ');
            `,
          }}
        />
        <main id="main-content">
          <ClientWrapper profileData={profileData}>{children}</ClientWrapper>
        </main>
      </body>
    </html>
  );
}
