"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardFooter } from '../../ui/card'
import { Label } from '../../ui/label'
import { Input } from '../../ui/input'
import { Button } from '../../ui/button'
import { Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { createOrganisation } from '@/services/firebase/admin-create'
import { IUser } from '@/models/user'
import { joinOrganisationAdmin } from '@/services/firebase/admin-update'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'

interface Props {
    user: IUser,
    refetch: () => Promise<void>
}
const CreateOrganisation: React.FC<Props> = ({ user, refetch }) => {
    const [name, setName] = useState<string>("");
    const [inviteCode, setInviteCode] = useState<string>("")

    const [loading, setLoading] = useState(false);

    async function handleCreate() {
        setLoading(true)
        const { error } = await createOrganisation({
            name: name as string,
            ownerId: user.id as string,
            email: user.email as string
        })

        if (error) {
            toast.error("Failed to create organisation", { description: `${error}` })
        } else {
            toast.success("Organisation created successfully")
            await refetch()
            window.location.reload();
        }
        setLoading(false)
    }

    async function handleJoin() {
        setLoading(true)
        const { error } = await joinOrganisationAdmin({
            code: inviteCode,
            uid: user.id as string,
        })

        if (error) {
            toast.error("Failed to join organisation", { description: `${error}` })
        } else {
            toast.success("Joined organisation successfully")
            await refetch()
        }
        setLoading(false)
    }

    return (
        <Tabs defaultValue="create">
            <TabsList className="grid grid-cols-2">
                <TabsTrigger value="create">Create</TabsTrigger>
                <TabsTrigger value="join">Join</TabsTrigger>
            </TabsList>

            {/* Create Organisation Tab */}
            <TabsContent value="create">
                <Card>
                    <CardContent className="grid gap-4 pt-6">
                        <div className="grid gap-2">
                            <Label>Name</Label>
                            <Input
                                placeholder="Enter organisation name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="justify-end">
                        <Button onClick={handleCreate} disabled={loading}>
                            {loading && <Loader2Icon className="animate-spin mr-2" size={16} />}
                            {loading ? "Creating..." : "Create"}
                        </Button>
                    </CardFooter>
                </Card>
            </TabsContent>

            {/* Join Organisation Tab */}
            <TabsContent value="join">
                <Card>
                    <CardContent className="grid gap-4 pt-6">
                        <div className="grid gap-2">
                            <Label>Invite Code</Label>
                            <Input
                                placeholder="Enter invite code"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="justify-end">
                        <Button onClick={handleJoin} disabled={loading}>
                            {loading && <Loader2Icon className="animate-spin mr-2" size={16} />}
                            {loading ? "Joining..." : "Join"}
                        </Button>
                    </CardFooter>
                </Card>
            </TabsContent>
        </Tabs>
    )
}

export default CreateOrganisation
