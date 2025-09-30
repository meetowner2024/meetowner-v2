import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientWrapper from "../components/ClientWrapper";
import Head from "next/head";
import Script from "next/script";
import { cookies } from "next/headers";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "MeetOwner | Buy, Sell & Rent Properties in Hyderabad & Major Cities",
  description: "Find apartments, villas, plots & commercial properties in Hyderabad, Chennai, Bengaluru, and Andhra Pradesh cities. Connect directly with owners.",
  keywords: "real estate Hyderabad, buy property Hyderabad, sell property Hyderabad, apartments Hyderabad, villas Hyderabad, plots Hyderabad, Chennai properties, Bengaluru properties, AP real estate, rent property",
  authors: [{ name: "MeetOwner" }],
  openGraph: {
    title: "MeetOwner | Buy, Sell & Rent Properties in Hyderabad & Major Cities",
    description: "Explore top apartments, villas, plots & commercial properties in Hyderabad, Chennai, Bengaluru, and AP cities. Buy, sell, or rent directly with owners.",
    url: "https://www.meetowner.in",
    siteName: "MeetOwner",
    images: [
      {
        url: "https://www.meetowner.in/favicon.ico",
        alt: "MeetOwner logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MeetOwner | Buy, Sell & Rent Properties in Hyderabad & Major Cities",
    description: "Discover apartments, villas, plots & commercial properties in Hyderabad, Chennai, Bengaluru, and AP cities. Buy, sell, or rent directly with owners.",
    images: ["https://www.meetowner.in/favicon.ico"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Meet Owner",
  url: "https://www.meetowner.in",
  logo: "https://www.meetowner.in/favicon.ico",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-9553919919",
    contactType: "Customer Service",
    areaServed: "Hyderabad",
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
    "@type": "Offer",
    price: "10000.00",
    priceCurrency: "INR",
    availability: "https://schema.org/InStock",
    url: "https://www.meetowner.in",
    itemOffered: {
      "@type": "Product",
      name: "Real Estate Properties in Hyderabad",
      description:
        "Apartments, villas, and plots for sale or rent in Hyderabad.",
    },
  },
};
export default async function RootLayout({ children }) {
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
  async function getProfile(user_id) {
    if (!user_id) {
      return null;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/getProfile?user_id=${user_id}`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      return data || [];
    } catch (error) {
      return null;
    }
  }
  const profileData = userId ? await getProfile(userId) : [];

  return (
    <html lang="en">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="language" content="en-IN" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preload" href="/src/main.jsx" as="script" />

        <link rel="canonical" href="https://www.meetowner.in" />

        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Head>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-PQ3F0L8PGL"
        strategy="afterInteractive"
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-PQ3F0L8PGL');
      `,
        }}
      />
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

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-P8HMN9BJ"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <main id="main-content">
          <ClientWrapper profileData={profileData}>{children}</ClientWrapper>
        </main>
        {}
        {/* <Script
          id="disable-devtools"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener("contextmenu", (event) => event.preventDefault());
              document.onkeydown = function (e) {
                if (
                  e.key === "F12" ||
                  (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
                  (e.ctrlKey && e.key === "U")
                ) {
                  e.preventDefault();
                  return false;
                }
              };
            `,
          }}
        /> */}
      </body>
    </html>
  );
}
