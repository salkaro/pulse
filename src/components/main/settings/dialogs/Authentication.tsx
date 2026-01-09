"use client";

// Local Imports
import Alert from '@/components/ui/alert-continue';
import NoContent from '@/components/ui/no-content';
import { Button } from '@/components/ui/button';
import { useTokens } from '@/hooks/useTokens';
import { OrgRoleType } from '@/constants/access';
import AddAPIKeyDialog from './AddAPIKeyDialog';
import { updateAPIKey } from '@/services/firebase/update';
import { generateApiKey } from '@/utils/generate';
import { useOrganisation } from '@/hooks/useOrganisation';
import { apiTokenAccessLevels, apiTokenAccessLevelsName } from '@/constants/access';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// External Imports
import { Check, Copy, Eye, EyeOff, Key, RotateCcw, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';

const Authentication = () => {
    const { data: session, status } = useSession();
    const { organisation, loading: orgLoading, refetch: refreshOrganisation } = useOrganisation();
    const { tokens, loading: tokensLoading, error: tokensError, refetch: refreshTokens } = useTokens(organisation?.id as string);

    // For showing/hiding API keys
    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
    // For copy feedback
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const userRole = session?.user.organisation?.role as OrgRoleType | undefined;

    async function createNewAPIKey({ name, accessLevel }: { name: string; accessLevel: number }): Promise<{ error?: boolean }> {
        try {
            if (!organisation?.id || !organisation.subscription) {
                toast("Failed to add API key:", { description: `Your organisation wasn't found. Please try again.` });
                return { error: true };
            };
            if (tokens && tokens.length >= 5) {
                toast("API key limit hit", { description: "You must delete an existing API key first" });
                return { error: true };
            }
            if (!userRole || userRole === "viewer") {
                toast("Invalid permissions", { description: "You do not have sufficient permission to create a new API key" });
                return { error: true };
            }
            const token = generateApiKey(accessLevel as keyof typeof apiTokenAccessLevels);
            // Attach metadata
            token.name = name;
            token.createdAt = Date.now();
            const { error } = await updateAPIKey({
                orgId: organisation.id,
                type: "update",
                token,
                perms: userRole,
            });
            if (error) throw error

            await refreshTokens();
            await refreshOrganisation();

            return {}
        } catch (error) {
            toast("Failed to create token", { description: `${error}` });
            return { error: true };
        }
    }

    // Rotate
    async function rotateAPIKey(tokenId: string) {
        try {
            if (!organisation?.id || !organisation.subscription) return;
            if (!userRole || userRole === "viewer") {
                toast("Invalid permissions", { description: "You do not have sufficient permission to rotate this api key" });
                return;
            }
            // find existing token metadata
            const existing = tokens?.find(t => t.id === tokenId);
            if (!existing) return;
            const newToken = generateApiKey(Number(existing.id?.slice(-2)) as keyof typeof apiTokenAccessLevels);
            newToken.name = existing.name;
            newToken.createdAt = Date.now();
            const { error } = await updateAPIKey({
                orgId: organisation.id,
                type: "rotate",
                token: newToken,
                perms: userRole,
                prevId: existing.id
            });
            if (error) throw error
            await refreshTokens();
            await refreshOrganisation();
        } catch (error) {
            toast("Failed to rotate token", { description: `${error}` })
        }
    }

    // Delete
    async function deleteAPIKey(tokenId: string) {
        try {
            if (!organisation?.id) return;
            if (!userRole || userRole === "viewer") {
                toast("Invalid permissions", { description: "You do not have sufficient permission to delete this api key." });
                return;
            }
            const { error } = await updateAPIKey({
                orgId: organisation.id,
                type: "delete",
                token: { id: tokenId },
                perms: userRole,
            });
            if (error) throw error
            await refreshTokens();
            await refreshOrganisation();
        } catch (error) {
            toast("Failed to delete token", { description: `${error}` })
        }
    }


    function copyToClipboard(apiKey: string) {
        navigator.clipboard.writeText(apiKey);
        setCopiedKey(apiKey);
        setTimeout(() => setCopiedKey(null), 2000);
    }

    function formatDate(timestamp: number) {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function maskApiKey() {
        return '•'.repeat(48);
    }

    if (orgLoading || tokensLoading) {
        return (
            <div className='w-full flex justify-center items-center min-h-48'>
                <Spinner />
            </div>
        );
    }

    if (organisation?.id && status !== "loading" && !orgLoading && !tokensLoading && tokensError) {
        return <p className="text-red-600">Error loading tokens: {tokensError}</p>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">API Keys</h3>
                <AddAPIKeyDialog addToken={createNewAPIKey} disabled={!organisation?.id || userRole === "viewer"} />
            </div>

            {!tokens || tokens.length === 0 ? (
                <NoContent text="You have not generated any API keys" />
            ) : (
                <>
                    {tokens.map(token => {
                        const id = token.id as string; // your token object needs a unique id or fallback to id
                        const showKey = showKeys[id] ?? false;
                        return (
                            <Card key={id} className="mb-4">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                                            <Key className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div>
                                            <CardTitle>{token.name}</CardTitle>
                                            <CardDescription>
                                                Created {formatDate(token.createdAt as number)}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button variant="ghost" size="sm" onClick={() => setShowKeys(prev => ({ ...prev, [id]: !prev[id] }))}>
                                            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(id)}>
                                            {copiedKey === id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    <div className="flex items-center space-x-2 p-3 bg-muted rounded-md border text-sm font-mono">
                                        <code className="flex-1 truncate">
                                            {showKey ? token.id : maskApiKey()}
                                        </code>
                                    </div>
                                </CardContent>

                                <CardFooter className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        Access Level: {token.id ? apiTokenAccessLevelsName[Number(id.slice(-2)) as keyof typeof apiTokenAccessLevels] : "Unknown"}
                                    </p>
                                    <div className="flex space-x-2">
                                        <Alert
                                            triggerComponent={
                                                <Button variant="outline" size="sm" className="text-orange-600 shadow-none">
                                                    <RotateCcw className="w-4 h-4 mr-2" />
                                                    Rotate
                                                </Button>
                                            }
                                            onClick={() => rotateAPIKey(id)}
                                            title="Are you sure?"
                                            description="This will delete your current key and generate a new one."
                                        />
                                        <Alert
                                            triggerComponent={
                                                <Button variant="outline" size="sm" className="text-red-600 shadow-none">
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </Button>
                                            }
                                            onClick={() => deleteAPIKey(id)}
                                            title="Are you sure?"
                                            description="This will permanently delete your API key."
                                        />
                                    </div>
                                </CardFooter>
                            </Card>
                        );
                    })}
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            <div className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5">
                                <svg fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-medium text-amber-800 dark:text-amber-200">Security Notice</h4>
                                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                    Store your API key securely. If compromised, rotate it immediately.
                                    Never expose it in client-side code or public repositories.
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}

        </div>
    )
}

export default Authentication
