import { useState } from 'react'
import { useAppContext } from '../context/useAppContext'
import { events, workshops } from '../data/items'
import { createBooking } from '../services/api'

const bookableItems = [...events, ...workshops]

const initialForm = {
  name: '',
  email: '',
  itemId: '',
  bookingDateTime: '',
  participants: '1',
  notes: '',
}

function BookingForm() {
  const { addBooking } = useAppContext()
  const [formData, setFormData] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [apiError, setApiError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedItem = bookableItems.find((item) => item.id === formData.itemId)

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
    setSuccessMessage('')
    setApiError('')
  }

  const validate = () => {
    const nextErrors = {}
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!formData.name.trim()) {
      nextErrors.name = 'Please enter your full name.'
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Please enter your email address.'
    } else if (!emailPattern.test(formData.email)) {
      nextErrors.email = 'Please enter a valid email address.'
    }

    if (!formData.itemId) {
      nextErrors.itemId = 'Please choose an event or workshop.'
    }

    if (!formData.bookingDateTime) {
      nextErrors.bookingDateTime = 'Please choose a booking date and time.'
    } else if (selectedItem?.date && formData.bookingDateTime.slice(0, 10) !== selectedItem.date) {
      nextErrors.bookingDateTime = `Please choose a time on ${selectedItem.date} for this session.`
    }

    if (!formData.participants || Number(formData.participants) < 1) {
      nextErrors.participants = 'Participants must be at least 1.'
    }

    return nextErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validate()
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length === 0) {
      const bookingPayload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        participants: Number(formData.participants),
        notes: formData.notes.trim(),
        itemId: formData.itemId,
        itemTitle: selectedItem.title,
        itemType: selectedItem.type,
        itemDate: selectedItem.date,
        bookingDateTime: formData.bookingDateTime,
      }

      try {
        setIsSubmitting(true)
        setApiError('')
        const savedBooking = await createBooking(bookingPayload)

        addBooking(savedBooking)
        setSuccessMessage(`Booking request saved for ${selectedItem.title}.`)
        setFormData(initialForm)
      } catch {
        addBooking(bookingPayload)
        setApiError('Booking could not be saved to the backend. It was kept locally for this session.')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <form className="app-panel space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <label htmlFor="booking-name" className="form-label">
          Full name
        </label>
        <input
          id="booking-name"
          type="text"
          value={formData.name}
          onChange={(event) => updateField('name', event.target.value)}
          className="form-field"
          aria-describedby={errors.name ? 'booking-name-error' : undefined}
          aria-invalid={Boolean(errors.name)}
          autoComplete="name"
        />
        {errors.name && <p id="booking-name-error" className="error-text">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="booking-email" className="form-label">
          Email address
        </label>
        <input
          id="booking-email"
          type="email"
          value={formData.email}
          onChange={(event) => updateField('email', event.target.value)}
          className="form-field"
          aria-describedby={errors.email ? 'booking-email-error' : undefined}
          aria-invalid={Boolean(errors.email)}
          autoComplete="email"
        />
        {errors.email && <p id="booking-email-error" className="error-text">{errors.email}</p>}
      </div>
      </div>

      <div>
        <label htmlFor="booking-item" className="form-label">
          Event or workshop
        </label>
        <select
          id="booking-item"
          value={formData.itemId}
          onChange={(event) => updateField('itemId', event.target.value)}
          className="form-field"
          aria-describedby={errors.itemId ? 'booking-item-error' : 'booking-item-help'}
          aria-invalid={Boolean(errors.itemId)}
        >
          <option value="">Select a session</option>
          {bookableItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title} - {item.date}
            </option>
          ))}
        </select>
        <p id="booking-item-help" className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Choose from current Urban Harvest Hub events and workshops.
        </p>
        {errors.itemId && <p id="booking-item-error" className="error-text">{errors.itemId}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <label htmlFor="booking-date-time" className="form-label">
          Booking date and time
        </label>
        <input
          id="booking-date-time"
          type="datetime-local"
          value={formData.bookingDateTime}
          onChange={(event) => updateField('bookingDateTime', event.target.value)}
          className="form-field"
          aria-describedby={errors.bookingDateTime ? 'booking-date-time-error' : 'booking-date-time-help'}
          aria-invalid={Boolean(errors.bookingDateTime)}
        />
        <p id="booking-date-time-help" className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {selectedItem?.date
            ? `This session is scheduled for ${selectedItem.date}.`
            : 'Select a session first, then choose a matching date and time.'}
        </p>
        {errors.bookingDateTime && (
          <p id="booking-date-time-error" className="error-text">
            {errors.bookingDateTime}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="booking-participants" className="form-label">
          Participants
        </label>
        <input
          id="booking-participants"
          type="number"
          min="1"
          value={formData.participants}
          onChange={(event) => updateField('participants', event.target.value)}
          className="form-field"
          aria-describedby={errors.participants ? 'booking-participants-error' : undefined}
          aria-invalid={Boolean(errors.participants)}
        />
        {errors.participants && (
          <p id="booking-participants-error" className="error-text">
            {errors.participants}
          </p>
        )}
      </div>
      </div>

      <div>
        <label htmlFor="booking-notes" className="form-label">
          Notes
        </label>
        <textarea
          id="booking-notes"
          rows="4"
          value={formData.notes}
          onChange={(event) => updateField('notes', event.target.value)}
          className="form-field"
          placeholder="Optional access needs, questions, or preferences"
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">No backend is used. Requests are saved in React Context.</p>
        <button type="submit" className="btn-primary w-full sm:w-auto" disabled={isSubmitting}>
          {isSubmitting ? 'Saving booking...' : 'Submit booking request'}
        </button>
      </div>

      {apiError && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200" role="alert">
          {apiError}
        </p>
      )}

      {successMessage && (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200" role="status">
          {successMessage}
        </p>
      )}
    </form>
  )
}

export default BookingForm
