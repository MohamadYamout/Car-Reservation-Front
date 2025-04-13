document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const orderDetailsDiv = document.getElementById("orderDetails");
  const orderTotalSpan = document.getElementById("orderTotal");

  // Personal Info fields
  const custNameInput = document.getElementById("custName");
  const custEmailInput = document.getElementById("custEmail");
  const custPhoneInput = document.getElementById("custPhone");
  
  const couponMsg = document.getElementById("couponMsg");
  const saveTransactionBtn = document.getElementById("saveTransaction");
  const completeTransactionBtn = document.getElementById("completeTransaction");
  const cancelTransactionBtn = document.getElementById("cancelTransaction");
  const requestQuotationBtn = document.getElementById("requestQuotation");

  let draftReservation = null;

  function fetchProfile() {
    fetch("http://localhost:5000/api/auth/profile", {
      headers: { "Authorization": "Bearer " + token }
    })
      .then(res => res.json())
      .then(data => {
        custNameInput.value = data.username || "";
        custEmailInput.value = data.email || "";
        custPhoneInput.value = data.phone || "";
      })
      .catch(err => console.error("Error fetching profile:", err));
  }
  
  function fetchReservation() {
    const reservationId = localStorage.getItem("reservationId");
    if (!reservationId) {
      orderDetailsDiv.innerHTML = "<p>No reservation found.</p>";
      orderTotalSpan.textContent = "0.00";
      return;
    }
    fetch("http://localhost:5000/api/reservations/me", {
      headers: { "Authorization": "Bearer " + token }
    })
      .then(res => res.json())
      .then(data => {
        draftReservation = data.find(r => r._id.toString() === reservationId) || null;
        if (!draftReservation) {
          orderDetailsDiv.innerHTML = "<p>No reservation found.</p>";
          orderTotalSpan.textContent = "0.00";
          return;
        }
        displayOrder(draftReservation);
      })
      .catch(err => {
        console.error("Error fetching reservation:", err);
        orderDetailsDiv.innerHTML = "<p>Error fetching reservation details.</p>";
      });
  }
  
  function displayOrder(reservation) {
    orderDetailsDiv.innerHTML = "";
    const pickup = new Date(reservation.pickupDateTime);
    const drop = new Date(reservation.dropoffDateTime);
    const diffTime = drop - pickup;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  
    let totalDailyPrice = 0;
    let overallExtras = 0;
  
    reservation.cars.forEach((item, idx) => {
      if (!item.carId) return;
      const car = item.carId;
      totalDailyPrice += parseFloat(car.dailyPrice) || 0;
  
      let extrasCost = 0;
      (item.extras || []).forEach(ex => {
        if (ex === "Chauffeur") extrasCost += 50;
        if (ex === "Baby Seat") extrasCost += 20;
        if (ex === "Satellite Navigator") extrasCost += 15;
      });
      if (item.insurance === "Full Insurance") extrasCost += 30;
      else if (item.insurance === "Tires and Windscreen") extrasCost += 20;
      else if (item.insurance === "Additional Driver Insurance") extrasCost += 25;
      if (item.fuel === "Fuel Prepaid") extrasCost += 40;
      else if (item.fuel === "Fuel Pay on Return") extrasCost += 30;
      if (item.gps) extrasCost += 10;
      overallExtras += extrasCost;
  
      orderDetailsDiv.innerHTML += `
        <strong>Car ${idx + 1}:</strong> ${car.brand} ${car.model} - Rate: $${parseFloat(car.dailyPrice).toFixed(2)} / day<br>
        Extras: ${item.extras && item.extras.length ? item.extras.join(", ") : "None"}<br>
        Insurance: ${item.insurance || "None"}<br>
        Fuel: ${item.fuel || "None"}<br>
        GPS: ${item.gps ? "Yes" : "No"}<br><hr>
      `;
    });
  
    const dailyCost = totalDailyPrice * diffDays;
    const overallTotal = dailyCost + overallExtras;
    orderTotalSpan.textContent = overallTotal.toFixed(2);
  
    reservation.calculatedDailyCost = dailyCost;
    reservation.calculatedExtras = overallExtras;
  }
  
  document.getElementById("applyCoupon").addEventListener("click", function() {
    const code = document.getElementById("couponCode").value.trim();
    if (code === "DISCOUNT10") {
      const currentTotal = parseFloat(orderTotalSpan.textContent) || 0;
      const discount = currentTotal * 0.1;
      const newTotal = currentTotal - discount;
      orderTotalSpan.textContent = newTotal.toFixed(2);
      couponMsg.textContent = "Coupon applied! 10% discount.";
    } else {
      couponMsg.textContent = "Invalid coupon code.";
    }
  });
  
  // --- Save Transaction Button (incomplete draft) ---
  document.getElementById("saveTransaction").addEventListener("click", () => {
    const custName = custNameInput.value.trim();
    const custEmail = custEmailInput.value.trim();
    const custPhone = custPhoneInput.value.trim();
    if (!custName || !custEmail || !custPhone) {
      alert("Please fill in your personal information before saving.");
      return;
    }
  
    const lineItemsPayload = draftReservation.cars.map(item => ({
      lineItemId: item._id,
      extras: item.extras || [],
      insurance: item.insurance || "",
      fuel: item.fuel || "",
      gps: !!item.gps
    }));
  
    fetch("http://localhost:5000/api/reservations/updateLineItems", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ reservationId: draftReservation._id, lineItems: lineItemsPayload })
    })
      .then(res => {
        if (!res.ok) return res.json().then(errData => Promise.reject(errData));
        return res.json();
      })
      .then(updatedReservation => {
        // Send the final amount from the total displayed on the page.
        const invoicePayload = {
          reservationId: updatedReservation._id,
          dailyRate: updatedReservation.calculatedDailyCost || 0,
          extraCost: updatedReservation.calculatedExtras || 0,
          amount: parseFloat(orderTotalSpan.textContent) || 0,
          status: "incomplete"
        };
        return fetch("http://localhost:5000/api/invoices", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          },
          body: JSON.stringify(invoicePayload)
        });
      })
      .then(res => {
        if (!res.ok) return res.json().then(errData => Promise.reject(errData));
        return res.json();
      })
      .then(invoiceData => {
        alert("Invoice generated and saved as incomplete (draft).");
        window.location.href = "index.html";
      })
      .catch(err => {
        console.error("Error saving transaction:", err);
        alert("Error saving transaction. Please try again.");
      });
  });

  // --- Cancel Transaction Button (save as cancelled) ---
  document.getElementById("cancelTransaction").addEventListener("click", () => {
    if (confirm("Are you sure you want to cancel this transaction?")) {
      const lineItemsPayload = draftReservation.cars.map(item => ({
        lineItemId: item._id,
        extras: item.extras || [],
        insurance: item.insurance || "",
        fuel: item.fuel || "",
        gps: !!item.gps
      }));
      
      fetch("http://localhost:5000/api/reservations/updateLineItems", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ reservationId: draftReservation._id, lineItems: lineItemsPayload })
      })
        .then(res => {
          if (!res.ok) return res.json().then(errData => Promise.reject(errData));
          return res.json();
        })
        .then(updatedReservation => {
          // Create an invoice payload with the status "cancelled"
          const invoicePayload = {
            reservationId: updatedReservation._id,
            dailyRate: updatedReservation.calculatedDailyCost || 0,
            extraCost: updatedReservation.calculatedExtras || 0,
            amount: parseFloat(orderTotalSpan.textContent) || 0,
            status: "cancelled"
          };
          return fetch("http://localhost:5000/api/invoices", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + token
            },
            body: JSON.stringify(invoicePayload)
          });
        })
        .then(res => {
          if (!res.ok) return res.json().then(errData => Promise.reject(errData));
          return res.json();
        })
        .then(invoiceData => {
          alert("Invoice generated and marked as cancelled.");
          window.location.href = "index.html";
        })
        .catch(err => {
          console.error("Error cancelling transaction:", err);
          alert("Error cancelling transaction. Please try again.");
        });
    }
  });

  // --- Complete Transaction Button (finalize booking with complete invoice) ---
  document.getElementById("completeTransaction").addEventListener("click", () => {
    const custName = custNameInput.value.trim();
    const custEmail = custEmailInput.value.trim();
    const custPhone = custPhoneInput.value.trim();
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
    if (!custName || !custEmail || !custPhone || !paymentMethod) {
      alert("Please fill in all personal and payment details.");
      return;
    }
  
    if (!confirm("Are you sure you want to finalize your booking?")) return;
  
    const lineItemsPayload = draftReservation.cars.map(item => ({
      lineItemId: item._id,
      extras: item.extras || [],
      insurance: item.insurance || "",
      fuel: item.fuel || "",
      gps: !!item.gps
    }));
  
    fetch("http://localhost:5000/api/reservations/updateLineItems", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ reservationId: draftReservation._id, lineItems: lineItemsPayload })
    })
      .then(res => {
        if (!res.ok) return res.json().then(errData => Promise.reject(errData));
        return res.json();
      })
      .then(updatedReservation => {
        // Send the final amount from the total displayed on the page.
        const invoicePayload = {
          reservationId: updatedReservation._id,
          dailyRate: updatedReservation.calculatedDailyCost || 0,
          extraCost: updatedReservation.calculatedExtras || 0,
          amount: parseFloat(orderTotalSpan.textContent) || 0,
          status: "complete"
        };
        return fetch("http://localhost:5000/api/invoices", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          },
          body: JSON.stringify(invoicePayload)
        });
      })
      .then(res => {
        if (!res.ok) return res.json().then(errData => Promise.reject(errData));
        return res.json();
      })
      .then(invoiceData => {
        alert("Invoice generated and reservation finalized successfully!");
        window.location.href = "index.html";
      })
      .catch(err => {
        console.error("Error finalizing booking:", err);
        alert("Error finalizing booking. Please try again.");
      });
  });
  
  document.getElementById("requestQuotation").addEventListener("click", () => {
    alert("Your quotation request has been sent. We will get back to you soon.");
    window.location.href = "index.html";
  });
  
  fetchProfile();
  fetchReservation();
});
