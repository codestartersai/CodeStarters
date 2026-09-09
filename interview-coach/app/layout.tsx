import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Interviews",
  description: "In-person interviews — questions, recording, and grading.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b border-ink-700 bg-ink-900/60 backdrop-blur sticky top-0 z-10">
          <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
            <Link href="/" className="font-semibold tracking-tight">
              Interviews
            </Link>
            <Link
              href="/start"
              className="rounded-lg bg-accent-500 hover:bg-accent-600 transition px-3 py-1.5 text-sm font-medium text-white"
            >
              New Interview
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
