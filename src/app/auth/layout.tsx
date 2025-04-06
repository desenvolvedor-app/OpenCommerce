import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <SiteHeader />
            <div className="min-h-[calc(100vh-64px-200px)] flex flex-col">
                {children}
            </div>
            <SiteFooter />
        </>
    );
}
