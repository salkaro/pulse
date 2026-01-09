import { auth } from "@/lib/firebase/config";

export function getCookie(name: string): string | null {
    // Check if running in browser environment
    if (typeof document === 'undefined') return null;

    const uid = auth.currentUser?.uid;
    if (!uid) return null;
    const match = document.cookie.match(
        new RegExp(`(?:^|; )salkaro\\.${uid}\\.${name}=([^;]+)`)
    );
    if (!match) return null;
    try {
        const safe = match[1];
        const binStr = atob(safe);
        const bytes = Uint8Array.from(binStr, c => c.codePointAt(0)!);
        return new TextDecoder().decode(bytes);
    } catch (err) {
        console.error("cookie decode failed", err);
        return null;
    }
}

export function setCookie(name: string, value: string, options: { expires?: number; path?: string } = {}): void {
    // Check if running in browser environment
    if (typeof document === 'undefined') return;

    const uid = auth.currentUser?.uid as string;
    if (!uid) return;

    const bytes = new TextEncoder().encode(value);
    const binStr = Array.from(bytes, b => String.fromCodePoint(b)).join("");
    const safe = btoa(binStr);

    let cookie = `salkaro.${uid}.${name}=${safe}; path=${options.path || '/'};`;

    if (options.expires) {
        const date = new Date();
        date.setTime(date.getTime() + options.expires * 24 * 60 * 60 * 1000);
        cookie += ` expires=${date.toUTCString()};`;
    }

    document.cookie = cookie;
}

export function removeCookie(name: string): void {
    // Check if running in browser environment
    if (typeof document === 'undefined') return;

    const uid = auth.currentUser?.uid as string;
    if (!uid) return;

    document.cookie = `salkaro.${uid}.${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
}

export function removeAllCookies(): void {
    // Check if running in browser environment
    if (typeof document === 'undefined') return;

    const cookies = document.cookie.split(";");

    cookies.forEach(cookie => {
        const trimmed = cookie.trim();
        if (trimmed.startsWith("salkaro.")) {
            const cookieName = trimmed.split("=")[0];
            document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
        }
    });
}