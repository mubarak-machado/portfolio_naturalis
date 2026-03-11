import type { CanvasTemplate } from './types'
import { FRAME_PRESETS, type FrameFormat } from '@/components/marketing/types'

interface TemplateData {
    productName: string
    productPrice: number
    imageUrl: string | null
    headline: string
    body: string
    cta: string
}

const formatPrice = (price: number) => `R$ ${price.toFixed(2).replace('.', ',')}`

export const getTemplates = (data: TemplateData, format: FrameFormat = 'story'): CanvasTemplate[] => {
    const { width: w, height: h } = FRAME_PRESETS[format]
    
    // Scale image slightly for square formats so it doesn't take all space
    const isSquare = h <= 1080
    const imgScale = isSquare ? 0.75 : 1
    const imgWidth = 600 * imgScale
    const imgHeight = 800 * imgScale
    
    return [
        {
            id: 'template_1',
            name: 'Soft Light Premium',
            backgroundColor: '#FCFBF8', // Warm off-white from design system
            layers: [
                {
                    id: 'bg_accent1', type: 'shape', name: 'Background Bubble 1',
                    x: -200, y: -200, width: 800, height: 800, rotation: 0, scale: 1, zIndex: 0,
                    backgroundColor: '#F4F3ED', borderRadius: 999, isLocked: true
                },
                {
                    id: 'bg_accent2', type: 'shape', name: 'Background Bubble 2',
                    x: 600, y: 1200, width: 800, height: 800, rotation: 0, scale: 1, zIndex: 0,
                    backgroundColor: '#E6E4DC', borderRadius: 999, isLocked: true
                },
                {
                    id: 'logo', type: 'logo', name: 'Logomarca',
                    x: 80, y: 80, width: 140, height: 140, rotation: 0, scale: 1, zIndex: 10
                },
                {
                    id: 'headline', type: 'text', name: 'Headline',
                    x: 100, y: 280, width: 880, height: 260, rotation: 0, scale: 1, zIndex: 2,
                    content: data.headline, color: '#1C1B17', fontSize: 85, fontWeight: 900, textAlign: 'left', fontFamily: 'Outfit'
                },
                {
                    id: 'product_image', type: 'image', name: 'Produto',
                    x: (w - imgWidth) / 2, y: isSquare ? 300 : h - 1370, width: imgWidth, height: imgHeight, rotation: 0, scale: 1, zIndex: 3,
                    content: data.imageUrl || undefined
                },
                {
                    id: 'card_bg', type: 'shape', name: 'Bottom Card',
                    x: 60, y: h - 540, width: 960, height: 460, rotation: 0, scale: 1, zIndex: 1,
                    backgroundColor: '#ffffff', borderRadius: 60, dropShadow: '0 20px 40px rgba(0,0,0,0.05)'
                },
                {
                    id: 'body_text', type: 'text', name: 'Body Text',
                    x: 120, y: h - 460, width: 840, height: 160, rotation: 0, scale: 1, zIndex: 2,
                    content: data.body, color: '#5D5A50', fontSize: 36, fontWeight: 400, textAlign: 'left'
                },
                {
                    id: 'cta_button', type: 'shape', name: 'CTA Background',
                    x: 120, y: h - 260, width: 440, height: 120, rotation: 0, scale: 1, zIndex: 2,
                    backgroundColor: '#2b9d58', borderRadius: 40
                },
                {
                    id: 'cta_text', type: 'text', name: 'CTA Text',
                    x: 120, y: h - 220, width: 440, height: 60, rotation: 0, scale: 1, zIndex: 3,
                    content: data.cta, color: '#ffffff', fontSize: 36, fontWeight: 'bold', textAlign: 'center'
                },
                {
                    id: 'price_text', type: 'text', name: 'Price',
                    x: 600, y: h - 240, width: 360, height: 100, rotation: 0, scale: 1, zIndex: 3,
                    content: formatPrice(data.productPrice), color: '#1C1B17', fontSize: 65, fontWeight: 900, textAlign: 'right'
                }
            ]
        },
        {
            id: 'template_2',
            name: 'Organic Dark',
            backgroundColor: '#1C1B17', // surface-900
            layers: [
                {
                    id: 'bg_shape', type: 'shape', name: 'Organic Background',
                    x: -200, y: 400, width: 1480, height: 1200, rotation: -10, scale: 1, zIndex: 0,
                    backgroundColor: '#302E28', borderRadius: 400, isLocked: true
                },
                {
                    id: 'logo', type: 'logo', name: 'Logo',
                    x: 880, y: 80, width: 120, height: 120, rotation: 0, scale: 1, zIndex: 10
                },
                {
                    id: 'badge', type: 'shape', name: 'Badge',
                    x: 80, y: 100, width: 320, height: 70, rotation: 0, scale: 1, zIndex: 2,
                    backgroundColor: 'rgba(43, 157, 88, 0.2)', border: '2px solid #2b9d58', borderRadius: 40
                },
                {
                    id: 'badge_text', type: 'text', name: 'Badge Text',
                    x: 80, y: 118, width: 320, height: 40, rotation: 0, scale: 1, zIndex: 3,
                    content: 'NOVIDADE NATURAL', color: '#4ade80', fontSize: 24, fontWeight: 900, textAlign: 'center', fontFamily: 'Inter'
                },
                {
                    id: 'headline', type: 'text', name: 'Headline',
                    x: 80, y: 220, width: 920, height: 300, rotation: 0, scale: 1, zIndex: 3,
                    content: data.headline, color: '#FCFBF8', fontSize: 80, fontWeight: 800, textAlign: 'left'
                },
                {
                    id: 'product_image', type: 'image', name: 'Produto',
                    x: (w - imgWidth) / 2, y: h - 1370, width: imgWidth, height: imgHeight, rotation: 0, scale: 1, zIndex: 2,
                    content: data.imageUrl || undefined
                },
                {
                    id: 'price_card', type: 'shape', name: 'Price BG',
                    x: 80, y: h - 480, width: 920, height: 340, rotation: 0, scale: 1, zIndex: 4,
                    backgroundColor: '#FCFBF8', borderRadius: 60
                },
                {
                    id: 'body', type: 'text', name: 'Body',
                    x: 140, y: h - 420, width: 800, height: 120, rotation: 0, scale: 1, zIndex: 5,
                    content: data.body, color: '#5D5A50', fontSize: 34, fontWeight: 500, textAlign: 'center'
                },
                {
                    id: 'price', type: 'text', name: 'Price',
                    x: 140, y: h - 280, width: 400, height: 100, rotation: 0, scale: 1, zIndex: 5,
                    content: formatPrice(data.productPrice), color: '#1C1B17', fontSize: 60, fontWeight: 900, textAlign: 'left'
                },
                {
                    id: 'cta_btn', type: 'shape', name: 'CTA Btn Width',
                    x: 520, y: h - 300, width: 420, height: 100, rotation: 0, scale: 1, zIndex: 5,
                    backgroundColor: '#f97316', borderRadius: 40 // Orange Accent
                },
                {
                    id: 'cta_acc', type: 'text', name: 'CTA Text',
                    x: 520, y: h - 270, width: 420, height: 60, rotation: 0, scale: 1, zIndex: 6,
                    content: data.cta.toUpperCase(), color: '#ffffff', fontSize: 32, fontWeight: 900, textAlign: 'center'
                }
            ]
        },
        {
            id: 'template_3',
            name: 'Orange Accent Split',
            backgroundColor: '#FCFBF8',
            layers: [
                {
                    id: 'bg_split', type: 'shape', name: 'Right Split',
                    x: 540, y: 0, width: 540, height: 1920, rotation: 0, scale: 1, zIndex: 0,
                    backgroundColor: '#F4F3ED', isLocked: true
                },
                {
                    id: 'accent_pill', type: 'shape', name: 'Orange Pill',
                    x: 440, y: 500, width: 200, height: 600, rotation: 0, scale: 1, zIndex: 1,
                    backgroundColor: '#f97316', borderRadius: 100, isLocked: true
                },
                {
                    id: 'logo', type: 'logo', name: 'Logomarca',
                    x: 80, y: 80, width: 120, height: 120, rotation: 0, scale: 1, zIndex: 10
                },
                {
                    id: 'headline', type: 'text', name: 'Headline',
                    x: 80, y: 260, width: 920, height: 260, rotation: 0, scale: 1, zIndex: 2,
                    content: data.headline.toUpperCase(), color: '#1C1B17', fontSize: 90, fontWeight: 900, textAlign: 'center'
                },
                {
                    id: 'product_image', type: 'image', name: 'Produto',
                    x: 240, y: 560, width: 600, height: 800, rotation: 0, scale: 1, zIndex: 3,
                    content: data.imageUrl || undefined
                },
                {
                    id: 'body_border', type: 'shape', name: 'Body Line',
                    x: 120, y: h - 460, width: 4, height: 160, rotation: 0, scale: 1, zIndex: 2,
                    backgroundColor: '#2b9d58'
                },
                {
                    id: 'body', type: 'text', name: 'Body Text',
                    x: 160, y: h - 450, width: 800, height: 160, rotation: 0, scale: 1, zIndex: 3,
                    content: data.body, color: '#45433B', fontSize: 36, fontWeight: 500, textAlign: 'left'
                },
                {
                    id: 'price', type: 'text', name: 'Price',
                    x: 120, y: h - 200, width: 460, height: 100, rotation: 0, scale: 1, zIndex: 4,
                    content: formatPrice(data.productPrice), color: '#1C1B17', fontSize: 75, fontWeight: 900, textAlign: 'left'
                },
                {
                    id: 'cta_box', type: 'shape', name: 'CTA Block',
                    x: 600, y: h - 220, width: 360, height: 120, rotation: 0, scale: 1, zIndex: 3,
                    backgroundColor: '#1C1B17', borderRadius: 40
                },
                {
                    id: 'cta_text', type: 'text', name: 'CTA Text',
                    x: 600, y: h - 180, width: 360, height: 80, rotation: 0, scale: 1, zIndex: 4,
                    content: data.cta.toUpperCase(), color: '#ffffff', fontSize: 34, fontWeight: 800, textAlign: 'center'
                }
            ]
        },
        {
            id: 'template_4',
            name: 'Minimal Green Elegance',
            backgroundColor: '#2b9d58', // Primary 500
            layers: [
                {
                    id: 'bg_glow', type: 'shape', name: 'Center Soft Circle',
                    x: 140, y: 300, width: 800, height: 800, rotation: 0, scale: 1, zIndex: 0,
                    backgroundColor: '#4ade80', opacity: 0.15, borderRadius: 999, isLocked: true
                },
                {
                    id: 'logo', type: 'logo', name: 'Logomarca',
                    x: 480, y: 100, width: 120, height: 120, rotation: 0, scale: 1, zIndex: 10
                },
                {
                    id: 'product_image', type: 'image', name: 'Produto',
                    x: 240, y: 300, width: 600, height: 800, rotation: 0, scale: 1, zIndex: 3,
                    content: data.imageUrl || undefined
                },
                {
                    id: 'headline', type: 'text', name: 'Headline',
                    x: 100, y: h - 740, width: 880, height: 260, rotation: 0, scale: 1, zIndex: 2,
                    content: data.headline, color: '#ffffff', fontSize: 70, fontWeight: 800, fontFamily: "sans-serif", textAlign: 'center'
                },
                {
                    id: 'body', type: 'text', name: 'Body',
                    x: 140, y: h - 480, width: 800, height: 160, rotation: 0, scale: 1, zIndex: 2,
                    content: data.body, color: '#f0fdf4', fontSize: 34, fontWeight: 400, textAlign: 'center' // primary-50
                },
                {
                    id: 'footer_card', type: 'shape', name: 'Footer Card',
                    x: 80, y: h - 240, width: 920, height: 160, rotation: 0, scale: 1, zIndex: 2,
                    backgroundColor: '#ffffff', borderRadius: 40
                },
                {
                    id: 'price', type: 'text', name: 'Price',
                    x: 140, y: h - 200, width: 400, height: 80, rotation: 0, scale: 1, zIndex: 3,
                    content: formatPrice(data.productPrice), color: '#16532e', fontSize: 65, fontWeight: 900 // primary-800
                },
                {
                    id: 'cta_button', type: 'shape', name: 'CTA Pill',
                    x: 580, y: h - 210, width: 360, height: 100, rotation: 0, scale: 1, zIndex: 3,
                    backgroundColor: '#1C1B17', borderRadius: 50
                },
                {
                    id: 'cta_text', type: 'text', name: 'CTA Text',
                    x: 580, y: h - 180, width: 360, height: 60, rotation: 0, scale: 1, zIndex: 4,
                    content: data.cta.toUpperCase(), color: '#FCFBF8', fontSize: 30, fontWeight: 800, textAlign: 'center'
                }
            ]
        },
        {
            id: 'template_5',
            name: 'Editorial Clear',
            backgroundColor: '#FCFBF8',
            layers: [
                {
                    id: 'logo', type: 'logo', name: 'Logo',
                    x: 80, y: 80, width: 140, height: 140, rotation: 0, scale: 1, zIndex: 10
                },
                {
                    id: 'bg', type: 'shape', name: 'Image Backdrop',
                    x: 80, y: 260, width: 920, height: 960, rotation: 0, scale: 1, zIndex: 1,
                    backgroundColor: '#F4F3ED', borderRadius: 60, isLocked: true
                },
                {
                    id: 'product_image', type: 'image', name: 'Produto',
                    x: 140, y: 340, width: 800, height: 800, rotation: 0, scale: 1, zIndex: 2,
                    content: data.imageUrl || undefined
                },
                {
                    id: 'headline', type: 'text', name: 'Headline',
                    x: 80, y: h - 640, width: 920, height: 200, rotation: 0, scale: 1, zIndex: 2,
                    content: data.headline, color: '#1C1B17', fontSize: 80, fontWeight: 900, fontFamily: "sans-serif", textAlign: 'left'
                },
                {
                    id: 'body', type: 'text', name: 'Body',
                    x: 80, y: h - 420, width: 660, height: 180, rotation: 0, scale: 1, zIndex: 2,
                    content: data.body, color: '#5D5A50', fontSize: 34, fontWeight: 400, textAlign: 'left'
                },
                {
                    id: 'separator', type: 'shape', name: 'Line',
                    x: 80, y: h - 200, width: 920, height: 2, rotation: 0, scale: 1, zIndex: 2,
                    backgroundColor: '#E6E4DC'
                },
                {
                    id: 'price', type: 'text', name: 'Price',
                    x: 80, y: h - 140, width: 400, height: 80, rotation: 0, scale: 1, zIndex: 3,
                    content: formatPrice(data.productPrice), color: '#2b9d58', fontSize: 60, fontWeight: 900, textAlign: 'left'
                },
                {
                    id: 'cta_button', type: 'shape', name: 'CTA Btn',
                    x: 580, y: h - 160, width: 420, height: 100, rotation: 0, scale: 1, zIndex: 3,
                    backgroundColor: '#f97316', borderRadius: 50
                },
                {
                    id: 'cta_text', type: 'text', name: 'CTA Text',
                    x: 580, y: h - 125, width: 420, height: 60, rotation: 0, scale: 1, zIndex: 4,
                    content: data.cta, color: '#ffffff', fontSize: 32, fontWeight: 800, textAlign: 'center'
                }
            ]
        },
        {
            id: 'template_6',
            name: 'Orange Burst',
            backgroundColor: '#f97316', // Orange 500
            layers: [
                {
                    id: 'bg_dark', type: 'shape', name: 'Bottom Dark Arch',
                    x: 0, y: 800, width: 1080, height: 1120, rotation: 0, scale: 1, zIndex: 0,
                    backgroundColor: '#1C1B17', borderRadius: 0, isLocked: true // We can just use a large rectangle for now
                },
                {
                    id: 'bg_dark_rounding', type: 'shape', name: 'Top Rounding',
                    x: 0, y: 700, width: 1080, height: 200, rotation: 0, scale: 1, zIndex: 0,
                    backgroundColor: '#1C1B17', borderRadius: 999, isLocked: true
                },
                {
                    id: 'logo', type: 'logo', name: 'Logo',
                    x: 480, y: 80, width: 120, height: 120, rotation: 0, scale: 1, zIndex: 10
                },
                {
                    id: 'headline', type: 'text', name: 'Headline',
                    x: 80, y: 240, width: 920, height: 260, rotation: 0, scale: 1, zIndex: 2,
                    content: data.headline.toUpperCase(), color: '#FCFBF8', fontSize: 90, fontWeight: 900, textAlign: 'center'
                },
                {
                    id: 'product_image', type: 'image', name: 'Produto',
                    x: 240, y: 500, width: 600, height: 800, rotation: 0, scale: 1, zIndex: 3,
                    content: data.imageUrl || undefined
                },
                {
                    id: 'body', type: 'text', name: 'Body',
                    x: 140, y: h - 560, width: 800, height: 200, rotation: 0, scale: 1, zIndex: 2,
                    content: data.body, color: '#A8A59A', fontSize: 36, fontWeight: 400, textAlign: 'center'
                },
                {
                    id: 'price', type: 'text', name: 'Price',
                    x: 140, y: h - 320, width: 800, height: 100, rotation: 0, scale: 1, zIndex: 2,
                    content: formatPrice(data.productPrice), color: '#4ade80', fontSize: 75, fontWeight: 900, textAlign: 'center'
                },
                {
                    id: 'cta_btn', type: 'shape', name: 'CTA Btn',
                    x: 290, y: h - 180, width: 500, height: 100, rotation: 0, scale: 1, zIndex: 2,
                    backgroundColor: '#ffffff', borderRadius: 50
                },
                {
                    id: 'cta', type: 'text', name: 'CTA Text',
                    x: 290, y: h - 150, width: 500, height: 50, rotation: 0, scale: 1, zIndex: 3,
                    content: data.cta.toUpperCase(), color: '#1C1B17', fontSize: 32, fontWeight: 900, textAlign: 'center'
                }
            ]
        },
        {
            id: 'template_7',
            name: 'Cream Review Focus',
            backgroundColor: '#F4F3ED',
            layers: [
                {
                    id: 'logo', type: 'logo', name: 'Logo',
                    x: 80, y: 80, width: 120, height: 120, rotation: 0, scale: 1, zIndex: 10
                },
                {
                    id: 'product_image', type: 'image', name: 'Produto',
                    x: 240, y: 180, width: 600, height: 600, rotation: 0, scale: 1, zIndex: 1,
                    content: data.imageUrl || undefined
                },
                {
                    id: 'card', type: 'shape', name: 'Review Card',
                    x: 80, y: h - 1100, width: 920, height: 640, rotation: 0, scale: 1, zIndex: 2,
                    backgroundColor: '#ffffff', borderRadius: 60, dropShadow: '0 20px 40px rgba(0,0,0,0.05)'
                },
                {
                    id: 'stars', type: 'text', name: 'Stars',
                    x: 160, y: h - 1020, width: 760, height: 60, rotation: 0, scale: 1, zIndex: 3,
                    content: '★★★★★', color: '#f97316', fontSize: 50, fontWeight: 900, textAlign: 'center'
                },
                {
                    id: 'headline', type: 'text', name: 'Review Headline',
                    x: 140, y: h - 920, width: 800, height: 280, rotation: 0, scale: 1, zIndex: 3,
                    content: `"${data.headline}"`, color: '#1C1B17', fontSize: 50, fontWeight: 600, textAlign: 'center', fontFamily: 'serif'
                },
                {
                    id: 'badge', type: 'shape', name: 'Badge',
                    x: 390, y: h - 600, width: 300, height: 60, rotation: 0, scale: 1, zIndex: 3,
                    backgroundColor: 'rgba(43,157,88,0.1)', borderRadius: 30
                },
                {
                    id: 'verified', type: 'text', name: 'Verified Text',
                    x: 390, y: h - 585, width: 300, height: 40, rotation: 0, scale: 1, zIndex: 4,
                    content: '✓ Super Recomendo', color: '#2b9d58', fontSize: 22, fontWeight: 800, textAlign: 'center'
                },
                {
                    id: 'price', type: 'text', name: 'Price',
                    x: 80, y: h - 380, width: 920, height: 80, rotation: 0, scale: 1, zIndex: 2,
                    content: formatPrice(data.productPrice), color: '#1C1B17', fontSize: 60, fontWeight: 900, textAlign: 'center'
                },
                {
                    id: 'cta_btn', type: 'shape', name: 'CTA Btn',
                    x: 240, y: h - 260, width: 600, height: 120, rotation: 0, scale: 1, zIndex: 2,
                    backgroundColor: '#2b9d58', borderRadius: 60
                },
                {
                    id: 'cta', type: 'text', name: 'CTA Text',
                    x: 240, y: h - 220, width: 600, height: 60, rotation: 0, scale: 1, zIndex: 3,
                    content: data.cta.toUpperCase(), color: '#ffffff', fontSize: 34, fontWeight: 900, textAlign: 'center'
                }
            ]
        },
        {
            id: 'template_8',
            name: 'Split Green/Sand',
            backgroundColor: '#FCFBF8',
            layers: [
                {
                    id: 'bg_top', type: 'shape', name: 'Green Top',
                    x: 0, y: 0, width: 1080, height: 1100, rotation: 0, scale: 1, zIndex: 0,
                    backgroundColor: '#16532e', isLocked: true // Dark Green
                },
                {
                    id: 'logo', type: 'logo', name: 'Logo',
                    x: 80, y: 80, width: 120, height: 120, rotation: 0, scale: 1, zIndex: 10
                },
                {
                    id: 'headline', type: 'text', name: 'Headline',
                    x: 80, y: 240, width: 920, height: 300, rotation: 0, scale: 1, zIndex: 2,
                    content: data.headline, color: '#FCFBF8', fontSize: 90, fontWeight: 900, textAlign: 'left'
                },
                {
                    id: 'product_image', type: 'image', name: 'Produto',
                    x: 460, y: 640, width: 600, height: 800, rotation: 0, scale: 1, zIndex: 3,
                    content: data.imageUrl || undefined
                },
                {
                    id: 'body', type: 'text', name: 'Body',
                    x: 80, y: h - 740, width: 420, height: 340, rotation: 0, scale: 1, zIndex: 2,
                    content: data.body, color: '#5D5A50', fontSize: 36, fontWeight: 400, textAlign: 'left'
                },
                {
                    id: 'price', type: 'text', name: 'Price',
                    x: 80, y: h - 360, width: 600, height: 100, rotation: 0, scale: 1, zIndex: 2,
                    content: formatPrice(data.productPrice), color: '#1C1B17', fontSize: 70, fontWeight: 900, textAlign: 'left'
                },
                {
                    id: 'cta_btn', type: 'shape', name: 'CTA Btn',
                    x: 80, y: h - 200, width: 500, height: 120, rotation: 0, scale: 1, zIndex: 2,
                    backgroundColor: '#f97316', borderRadius: 20
                },
                {
                    id: 'cta', type: 'text', name: 'CTA Text',
                    x: 80, y: h - 160, width: 500, height: 60, rotation: 0, scale: 1, zIndex: 3,
                    content: data.cta.toUpperCase(), color: '#ffffff', fontSize: 32, fontWeight: 900, textAlign: 'center'
                }
            ]
        },
        {
            id: 'template_9',
            name: 'Dribbble Minimalist',
            backgroundColor: '#ffffff',
            layers: [
                {
                    id: 'border_frame', type: 'shape', name: 'Inner Frame',
                    x: 40, y: 40, width: w - 80, height: h - 80, rotation: 0, scale: 1, zIndex: 0,
                    border: '1px solid #E6E4DC', borderRadius: 40, isLocked: true
                },
                {
                    id: 'logo', type: 'logo', name: 'Logo',
                    x: (w - 100) / 2, y: 100, width: 100, height: 100, rotation: 0, scale: 1, zIndex: 10
                },
                {
                    id: 'product_image', type: 'image', name: 'Produto',
                    x: (w - 700) / 2, y: 340, width: 700, height: 700, rotation: 0, scale: 1, zIndex: 1,
                    content: data.imageUrl || undefined
                },
                {
                    id: 'headline', type: 'text', name: 'Headline',
                    x: 100, y: h - 840, width: 880, height: 300, rotation: 0, scale: 1, zIndex: 2,
                    content: data.headline, color: '#1C1B17', fontSize: 75, fontWeight: 900, fontFamily: 'Outfit', textAlign: 'center'
                },
                {
                    id: 'price_tag', type: 'shape', name: 'Price Tag',
                    x: (w - 300) / 2, y: h - 500, width: 300, height: 80, rotation: 0, scale: 1, zIndex: 3,
                    backgroundColor: '#1C1B17', borderRadius: 20
                },
                {
                    id: 'price_text', type: 'text', name: 'Price Text',
                    x: (w - 300) / 2, y: h - 475, width: 300, height: 40, rotation: 0, scale: 1, zIndex: 4,
                    content: formatPrice(data.productPrice), color: '#ffffff', fontSize: 40, fontWeight: 900, fontFamily: 'Outfit', textAlign: 'center'
                },
                {
                    id: 'body', type: 'text', name: 'Body',
                    x: 140, y: h - 400, width: 800, height: 120, rotation: 0, scale: 1, zIndex: 2,
                    content: data.body, color: '#5D5A50', fontSize: 32, fontWeight: 400, fontFamily: 'Inter', textAlign: 'center'
                },
                {
                    id: 'cta_btn', type: 'shape', name: 'CTA Pill',
                    x: (w - 440) / 2, y: h - 240, width: 440, height: 120, rotation: 0, scale: 1, zIndex: 2,
                    backgroundColor: '#2b9d58', borderRadius: 60
                },
                {
                    id: 'cta_text', type: 'text', name: 'CTA Text',
                    x: (w - 440) / 2, y: h - 200, width: 440, height: 50, rotation: 0, scale: 1, zIndex: 3,
                    content: data.cta.toUpperCase(), color: '#ffffff', fontSize: 34, fontWeight: 900, fontFamily: 'Outfit', textAlign: 'center'
                }
            ]
        }
    ]
}
