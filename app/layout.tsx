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
  title: "JSON Query Playground | Interactive jq Playground",
  description:
    "Transform and query JSON data with jq in an interactive playground. Test and experiment with jq queries in real-time with syntax highlighting and instant results.",
  keywords: [
    "jq",
    "JSON",
    "query",
    "playground",
    "data transformation",
    "JSON processing",
    "jq-wasm",
    "interactive editor",
  ],
  openGraph: {
    title: "JSON Query Playground | Interactive jq Playground",
    description:
      "Transform and query JSON data with jq in an interactive playground. Test and experiment with jq queries in real-time with syntax highlighting and instant results.",
    type: "website",
    locale: "en_US",
    siteName: "JSON Query Playground",
  },
  twitter: {
    card: "summary",
    title: "JSON Query Playground | Interactive jq Playground",
    description:
      "Transform and query JSON data with jq in an interactive playground. Test and experiment with jq queries in real-time with syntax highlighting and instant results.",
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.op = window.op||function(...args){(window.op.q=window.op.q||[]).push(args);};
          window.op('init', {
            clientId: '3bf872ec-15b8-4308-b0d5-b56e0e15a6f5',
            trackScreenViews: true,
            trackOutgoingLinks: true,
            trackAttributes: true,
          });`,
          }}
        />
        <script src="https://openpanel.dev/op1.js" defer async></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
