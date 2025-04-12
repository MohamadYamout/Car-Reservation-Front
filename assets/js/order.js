document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const reservationId = localStorage.getItem("reservationId"); // Must be stored on creation
  const lineItemsContainer = document.getElementById("lineItemsContainer");
  const dailyRateDisplay = document.getElementById("dailyRateDisplay");
  const totalPriceSpan = document.getElementById("totalPrice");
  const confirmBookingBtn = document.getElementById("confirmBookingBtn");
  const proceedToCheckoutBtn = document.getElementById("proceedToCheckout");

  let draftReservation = null;
  let lineItems = [];

  // Prices for extra services.
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

  function fetchReservation() {
    fetch("http://localhost:5000/api/reservations/me", {
      headers: { "Authorization": "Bearer " + token }
    })
      .then(res => res.json())
      .then(data => {
        draftReservation = data.find(r => r._id.toString() === reservationId) || null;
        if (!draftReservation) {
          console.warn("No current reservation found");
          lineItemsContainer.innerHTML = "<p>No cars reserved.</p>";
          updateTotals();
          return;
        }
        lineItems = draftReservation.cars || [];
        lineItems.forEach(item => {
          if (!item.extras) item.extras = [];
        });
        renderLineItems();
        updateTotals();
      })
      .catch(err => console.error("Error fetching reservation:", err));
  }

  function renderLineItems() {
    lineItemsContainer.innerHTML = "";
    if (lineItems.length === 0) {
      lineItemsContainer.innerHTML = "<p>No reserved cars to display.</p>";
      return;
    }
    lineItems.forEach((item, index) => {
      if (!item.carId) return;
      const carObj = item.carId;
      const itemDiv = document.createElement("div");
      itemDiv.style.border = "1px solid #ccc";
      itemDiv.style.padding = "10px";
      itemDiv.style.marginBottom = "10px";

      const heading = document.createElement("h3");
      heading.textContent = `${carObj.brand} ${carObj.model} - $${parseFloat(carObj.dailyPrice).toFixed(2)} / day`;
      itemDiv.appendChild(heading);

      const extrasLabel = document.createElement("div");
      extrasLabel.textContent = "Extra Services:";
      itemDiv.appendChild(extrasLabel);

      const extrasContainer = document.createElement("div");
      extrasContainer.appendChild(createCheckbox("Chauffeur (+$50)", "chauffeur", item.extras.includes("Chauffeur"), index));
      extrasContainer.appendChild(createCheckbox("Baby Seat (+$20)", "babySeat", item.extras.includes("Baby Seat"), index));
      extrasContainer.appendChild(createCheckbox("Satellite Navigator (+$15)", "satNav", item.extras.includes("Satellite Navigator"), index));
      itemDiv.appendChild(extrasContainer);

      const insuranceLabel = document.createElement("div");
      insuranceLabel.textContent = "Insurance (choose one):";
      itemDiv.appendChild(insuranceLabel);

      const insuranceContainer = document.createElement("div");
      insuranceContainer.appendChild(createRadio("Full Insurance (+$30)", "fullIns", item.insurance === "Full Insurance", index));
      insuranceContainer.appendChild(createRadio("Tires and Windscreen (+$20)", "tires", item.insurance === "Tires and Windscreen", index));
      insuranceContainer.appendChild(createRadio("Additional Driver Insurance (+$25)", "addDriver", item.insurance === "Additional Driver Insurance", index));
      itemDiv.appendChild(insuranceContainer);

      const fuelLabel = document.createElement("div");
      fuelLabel.textContent = "Fuel (choose one):";
      itemDiv.appendChild(fuelLabel);

      const fuelContainer = document.createElement("div");
      fuelContainer.appendChild(createFuelRadio("Fuel Prepaid (+$40)", "fuelPrepaid", item.fuel === "Fuel Prepaid", index));
      fuelContainer.appendChild(createFuelRadio("Fuel Pay on Return (+$30)", "fuelReturn", item.fuel === "Fuel Pay on Return", index));
      itemDiv.appendChild(fuelContainer);

      const gpsDiv = document.createElement("div");
      const gpsCheckbox = document.createElement("input");
      gpsCheckbox.type = "checkbox";
      gpsCheckbox.checked = item.gps === true;
      gpsCheckbox.addEventListener("change", () => {
        item.gps = gpsCheckbox.checked;
        updateTotals();
      });
      gpsDiv.appendChild(gpsCheckbox);
      const gpsLabel = document.createElement("span");
      gpsLabel.textContent = " GPS (+$10)";
      gpsDiv.appendChild(gpsLabel);
      itemDiv.appendChild(gpsDiv);

      lineItemsContainer.appendChild(itemDiv);
    });
  }

  // Helper functions.
  function createCheckbox(labelText, extraType, isChecked, lineIndex) {
    const wrapper = document.createElement("label");
    wrapper.style.display = "block";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = isChecked;
    checkbox.addEventListener("change", () => {
      const item = lineItems[lineIndex];
      if (!item.extras) item.extras = [];
      if (checkbox.checked) {
        if (extraType === "chauffeur" && !item.extras.includes("Chauffeur"))
          item.extras.push("Chauffeur");
        if (extraType === "babySeat" && !item.extras.includes("Baby Seat"))
          item.extras.push("Baby Seat");
        if (extraType === "satNav" && !item.extras.includes("Satellite Navigator"))
          item.extras.push("Satellite Navigator");
      } else {
        if (extraType === "chauffeur")
          item.extras = item.extras.filter(e => e !== "Chauffeur");
        if (extraType === "babySeat")
          item.extras = item.extras.filter(e => e !== "Baby Seat");
        if (extraType === "satNav")
          item.extras = item.extras.filter(e => e !== "Satellite Navigator");
      }
      updateTotals();
    });
    const label = document.createElement("span");
    label.textContent = labelText;
    wrapper.appendChild(checkbox);
    wrapper.appendChild(label);
    return wrapper;
  }

  function createRadio(labelText, insuranceType, isSelected, lineIndex) {
    let actualValue = "";
    if (insuranceType === "fullIns") actualValue = "Full Insurance";
    else if (insuranceType === "tires") actualValue = "Tires and Windscreen";
    else if (insuranceType === "addDriver") actualValue = "Additional Driver Insurance";
    
    const wrapper = document.createElement("label");
    wrapper.style.display = "block";
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = `insuranceGroup-${lineIndex}`;
    radio.checked = isSelected;
    radio.addEventListener("change", () => {
      lineItems[lineIndex].insurance = actualValue;
      updateTotals();
    });
    const label = document.createElement("span");
    label.textContent = labelText;
    wrapper.appendChild(radio);
    wrapper.appendChild(label);
    return wrapper;
  }

  function createFuelRadio(labelText, fuelType, isSelected, lineIndex) {
    let actualValue = "";
    if (fuelType === "fuelPrepaid") actualValue = "Fuel Prepaid";
    else if (fuelType === "fuelReturn") actualValue = "Fuel Pay on Return";
    
    const wrapper = document.createElement("label");
    wrapper.style.display = "block";
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = `fuelGroup-${lineIndex}`;
    radio.checked = isSelected;
    radio.addEventListener("change", () => {
      lineItems[lineIndex].fuel = actualValue;
      updateTotals();
    });
    const label = document.createElement("span");
    label.textContent = labelText;
    wrapper.appendChild(radio);
    wrapper.appendChild(label);
    return wrapper;
  }

  // Update totals calculation.
  function updateTotals() {
    if (!draftReservation) return;
    const pickup = new Date(draftReservation.pickupDateTime);
    const drop = new Date(draftReservation.dropoffDateTime);
    const diffTime = drop - pickup;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  
    let totalDaily = 0;
    let overallExtras = 0;
    lineItems.forEach(item => {
      if (!item.carId) return;
      const dailyPrice = parseFloat(item.carId.dailyPrice) || 0;
      totalDaily += dailyPrice;
  
      let itemExtrasCost = 0;
      (item.extras || []).forEach(ex => {
        if (ex === "Chauffeur") itemExtrasCost += prices.chauffeur;
        if (ex === "Baby Seat") itemExtrasCost += prices.babySeat;
        if (ex === "Satellite Navigator") itemExtrasCost += prices.satNav;
      });
      if (item.insurance === "Full Insurance") itemExtrasCost += prices.insurance.full;
      else if (item.insurance === "Tires and Windscreen") itemExtrasCost += prices.insurance.tires;
      else if (item.insurance === "Additional Driver Insurance") itemExtrasCost += prices.insurance.addDriver;
      if (item.fuel === "Fuel Prepaid") itemExtrasCost += prices.fuel.prepaid;
      else if (item.fuel === "Fuel Pay on Return") itemExtrasCost += prices.fuel.return;
      if (item.gps) itemExtrasCost += prices.gps;
      overallExtras += itemExtrasCost;
    });
  
    const dailyCost = totalDaily * diffDays;
    const overallTotal = dailyCost + overallExtras;
    dailyRateDisplay.textContent = dailyCost.toFixed(2);
    totalPriceSpan.textContent = overallTotal.toFixed(2);
  }

  // Confirm Booking flow.
  confirmBookingBtn.addEventListener("click", () => {
    if (!draftReservation) {
      alert("No draft reservation found!");
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
      body: JSON.stringify({ reservationId, lineItems: lineItemsPayload })
    })
      .then(res => {
        if (!res.ok) return res.json().then(errData => Promise.reject(errData));
        return res.json();
      })
      .then(updatedReservation => {
        const invoicePayload = {
          reservationId: updatedReservation._id,
          dailyRate: updatedReservation.calculatedDailyCost || 0,
          extraCost: updatedReservation.calculatedExtras || 0
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
  
  // Proceed to Checkout flow: update extras then redirect.
  function updateExtrasAndProceed() {
    if (!draftReservation) {
      alert("No draft reservation found!");
      return;
    }
    const lineItemsPayload = lineItems.map(item => ({
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
      body: JSON.stringify({ reservationId, lineItems: lineItemsPayload })
    })
      .then(res => {
        if (!res.ok) return res.json().then(errData => Promise.reject(errData));
        return res.json();
      })
      .then(updatedReservation => {
        window.location.href = "checkout.html";
      })
      .catch(err => {
        console.error("Error updating extras:", err);
        alert("Failed to update extra services. Please try again.");
      });
  }
  
  proceedToCheckoutBtn.addEventListener("click", updateExtrasAndProceed);

  fetchReservation();
});