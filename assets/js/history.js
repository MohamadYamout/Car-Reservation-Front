document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const bookingGrid = document.getElementById("bookingGrid");
  const noBookingsDiv = document.getElementById("noBookings");

  if (!token) {
    alert("Please log in to view your booking history.");
    window.location.href = "login.html";
    return;
  }

  // We'll store data from both reservations and invoices, then merge them.
  let reservations = [];
  let invoices = [];

  // 1. Fetch all reservations
  fetch("http://localhost:5000/api/reservations/me", {
    headers: { Authorization: "Bearer " + token },
  })
    .then((res) => res.json())
    .then((reservationsData) => {
      reservations = reservationsData || [];
      // 2. Fetch all invoices
      return fetch("http://localhost:5000/api/invoices/my-invoices", {
        headers: { Authorization: "Bearer " + token },
      });
    })
    .then((res) => res.json())
    .then((invoicesData) => {
      invoices = invoicesData || [];
      renderHistory(reservations, invoices);
    })
    .catch((err) => {
      console.error("Error fetching history:", err);
      bookingGrid.style.display = "none";
      noBookingsDiv.style.display = "block";
      noBookingsDiv.innerHTML =
        "<h3>Error Fetching Bookings</h3><p>Please try again later.</p>";
    });

  function renderHistory(reservations, invoices) {
    if (!reservations.length) {
      noBookingsDiv.style.display = "block";
      bookingGrid.style.display = "none";
      return;
    }
    noBookingsDiv.style.display = "none";
    bookingGrid.style.display = "grid";
    bookingGrid.innerHTML = "";

    reservations.forEach((reservation) => {
      const carItem = reservation.cars && reservation.cars[0];
      let carName = "Unknown Car";
      if (carItem && carItem.carId) {
        carName = `${carItem.carId.brand || ""} ${carItem.carId.model || ""}`.trim();
      }

      // Find matching invoice by reservationId.
      const invoice = invoices.find(
        (inv) => inv.reservationId === reservation._id
      );
      const amount = invoice ? invoice.amount : 0;
      // Format pickup and dropoff dates
      const pickupDate = new Date(reservation.pickupDateTime);
      const dropoffDate = new Date(reservation.dropoffDateTime);

      // Compute display status according to the new custom logic.
      const displayStatus = getCustomDisplayStatus(invoice, pickupDate, dropoffDate);

      // Also get the corresponding CSS class
      const statusClass = getStatusClass(displayStatus);

      // Build the booking card
      const card = document.createElement("div");
      card.classList.add("booking-card");
      card.innerHTML = `
        <div class="car-details">
          <h3>${carName}</h3>
          <p><strong>Pickup Location:</strong> ${reservation.pickupLocation || "N/A"}</p>
          <p><strong>Dropoff Location:</strong> ${reservation.dropoffLocation || "N/A"}</p>
          <p><strong>Driver:</strong> ${reservation.driverName || "N/A"}</p>
        </div>
        <div class="booking-date">
          <p><strong>Pickup:</strong> ${pickupDate.toLocaleDateString()}</p>
          <p><strong>Dropoff:</strong> ${dropoffDate.toLocaleDateString()}</p>
        </div>
        <div class="booking-status ${statusClass}">
          ${displayStatus}
        </div>
        <div class="booking-actions">
          <div class="booking-price">$${amount.toFixed(2)}</div>
        </div>
      `;
      bookingGrid.appendChild(card);
    });
  }

  // Helper to compute display status
  function getCustomDisplayStatus(invoice, pickupDate, dropoffDate) {
    const now = new Date();

    if (!invoice) {
      if (now < dropoffDate) {
        return "Draft";
      } else {
        return "Cancelled";
      }
    }

    if (invoice.status === "cancelled") {
      return "Cancelled";
    }

    if (invoice.status === "complete") {
      if (now < pickupDate) {
        return "Inactive";
      }
      if (now >= pickupDate && now < dropoffDate) {
        return "Active";
      }
      if (now >= dropoffDate) {
        return "Completed";
      }
    }

    if (invoice.status === "incomplete") {
      if (now < dropoffDate) {
        return "Draft";
      } else {
        updateInvoiceStatus(invoice._id, "cancelled");
        return "Cancelled";
      }
    }
    return "Active";
  }

  function getStatusClass(statusString) {
    switch (statusString.toLowerCase()) {
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      case "draft":
        return "status-draft";
      case "inactive":
        return "status-inactive";
      case "active":
        return "status-active";
      default:
        return "status-active";
    }
  }

  function updateInvoiceStatus(invoiceId, newStatus) {
    fetch(`http://localhost:5000/api/invoices/${invoiceId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Invoice updated to", newStatus, data);
      })
      .catch((err) => {
        console.error("Error updating invoice:", err);
      });
  }
});