/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Product } from '@/types/database'

export interface CartItem {
    product: Product
    quantity: number
}

interface CartContextType {
    items: CartItem[]
    addItem: (product: Product) => { success: boolean; message?: string }
    removeItem: (productId: string) => void
    updateQuantity: (productId: string, quantity: number) => { success: boolean; message?: string }
    clearCart: () => void
    totalItems: number
    totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const STORAGE_KEY = 'ro-naturalis-cart'

function loadCart(): CartItem[] {
    try {
        const stored = sessionStorage.getItem(STORAGE_KEY)
        if (stored) return JSON.parse(stored)
    } catch { /* ignore */ }
    return []
}

function saveCart(items: CartItem[]) {
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch { /* ignore */ }
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(loadCart)

    useEffect(() => {
        saveCart(items)
    }, [items])

    function addItem(product: Product): { success: boolean; message?: string } {
        const existing = items.find(i => i.product.id === product.id)
        const currentQty = existing ? existing.quantity : 0
        if (currentQty >= product.stock_quantity) {
            return { success: false, message: `Só há ${product.stock_quantity} unidades no estoque.` }
        }

        setItems(prev => {
            const existingInPrev = prev.find(i => i.product.id === product.id)
            if (existingInPrev) {
                return prev.map(i =>
                    i.product.id === product.id
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                )
            }
            return [...prev, { product, quantity: 1 }]
        })
        return { success: true }
    }

    function removeItem(productId: string) {
        setItems(prev => prev.filter(i => i.product.id !== productId))
    }

    function updateQuantity(productId: string, quantity: number): { success: boolean; message?: string } {
        const existing = items.find(i => i.product.id === productId)
        if (!existing) return { success: false }

        if (quantity > existing.product.stock_quantity) {
            // Adjust to max stock
            setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: existing.product.stock_quantity } : i))
            return { success: false, message: `Só há ${existing.product.stock_quantity} unidades no estoque.` }
        }

        if (quantity <= 0) {
            removeItem(productId)
            return { success: true }
        }
        setItems(prev =>
            prev.map(i =>
                i.product.id === productId ? { ...i, quantity } : i
            )
        )
        return { success: true }
    }

    function clearCart() {
        setItems([])
    }

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
    const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (!context) throw new Error('useCart deve ser usado dentro de um CartProvider')
    return context
}
