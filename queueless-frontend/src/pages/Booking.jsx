import PageHero from "../components/PageHero";
import BookAppointment from "./BookAppointment";

function Booking() {
  return (
    <div>
      <PageHero
        title="Book an appointment"
        subtitle="Choose a service and reserve your place before you leave home."
      />
      <BookAppointment />
    </div>
  );
}

export default Booking;
