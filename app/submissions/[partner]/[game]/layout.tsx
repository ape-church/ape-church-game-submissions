import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getGameMetadata } from '@/lib/getGameMetadata'
import StatusBadge from '@/components/shared/StatusBadge'

interface Props {
    params: Promise<{ partner: string; game: string }>
    children: React.ReactNode
}

export default async function GameLayout({ params, children }: Props) {
    const { partner, game } = await params
    const metadata = await getGameMetadata(partner, game)
    const title = metadata?.displayTitle ?? game

    return (
        <div className="w-full max-w-6xl mx-auto">
            <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to all game submissions
            </Link>

            <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <h1 className="text-3xl font-semibold">{title}</h1>
                {metadata?.status && <StatusBadge status={metadata.status} />}
            </div>
            {children}
        </div>
    )
}
