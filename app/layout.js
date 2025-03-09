import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Community Salad Tools - Useful Tools for the Salad Community",
  description: "Discover a collection of useful tools made specifically for the Salad community. Enhance your experience with our unique tools!",
  openGraph: {
    title: "Community Salad Tools - Useful Tools for the Salad Community",
    description: "Discover a collection of useful tools made specifically for the Salad community. Enhance your experience with our unique tools!",
    url: "https://salad-tools.vercel.app/",
    siteName: "Community Salad Tools",
    images: [
      {
        url: "https://salad-tools.vercel.app/salad.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Community Salad Tools - Useful Tools for the Salad Community",
    description: "Discover a collection of useful tools made specifically for the Salad community. Enhance your experience with our unique tools!",
    images: ["https://salad-tools.vercel.app/salad.png"],
  },
  alternates: {
    canonical: "https://salad-tools.vercel.app/",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://salad-tools.vercel.app/" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}