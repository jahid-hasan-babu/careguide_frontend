import type { Metadata } from "next";
import { ReduxProvider } from "../redux/provider";
import "../index.css";

export const metadata: Metadata = {
  title: "SecureNotes | Enterprise RBAC & Aggregations",
  description: "Secure Note-Taking Platform with Role-Based Access Control and MongoDB Aggregation Pipelines",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
