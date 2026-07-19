import type {Metadata, Viewport} from "next";
import {Quicksand} from "next/font/google";
import {ThemeProvider} from "../components/theme-provider";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

export const metadata: Metadata = {
    metadataBase: new URL(defaultUrl),
    title: "NAVIS",
    description: "Dein Studium, perfekt organisiert.",
};
export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#09090b" }
    ]
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
