"use client";

// Local Imports
import { Button } from '../../ui/button'
import { memberLimits } from '@/constants/limits';
import StripePricingTable from '../../ui/pricing-table'
import { levelFourAccess } from '@/constants/access';
import { useOrganisation } from '@/hooks/useOrganisation';
import { createBillingPortalUrl } from '@/services/stripe/create';
import { IOrganisation, SubscriptionType } from '@/models/organisation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'

// External Imports
import { Zap, Rocket, Star, Crown, Users, CreditCard } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

const Billing = () => {
    const { organisation } = useOrganisation();
    const { data: session } = useSession();

    const hasLevelFourAccess = levelFourAccess.includes(session?.user.organisation?.role as string);

    async function handleBillingPortal() {
        try {
            if (organisation?.stripeCustomerId) {
                const billingUrl = await createBillingPortalUrl({ customerId: organisation?.stripeCustomerId });
                if (billingUrl) {
                    window.open(billingUrl, "_blank");
                } else {
                    throw new Error("Failed to create billing portal url")
                }
            } else {
                throw new Error("Organisation is invalid")
            }
        } catch (error) {
            toast("Failed to create billing portal url", { description: `${error}` })
        }
    }

    return (
        <div className='space-y-4'>
            {hasLevelFourAccess && (
                <>
                    <div className='w-full flex justify-between items-center'>
                        <h3 className="text-lg font-medium">Billing</h3>
                        <Button onClick={handleBillingPortal}>
                            Manage
                        </Button>
                    </div>
                    {organisation?.subscription === "free" && (
                        <StripePricingTable />
                    )}
                </>
            )}
            <CurrentSubscription organisation={organisation as IOrganisation} hasLevelFourAccess={hasLevelFourAccess} />
        </div>
    )
}

const getSubscriptionIcon = (type: SubscriptionType) => {
    const iconProps = { className: "w-6 h-6" };

    switch (type) {
        case 'free':
            return <Zap {...iconProps} />;
        case 'starter':
            return <Rocket {...iconProps} />;
        case 'essential':
            return <Star {...iconProps} />;
        case 'pro':
            return <Crown {...iconProps} />;
        default:
            return <Zap {...iconProps} />;
    }
};

const getSubscriptionColor = (type: SubscriptionType) => {
    switch (type) {
        case 'free':
            return 'text-gray-500';
        case 'starter':
            return 'text-blue-500';
        case 'essential':
            return 'text-purple-500';
        case 'pro':
            return 'text-amber-500';
        default:
            return 'text-gray-500';
    }
};

const CurrentSubscription = ({ organisation, hasLevelFourAccess }: { organisation: IOrganisation, hasLevelFourAccess: boolean }) => {
    const subscriptionType = organisation?.subscription || 'free';
    const memberLimit = memberLimits[subscriptionType];
    const currentMembers = organisation?.members || 0;
    const iconColor = getSubscriptionColor(subscriptionType);

    return (
        <div className='space-y-6'>
            {!hasLevelFourAccess && <h3 className="text-lg font-medium">Billing</h3>}

            <Card>
                <CardHeader>
                    <CardTitle>Current Subscription</CardTitle>
                    <CardDescription>Your current plan and usage details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Subscription Plan */}
                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className={`p-3 rounded-full bg-background border-2 ${iconColor}`}>
                            {getSubscriptionIcon(subscriptionType)}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Current Plan</p>
                            <p className="text-2xl font-bold capitalize">{subscriptionType}</p>
                        </div>
                    </div>

                    {/* Usage Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Members */}
                        <div className="flex items-start gap-3 p-4 border rounded-lg">
                            <div className="p-2 rounded-md bg-blue-500/10">
                                <Users className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Team Members</p>
                                <p className="text-xl font-semibold">
                                    {currentMembers} / {memberLimit === -1 ? 'Unlimited' : memberLimit}
                                </p>
                                {memberLimit !== -1 && (
                                    <div className="mt-2 w-full bg-muted rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full transition-all"
                                            style={{ width: `${Math.min((currentMembers / memberLimit) * 100, 100)}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stripe Customer */}
                        {(organisation?.stripeCustomerId && hasLevelFourAccess) && (
                            <div className="flex items-start gap-3 p-4 border rounded-lg">
                                <div className="p-2 rounded-md bg-purple-500/10">
                                    <CreditCard className="w-5 h-5 text-purple-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-muted-foreground">Customer ID</p>
                                    <p className="text-sm font-mono truncate" title={organisation.stripeCustomerId}>
                                        {organisation.stripeCustomerId}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {!hasLevelFourAccess && (
                <div className="flex items-start gap-2 p-4 bg-muted/30 rounded-lg border border-dashed">
                    <div className="text-muted-foreground text-sm">
                        <span className="font-medium">Need to upgrade?</span> Please contact your organization administrator to manage your subscription.
                    </div>
                </div>
            )}
        </div>
    )
}


export default Billing
