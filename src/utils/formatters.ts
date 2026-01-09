export function formatCurrency (amount: number, currency?: string) {
    if (!currency) {
        return amount.toFixed(2).toString()
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase() || 'USD',
        minimumFractionDigits: 2,
    }).format(amount);
};


export function formatYAxis (value: number) {
    if (value >= 1000) {
        return `${(value / 1000).toFixed(0)}k`
    }
    return `${value}`
}

export function formatDateRange(filter: string) {
    const now = new Date();
    const nowUnix = Math.floor(now.getTime() / 1000);

    switch (filter) {
        case 'monthly': {
            const monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return { from: Math.floor(monthAgo.getTime() / 1000), to: nowUnix };
        }
        case 'quarterly': {
            const quarterAgo = new Date(now);
            quarterAgo.setMonth(quarterAgo.getMonth() - 3);
            return { from: Math.floor(quarterAgo.getTime() / 1000), to: nowUnix };
        }
        case 'yearly': {
            const yearAgo = new Date(now);
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);
            return { from: Math.floor(yearAgo.getTime() / 1000), to: nowUnix };
        }
        default:
            return {};
    }
}

export function formatDateByTimeAgo(timestamp?: number | null) {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}