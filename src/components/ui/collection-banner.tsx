import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

interface CollectionBannerProps {
    title: string;
    description: string;
    image: string;
    buttonText: string;
    buttonLink: string;
    position?: 'left' | 'right';
}

export function CollectionBanner({
    title,
    description,
    image,
    buttonText,
    buttonLink,
    position = 'left',
}: CollectionBannerProps) {
    return (
        <div className="relative overflow-hidden rounded-xl bg-muted/40">
            <div className="container mx-auto py-12 px-4">
                <div
                    className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center ${
                        position === 'right' ? 'md:grid-flow-dense' : ''
                    }`}
                >
                    <div
                        className={`space-y-4 ${position === 'right' ? 'md:col-start-2' : ''}`}
                    >
                        <h2 className="text-3xl font-bold">{title}</h2>
                        <p className="text-muted-foreground">{description}</p>
                        <Button asChild className="mt-2">
                            <Link href={buttonLink}>{buttonText}</Link>
                        </Button>
                    </div>

                    <div className="relative h-[300px]">
                        <Image
                            src={image}
                            alt={title}
                            fill
                            className="object-cover rounded-lg"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
