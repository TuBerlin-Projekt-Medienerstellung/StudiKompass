import type {Metadata} from "next";
import {Quicksand} from "next/font/google";
import {ThemeProvider} from "../components/theme-provider";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

export const metadata: Metadata = {
    metadataBase: new URL(defaultUrl),
    title: "Next.js and Supabase Starter Kit",
    description: "The fastest way to build apps with Next.js and Supabase",
};

const quicksand = Quicksand({
    variable: "--font-quicksand",
    display: "swap",
    subsets: ["latin"],
});

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={`${quicksand.className} antialiased`}>
        <ThemeProvider>
            {children}

        </ThemeProvider>
        </body>
        </html>
    );
}
