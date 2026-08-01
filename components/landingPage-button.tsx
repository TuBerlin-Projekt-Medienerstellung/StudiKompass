"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";


interface NavButtonProps {
    href: string;
    children: React.ReactNode;
    loadingText?: string;
    className?: string;
}

export function NavButton({ href, children, loadingText, className }: NavButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsLoading(true);
        router.push(href);
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className={`${className} flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-wait`}
        >
            {isLoading ? (
                <>
                    <Loader2 className="size-5 animate-spin" />
                    <span>{loadingText || "Laden..."}</span>
                </>
            ) : (
                children
            )}
        </button>
    );
}