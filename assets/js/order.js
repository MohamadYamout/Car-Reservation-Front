document.addEventListener("DOMContentLoaded", function() {
  // Retrieve the reserved car id from localStorage
  const reservedCarId = localStorage.getItem("reservedCarId");
  let dailyRate = 0; // Will be updated after fetching the car details

  // Function to fetch reserved car details and set daily rate
  function fetchReservedCar() {
    if (reservedCarId) {
      fetch(`http://localhost:5000/api/cars/${reservedCarId}`)
        .then(response => response.json())
        .then(car => {
          dailyRate = parseFloat(car.dailyPrice) || 0;
          document.getElementById("dailyRateDisplay").textContent = dailyRate.toFixed(2);
          updateSummary();
        })
        .catch(error => {
          console.error("Error fetching reserved car:", error);
        });
    } else {
      // Optionally, handle the case when no reserved car ID is found
      console.error("No reserved car ID found in localStorage.");
    }
  }
  
  fetchReservedCar();

  // Prices for extra services
  const prices = {
    chauffeur: 50,
    babySeat: 20,
    satNav: 15,
    insurance: {
      full: 30,
      tires: 20,
      addDriver: 25
    },
    fuel: {
      prepaid: 40,
      return: 30
    },
    gps: 10
  };

  const extraServicesForm = document.getElementById("extraServicesForm");
  const orderSummaryDiv = document.getElementById("orderSummary");
  const totalPriceSpan = document.getElementById("totalPrice");

  // Function to update the Order Summary
  function updateSummary() {
    // Clear existing order summary
    orderSummaryDiv.innerHTML = "";
    let extraCost = 0;
    let summaryItems = [];

    // Extra services (checkboxes)
    const services = extraServicesForm.querySelectorAll('input[name="services"]:checked');
    services.forEach(service => {
      let cost = 0;
      if (service.id === "chauffeur") {
        cost = prices.chauffeur;
        summaryItems.push(`Chauffeur (+$${cost})`);
      } else if (service.id === "babySeat") {
        cost = prices.babySeat;
        summaryItems.push(`Baby Seat (+$${cost})`);
      } else if (service.id === "satNav") {
        cost = prices.satNav;
        summaryItems.push(`Satellite Navigator (+$${cost})`);
      }
      extraCost += cost;
    });

    // Insurance options (radio buttons)
    const insuranceOption = extraServicesForm.querySelector('input[name="insurance"]:checked');
    if (insuranceOption) {
      let cost = 0;
      if (insuranceOption.id === "fullIns") {
        cost = prices.insurance.full;
        summaryItems.push(`Full Insurance (+$${cost})`);
      } else if (insuranceOption.id === "tires") {
        cost = prices.insurance.tires;
        summaryItems.push(`Tires and Windscreen (+$${cost})`);
      } else if (insuranceOption.id === "addDriver") {
        cost = prices.insurance.addDriver;
        summaryItems.push(`Additional Driver Insurance (+$${cost})`);
      }
      extraCost += cost;
    }

    // Fuel options (radio buttons)
    const fuelOption = extraServicesForm.querySelector('input[name="fuel"]:checked');
    if (fuelOption) {
      let cost = 0;
      if (fuelOption.id === "fuelPrepaid") {
        cost = prices.fuel.prepaid;
        summaryItems.push(`Fuel Prepaid (+$${cost})`);
      } else if (fuelOption.id === "fuelReturn") {
        cost = prices.fuel.return;
        summaryItems.push(`Fuel Pay on Return (+$${cost})`);
      }
      extraCost += cost;
    }

    // GPS option (checkbox)
    const gpsOption = extraServicesForm.querySelector('input[name="gps"]:checked');
    if (gpsOption) {
      extraCost += prices.gps;
      summaryItems.push(`GPS (+$${prices.gps})`);
    }

    // Build summary list
    if (summaryItems.length > 0) {
      const ul = document.createElement("ul");
      summaryItems.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        ul.appendChild(li);
      });
      orderSummaryDiv.appendChild(ul);
    } else {
      orderSummaryDiv.textContent = "No extra services selected.";
    }

    // Calculate total: dailyRate plus extraCost
    const total = dailyRate + extraCost;
    totalPriceSpan.textContent = total.toFixed(2);
    
    return { total, extraCost };
  }

  // Listen for changes on the extra services form
  extraServicesForm.addEventListener("change", updateSummary);

  // Listen for form submission to send invoice data to the backend
  extraServicesForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const { total, extraCost } = updateSummary();
    
    // Assume reservationId is stored in localStorage after car reservation
    const reservationId = localStorage.getItem("reservationId") || "";
    
    fetch("http://localhost:5000/api/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token")
      },
      body: JSON.stringify({
        reservationId: reservationId,
        dailyRate: dailyRate,
        extraCost: extraCost
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to create invoice");
        }
        return response.json();
      })
      .then(data => {
        totalPriceSpan.textContent = parseFloat(data.amount).toFixed(2);
        alert("Invoice updated! Total amount: $" + data.amount.toFixed(2));
      })
      .catch(error => {
        console.error("Error creating invoice:", error);
      });
  });
});

  