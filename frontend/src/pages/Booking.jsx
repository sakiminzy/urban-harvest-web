import BookingForm from '../components/BookingForm'

function Booking() {
  return (
    <section className="page-stack" aria-labelledby="booking-heading">
      <div className="mx-auto max-w-3xl text-center">
        <p className="section-kicker">Reservations</p>
        <h1 id="booking-heading" className="mt-2 page-title">Booking</h1>
        <p className="page-copy mx-auto mt-3">
          Request a place at an Urban Harvest Hub event or workshop. This form
          validates in the browser only for Task 1.
        </p>
      </div>

      <div className="mx-auto w-full max-w-3xl">
        <BookingForm />
      </div>
    </section>
  )
}

export default Booking
