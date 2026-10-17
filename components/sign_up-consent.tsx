'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {SignUpForm} from '@/components/sign-up-form';
import {Privacy_terms} from '@/components/Policy';

export function SignUpProcess() {
    const [isOpen, setOpen] = useState(true);
    const [hasAccepted, setAccepted] = useState(false);
    const router = useRouter();

    const handleAccept = () => {
        setAccepted(true);
        setOpen(false);
    }; //user accepts-> can sign up

    const handleDecline = () => {
        router.push('/');
    };//back to landing page

    return (
        <div className="relative w-full">
            {!hasAccepted && (
                <Privacy_terms 
                    isOpen={isOpen} 
                    onAccept={handleAccept} 
                    onDecline={handleDecline} 
                />
            )}
            <SignUpForm />
        </div>
    );
}