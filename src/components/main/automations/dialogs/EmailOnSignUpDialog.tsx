"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { template1 } from '@/templates/email/sign-up'
import { Separator } from '@/components/ui/separator'
import { ProfileImage } from '@/components/icons/icons'
import { updateAutomation } from '@/services/firebase/automations/update'
import { toast } from 'sonner'
import { removeSessionStorage } from '@/utils/storage-handlers'
import { automationsCookieKey } from '@/constants/cookies'
import { Loader2Icon } from 'lucide-react'
import { useAutomations } from '@/hooks/useAutomations'

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    automationId: string
    entityName?: string
    organisationId?: string | null
    entityId?: string
}

const EmailOnSignUpDialog: React.FC<Props> = ({
    open,
    onOpenChange,
    automationId,
    entityName = "Your Company",
    organisationId,
    entityId
}) => {
    const [values, setValues] = useState({
        entityName: entityName,
        logoUrl: "",
        firstName: "{{firstName}}",
        dashboardUrl: "https://app.example.com",
        entityDomain: "example.com",
        companyAddress: "123 Main St, City, Country",
        featureOne: "Feature one that provides value",
        featureTwo: "Feature two that saves time",
        featureThree: "Feature three that improves results",
    })
    const [isSaving, setIsSaving] = useState(false)
    const { automations, loading, refetch } = useAutomations(organisationId || null, entityId || null)

    // Load existing automation data when dialog opens
    useEffect(() => {
        if (open && automations && !loading) {
            const existingAutomation = automations.find(a => a.id === automationId)
            console.log(existingAutomation)
            if (existingAutomation?.emailTemplate) {
                const template = existingAutomation.emailTemplate

                // Extract values from the email template
                // Since we saved the replaced values, we need to extract what we can
                setValues({
                    entityName: template.footer.teamName,
                    logoUrl: template.header.logoUrl || "",
                    firstName: "{{firstName}}", // Keep as template variable
                    dashboardUrl: template.body.cta.url || "https://app.example.com",
                    entityDomain: template.footer.supportEmail.replace('support@', '') || "example.com",
                    companyAddress: template.footer.address || "123 Main St, City, Country",
                    featureOne: template.body.mainContent[1] || "Feature one that provides value",
                    featureTwo: template.body.mainContent[2] || "Feature two that saves time",
                    featureThree: template.body.mainContent[3] || "Feature three that improves results",
                })
            } else {
                // Reset to defaults if no existing automation
                setValues({
                    entityName: entityName,
                    logoUrl: "",
                    firstName: "{{firstName}}",
                    dashboardUrl: "https://app.example.com",
                    entityDomain: "example.com",
                    companyAddress: "123 Main St, City, Country",
                    featureOne: "Feature one that provides value",
                    featureTwo: "Feature two that saves time",
                    featureThree: "Feature three that improves results",
                })
            }
        }
    }, [open, automations, loading, automationId, entityName])

    const handleValueChange = (key: string, value: string) => {
        setValues(prev => ({ ...prev, [key]: value }))
    }

    const replaceTemplateVars = (text: string): string => {
        return text
            .replace(/\{\{entityName\}\}/g, values.entityName)
            .replace(/\{\{logoUrl\}\}/g, values.logoUrl)
            .replace(/\{\{firstName\}\}/g, values.firstName)
            .replace(/\{\{dashboardUrl\}\}/g, values.dashboardUrl)
            .replace(/\{\{entityDomain\}\}/g, values.entityDomain)
            .replace(/\{\{companyAddress\}\}/g, values.companyAddress)
    }

    const handleSave = async () => {
        if (!organisationId || !entityId) {
            toast.error('Missing organisation or entity information')
            return
        }

        setIsSaving(true)
        try {
            // Construct the email template from values and template1
            const emailTemplate = {
                id: template1.id,
                title: replaceTemplateVars(template1.title),
                subject: replaceTemplateVars(template1.subject),
                previewText: template1.previewText,
                description: template1.description,
                header: {
                    logoUrl: values.logoUrl,
                    headline: replaceTemplateVars(template1.header.headline),
                    subheadline: template1.header.subheadline
                },
                body: {
                    greeting: replaceTemplateVars(template1.body.greeting),
                    intro: replaceTemplateVars(template1.body.intro),
                    mainContent: [
                        replaceTemplateVars(template1.body.mainContent[0]),
                        values.featureOne,
                        values.featureTwo,
                        values.featureThree
                    ],
                    cta: {
                        text: template1.body.cta.text,
                        url: values.dashboardUrl
                    },
                    secondaryContent: replaceTemplateVars(template1.body.secondaryContent)
                },
                footer: {
                    signOff: template1.footer.signOff,
                    teamName: replaceTemplateVars(template1.footer.teamName),
                    supportEmail: `support@${values.entityDomain}`,
                    address: values.companyAddress,
                    unsubscribeText: replaceTemplateVars(template1.footer.unsubscribeText)
                },
                styling: {
                    theme: template1.styling.theme,
                    primaryColor: template1.styling.primaryColor,
                    backgroundColor: template1.styling.backgroundColor,
                    fontFamily: template1.styling.fontFamily
                }
            }

            const result = await updateAutomation({
                organisationId,
                entityId,
                automationId,
                emailTemplate
            })

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Email template saved successfully')
                await refetch()
                removeSessionStorage(automationsCookieKey)
                onOpenChange(false)
            }
        } catch (error) {
            toast.error('Failed to save email template')
            console.error('Save error:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const renderEmailPreview = () => {
        return (
            <div className="bg-white border rounded-lg p-6 space-y-4" style={{ fontFamily: template1.styling.fontFamily }}>
                {/* Header */}
                <div className="text-center space-y-2 pb-4 border-b">
                    <div className="flex justify-center mb-4">
                        {values.logoUrl ? (
                            <ProfileImage image={values.logoUrl} />
                        ) : (
                            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs">
                                Logo
                            </div>
                        )}
                    </div>
                    <h1 className="text-2xl font-bold" style={{ color: template1.styling.primaryColor }}>
                        {replaceTemplateVars(template1.header.headline)}
                    </h1>
                    <p className="text-muted-foreground">
                        {replaceTemplateVars(template1.header.subheadline)}
                    </p>
                </div>

                {/* Body */}
                <div className="space-y-4">
                    <p className="font-medium">Hi John,</p>

                    <p className="text-sm">
                        {replaceTemplateVars(template1.body.intro)}
                    </p>

                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                        <p className="text-sm font-medium">{replaceTemplateVars(template1.body.mainContent[0])}</p>
                        <p className="text-sm">• {values.featureOne}</p>
                        <p className="text-sm">• {values.featureTwo}</p>
                        <p className="text-sm">• {values.featureThree}</p>
                    </div>

                    <div className="flex justify-center py-4">
                        <Button
                            style={{ backgroundColor: template1.styling.primaryColor }}
                            className="text-white"
                        >
                            {template1.body.cta.text}
                        </Button>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        {replaceTemplateVars(template1.body.secondaryContent)}
                    </p>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t space-y-2 text-center">
                    <p className="text-sm">{template1.footer.signOff}</p>
                    <p className="text-sm font-medium">{replaceTemplateVars(template1.footer.teamName)}</p>
                    <p className="text-xs text-muted-foreground mt-4">
                        {replaceTemplateVars(template1.footer.unsubscribeText)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {replaceTemplateVars(template1.footer.address)}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-450! w-[95vw] h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Configure Email on Sign Up</DialogTitle>
                    <DialogDescription>
                        Customize the welcome email template for new users
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-8 h-full overflow-hidden">
                    {/* Left side - Form inputs */}
                    <div className="overflow-y-auto pr-4 pl-1">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-sm">Basic Information</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="entityName">Company Name</Label>
                                    <Input
                                        id="entityName"
                                        value={values.entityName}
                                        onChange={(e) => handleValueChange('entityName', e.target.value)}
                                        placeholder="Your Company"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="logoUrl">Logo URL</Label>
                                    <Input
                                        id="logoUrl"
                                        value={values.logoUrl}
                                        onChange={(e) => handleValueChange('logoUrl', e.target.value)}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dashboardUrl">Dashboard URL</Label>
                                    <Input
                                        id="dashboardUrl"
                                        value={values.dashboardUrl}
                                        onChange={(e) => handleValueChange('dashboardUrl', e.target.value)}
                                        placeholder="https://app.example.com"
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h3 className="font-semibold text-sm">Features</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="featureOne">Feature One</Label>
                                    <Textarea
                                        id="featureOne"
                                        value={values.featureOne}
                                        onChange={(e) => handleValueChange('featureOne', e.target.value)}
                                        rows={2}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="featureTwo">Feature Two</Label>
                                    <Textarea
                                        id="featureTwo"
                                        value={values.featureTwo}
                                        onChange={(e) => handleValueChange('featureTwo', e.target.value)}
                                        rows={2}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="featureThree">Feature Three</Label>
                                    <Textarea
                                        id="featureThree"
                                        value={values.featureThree}
                                        onChange={(e) => handleValueChange('featureThree', e.target.value)}
                                        rows={2}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h3 className="font-semibold text-sm">Company Details</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="entityDomain">Domain</Label>
                                    <Input
                                        id="entityDomain"
                                        value={values.entityDomain}
                                        onChange={(e) => handleValueChange('entityDomain', e.target.value)}
                                        placeholder="example.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="companyAddress">Company Address</Label>
                                    <Textarea
                                        id="companyAddress"
                                        value={values.companyAddress}
                                        onChange={(e) => handleValueChange('companyAddress', e.target.value)}
                                        rows={2}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 pb-10">
                                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? (
                                        <>
                                            <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Email preview */}
                    <div className="border-l pl-6">
                        <div className="sticky top-0">
                            <h3 className="font-semibold text-sm mb-4">Email Preview</h3>
                            <div className="h-[calc(90vh-8rem)] overflow-y-auto">
                                {renderEmailPreview()}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default EmailOnSignUpDialog
