'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

export interface SelectedLab {
  id: string
  name: string
  town: string
  rating: number
  total_price: number
  turnaround_hours: number
  distance_km?: number
}

export interface Schedule {
  date: string
  timeSlotId: string
  timeSlotLabel: string
  addressLine: string
  landmark: string
  latitude?: number
  longitude?: number
}

export interface DeliveryPrefs {
  whatsapp: boolean
  email: boolean
  emailAddress: string
  doctor: boolean
  doctorContact: string
  doctorName: string
  doctorChannel: 'whatsapp' | 'email'
}

interface BookingContextType {
  selectedLab: SelectedLab | null
  setSelectedLab: (lab: SelectedLab | null) => void
  schedule: Schedule | null
  setSchedule: (s: Schedule | null) => void
  delivery: DeliveryPrefs
  setDelivery: (d: DeliveryPrefs) => void
  orderNumber: string | null
  setOrderNumber: (n: string | null) => void
  resetBooking: () => void
}

const defaultDelivery: DeliveryPrefs = {
  whatsapp: true,
  email: false,
  emailAddress: '',
  doctor: false,
  doctorContact: '',
  doctorName: '',
  doctorChannel: 'whatsapp',
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [selectedLab, setSelectedLab] = useState<SelectedLab | null>(null)
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [delivery, setDelivery] = useState<DeliveryPrefs>(defaultDelivery)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)

  const resetBooking = () => {
    setSelectedLab(null)
    setSchedule(null)
    setDelivery(defaultDelivery)
    setOrderNumber(null)
  }

  return (
    <BookingContext.Provider value={{ selectedLab, setSelectedLab, schedule, setSchedule, delivery, setDelivery, orderNumber, setOrderNumber, resetBooking }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const context = useContext(BookingContext)
  if (!context) throw new Error('useBooking must be used within a BookingProvider')
  return context
}
