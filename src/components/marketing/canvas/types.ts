export type LayerType = 'image' | 'text' | 'shape' | 'logo'

export interface CanvasLayer {
    id: string
    type: LayerType
    name: string

    // Transform coordinates (center-based is often easier for rotation, but top-left is standard for DOM)
    // We will use top-left for x, y and calculate transform-origin dynamically as center.
    x: number
    y: number
    width: number
    height: number
    rotation: number
    scale: number
    zIndex: number

    // Content
    content?: string // For Text and Image URLs

    // Style & Effects
    color?: string
    backgroundColor?: string
    fontSize?: number
    fontWeight?: number | string
    fontFamily?: string
    textAlign?: 'left' | 'center' | 'right'
    opacity?: number
    borderRadius?: number
    
    // V2 Effects
    stroke?: string
    strokeWidth?: number
    shadowColor?: string
    shadowBlur?: number
    shadowOffsetX?: number
    shadowOffsetY?: number
    shadowOpacity?: number
    
    // V2 Image Filters
    brightness?: number
    contrast?: number
    grayscale?: boolean
    
    // V2 Advanced Text
    letterSpacing?: number
    lineHeight?: number

    // Specific configs
    dropShadow?: string
    border?: string

    // Locking
    isLocked?: boolean
}

export interface CanvasTemplate {
    id: string
    name: string
    layers: CanvasLayer[]
    backgroundColor: string
    backgroundImage?: string
}
