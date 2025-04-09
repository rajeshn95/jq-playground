import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jq-playground.rajeshnautiyal.me"),
  applicationName: "JSON Query Playground",
  title: "JSON Query Playground | Interactive Playground for JQ/JMESPath",
  description:
    "Transform and query JSON data with JQ/JMESPath in an interactive playground. Test and experiment with JQ/JMESPath queries in real-time with syntax highlighting and instant results.",
  keywords: [
    "jq",
    "JMESPath",
    "jmespath",
    "jmes",
    "JSON",
    "query",
    "playground",
    "data transformation",
    "JSON processing",
    "jq-wasm",
    "interactive editor",
  ],
  openGraph: {
    title: "JSON Query Playground | Interactive Playground for JQ/JMESPath",
    description:
      "Transform and query JSON data with JQ/JMESPath in an interactive playground. Test and experiment with JQ/JMESPath queries in real-time with syntax highlighting and instant results.",
    type: "website",
    locale: "en_US",
    siteName: "JSON Query Playground",
    images: [{ url: "https://jq-playground.rajeshnautiyal.me/logo.png" }],
  },
  twitter: {
    card: "summary",
    title: "JSON Query Playground | Interactive Playground for JQ/JMESPath",
    description:
      "Transform and query JSON data with JQ/JMESPath in an interactive playground. Test and experiment with JQ/JMESPath queries in real-time with syntax highlighting and instant results.",
    images: "https://jq-playground.rajeshnautiyal.me/logo.png",
    creator: "@Rajssj4",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head></head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
