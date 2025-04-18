// assets/js/checkout.js

document.addEventListener("DOMContentLoaded", () => {
  // Dynamically set the minimum expiry year to the current year.
  const currentYear = new Date().getFullYear();
  const expiryYearInput = document.getElementById("expiryYear");
  if (expiryYearInput) {
    expiryYearInput.setAttribute("min", currentYear);
  }

  const token = localStorage.getItem("token");
  const orderDetailsDiv = document.getElementById("orderDetails");
  const orderTotalSpan = document.getElementById("orderTotal");
  const loyaltyMsg = document.getElementById("loyaltyMsg");
  const couponMsg = document.getElementById("couponMsg");

  const saveBtn = document.getElementById("saveTransaction");
  const completeBtn = document.getElementById("completeTransaction");
  const cancelBtn = document.getElementById("cancelTransaction");
  const quoteBtn = document.getElementById("requestQuotation");
  const applyCouponBtn = document.getElementById("applyCoupon");

  const custNameInput = document.getElementById("custName");
  const custEmailInput = document.getElementById("custEmail");
  const custPhoneInput = document.getElementById("custPhone");
  const paymentForm = document.getElementById("paymentForm");
  const creditCardSection = document.getElementById("creditCardSection");

  let draftReservation = null;
  let storedCard = null;
  let appliedCoupon = null;
  let baseOrderTotal = 0;
  let userPoints = 0;

  // Fetch user profile (including points)
  function fetchProfile() {
    return fetch("http://localhost:5000/api/auth/profile", {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => {
        custNameInput.value = data.username || "";
        custEmailInput.value = data.email || "";
        custPhoneInput.value = data.phone || "";
        userPoints = data.points || 0;
      })
      .catch((err) => console.error("Error fetching profile:", err));
  }

  // Fetch the current draft reservation and display it
  function fetchReservation() {
    const reservationId = localStorage.getItem("reservationId");
    if (!reservationId) {
      orderDetailsDiv.innerHTML = "<p>No reservation found.</p>";
      orderTotalSpan.textContent = "0.00";
      return;
    }
    fetch("http://localhost:5000/api/reservations/me", {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((list) => {
        draftReservation = list.find((r) => r._id === reservationId);
        if (!draftReservation) {
          orderDetailsDiv.innerHTML = "<p>No reservation found.</p>";
          orderTotalSpan.textContent = "0.00";
          return;
        }
        displayOrder(draftReservation);
      })
      .catch((err) => {
        console.error("Error fetching reservation:", err);
        orderDetailsDiv.innerHTML =
          "<p>Error fetching reservation details.</p>";
      });
  }

  // Render the order details, apply loyalty discount, and set baseOrderTotal
  function displayOrder(res) {
    orderDetailsDiv.innerHTML = "";
    const pickup = new Date(res.pickupDateTime);
    const drop = new Date(res.dropoffDateTime);
    const days = Math.ceil((drop - pickup) / (1000 * 60 * 60 * 24)) || 1;

    let dailySum = 0;
    let extrasSum = 0;

    res.cars.forEach((item, idx) => {
      if (!item.carId) return;
      const car = item.carId;
      dailySum += parseFloat(car.dailyPrice) || 0;

      let extraCost = 0;
      (item.extras || []).forEach((ex) => {
        if (ex === "Chauffeur") extraCost += 50;
        if (ex === "Baby Seat") extraCost += 20;
        if (ex === "Satellite Navigator") extraCost += 15;
      });
      if (item.insurance === "Full Insurance") extraCost += 30;
      else if (item.insurance === "Tires and Windscreen") extraCost += 20;
      else if (item.insurance === "Additional Driver Insurance")
        extraCost += 25;
      if (item.fuel === "Fuel Prepaid") extraCost += 40;
      else if (item.fuel === "Fuel Pay on Return") extraCost += 30;
      if (item.gps) extraCost += 10;
      extrasSum += extraCost;

      orderDetailsDiv.innerHTML += `
        <strong>Car ${idx + 1}:</strong> ${car.brand} ${
        car.model
      } – $${parseFloat(car.dailyPrice).toFixed(2)} / day<br>
        Extras: ${item.extras.join(", ") || "None"}<br>
        Insurance: ${item.insurance || "None"}<br>
        Fuel: ${item.fuel || "None"}<br>
        GPS: ${item.gps ? "Yes" : "No"}<hr>
      `;
    });

    const rawTotal = dailySum * days + extrasSum;
    baseOrderTotal = rawTotal;

    // Loyalty tiers: 5% @500, 10% @1000, 15% @1500
    let rate = 0;
    if (userPoints >= 1500) rate = 0.15;
    else if (userPoints >= 1000) rate = 0.1;
    else if (userPoints >= 500) rate = 0.05;

    let finalTotal = rawTotal;
    if (rate > 0) {
      const discount = rawTotal * rate;
      finalTotal = rawTotal - discount;
      loyaltyMsg.textContent = `Loyalty discount applied: ${
        rate * 100
      }% off (–$${discount.toFixed(2)})`;
    } else {
      loyaltyMsg.textContent = "";
    }

    orderTotalSpan.textContent = finalTotal.toFixed(2);
    baseOrderTotal = finalTotal;
  }

  // Coupon application
  applyCouponBtn.addEventListener("click", () => {
    const code = document.getElementById("couponCode").value.trim();
    if (appliedCoupon) {
      couponMsg.textContent = "A coupon has already been applied.";
      return;
    }
    fetch(`http://localhost:5000/api/coupons/${code}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.discountPercentage) {
          appliedCoupon = code;
          const discount = baseOrderTotal * (data.discountPercentage / 100);
          baseOrderTotal -= discount;
          orderTotalSpan.textContent = baseOrderTotal.toFixed(2);
          couponMsg.textContent = `Coupon applied! ${data.discountPercentage}% discount.`;
        } else {
          couponMsg.textContent = data.error || "Invalid coupon.";
        }
      })
      .catch(() => {
        couponMsg.textContent = "Error applying coupon.";
      });
  });

  // Toggle credit card fields
  paymentForm.addEventListener("change", () => {
    const sel = document.querySelector('input[name="payment"]:checked')?.value;
    if (sel === "Credit Card") {
      creditCardSection.style.display = "block";
      if (!storedCard) {
        fetch("http://localhost:5000/api/creditcards/me", {
          headers: { Authorization: "Bearer " + token },
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.creditCard) {
              storedCard = data.creditCard;
              [
                "cardHolderName",
                "cardNumber",
                "expiryMonth",
                "expiryYear",
                "cvv",
              ].forEach(
                (id) =>
                  (document.getElementById(id).value = storedCard[id] || "")
              );
            }
          })
          .catch(console.error);
      }
    } else {
      creditCardSection.style.display = "none";
    }
  });

  // Save Transaction (draft)
  saveBtn.addEventListener("click", () => {
    const name = custNameInput.value.trim();
    const email = custEmailInput.value.trim();
    const phone = custPhoneInput.value.trim();
    if (!name || !email || !phone) {
      alert("Please fill in your personal information before saving.");
      return;
    }
    const lineItemsPayload = draftReservation.cars.map((item) => ({
      lineItemId: item._id,
      extras: item.extras || [],
      insurance: item.insurance || "",
      fuel: item.fuel || "",
      gps: !!item.gps,
    }));

    fetch("http://localhost:5000/api/reservations/updateLineItems", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        reservationId: draftReservation._id,
        lineItems: lineItemsPayload,
      }),
    })
      .then((res) =>
        res.ok ? res.json() : res.json().then((err) => Promise.reject(err))
      )
      .then((updatedReservation) =>
        fetch("http://localhost:5000/api/invoices", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            reservationId: updatedReservation._id,
            dailyRate: updatedReservation.calculatedDailyCost || 0,
            extraCost: updatedReservation.calculatedExtras || 0,
            amount: parseFloat(orderTotalSpan.textContent) || 0,
            status: "incomplete",
          }),
        })
      )
      .then((res) => (res.ok ? res.json() : Promise.reject("Invoice error")))
      .then(() => {
        alert("Invoice generated and saved as incomplete (draft).");
        window.location.href = "../index.html";
      })
      .catch((err) => {
        console.error("Error saving transaction:", err);
        alert("Error saving transaction. Please try again.");
      });
  });

  // Complete Transaction (finalize)
  completeBtn.addEventListener("click", () => {
    const name = custNameInput.value.trim();
    const email = custEmailInput.value.trim();
    const phone = custPhoneInput.value.trim();
    const method = document.querySelector(
      'input[name="payment"]:checked'
    )?.value;
    if (!name || !email || !phone || !method) {
      alert("Please fill in all personal and payment details.");
      return;
    }
    if (!confirm("Are you sure you want to finalize your booking?")) return;

    const lineItemsPayload = draftReservation.cars.map((item) => ({
      lineItemId: item._id,
      extras: item.extras || [],
      insurance: item.insurance || "",
      fuel: item.fuel || "",
      gps: !!item.gps,
    }));

    // 1) Update line items
    fetch("http://localhost:5000/api/reservations/updateLineItems", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        reservationId: draftReservation._id,
        lineItems: lineItemsPayload,
      }),
    })
      .then((res) =>
        res.ok ? res.json() : res.json().then((err) => Promise.reject(err))
      )
      // 2) Save credit card if needed
      .then((updatedReservation) => {
        if (method === "Credit Card" && !storedCard) {
          const ccInfo = {
            cardHolderName: document
              .getElementById("cardHolderName")
              .value.trim(),
            cardNumber: document.getElementById("cardNumber").value.trim(),
            expiryMonth: document.getElementById("expiryMonth").value,
            expiryYear: document.getElementById("expiryYear").value,
            cvv: document.getElementById("cvv").value.trim(),
          };
          if (Object.values(ccInfo).some((v) => !v)) {
            alert("Please fill in all credit card details.");
            return Promise.reject("Missing credit card details.");
          }
          return fetch("http://localhost:5000/api/creditcards", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
            body: JSON.stringify(ccInfo),
          })
            .then((res) =>
              res.ok
                ? res.json()
                : res.json().then((err) => Promise.reject(err))
            )
            .then((cardResp) => {
              storedCard = cardResp.creditCard;
              return updatedReservation;
            });
        }
        return updatedReservation;
      })
      // 3) Finalize reservation
      .then((updatedReservation) =>
        fetch("http://localhost:5000/api/reservations/finalize", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({ reservationId: updatedReservation._id }),
        }).then((res) =>
          res.ok
            ? updatedReservation
            : res.json().then((err) => Promise.reject(err))
        )
      )
      // 4) Create complete invoice
      .then((finalResv) =>
        fetch("http://localhost:5000/api/invoices", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            reservationId: finalResv._id,
            dailyRate: finalResv.calculatedDailyCost || 0,
            extraCost: finalResv.calculatedExtras || 0,
            amount: parseFloat(orderTotalSpan.textContent) || 0,
            status: "complete",
          }),
        })
      )
      .then((res) => (res.ok ? res.json() : Promise.reject("Invoice error")))
      // 5) Mark coupon used if any
      .then(() => {
        if (appliedCoupon) {
          return fetch(
            `http://localhost:5000/api/coupons/use/${appliedCoupon}`,
            {
              method: "PUT",
            }
          );
        }
      })
      .then(() => {
        alert("Invoice generated and reservation finalized successfully!");
        window.location.href = "../index.html";
      })
      .catch((err) => {
        console.error("Error finalizing booking:", err);
        alert("Error finalizing booking.");
      });
  });

  // Cancel Transaction
  cancelBtn.addEventListener("click", () => {
    if (!confirm("Are you sure you want to cancel this transaction?")) return;

    const lineItemsPayload = draftReservation.cars.map((item) => ({
      lineItemId: item._id,
      extras: item.extras || [],
      insurance: item.insurance || "",
      fuel: item.fuel || "",
      gps: !!item.gps,
    }));

    fetch("http://localhost:5000/api/reservations/updateLineItems", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        reservationId: draftReservation._id,
        lineItems: lineItemsPayload,
      }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject("Update error")))
      .then((updatedReservation) =>
        fetch("http://localhost:5000/api/invoices", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            reservationId: updatedReservation._id,
            dailyRate: updatedReservation.calculatedDailyCost || 0,
            extraCost: updatedReservation.calculatedExtras || 0,
            amount: parseFloat(orderTotalSpan.textContent) || 0,
            status: "cancelled",
          }),
        })
      )
      .then((res) => (res.ok ? res.json() : Promise.reject("Invoice error")))
      .then(() => {
        alert("Invoice generated and marked as cancelled.");
        window.location.href = "../index.html";
      })
      .catch((err) => {
        console.error("Error cancelling transaction:", err);
        alert("Error cancelling transaction. Please try again.");
      });
  });

  // Request Quotation
  quoteBtn.addEventListener("click", () => {
    alert(
      "Your quotation request has been sent. We will get back to you soon."
    );
    window.location.href = "../index.html";
  });

  // Kick off initial fetches
  fetchProfile().then(fetchReservation);
});
