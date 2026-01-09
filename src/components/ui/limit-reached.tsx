import Link from 'next/link';
import React from 'react'

interface Props {
    type: string;
    limit: number;
}
const LimitReached: React.FC<Props> = ({ type, limit }) => {
    return (
        <div className="bg-muted/50 border border-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
                You&apos;ve reached the maximum number of {type} for your plan ({limit} {type}).{" "}
                <Link href="/settings#billing" className='underline'>Upgrade your plan</Link> to add more {type}.
            </p>
        </div>
    )
}

export default LimitReached
