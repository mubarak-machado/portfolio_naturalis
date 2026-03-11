import type { MarketingTextResult } from '@/lib/gemini'

export type FrameFormat = 'feed_square' | 'feed_portrait' | 'story'

export const FRAME_PRESETS: Record<FrameFormat, { width: number; height: number; label: string }> = {
    feed_square: { width: 1080, height: 1080, label: 'Feed Quadrado (1:1)' },
    feed_portrait: { width: 1080, height: 1350, label: 'Feed Retrato (4:5)' },
    story: { width: 1080, height: 1920, label: 'Story / Reels (9:16)' }
}

export interface TemplateConfig {
    themeColor: string
    customBgUrl: string | null
    showLogo: boolean
    imageScale: number
    imageOffsetX: number
    imageOffsetY: number
}

export interface TemplateProps {
    productName: string
    productPrice: number
    imageUrl: string | null
    text: MarketingTextResult
    config: TemplateConfig
}
