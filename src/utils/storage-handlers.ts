import { auth } from "@/lib/firebase/config";

export function getSessionStorage(name: string): string | null {
    // Check if running in browser environment
    if (typeof window === 'undefined') return null;

    const uid = auth.currentUser?.uid;
    if (!uid) return null;

    try {
        const key = `salkaro.${uid}.${name}`;
        return sessionStorage.getItem(key);
    } catch (err) {
        console.error("sessionStorage get failed", err);
        return null;
    }
}

export function setSessionStorage(name: string, value: string): void {
    // Check if running in browser environment
    if (typeof window === 'undefined') return;

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
        const key = `salkaro.${uid}.${name}`;
        sessionStorage.setItem(key, value);
    } catch (err) {
        console.error("sessionStorage set failed", err);
    }
}

export function removeSessionStorage(name: string): void {
    // Check if running in browser environment
    if (typeof window === 'undefined') return;

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
        const key = `salkaro.${uid}.${name}`;
        sessionStorage.removeItem(key);
    } catch (err) {
        console.error("sessionStorage remove failed", err);
    }
}

export function clearAllSessionStorage(): void {
    // Check if running in browser environment
    if (typeof window === 'undefined') return;

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
        const prefix = `salkaro.${uid}.`;
        const keysToRemove: string[] = [];

        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && key.startsWith(prefix)) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach(key => sessionStorage.removeItem(key));
    } catch (err) {
        console.error("sessionStorage clear failed", err);
    }
}
