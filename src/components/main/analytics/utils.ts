/**
 * Formats a duration in seconds to a human-readable string
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "2m 30s" or "45s")
 */
export function formatDuration(seconds: number): string {
    if (seconds < 60) {
        return `${Math.round(seconds)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Formats an event name from snake_case to Title Case
 * @param eventName - Event name in snake_case (e.g., "page_view")
 * @returns Formatted string in Title Case (e.g., "Page View")
 */
export function formatEventName(eventName: string): string {
    return eventName
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}
