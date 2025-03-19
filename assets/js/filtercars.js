// For filtering purposes, we merge all cars from every group.
const allCarsData = typeof carGroupsData !== "undefined"
  ? carGroupsData.flatMap(group => group.cars)
  : [];

window.addEventListener("DOMContentLoaded", () => {
  // Get filter elements
  const engineTypeEl = document.getElementById("engineType");
  const horsepowerEl = document.getElementById("horsepower");
  const torqueEl = document.getElementById("torque");
  const doorsEl = document.getElementById("doors");
  const passengersEl = document.getElementById("passengers");
  const fuelTypeEl = document.getElementById("fuelType");
  const gearboxEl = document.getElementById("gearbox");
  const driveTypeEl = document.getElementById("driveType");
  const rangePerChargeEl = document.getElementById("rangePerCharge");
  const chargingTimeEl = document.getElementById("chargingTime");
  const acEl = document.getElementById("ac");
  const electricWindowsEl = document.getElementById("electricWindows");
  const safetyFeaturesEl = document.getElementById("safetyFeatures");
  const entertainmentSystemEl = document.getElementById("entertainmentSystem");
  const interiorMaterialEl = document.getElementById("interiorMaterial");
  const filterBtn = document.getElementById("filterBtn");
  const filteredCarsContainer = document.getElementById("filteredCarsContainer");

  // Helper function to extract numeric value from a string.
  function extractNumber(str) {
    const match = str.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  }

  // Display all cars initially
  displayFilteredCars(allCarsData);

  filterBtn.addEventListener("click", () => {
    // Get filter values (trim and, where applicable, convert to lowercase)
    const engineTypeVal = engineTypeEl.value.trim().toLowerCase();
    const horsepowerVal = horsepowerEl.value.trim();
    const torqueVal = torqueEl.value.trim();
    const doorsVal = doorsEl.value;
    const passengersVal = passengersEl.value;
    const fuelTypeVal = fuelTypeEl.value.trim();
    const gearboxVal = gearboxEl.value.trim();
    const driveTypeVal = driveTypeEl.value.trim().toLowerCase();
    const rangePerChargeVal = rangePerChargeEl.value.trim().toLowerCase();
    const chargingTimeVal = chargingTimeEl.value.trim().toLowerCase();
    const acVal = acEl.value; // "Yes", "No", or ""
    const electricWindowsVal = electricWindowsEl.value; // "Yes", "No", or ""
    const safetyFeaturesVal = safetyFeaturesEl.value.trim().toLowerCase();
    const entertainmentSystemVal = entertainmentSystemEl.value.trim().toLowerCase();
    const interiorMaterialVal = interiorMaterialEl.value.trim().toLowerCase();

    const filtered = allCarsData.filter(car => {
      // Engine Type filter (substring check)
      if (engineTypeVal && (!car.engineType || car.engineType.toLowerCase().indexOf(engineTypeVal) === -1)) {
        return false;
      }

      // Horsepower filter with numeric comparison
      if (horsepowerVal) {
        const carHP = extractNumber(car.horsepower);
        if (horsepowerVal.includes("-")) {
          // e.g., "200-250"
          const [minStr, maxStr] = horsepowerVal.split("-");
          const minHP = parseInt(minStr, 10);
          const maxHP = parseInt(maxStr, 10);
          if (carHP === null || carHP < minHP || carHP > maxHP) {
            return false;
          }
        } else if (horsepowerVal.includes("+")) {
          // e.g., "300+"
          const minHP = parseInt(horsepowerVal, 10);
          if (carHP === null || carHP < minHP) {
            return false;
          }
        } else {
          // Exact match, e.g., "200"
          const exactHP = parseInt(horsepowerVal, 10);
          if (carHP === null || carHP !== exactHP) {
            return false;
          }
        }
      }

      // Torque filter with numeric comparison
      if (torqueVal) {
        const carTorque = extractNumber(car.torque);
        if (torqueVal.includes("<")) {
          // e.g., "<300"
          const maxTorque = parseInt(torqueVal.replace("<", ""), 10);
          if (carTorque === null || carTorque >= maxTorque) {
            return false;
          }
        } else if (torqueVal.includes("-")) {
          // e.g., "300-350"
          const [minStr, maxStr] = torqueVal.split("-");
          const minTorque = parseInt(minStr, 10);
          const maxTorque = parseInt(maxStr, 10);
          if (carTorque === null || carTorque < minTorque || carTorque > maxTorque) {
            return false;
          }
        } else if (torqueVal.includes("+")) {
          // e.g., "400+"
          const minTorque = parseInt(torqueVal, 10);
          if (carTorque === null || carTorque < minTorque) {
            return false;
          }
        } else {
          // Exact match
          const exactTorque = parseInt(torqueVal, 10);
          if (carTorque === null || carTorque !== exactTorque) {
            return false;
          }
        }
      }

      // Doors filter
      if (doorsVal && parseInt(doorsVal) !== car.numberOfDoors) {
        return false;
      }

      // Passengers filter
      if (passengersVal && parseInt(passengersVal) !== car.passengers) {
        return false;
      }

      // Fuel Type filter (case-insensitive)
      if (fuelTypeVal && (!car.fuelType || car.fuelType.toLowerCase() !== fuelTypeVal.toLowerCase())) {
        return false;
      }

      // Gearbox filter (case-insensitive)
      if (gearboxVal && (!car.gearbox || car.gearbox.toLowerCase() !== gearboxVal.toLowerCase())) {
        return false;
      }

      // Drive Type filter
      if (driveTypeVal && (!car.driveType || car.driveType.toLowerCase().indexOf(driveTypeVal) === -1)) {
        return false;
      }

      // Range Per Charge filter
      if (rangePerChargeVal && (!car.rangePerCharge || car.rangePerCharge.toLowerCase().indexOf(rangePerChargeVal) === -1)) {
        return false;
      }

      // Charging Time filter
      if (chargingTimeVal && (!car.chargingTime || car.chargingTime.toLowerCase().indexOf(chargingTimeVal) === -1)) {
        return false;
      }

      // AC filter
      if (acVal) {
        const carAC = (typeof car.AC === "boolean") ? (car.AC ? "Yes" : "No") : "";
        if (carAC !== acVal) {
          return false;
        }
      }

      // Electric Windows filter
      if (electricWindowsVal) {
        const carEW = (typeof car.electricWindows === "boolean") ? (car.electricWindows ? "Yes" : "No") : "";
        if (carEW !== electricWindowsVal) {
          return false;
        }
      }

      // Safety Features filter
      if (safetyFeaturesVal && (!car.safetyFeatures || car.safetyFeatures.toLowerCase().indexOf(safetyFeaturesVal) === -1)) {
        return false;
      }

      // Entertainment System filter
      if (entertainmentSystemVal && (!car.entertainmentSystem || car.entertainmentSystem.toLowerCase().indexOf(entertainmentSystemVal) === -1)) {
        return false;
      }

      // Interior Material filter
      if (interiorMaterialVal && (!car.interiorMaterial || car.interiorMaterial.toLowerCase().indexOf(interiorMaterialVal) === -1)) {
        return false;
      }

      return true;
    });

    displayFilteredCars(filtered);
  });

  function displayFilteredCars(cars) {
    filteredCarsContainer.innerHTML = "";
    if (cars.length === 0) {
      filteredCarsContainer.textContent = "No cars match your filters.";
      return;
    }
    cars.forEach(car => {
      const carCard = document.createElement("div");
      carCard.classList.add("car-card");
      const carImage = document.createElement("img");
      carImage.src = car.imageUrl;
      carImage.alt = `${car.brand} ${car.model}`;
      carCard.appendChild(carImage);
      const info = document.createElement("p");
      info.innerHTML = `<strong>${car.brand} ${car.model}</strong><br>
                        Daily Fee: $${car.dailyFee}<br>
                        Horsepower: ${car.horsepower}<br>
                        Torque: ${car.torque}<br>
                        Fuel Type: ${car.fuelType}<br>
                        Gearbox: ${car.gearbox}`;
      carCard.appendChild(info);
      filteredCarsContainer.appendChild(carCard);
    });
  }
});