import {Star} from "lucide-react";

interface StarRatingDisplayProps {
    value: number; // 0–5, Dezimalwerte erlaubt (z.B. 4.2 -> 4 volle + 1 zu 20% gefüllter Stern)
    size?: number;
    className?: string;
}

const StarRatingDisplay = ({value, size = 16, className = ""}: StarRatingDisplayProps) => {
    return (
        <div className={`flex items-center gap-0.5 ${className}`}>
            {[0, 1, 2, 3, 4].map((i) => {
                const fuellgrad = Math.min(100, Math.max(0, (value - i) * 100));
                return (
                    <div key={i} className="relative shrink-0" style={{width: size, height: size}}>
                        <Star size={size} className="absolute inset-0 text-gray-300" fill="currentColor"/>
                        <div className="absolute inset-0 overflow-hidden" style={{width: `${fuellgrad}%`}}>
                            <Star size={size} className="text-amber-400" fill="currentColor"/>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default StarRatingDisplay;