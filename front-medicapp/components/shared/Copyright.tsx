'use client'

import { useState, useEffect } from 'react'

export const Copyright = () => {
  const [ year, setYear ] = useState(new Date().getFullYear())

  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  return (
    <p className="text-xs text-gray-600">
      &copy; {year} todos los derechos reservados MedicApp
    </p>
  )
}