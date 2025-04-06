import { Bell, HelpCircle } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { isUsingShopify } from '@/services/shopify-service';

interface AdminHeaderProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
}

export function AdminHeader({ title, description, actions }: AdminHeaderProps) {
    // Check if we're in Shopify mode - would be configured properly in a real implementation
    const shopifyMode = isUsingShopify();

    return (
        <div className="border-b pb-5 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">
                            {title}
                        </h1>
                        {shopifyMode && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                Shopify Connected
                            </span>
                        )}
                    </div>
                    {description && (
                        <p className="text-muted-foreground">{description}</p>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon">
                        <HelpCircle className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Bell className="h-5 w-5" />
                    </Button>
                    {actions && <div className="flex-shrink-0">{actions}</div>}
                </div>
            </div>
        </div>
    );
}
