"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Loader2, CheckCircle2, TicketIcon } from 'lucide-react'
import { createTicket } from '@/services/firebase/tickets/create'
import { TicketTag } from '@/models/ticket'

interface SubmitTicketPageProps {
    organisationId: string
    entityId: string
    entityName: string
}

const Page: React.FC<SubmitTicketPageProps> = ({ organisationId, entityId, entityName }) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form state
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [issueLocation, setIssueLocation] = useState('')
    const [tag, setTag] = useState<TicketTag>('normal')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)

        try {
            // Validate
            if (!name || !email || !title || !description) {
                throw new Error('Please fill in all required fields')
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(email)) {
                throw new Error('Please enter a valid email address')
            }

            // Create ticket
            const { ticket, error: createError } = await createTicket({
                organisationId,
                entityId,
                title,
                description,
                issueLocation: issueLocation || window.location.href,
                tag,
                customer: {
                    id: `customer_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                    name,
                    email,
                },
            })

            if (createError || !ticket) {
                throw new Error(createError || 'Failed to submit ticket')
            }

            // Success!
            setIsSuccess(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit ticket')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSubmitAnother = () => {
        setIsSuccess(false)
        setName('')
        setEmail('')
        setTitle('')
        setDescription('')
        setIssueLocation('')
        setTag('normal')
        setError(null)
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-b from-background to-muted/20">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-12 pb-8 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 rounded-full bg-green-500/10">
                                <CheckCircle2 className="w-16 h-16 text-green-500" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Ticket Submitted!</h2>
                        <p className="text-muted-foreground mb-6">
                            Your support ticket has been successfully submitted. We&apos;ll get back to you as soon as possible.
                        </p>
                        <Button onClick={handleSubmitAnother} className="w-full">
                            Submit Another Ticket
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-b from-background to-muted/20">
            <Card className="w-full max-w-2xl">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 rounded-full bg-purple-500/10">
                            <TicketIcon className="w-12 h-12 text-purple-500" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Submit a Support Ticket</CardTitle>
                    <CardDescription className="text-base">
                        Having an issue with {entityName}? Let us know and we&apos;ll help you out.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Customer Information */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Your Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        Email Address <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Ticket Details */}
                        <div className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="title">
                                    Issue Title <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    placeholder="Brief description of the issue"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    Description <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="Please provide a detailed description of the issue..."
                                    value={description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                                    required
                                    disabled={isSubmitting}
                                    rows={5}
                                    className="resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="issueLocation">
                                        Issue Location (URL)
                                    </Label>
                                    <Input
                                        id="issueLocation"
                                        type="url"
                                        placeholder="https://example.com/page"
                                        value={issueLocation}
                                        onChange={(e) => setIssueLocation(e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select
                                        value={tag}
                                        onValueChange={(value) => setTag(value as TicketTag)}
                                        disabled={isSubmitting}
                                    >
                                        <SelectTrigger id="priority">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="normal">Normal</SelectItem>
                                            <SelectItem value="important">Important</SelectItem>
                                            <SelectItem value="critical">Critical</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Ticket'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default Page
