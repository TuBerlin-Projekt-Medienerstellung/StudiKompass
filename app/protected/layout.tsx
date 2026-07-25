import NavBar from "@/components/nav-bar";
import { pruefeSemesterUpdate } from "@/app/protected/planner/actions";

export default async function ProtectedLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    await pruefeSemesterUpdate();

    return (
        <div className="min-h-screen flex flex-col bg-zinc-100 dark:bg-[#160A1F] text-foreground">
            <NavBar/>
            <main className="flex-1 md:ml-72 p-6 mt-13 md:mt-0">
                {children}
            </main>
        </div>
    );
}
