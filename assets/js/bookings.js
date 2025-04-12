function loadBookings() {
    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    const bookingsList = document.getElementById("bookingsList");
    if (bookings.length === 0) {
      bookingsList.innerHTML = "<p>No finalized bookings available.</p>";
      return;
    }
    bookings.forEach((booking, idx) => {
      const div = document.createElement("div");
      div.innerHTML = `<h3>Booking ${idx + 1} (Completed: ${booking.completedAt})</h3>
        <p>Name: ${booking.personalInfo.name}</p>
        <p>Total: $${booking.total.toFixed(2)}</p>
        <p>Cars: ${booking.order.map(car => car.group).join(", ")}</p>
        <hr>`;
      bookingsList.appendChild(div);
    });
  }
  loadBookings();
  