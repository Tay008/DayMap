import { useEffect, useState } from 'react'
import './Toast.css'

interface ToastItem {
  id: number
  text: string
}

type ToastListener = (text: string) => void

let listener: ToastListener | null = null

export function showErrorToast(message: string): void {
  listener?.(message)
}

export default function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    listener = (text: string) => {
      const id = Date.now() + Math.random()
      setItems((current) => [...current, { id, text }])
      window.setTimeout(() => {
        setItems((current) => current.filter((item) => item.id !== id))
      }, 4000)
    }
    return () => {
      listener = null
    }
  }, [])

  return (
    <div className="toast-host" aria-live="polite">
      {items.map((item) => (
        <div key={item.id} className="toast" dir="auto">
          {item.text}
        </div>
      ))}
    </div>
  )
}
