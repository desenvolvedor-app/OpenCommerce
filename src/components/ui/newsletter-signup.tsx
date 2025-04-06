'use client';

import { CheckCircle, Mail } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function NewsletterSignup() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter an email address');
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setIsSubmitting(false);
        setIsSubscribed(true);
        toast.success('Thanks for subscribing to our newsletter!');
    };

    if (isSubscribed) {
        return (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span>Thanks for subscribing!</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
            <Input
                type="email"
                placeholder="Your email address"
                className="flex-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
            />
            <Button type="submit" disabled={isSubmitting}>
                <Mail className="mr-2 h-4 w-4" />
                Subscribe
            </Button>
        </form>
    );
}
