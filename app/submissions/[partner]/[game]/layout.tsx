import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getGameMetadata } from '@/lib/getGameMetadata'

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

            <h1 className="text-3xl font-semibold mb-4 sm:mb-6">{title}</h1>

            {children}
        </div>
    )
}
