'use client';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AdminHeader } from '@/components/admin/admin-header';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { firestore } from '@/lib/firebase/firebase';

// Define types for shipping settings
interface ShippingZone {
    enabled: boolean;
    name: string;
    countries: string[];
}

interface WeightRange {
    minWeight: number;
    maxWeight: number;
    price: number;
}

interface ShippingSettings {
    zones: {
        domestic: ShippingZone;
        international: ShippingZone;
    };
    method: 'flat-rate' | 'free' | 'calculated';
    flatRate: number;
    weightRanges: WeightRange[];
    updatedAt?: any;
}

export default function ShippingPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [settings, setSettings] = useState<ShippingSettings>({
        zones: {
            domestic: {
                enabled: true,
                name: 'Domestic Shipping',
                countries: ['United States'],
            },
            international: {
                enabled: false,
                name: 'International Shipping',
                countries: ['Worldwide'],
            },
        },
        method: 'flat-rate',
        flatRate: 5.99,
        weightRanges: [{ minWeight: 0, maxWeight: 5, price: 5.99 }],
    });

    useEffect(() => {
        async function fetchSettings() {
            try {
                setIsLoading(true);
                const docRef = doc(firestore, 'settings', 'shipping');
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setSettings(docSnap.data() as ShippingSettings);
                }
            } catch (error) {
                console.error('Error fetching shipping settings:', error);
                toast.error('Failed to load shipping settings');
            } finally {
                setIsLoading(false);
            }
        }

        fetchSettings();
    }, []);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await setDoc(doc(firestore, 'settings', 'shipping'), settings);
            toast.success('Shipping settings saved successfully');
        } catch (error) {
            console.error('Error saving shipping settings:', error);
            toast.error('Failed to save shipping settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDomesticChange = (checked: boolean) => {
        setSettings({
            ...settings,
            zones: {
                ...settings.zones,
                domestic: {
                    ...settings.zones.domestic,
                    enabled: checked,
                },
            },
        });
    };

    const handleInternationalChange = (checked: boolean) => {
        setSettings({
            ...settings,
            zones: {
                ...settings.zones,
                international: {
                    ...settings.zones.international,
                    enabled: checked,
                },
            },
        });
    };

    const handleMethodChange = (value: 'flat-rate' | 'free' | 'calculated') => {
        setSettings({
            ...settings,
            method: value,
        });
    };

    const handleFlatRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings({
            ...settings,
            flatRate: parseFloat(e.target.value) || 0,
        });
    };

    const handleWeightRangeChange = (
        index: number,
        field: keyof WeightRange,
        value: number
    ) => {
        const updatedRanges = [...settings.weightRanges];
        updatedRanges[index] = {
            ...updatedRanges[index],
            [field]: value,
        };

        setSettings({
            ...settings,
            weightRanges: updatedRanges,
        });
    };

    const addWeightRange = () => {
        const lastRange =
            settings.weightRanges[settings.weightRanges.length - 1];

        setSettings({
            ...settings,
            weightRanges: [
                ...settings.weightRanges,
                {
                    minWeight: lastRange.maxWeight,
                    maxWeight: lastRange.maxWeight + 5,
                    price: lastRange.price + 2,
                },
            ],
        });
    };

    const removeWeightRange = (index: number) => {
        if (settings.weightRanges.length <= 1) return;

        const updatedRanges = [...settings.weightRanges];
        updatedRanges.splice(index, 1);

        setSettings({
            ...settings,
            weightRanges: updatedRanges,
        });
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <AdminHeader
                title="Shipping Settings"
                description="Configure shipping zones and rates"
                actions={
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save Settings'
                        )}
                    </Button>
                }
            />

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Shipping Zones</CardTitle>
                        <CardDescription>
                            Configure shipping zones based on geographic
                            regions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium">
                                        Domestic Shipping
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        United States
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="domestic"
                                        checked={
                                            settings.zones.domestic.enabled
                                        }
                                        onCheckedChange={handleDomesticChange}
                                    />
                                    <Label htmlFor="domestic">Enabled</Label>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium">
                                        International Shipping
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Worldwide
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="international"
                                        checked={
                                            settings.zones.international.enabled
                                        }
                                        onCheckedChange={
                                            handleInternationalChange
                                        }
                                    />
                                    <Label htmlFor="international">
                                        Enabled
                                    </Label>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Shipping Methods</CardTitle>
                        <CardDescription>
                            Set up different shipping methods for your
                            customers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup
                            value={settings.method}
                            onValueChange={handleMethodChange}
                        >
                            <div className="flex items-center space-x-2 mb-4">
                                <RadioGroupItem
                                    value="flat-rate"
                                    id="flat-rate"
                                />
                                <Label htmlFor="flat-rate">
                                    Flat Rate Shipping
                                </Label>
                            </div>

                            {settings.method === 'flat-rate' && (
                                <div className="ml-6 mb-4">
                                    <Label
                                        htmlFor="flat-rate-price"
                                        className="mb-1 block"
                                    >
                                        Rate ($)
                                    </Label>
                                    <Input
                                        type="number"
                                        id="flat-rate-price"
                                        placeholder="5.99"
                                        className="max-w-[200px]"
                                        value={settings.flatRate}
                                        onChange={handleFlatRateChange}
                                    />
                                </div>
                            )}

                            <div className="flex items-center space-x-2 mb-4">
                                <RadioGroupItem value="free" id="free" />
                                <Label htmlFor="free">Free Shipping</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                    value="calculated"
                                    id="calculated"
                                />
                                <Label htmlFor="calculated">
                                    Calculated by Weight
                                </Label>
                            </div>

                            {settings.method === 'calculated' && (
                                <div className="ml-6 mt-2 grid gap-4">
                                    {settings.weightRanges.map(
                                        (range, index) => (
                                            <div
                                                key={index}
                                                className="grid grid-cols-3 gap-2 items-end"
                                            >
                                                <div>
                                                    <Label
                                                        htmlFor={`min-weight-${index}`}
                                                        className="mb-1 block"
                                                    >
                                                        Min Weight (lb)
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        id={`min-weight-${index}`}
                                                        value={range.minWeight}
                                                        onChange={(e) =>
                                                            handleWeightRangeChange(
                                                                index,
                                                                'minWeight',
                                                                parseFloat(
                                                                    e.target
                                                                        .value
                                                                ) || 0
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <Label
                                                        htmlFor={`max-weight-${index}`}
                                                        className="mb-1 block"
                                                    >
                                                        Max Weight (lb)
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        id={`max-weight-${index}`}
                                                        value={range.maxWeight}
                                                        onChange={(e) =>
                                                            handleWeightRangeChange(
                                                                index,
                                                                'maxWeight',
                                                                parseFloat(
                                                                    e.target
                                                                        .value
                                                                ) || 0
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="flex-1">
                                                        <Label
                                                            htmlFor={`weight-price-${index}`}
                                                            className="mb-1 block"
                                                        >
                                                            Price ($)
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            id={`weight-price-${index}`}
                                                            value={range.price}
                                                            onChange={(e) =>
                                                                handleWeightRangeChange(
                                                                    index,
                                                                    'price',
                                                                    parseFloat(
                                                                        e.target
                                                                            .value
                                                                    ) || 0
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    {settings.weightRanges
                                                        .length > 1 && (
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="mt-5"
                                                            onClick={() =>
                                                                removeWeightRange(
                                                                    index
                                                                )
                                                            }
                                                        >
                                                            &times;
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    )}
                                    <Button
                                        variant="outline"
                                        className="w-fit"
                                        onClick={addWeightRange}
                                    >
                                        + Add Weight Range
                                    </Button>
                                </div>
                            )}
                        </RadioGroup>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
