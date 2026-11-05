import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Imperia Sensa Park",
  description: "Cổng đăng nhập và đăng ký Imperia Sensa Park",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased select-none">{children}</body>
    </html>
  );
}

