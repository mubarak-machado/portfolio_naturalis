import { useState, useCallback } from 'react'
import type { CanvasLayer } from './types'

type HistoryState = {
    past: CanvasLayer[][];
    present: CanvasLayer[];
    future: CanvasLayer[][];
}

export function useLayerManager(initialLayers: CanvasLayer[] = []) {
    const [history, setHistory] = useState<HistoryState>({
        past: [],
        present: initialLayers,
        future: []
    })
    const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null)

    const layers = history.present;

    // Call this BEFORE making a discrete significant change (like delete, order, or starting a drag)
    const commitHistory = useCallback(() => {
        setHistory(current => {
            const newPast = [...current.past, current.present]
            if (newPast.length > 10) newPast.shift() // Limit to 10 steps
            return {
                ...current,
                past: newPast,
                future: []
            }
        })
    }, [])

    // Mostly for templates loading
    const resetLayers = useCallback((newLayers: CanvasLayer[]) => {
        setHistory({ past: [], present: newLayers, future: [] })
        setSelectedLayerId(null)
    }, [])

    const setLayers = useCallback((updater: CanvasLayer[] | ((curr: CanvasLayer[]) => CanvasLayer[])) => {
        setHistory(curr => ({
            ...curr,
            present: typeof updater === 'function' ? updater(curr.present) : updater
        }))
    }, [])

    const updateLayer = useCallback((id: string, updates: Partial<CanvasLayer>) => {
        setHistory(curr => ({
            ...curr,
            present: curr.present.map(layer =>
                layer.id === id ? { ...layer, ...updates } : layer
            )
        }))
    }, [])

    // For inputs/properties that change instantly and we want them logged in history
    const updateLayerWithHistory = useCallback((id: string, updates: Partial<CanvasLayer>) => {
        commitHistory()
        updateLayer(id, updates)
    }, [commitHistory, updateLayer])

    const bringToFront = useCallback((id: string) => {
        commitHistory()
        setHistory(curr => {
            const maxZ = Math.max(...curr.present.map(l => l.zIndex), 0)
            return {
                ...curr,
                present: curr.present.map(layer =>
                    layer.id === id ? { ...layer, zIndex: maxZ + 1 } : layer
                )
            }
        })
    }, [commitHistory])

    const sendToBack = useCallback((id: string) => {
        commitHistory()
        setHistory(curr => {
            const minZ = Math.min(...curr.present.map(l => l.zIndex), 0)
            return {
                ...curr,
                present: curr.present.map(layer =>
                    layer.id === id ? { ...layer, zIndex: minZ - 1 } : layer
                )
            }
        })
    }, [commitHistory])

    const deleteLayer = useCallback((id: string) => {
        commitHistory()
        setHistory(curr => ({
            ...curr,
            present: curr.present.filter(layer => layer.id !== id)
        }))
        if (selectedLayerId === id) setSelectedLayerId(null)
    }, [commitHistory, selectedLayerId])

    const addLayer = useCallback((layer: CanvasLayer) => {
        commitHistory()
        setHistory(curr => {
            // Guarantee lowest z-index is higher than anything else to appear on top
            const maxZ = Math.max(...curr.present.map(l => l.zIndex), 0)
            const newLayer = { ...layer, zIndex: maxZ + 1 }
            return {
                ...curr,
                present: [...curr.present, newLayer]
            }
        })
        setSelectedLayerId(layer.id)
    }, [commitHistory])

    const undo = useCallback(() => {
        setHistory(current => {
            if (current.past.length === 0) return current
            const newPast = [...current.past]
            const previous = newPast.pop()!
            return {
                past: newPast,
                present: previous,
                future: [current.present, ...current.future]
            }
        })
        setSelectedLayerId(null)
    }, [])

    const redo = useCallback(() => {
        setHistory(current => {
            if (current.future.length === 0) return current
            const newFuture = [...current.future]
            const next = newFuture.shift()!
            return {
                past: [...current.past, current.present],
                present: next,
                future: newFuture
            }
        })
        setSelectedLayerId(null)
    }, [])

    const alignLayer = useCallback((id: string, alignType: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom', canvasWidth: number, canvasHeight: number) => {
        const layerToAlign = history.present.find(l => l.id === id)
        if (!layerToAlign) return

        let updates: Partial<CanvasLayer> = {}

        switch (alignType) {
            case 'left':
                updates.x = 0
                break
            case 'center':
                updates.x = (canvasWidth - layerToAlign.width) / 2
                break
            case 'right':
                updates.x = canvasWidth - layerToAlign.width
                break
            case 'top':
                updates.y = 0
                break
            case 'middle':
                updates.y = (canvasHeight - layerToAlign.height) / 2
                break
            case 'bottom':
                updates.y = canvasHeight - layerToAlign.height
                break
        }

        if (Object.keys(updates).length > 0) {
            updateLayerWithHistory(id, updates)
        }
    }, [history.present, updateLayerWithHistory])

    const selectedLayer = layers.find(l => l.id === selectedLayerId) || null
    const canUndo = history.past.length > 0
    const canRedo = history.future.length > 0

    return {
        layers,
        setLayers,
        selectedLayerId,
        setSelectedLayerId,
        selectedLayer,
        updateLayer,
        updateLayerWithHistory,
        bringToFront,
        sendToBack,
        deleteLayer,
        addLayer,
        commitHistory,
        resetLayers,
        undo,
        redo,
        canUndo,
        canRedo,
        alignLayer
    }
}
