import React from "react";

const initialsAvatar = (email: string | null) => {
    if (!email) return "-";

    try {
        const namePart = email.split('@')[0];
        const parts = namePart.split('.');
        const firstInitial = parts[0] ? parts[0][0] : '';
        const secondInitial = parts[1] ? parts[1][0] : '';

        return (firstInitial + secondInitial).toUpperCase();
    } catch (error) {
        return "-";
    }
};

interface AvatarProps {
    email: string | null;
}

export default function Avatar({email}: AvatarProps) {
    return (
        <div>
            {initialsAvatar(email)}
        </div>
    );
}