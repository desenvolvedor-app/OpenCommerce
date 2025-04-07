'use client';

import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
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
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { firestore } from '@/lib/firebase/firebase';
import {
    getPaymentSettings,
    getStoreSettings,
    getThemeSettings,
    PaymentSettings,
    StoreSettings,
    ThemeSettings,
} from '@/services/settings-service';
import { storeThemes } from '@/lib/themes';

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Store settings state
    const [storeSettings, setStoreSettings] = useState<StoreSettings>({
        name: 'My Store',
        email: 'contact@example.com',
        phone: '(555) 123-4567',
        address: '123 Main St, Anytown, ST 12345',
        currency: 'USD',
        taxEnabled: true,
        taxRate: 7.5,
    });

    // Payment settings state
    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
        stripeEnabled: true,
        paypalEnabled: false,
        stripeKey: 'pk_test_',
        paypalClientId: '',
    });

    // Theme settings state
    const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
        primaryColor: 'default',
        allowUserThemeToggle: true,
    });

    useEffect(() => {
        async function fetchSettings() {
            try {
                setIsLoading(true);

                // Fetch store settings using the service
                const storeData = await getStoreSettings();
                setStoreSettings(storeData);

                // Fetch payment settings using the service
                const paymentData = await getPaymentSettings();
                setPaymentSettings(paymentData);

                // Fetch theme settings
                const themeData = await getThemeSettings();
                setThemeSettings(themeData);
            } catch (error) {
                console.error('Error fetching settings:', error);
                toast.error('Failed to load settings');
            } finally {
                setIsLoading(false);
            }
        }

        fetchSettings();
    }, []);

    const handleStoreSettingChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            setStoreSettings({
                ...storeSettings,
                [name]: e.target.checked,
            });
        } else if (type === 'number') {
            setStoreSettings({
                ...storeSettings,
                [name]: parseFloat(value),
            });
        } else {
            setStoreSettings({
                ...storeSettings,
                [name]: value,
            });
        }
    };

    const handlePaymentSettingChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            setPaymentSettings({
                ...paymentSettings,
                [name]: e.target.checked,
            });
        } else {
            setPaymentSettings({
                ...paymentSettings,
                [name]: value,
            });
        }
    };

    const handleThemeSettingChange = (
        name: string,
        value: string | boolean
    ) => {
        setThemeSettings({
            ...themeSettings,
            [name]: value,
        });
    };

    const handleSwitchChange = (
        name: string,
        checked: boolean,
        settingsType: 'store' | 'payment'
    ) => {
        if (settingsType === 'store') {
            setStoreSettings({
                ...storeSettings,
                [name]: checked,
            });
        } else {
            setPaymentSettings({
                ...paymentSettings,
                [name]: checked,
            });
        }
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);

        try {
            // Save store settings
            await setDoc(doc(firestore, 'settings', 'store'), {
                ...storeSettings,
                updatedAt: serverTimestamp(),
            });

            // Save payment settings
            await setDoc(doc(firestore, 'settings', 'payment'), {
                ...paymentSettings,
                updatedAt: serverTimestamp(),
            });

            // Save theme settings
            await setDoc(doc(firestore, 'settings', 'theme'), {
                ...themeSettings,
                updatedAt: serverTimestamp(),
            });

            toast.success('Settings saved successfully');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
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
                title="Store Settings"
                description="Configure your store preferences"
                actions={
                    <Button onClick={handleSaveSettings} disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                }
            />

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="payment">Payment</TabsTrigger>
                    <TabsTrigger value="notifications">
                        Notifications
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Store Information</CardTitle>
                            <CardDescription>
                                Basic information about your store
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="store-name">Store Name</Label>
                                <Input
                                    id="store-name"
                                    name="name"
                                    value={storeSettings.name}
                                    onChange={handleStoreSettingChange}
                                    placeholder="My Store"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="store-email">
                                    Contact Email
                                </Label>
                                <Input
                                    id="store-email"
                                    name="email"
                                    value={storeSettings.email}
                                    onChange={handleStoreSettingChange}
                                    placeholder="contact@example.com"
                                    type="email"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="store-phone">
                                    Contact Phone
                                </Label>
                                <Input
                                    id="store-phone"
                                    name="phone"
                                    value={storeSettings.phone}
                                    onChange={handleStoreSettingChange}
                                    placeholder="(555) 123-4567"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="store-address">
                                    Business Address
                                </Label>
                                <Input
                                    id="store-address"
                                    name="address"
                                    value={storeSettings.address}
                                    onChange={handleStoreSettingChange}
                                    placeholder="123 Main St, Anytown, ST 12345"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Tax Settings</CardTitle>
                            <CardDescription>
                                Configure sales tax for your store
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="tax-enabled">
                                        Enable Sales Tax
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Apply sales tax to orders
                                    </p>
                                </div>
                                <Switch
                                    id="tax-enabled"
                                    name="taxEnabled"
                                    checked={storeSettings.taxEnabled}
                                    onCheckedChange={(checked) =>
                                        handleSwitchChange(
                                            'taxEnabled',
                                            checked,
                                            'store'
                                        )
                                    }
                                />
                            </div>

                            {storeSettings.taxEnabled && (
                                <div className="grid gap-2 pt-2">
                                    <Label htmlFor="tax-rate">
                                        Tax Rate (%)
                                    </Label>
                                    <Input
                                        id="tax-rate"
                                        type="number"
                                        name="taxRate"
                                        value={storeSettings.taxRate}
                                        onChange={handleStoreSettingChange}
                                        step="0.01"
                                        min="0"
                                        max="100"
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Theme Settings</CardTitle>
                            <CardDescription>
                                Configure the appearance of your store
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <Label>Store Theme</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {Object.values(storeThemes).map((theme) => (
                                        <div 
                                            key={theme.name}
                                            className={`border rounded-lg p-2 cursor-pointer hover:border-primary transition-colors ${
                                                themeSettings.primaryColor === theme.name ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                                            }`}
                                            onClick={() => handleThemeSettingChange('primaryColor', theme.name)}
                                        >
                                            <div 
                                                className="h-20 w-full rounded mb-2"
                                                style={{ 
                                                    background: `hsl(${theme.colors.primary})`,
                                                }}
                                            />
                                            <div className="text-center">
                                                <div className="font-medium">{theme.label}</div>
                                                <div className="text-xs text-muted-foreground">{theme.description}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="theme-toggle">
                                        Allow Users to Toggle Dark/Light Mode
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Let customers switch between dark and light display modes
                                    </p>
                                </div>
                                <Switch
                                    id="theme-toggle"
                                    checked={themeSettings.allowUserThemeToggle}
                                    onCheckedChange={(checked) =>
                                        handleThemeSettingChange('allowUserThemeToggle', checked)
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="payment" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Methods</CardTitle>
                            <CardDescription>
                                Configure the payment methods available to your
                                customers
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium">Stripe</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Accept credit card payments via
                                            Stripe
                                        </p>
                                    </div>
                                    <Switch
                                        id="stripe-enabled"
                                        name="stripeEnabled"
                                        checked={paymentSettings.stripeEnabled}
                                        onCheckedChange={(checked) =>
                                            handleSwitchChange(
                                                'stripeEnabled',
                                                checked,
                                                'payment'
                                            )
                                        }
                                    />
                                </div>

                                {paymentSettings.stripeEnabled && (
                                    <div className="grid gap-2 pl-6 pt-1">
                                        <Label htmlFor="stripe-key">
                                            Stripe API Key
                                        </Label>
                                        <Input
                                            id="stripe-key"
                                            name="stripeKey"
                                            value={paymentSettings.stripeKey}
                                            onChange={
                                                handlePaymentSettingChange
                                            }
                                            placeholder="pk_test_..."
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Find your API keys in the Stripe
                                            dashboard
                                        </p>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium">PayPal</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Accept payments via PayPal
                                        </p>
                                    </div>
                                    <Switch
                                        id="paypal-enabled"
                                        name="paypalEnabled"
                                        checked={paymentSettings.paypalEnabled}
                                        onCheckedChange={(checked) =>
                                            handleSwitchChange(
                                                'paypalEnabled',
                                                checked,
                                                'payment'
                                            )
                                        }
                                    />
                                </div>

                                {paymentSettings.paypalEnabled && (
                                    <div className="grid gap-2 pl-6 pt-1">
                                        <Label htmlFor="paypal-id">
                                            PayPal Client ID
                                        </Label>
                                        <Input
                                            id="paypal-id"
                                            name="paypalClientId"
                                            value={
                                                paymentSettings.paypalClientId
                                            }
                                            onChange={
                                                handlePaymentSettingChange
                                            }
                                            placeholder="Client ID from PayPal Developer Dashboard"
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Email Notifications</CardTitle>
                            <CardDescription>
                                Configure automated emails sent to customers
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Order Confirmation</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Send an email when an order is placed
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Shipping Updates</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Send an email when an order ships
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Abandoned Cart</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Send an email when a cart is abandoned
                                    </p>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </AdminLayout>
    );
}
