import React, { useRef, useEffect } from 'react'
import { Stage, Layer, Rect, Text, Image as KonvaImage, Transformer } from 'react-konva'
import Konva from 'konva'
import useImage from 'use-image'
import type { CanvasLayer, CanvasTemplate } from './types'

export type LayerManagerResult = {
    layers: CanvasLayer[]
    selectedLayerId: string | null
    setSelectedLayerId: (id: string | null) => void
    updateLayer: (id: string, updates: Partial<CanvasLayer>) => void
    setLayers?: (layers: CanvasLayer[]) => void
    commitHistory?: () => void
}

interface CanvasEditorProps {
    template: CanvasTemplate
    manager: LayerManagerResult
    canvasRef?: React.RefObject<Konva.Stage | null> // Stage ref for export
    zoom?: number
    canvasWidth: number
    canvasHeight: number
}

// --- Custom Image Component ---
interface LayerComponentProps {
    layer: CanvasLayer
    isSelected: boolean
    onSelect: () => void
    onChange: (id: string, updates: Partial<CanvasLayer>) => void
    onHistoryCommit: () => void
}

const URLImage = ({ layer, isSelected, onSelect, onChange, onHistoryCommit }: LayerComponentProps) => {
    const [image] = useImage(layer.content || '', 'anonymous')
    const shapeRef = useRef<Konva.Image>(null)
    const trRef = useRef<Konva.Transformer>(null)

    useEffect(() => {
        if (isSelected && trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current])
            trRef.current.getLayer()?.batchDraw()
        }
    }, [isSelected])

    useEffect(() => {
        if (image && shapeRef.current) {
            shapeRef.current.cache()
            // brightness is -1 to 1 in Konva
            shapeRef.current.brightness(layer.brightness ?? 0)
            shapeRef.current.contrast(layer.contrast ?? 0)
            
            const filters = [Konva.Filters.Brighten, Konva.Filters.Contrast]
            if (layer.grayscale) {
                filters.push(Konva.Filters.Grayscale)
            }
            shapeRef.current.filters(filters)
            
            shapeRef.current.getLayer()?.batchDraw()
        }
    }, [image, layer.brightness, layer.contrast, layer.grayscale])

    return (
        <React.Fragment>
            <KonvaImage
                image={image}
                ref={shapeRef}
                x={layer.x}
                y={layer.y}
                width={layer.width}
                height={layer.height}
                rotation={layer.rotation || 0}
                opacity={layer.opacity ?? 1}
                shadowColor={layer.shadowColor}
                shadowBlur={layer.shadowBlur}
                shadowOffsetX={layer.shadowOffsetX}
                shadowOffsetY={layer.shadowOffsetY}
                shadowOpacity={layer.shadowOpacity}
                draggable={!layer.isLocked}
                onClick={onSelect}
                onTap={onSelect}
                onDragStart={onHistoryCommit}
                onTransformStart={onHistoryCommit}
                onDragEnd={(e) => {
                    onChange(layer.id, {
                        x: e.target.x(),
                        y: e.target.y()
                    })
                }}
                onTransformEnd={() => {
                    const node = shapeRef.current
                    if (!node) return
                    const scaleX = node.scaleX()
                    const scaleY = node.scaleY()

                    node.scaleX(1)
                    node.scaleY(1)

                    onChange(layer.id, {
                        x: node.x(),
                        y: node.y(),
                        rotation: node.rotation(),
                        width: Math.max(5, node.width() * scaleX),
                        height: Math.max(5, node.height() * scaleY)
                    })
                }}
            />
            {isSelected && !layer.isLocked && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        if (newBox.width < 10 || newBox.height < 10) return oldBox
                        return newBox
                    }}
                />
            )}
        </React.Fragment>
    )
}

// --- Custom Text Component ---
const CanvasText = ({ layer, isSelected, onSelect, onChange, onHistoryCommit }: LayerComponentProps) => {
    const shapeRef = useRef<Konva.Text>(null)
    const trRef = useRef<Konva.Transformer>(null)

    useEffect(() => {
        if (isSelected && trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current])
            trRef.current.getLayer()?.batchDraw()
        }
    }, [isSelected])

    return (
        <React.Fragment>
            <Text
                ref={shapeRef}
                text={layer.content || ''}
                x={layer.x}
                y={layer.y}
                width={layer.width} // Allows wrapping 
                fontSize={layer.fontSize || 32}
                fontFamily={layer.fontFamily || 'sans-serif'}
                fill={layer.color || '#000'}
                align={layer.textAlign || 'left'}
                fontStyle={layer.fontWeight === 'bold' ? 'bold' : 'normal'}
                rotation={layer.rotation || 0}
                opacity={layer.opacity ?? 1}
                stroke={layer.stroke}
                strokeWidth={layer.strokeWidth}
                shadowColor={layer.shadowColor}
                shadowBlur={layer.shadowBlur}
                shadowOffsetX={layer.shadowOffsetX}
                shadowOffsetY={layer.shadowOffsetY}
                shadowOpacity={layer.shadowOpacity}
                letterSpacing={layer.letterSpacing || 0}
                lineHeight={layer.lineHeight || 1.2}
                draggable={!layer.isLocked}
                onClick={onSelect}
                onTap={onSelect}
                onDragStart={onHistoryCommit}
                onTransformStart={onHistoryCommit}
                onDragEnd={(e) => {
                    onChange(layer.id, {
                        x: e.target.x(),
                        y: e.target.y()
                    })
                }}
                onTransformEnd={() => {
                    const node = shapeRef.current
                    if (!node) return
                    const scaleX = node.scaleX()

                    // Reset scale and update width/fontSize
                    // For text, resizing generally increases font size visually or alters width boundary.
                    const scaleY = node.scaleY()

                    node.scaleX(1)
                    node.scaleY(1)

                    onChange(layer.id, {
                        x: node.x(),
                        y: node.y(),
                        rotation: node.rotation(),
                        width: Math.max(10, node.width() * scaleX),
                        fontSize: (layer.fontSize || 32) * Math.max(scaleX, scaleY)
                    })
                }}
            />
            {isSelected && !layer.isLocked && (
                <Transformer
                    ref={trRef}
                    // For text, we generally only want middle handles to change width, or corner handles to scale.
                    // Keep ratio when scaling text from corners to avoid stretching.
                    enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right']}
                    boundBoxFunc={(oldBox, newBox) => {
                        // Prevent the text box from being crushed
                        if (newBox.width < 50) return oldBox
                        return newBox
                    }}
                />
            )}
        </React.Fragment>
    )
}

// --- Custom Shape Component ---
const CanvasShape = ({ layer, isSelected, onSelect, onChange, onHistoryCommit }: LayerComponentProps) => {
    const shapeRef = useRef<Konva.Rect>(null)
    const trRef = useRef<Konva.Transformer>(null)

    useEffect(() => {
        if (isSelected && trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current])
            trRef.current.getLayer()?.batchDraw()
        }
    }, [isSelected])

    return (
        <React.Fragment>
            <Rect
                ref={shapeRef}
                x={layer.x}
                y={layer.y}
                width={layer.width}
                height={layer.height}
                fill={layer.backgroundColor || '#ccc'}
                cornerRadius={layer.borderRadius || 0}
                rotation={layer.rotation || 0}
                opacity={layer.opacity ?? 1}
                stroke={layer.stroke}
                strokeWidth={layer.strokeWidth}
                shadowColor={layer.shadowColor}
                shadowBlur={layer.shadowBlur}
                shadowOffsetX={layer.shadowOffsetX}
                shadowOffsetY={layer.shadowOffsetY}
                shadowOpacity={layer.shadowOpacity}
                draggable={!layer.isLocked}
                onClick={onSelect}
                onTap={onSelect}
                onDragStart={onHistoryCommit}
                onTransformStart={onHistoryCommit}
                onDragEnd={(e) => {
                    onChange(layer.id, {
                        x: e.target.x(),
                        y: e.target.y()
                    })
                }}
                onTransformEnd={() => {
                    const node = shapeRef.current
                    if (!node) return
                    const scaleX = node.scaleX()
                    const scaleY = node.scaleY()

                    node.scaleX(1)
                    node.scaleY(1)

                    onChange(layer.id, {
                        x: node.x(),
                        y: node.y(),
                        rotation: node.rotation(),
                        width: Math.max(5, node.width() * scaleX),
                        height: Math.max(5, node.height() * scaleY)
                    })
                }}
            />
            {isSelected && !layer.isLocked && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        if (newBox.width < 10 || newBox.height < 10) return oldBox
                        return newBox
                    }}
                />
            )}
        </React.Fragment>
    )
}

// --- Background Image Component ---
const BackgroundImage = ({ url, canvasWidth, canvasHeight }: { url: string; canvasWidth: number; canvasHeight: number }) => {
    const [image] = useImage(url, 'anonymous')
    if (!image) return null

    // Fit image to canvas cover
    const scale = Math.max(canvasWidth / image.width, canvasHeight / image.height)

    return (
        <KonvaImage
            image={image}
            width={image.width * scale}
            height={image.height * scale}
            x={(canvasWidth - image.width * scale) / 2}
            y={(canvasHeight - image.height * scale) / 2}
            listening={false} // Background doesn't capture events
        />
    )
}

export default function CanvasEditor({
    template,
    manager,
    canvasRef,
    zoom = 1,
    canvasWidth,
    canvasHeight
}: CanvasEditorProps) {
    const { layers, selectedLayerId, setSelectedLayerId } = manager

    const checkDeselect = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
        // Deselect when clicking on empty area
        const clickedOnEmpty = e.target.name() === 'background-layer'
        if (clickedOnEmpty) {
            setSelectedLayerId(null)
        }
    }

    return (
        <div className="shadow-2xl overflow-hidden bg-white">
            <Stage
                width={canvasWidth * zoom}
                height={canvasHeight * zoom}
                scaleX={zoom}
                scaleY={zoom}
                onMouseDown={checkDeselect}
                onTouchStart={checkDeselect}
                ref={canvasRef}
            >
                {/* Background Layer (Fixed) */}
                <Layer name="background-layer">
                    <Rect
                        width={canvasWidth}
                        height={canvasHeight}
                        fill={template.backgroundColor || '#ffffff'}
                        name="background-layer"
                    />
                    {template.backgroundImage && (
                        <BackgroundImage url={template.backgroundImage} canvasWidth={canvasWidth} canvasHeight={canvasHeight} />
                    )}
                </Layer>

                {/* Content Layer */}
                <Layer>
                    {[...layers].sort((a, b) => a.zIndex - b.zIndex).map((layer) => {
                        const isSelected = layer.id === selectedLayerId
                        const props = {
                            key: layer.id,
                            layer: layer,
                            isSelected: isSelected,
                            onSelect: () => {
                                if (manager.selectedLayerId !== layer.id) {
                                    manager.setSelectedLayerId(layer.id)
                                }
                            },
                            onChange: manager.updateLayer,
                            onHistoryCommit: manager.commitHistory || (() => { })
                        }

                        if (layer.type === 'text') {
                            return <CanvasText {...props} />
                        } else if (layer.type === 'image' || layer.type === 'logo') {
                            return <URLImage {...props} />
                        } else if (layer.type === 'shape') {
                            return <CanvasShape {...props} />
                        }
                        return null
                    })}
                </Layer>
            </Stage>
        </div>
    )
}
