import { IToken } from "@/models/token";
import { retrieveTokens } from "@/services/firebase/retrieve";
import { tokensCookieKey } from "@/constants/cookies";
import { getCookie, setCookie } from "@/utils/cookie-handlers";
import { useState, useEffect, useCallback } from "react";

interface UseTokensReturn {
    tokens: IToken[] | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useTokens(orgId: string | null): UseTokensReturn {
    const [tokens, setTokens] = useState<IToken[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTokens = useCallback(async ({ reload }: { reload?: boolean }) => {
        if (!orgId) {
            setTokens(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (!reload) {
                const cached = getCookie(tokensCookieKey);
                if (cached) {
                    setTokens(JSON.parse(cached));
                    setLoading(false);
                    return;
                }
            }

            const data = await retrieveTokens({ orgId });
            setTokens(data);
            setCookie(tokensCookieKey, JSON.stringify(data ?? []), { expires: 1 }); // 1 day
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch tokens");
            setTokens(null);
        } finally {
            setLoading(false);
        }
    }, [orgId]);


    useEffect(() => {
        fetchTokens({});
    }, [fetchTokens]);

    const refetch = useCallback(async () => {
        await fetchTokens({ reload: true });
    }, [fetchTokens]);

    return { tokens, loading, error, refetch };
}
