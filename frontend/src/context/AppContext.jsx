import { useEffect, useMemo, useState } from 'react'
import { AppContext } from './appContextStore'

function getInitialDarkMode() {
  const savedPreference = localStorage.getItem('urbanHarvestDarkMode')

  if (savedPreference !== null) {
    return savedPreference === 'true'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function AppProvider({ children }) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode)
  const [bookings, setBookings] = useState([])
  const [subscriptions, setSubscriptions] = useState([])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
    localStorage.setItem('urbanHarvestDarkMode', String(isDarkMode))
  }, [isDarkMode])

  const addBooking = (booking) => {
    setBookings((currentBookings) => [
      {
        ...booking,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      },
      ...currentBookings,
    ])
  }

  const addSubscription = (subscription) => {
    setSubscriptions((currentSubscriptions) => [
      {
        ...subscription,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      },
      ...currentSubscriptions,
    ])
  }

  const value = useMemo(
    () => ({
      selectedCategory,
      setSelectedCategory,
      searchTerm,
      setSearchTerm,
      isDarkMode,
      setIsDarkMode,
      toggleDarkMode: () => setIsDarkMode((current) => !current),
      bookings,
      addBooking,
      subscriptions,
      addSubscription,
    }),
    [bookings, isDarkMode, searchTerm, selectedCategory, subscriptions],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
