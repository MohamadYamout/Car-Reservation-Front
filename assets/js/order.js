// Dummy daily rates based on car group
const dailyRates = {
  "SUV": 100,
  "Electric": 120,
  "Hybrid": 90,
  "Convertible": 150,
  "Bus": 200
};

// Extra service prices
const servicePrices = {
  "Chauffeur": 50,
  "Baby Seat": 20,
  "Satellite Navigator": 15,
  "Full Insurance": 30,
  "Tires and Windscreen": 20,
  "Additional Driver Insurance": 25,
  "Fuel Prepaid": 40,
  "Fuel Pay on Return": 30,
  "GPS": 10
};

let order = JSON.parse(localStorage.getItem('currentOrder')) || [];
let totalPrice = 0;

// For reviews pagination
let reviews = JSON.parse(localStorage.getItem('reviews')) || [];
if (reviews.length === 0) {
  // Sample reviews
  reviews = [
    { name: "Alice", rating: 5, comment: "Excellent service!", date: new Date().toLocaleDateString(), profilePic: "N/A" },
    { name: "Bob", rating: 4, comment: "Very good experience.", date: new Date().toLocaleDateString(), profilePic: "N/A" },
    { name: "Charlie", rating: 3, comment: "It was ok.", date: new Date().toLocaleDateString(), profilePic: "N/A" },
    { name: "Diana", rating: 5, comment: "Loved it!", date: new Date().toLocaleDateString(), profilePic: "N/A" }
  ];
  localStorage.setItem('reviews', JSON.stringify(reviews));
}
let reviewIndex = 0;

const orderSummaryDiv = document.getElementById("orderSummary");
const totalPriceSpan = document.getElementById("totalPrice");

function updateOrderSummary() {
  orderSummaryDiv.innerHTML = "";
  totalPrice = 0;
  order.forEach((car, idx) => {
    const carDiv = document.createElement("div");
    carDiv.innerHTML = `<strong>Car ${idx + 1}:</strong> ${car.group} - Daily Rate: $${car.rate} <br>
      Extra Services: ${car.services.length ? car.services.join(", ") : "None"} <br>
      Subtotal: $${car.subtotal} <hr>`;
    orderSummaryDiv.appendChild(carDiv);
    totalPrice += car.subtotal;
  });
  totalPriceSpan.textContent = totalPrice;
  localStorage.setItem('currentOrder', JSON.stringify(order));
}

function displayReviews() {
  const reviewSection = document.getElementById("reviewSection");
  reviewSection.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    const idx = (reviewIndex + i) % reviews.length;
    const rev = reviews[idx];
    const div = document.createElement("div");
    div.innerHTML = `<strong>${rev.name}</strong> (${rev.date})<br>
      Rating: ${rev.rating} / 5<br>
      Comment: ${rev.comment}<br>
      Profile Picture: ${rev.profilePic}<br><hr>`;
    reviewSection.appendChild(div);
  }
}

// Update daily rate when selection changes
document.getElementById("carGroup").addEventListener("change", function() {
  const group = this.value;
  document.getElementById("dailyRateDisplay").textContent = group && dailyRates[group] ? "$" + dailyRates[group] : "-";
});

// Handle add car form submission
document.getElementById("addCarForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const group = document.getElementById("carGroup").value;
  if (!group) {
    alert("Please select a car group.");
    return;
  }
  const rate = dailyRates[group];

  let services = [];
  if (document.getElementById("chauffeur").checked) services.push("Chauffeur");
  if (document.getElementById("babySeat").checked) services.push("Baby Seat");
  if (document.getElementById("navigator").checked) services.push("Satellite Navigator");
  if (document.getElementById("gps").checked) services.push("GPS");

  const insurance = document.querySelector('input[name="insurance"]:checked');
  if (insurance) services.push(insurance.value);

  const fuel = document.querySelector('input[name="fuel"]:checked');
  if (fuel) services.push(fuel.value);

  let extraCost = 0;
  services.forEach(s => {
    extraCost += servicePrices[s] || 0;
  });

  const subtotal = rate + extraCost;
  order.push({ group, rate, services, subtotal });
  updateOrderSummary();
  this.reset();
  document.getElementById("dailyRateDisplay").textContent = "-";
});

// Review navigation buttons
document.getElementById("prevReview").addEventListener("click", function() {
  reviewIndex = (reviewIndex - 3 + reviews.length) % reviews.length;
  displayReviews();
});
document.getElementById("nextReview").addEventListener("click", function() {
  reviewIndex = (reviewIndex + 3) % reviews.length;
  displayReviews();
});

// New review submission
document.getElementById("reviewForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const name = document.getElementById("reviewerName").value;
  const rating = parseInt(document.getElementById("reviewRating").value);
  const comment = document.getElementById("reviewComment").value;
  const newReview = {
    name,
    rating,
    comment,
    date: new Date().toLocaleDateString(),
    profilePic: "N/A"
  };
  reviews.push(newReview);
  localStorage.setItem('reviews', JSON.stringify(reviews));
  alert("Review submitted!");
  this.reset();
  displayReviews();
});

// Update statistics based on finalized bookings (simulated)
function updateStatistics() {
  let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  if (bookings.length === 0) {
    document.getElementById("popularCar").textContent = "N/A";
    document.getElementById("avgDailyFee").textContent = "0";
    return;
  }
  let carCount = {};
  let totalFee = 0, count = 0;
  bookings.forEach(b => {
    b.cars.forEach(car => {
      carCount[car.group] = (carCount[car.group] || 0) + 1;
      totalFee += car.rate;
      count++;
    });
  });
  let popular = Object.keys(carCount).reduce((a, b) => carCount[a] > carCount[b] ? a : b);
  document.getElementById("popularCar").textContent = popular;
  document.getElementById("avgDailyFee").textContent = (totalFee / count).toFixed(2);
}

updateOrderSummary();
displayReviews();
updateStatistics();

  