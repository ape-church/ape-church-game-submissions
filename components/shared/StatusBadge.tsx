const statusClasses: Record<string, string> = {
    pending: 'bg-amber-500 text-black',
    approved: 'bg-green-500 text-black',
    rejected: 'bg-red-500 text-white',
}

export default function StatusBadge({ status }: { status: string }) {
    const className = statusClasses[status] ?? 'bg-muted text-muted-foreground'

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${className}`}>
            {status}
        </span>
    )
}