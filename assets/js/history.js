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
        const invoiceStatus = invoice ? invoice.status : "incomplete";
  
        // Compute display status according to your custom logic:
        // 1) cancelled -> Cancelled
        // 2) complete + now < dropoffDate => Active, else Completed
        // 3) incomplete + now < dropoffDate => Active, else Incomplete
        const dropoffDate = new Date(reservation.dropoffDateTime);
        const displayStatus = getCustomDisplayStatus(invoiceStatus, dropoffDate);
  
        // Also get the corresponding CSS class
        const statusClass = getStatusClass(displayStatus);
  
        // Format pickup and dropoff
        const pickupDate = new Date(reservation.pickupDateTime);
        const dropDate = dropoffDate; // just naming consistency
  
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
            <p><strong>Dropoff:</strong> ${dropDate.toLocaleDateString()}</p>
          </div>
          <div class="booking-status ${statusClass}">
            ${displayStatus}
          </div>
          <div class="booking-actions">
            <div class="booking-price">$${amount.toFixed(2)}</div>
            <a href="downloadInvoice.html?id=${reservation._id}" class="btn-invoice">
              Download Invoice
            </a>
          </div>
        `;
        bookingGrid.appendChild(card);
      });
    }
  
    // Helper to compute display status
    function getCustomDisplayStatus(invoiceStatus, dropoffDate) {
      const now = new Date();
  
      // 1) If invoiceStatus is "cancelled"
      if (invoiceStatus === "cancelled") {
        return "Cancelled";
      }
  
      // 2) If invoiceStatus is "complete"
      if (invoiceStatus === "complete") {
        // If current time < dropoffDate => "Active"
        if (now < dropoffDate) {
          return "Active";
        } else {
          return "Completed";
        }
      }
  
      // 3) If invoiceStatus is "incomplete"
      if (invoiceStatus === "incomplete") {
        // If current time < dropoffDate => "Active"
        if (now < dropoffDate) {
          return "Active";
        } else {
          return "Incomplete";
        }
      }
  
      // Fallback if any other unknown status
      return "Active";
    }
  
    // Helper to get the CSS class for the status
    function getStatusClass(statusString) {
      switch (statusString.toLowerCase()) {
        case "completed":
          return "status-completed";
        case "cancelled":
          return "status-cancelled";
        case "incomplete":
          return "status-incomplete";
        case "active":
          return "status-active";
        default:
          return "status-active"; // fallback
      }
    }
  });
  