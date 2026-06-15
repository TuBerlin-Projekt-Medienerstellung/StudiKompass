import NavBar from "@/components/nav-bar";

export default function ProtectedLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-zinc-100">
            <NavBar/>
            <main className="flex-1 md:ml-72 p-6 mt-13 md:mt-0">
                {children}
            </main>
        </div>
    );
}