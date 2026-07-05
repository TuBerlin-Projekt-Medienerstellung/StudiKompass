interface KategorieBarProps {
    label: string;
    wert: number; // 0–5
}

const KategorieBar = ({label, wert}: KategorieBarProps) => {
    const breite = Math.min(100, Math.max(0, (wert / 5) * 100));

    return (
        <div className="flex items-center gap-3 text-sm">
            <span className="w-24 shrink-0 text-gray-600">{label}</span>
            <div className="flex-1 h-2 rounded-full bg-white/60 overflow-hidden">
                <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{width: `${breite}%`}}
                />
            </div>
            <span className="w-8 text-right font-medium">{wert.toFixed(1)}</span>
        </div>
    );
};

export default KategorieBar;