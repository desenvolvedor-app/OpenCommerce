import { LucideIcon } from 'lucide-react';

interface FeatureItemProps {
    icon: LucideIcon;
    title: string;
    description: string;
}

function FeatureItem({ icon: Icon, title, description }: FeatureItemProps) {
    return (
        <div className="flex flex-col items-center text-center p-6">
            <div className="relative bg-primary/10 rounded-full p-3 mb-4">
                <Icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    );
}

interface FeatureGridProps {
    features: FeatureItemProps[];
}

export function FeatureGrid({ features }: FeatureGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
                <FeatureItem key={index} {...feature} />
            ))}
        </div>
    );
}
