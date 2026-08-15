import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "@/styles/tokens.css";
import "@/styles/primitives.css";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pegasusprep.education"),
  title: "Pegasus Education — Private Education Office",
  description:
    "A private education office for high net worth families. By invitation and referral only.",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Pegasus Education",
    title: "Pegasus Education — Private Education Office",
    description:
      "A private education office for high net worth families. By invitation and referral only.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pegasus Education — Private Education Office",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pegasus Education — Private Education Office",
    description:
      "A private education office for high net worth families. By invitation and referral only.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fafaf7",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        {children}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','2299738294187764');fbq('track','PageView');`,
          }}
        />
      </body>
    </html>
  );
}
