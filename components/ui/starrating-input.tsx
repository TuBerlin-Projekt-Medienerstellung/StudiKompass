"use client";

import {useState} from "react";
import {Star} from "lucide-react";

interface StarRatingInputProps {
    value: number; // 0–5, ganzzahlig
    onChange: (value: number) => void;
    size?: number;
}

const StarRatingInput = ({value, onChange, size = 22}: StarRatingInputProps) => {
    const [hover, setHover] = useState<number | null>(null);
    const angezeigterWert = hover ?? value;

    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((stern) => (
                <button
                    key={stern}
                    type="button"
                    onClick={() => onChange(stern)}
                    onMouseEnter={() => setHover(stern)}
                    onMouseLeave={() => setHover(null)}
                    className="transition-transform hover:scale-110"
                    aria-label={`${stern} von 5 Sternen`}
                >
                    <Star
                        size={size}
                        className={stern <= angezeigterWert ? "text-amber-400" : "text-gray-300"}
                        fill="currentColor"
                    />
                </button>
            ))}
        </div>
    );
};

export default StarRatingInput;