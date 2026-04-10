'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

export interface CartTest {
  id: string
  name: string
  slug: string
  sample_type: string
  category: string
  preparation_instructions: string | null
  turnaround_hours: number | null
}

interface CartContextType {
  cart: CartTest[]
  addToCart: (test: CartTest) => void
  removeFromCart: (id: string) => void
  toggleCart: (test: CartTest) => void
  isInCart: (id: string) => boolean
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartTest[]>([])

  const addToCart = (test: CartTest) => {
    setCart(prev => {
      if (prev.find(t => t.id === test.id)) return prev
      return [...prev, test]
    })
  }

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(t => t.id !== id))
  }

  const toggleCart = (test: CartTest) => {
    setCart(prev => {
      if (prev.find(t => t.id === test.id)) {
        return prev.filter(t => t.id !== test.id)
      }
      return [...prev, test]
    })
  }

  const isInCart = (id: string) => !!cart.find(t => t.id === id)

  const clearCart = () => setCart([])

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, toggleCart, isInCart, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}
