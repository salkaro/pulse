"use client"

// Local Imports
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { entityLimits } from '@/constants/limits'
import { createEntity } from '@/services/firebase/entities/create'
import { useOrganisation } from '@/hooks/useOrganisation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// External Imports
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { useEntities } from '@/hooks/useEntities'

const Page = () => {
    const router = useRouter()
    const { organisation, loading: loadingOrg } = useOrganisation();
    const { refetch } = useEntities(organisation?.id as string)

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [logoPrimary, setLogoPrimary] = useState('')
    const [loading, setLoading] = useState(false)

    const subscriptionTier = organisation?.subscription ?? "free"
    const entityLimit = entityLimits[subscriptionTier as keyof typeof entityLimits]
    const currentEntityCount = organisation?.entities ?? 0
    const canAddEntity = entityLimit === -1 || currentEntityCount < entityLimit

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!organisation?.id) {
            toast.error('Organisation not found')
            return
        }

        if (!canAddEntity) {
            toast.error(`Entity limit reached. Upgrade your plan to create more entities.`)
            return
        }

        if (!name.trim()) {
            toast.error('Please enter an entity name')
            return
        }

        setLoading(true)

        try {
            const { error } = await createEntity({
                organisationId: organisation.id,
                name: name.trim(),
                description: description.trim() || undefined,
                logoPrimary: logoPrimary.trim() || undefined,
            })

            if (error) {
                throw new Error(error)
            }

            await refetch();

            toast.success('Entity created successfully!')
            router.push(`/dashboard`)
        } catch (error) {
            console.error('Error creating entity:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to create entity')
        } finally {
            setLoading(false)
        }
    }

    if (loadingOrg) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spinner />
            </div>
        )
    }

    if (!canAddEntity) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Entity Limit Reached</CardTitle>
                        <CardDescription>
                            You&apos;ve reached the maximum number of entities ({entityLimit}) for your {subscriptionTier} plan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Upgrade your subscription to create more entities.
                        </p>
                        <Button onClick={() => router.push('/settings')}>
                            Upgrade Plan
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Entity</CardTitle>
                    <CardDescription>
                        Add a new entity to your organisation ({currentEntityCount}/{entityLimit === -1 ? '∞' : entityLimit})
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Entity Name</Label>
                            <Input
                                id="name"
                                placeholder="Enter entity name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Enter a description for your entity (optional)"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={loading}
                                rows={4}
                            />
                            <p className="text-xs text-muted-foreground">
                                Provide a brief description of what this entity represents
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="logo">Primary Logo URL</Label>
                            <Input
                                id="logo"
                                type="url"
                                placeholder="https://example.com/logo.png"
                                value={logoPrimary}
                                onChange={(e) => setLogoPrimary(e.target.value)}
                                disabled={loading}
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter the URL of your primary logo image (optional)
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading || !name.trim()}>
                                {loading && <Spinner className="mr-2" />}
                                Create Entity
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default Page
