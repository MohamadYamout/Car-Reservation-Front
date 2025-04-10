let currentOrder = JSON.parse(localStorage.getItem("currentOrder")) || [];
let originalTotal = currentOrder.reduce((sum, car) => sum + car.subtotal, 0);
let discount = 0;
let finalTotal = originalTotal;

function displayOrder() {
  const orderDetailsDiv = document.getElementById("orderDetails");
  orderDetailsDiv.innerHTML = "";
  currentOrder.forEach((car, idx) => {
    orderDetailsDiv.innerHTML += `<strong>Car ${idx + 1}:</strong> ${car.group} - Rate: $${car.rate} <br>
      Services: ${car.services.length ? car.services.join(", ") : "None"}<br>
      Subtotal: $${car.subtotal}<br><hr>`;
  });
  document.getElementById("orderTotal").textContent = finalTotal.toFixed(2);
}

displayOrder();

// Coupon application
document.getElementById("applyCoupon").addEventListener("click", function() {
  const code = document.getElementById("couponCode").value.trim();
  if (code === "DISCOUNT10") {
    discount = 0.1 * originalTotal;
    finalTotal = originalTotal - discount;
    document.getElementById("couponMsg").textContent = "Coupon applied! 10% discount.";
  } else {
    discount = 0;
    finalTotal = originalTotal;
    document.getElementById("couponMsg").textContent = "Invalid coupon code.";
  }
  displayOrder();
});

// Save Transaction (only one allowed at a time)
document.getElementById("saveTransaction").addEventListener("click", function() {
  if (localStorage.getItem("savedTransaction")) {
    alert("You already have a saved transaction. Please complete or cancel it before saving a new one.");
  } else {
    const transaction = {
      order: currentOrder,
      total: finalTotal,
      personalInfo: {
        name: document.getElementById("custName").value,
        email: document.getElementById("custEmail").value,
        phone: document.getElementById("custPhone").value
      },
      paymentMethod: document.querySelector('input[name="payment"]:checked')?.value || "Not selected",
      savedAt: new Date().toLocaleString()
    };
    localStorage.setItem("savedTransaction", JSON.stringify(transaction));
    alert("Transaction saved. You can come back later to complete it.");
  }
});

// Complete Transaction
document.getElementById("completeTransaction").addEventListener("click", function() {
  const personalInfo = {
    name: document.getElementById("custName").value,
    email: document.getElementById("custEmail").value,
    phone: document.getElementById("custPhone").value
  };
  const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
  if (!personalInfo.name || !personalInfo.email || !personalInfo.phone || !paymentMethod) {
    alert("Please fill in all personal and payment details.");
    return;
  }
  const transaction = {
    order: currentOrder,
    total: finalTotal,
    discount: discount,
    personalInfo,
    paymentMethod,
    completedAt: new Date().toLocaleString()
  };

  let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  bookings.push(transaction);
  localStorage.setItem("bookings", JSON.stringify(bookings));

  // Invoice generation
  let invoices = JSON.parse(localStorage.getItem("invoices")) || [];
  const invoice = {
    invoiceId: 'INV' + Date.now(),
    transaction,
    generatedAt: new Date().toLocaleString()
  };
  invoices.push(invoice);
  localStorage.setItem("invoices", JSON.stringify(invoices));

  // Award points (1 point per $10 spent)
  let points = parseInt(localStorage.getItem("userPoints")) || 0;
  points += Math.floor(finalTotal / 10);
  localStorage.setItem("userPoints", points);
  alert("Transaction completed! Your invoice has been generated. Points awarded: " + Math.floor(finalTotal / 10));

  localStorage.removeItem("currentOrder");
  localStorage.removeItem("savedTransaction");
  window.location.href = "index.html";
});

// Cancel Transaction
document.getElementById("cancelTransaction").addEventListener("click", function() {
  if (confirm("Are you sure you want to cancel this transaction?")) {
    localStorage.removeItem("currentOrder");
    localStorage.removeItem("savedTransaction");
    alert("Transaction cancelled.");
    window.location.href = "index.html";
  }
});

// Request Quotation
document.getElementById("requestQuotation").addEventListener("click", function() {
  alert("Your quotation request has been sent. We will get back to you soon.");
  localStorage.removeItem("currentOrder");
  window.location.href = "index.html";
});
