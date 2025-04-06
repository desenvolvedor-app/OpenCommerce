import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function Hero() {
    return (
        <section className="relative overflow-hidden bg-muted/20">
            <div className="container mx-auto py-16 md:py-24 lg:py-32 px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                    <div className="max-w-xl space-y-6">
                        <div>
                            <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                                New Collection
                            </span>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
                                Modern Designs for Modern Living
                            </h1>
                        </div>
                        <p className="text-lg text-muted-foreground">
                            Discover our curated collection of premium products
                            designed for modern living. Quality meets
                            affordability in every purchase.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-2">
                            <Button size="lg" asChild>
                                <Link href="/products">Shop Collection</Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link href="/categories">
                                    Browse Categories
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="relative h-[300px] md:h-[500px] rounded-lg overflow-hidden shadow-lg border">
                        <Image
                            src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1950&q=80"
                            alt="Hero image"
                            fill
                            priority
                            className="object-cover"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
