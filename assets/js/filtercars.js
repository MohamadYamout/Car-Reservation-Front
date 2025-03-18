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

  // Display all cars initially
  displayFilteredCars(allCarsData);

  filterBtn.addEventListener("click", () => {
    // Get filter values (trim and toLowerCase for text fields)
    const engineTypeVal = engineTypeEl.value.trim().toLowerCase();
    const horsepowerVal = horsepowerEl.value.trim().toLowerCase();
    const torqueVal = torqueEl.value.trim().toLowerCase();
    const doorsVal = doorsEl.value;
    const passengersVal = passengersEl.value;
    const fuelTypeVal = fuelTypeEl.value;
    const gearboxVal = gearboxEl.value;
    const driveTypeVal = driveTypeEl.value.trim().toLowerCase();
    const rangePerChargeVal = rangePerChargeEl.value.trim().toLowerCase();
    const chargingTimeVal = chargingTimeEl.value.trim().toLowerCase();
    const acVal = acEl.value; // "Yes", "No", or ""
    const electricWindowsVal = electricWindowsEl.value; // "Yes", "No", or ""
    const safetyFeaturesVal = safetyFeaturesEl.value.trim().toLowerCase();
    const entertainmentSystemVal = entertainmentSystemEl.value.trim().toLowerCase();
    const interiorMaterialVal = interiorMaterialEl.value.trim().toLowerCase();

    const filtered = allCarsData.filter(car => {
      // For text comparisons, check if the car property (converted to string and lowercase) includes the filter text.
      if (engineTypeVal && (!car.engineType || car.engineType.toLowerCase().indexOf(engineTypeVal) === -1)) {
        return false;
      }
      if (horsepowerVal && (!car.horsepower || car.horsepower.toLowerCase().indexOf(horsepowerVal) === -1)) {
        return false;
      }
      if (torqueVal && (!car.torque || car.torque.toLowerCase().indexOf(torqueVal) === -1)) {
        return false;
      }
      if (doorsVal && parseInt(doorsVal) !== car.numberOfDoors) {
        return false;
      }
      if (passengersVal && parseInt(passengersVal) !== car.passengers) {
        return false;
      }
      if (fuelTypeVal && car.fuelType !== fuelTypeVal) {
        return false;
      }
      if (gearboxVal && car.gearbox !== gearboxVal) {
        return false;
      }
      if (driveTypeVal && (!car.driveType || car.driveType.toLowerCase().indexOf(driveTypeVal) === -1)) {
        return false;
      }
      if (rangePerChargeVal && (!car.rangePerCharge || car.rangePerCharge.toLowerCase().indexOf(rangePerChargeVal) === -1)) {
        return false;
      }
      if (chargingTimeVal && (!car.chargingTime || car.chargingTime.toLowerCase().indexOf(chargingTimeVal) === -1)) {
        return false;
      }
      if (acVal) {
        const carAC = (typeof car.AC === "boolean") ? (car.AC ? "Yes" : "No") : "";
        if (carAC !== acVal) {
          return false;
        }
      }
      if (electricWindowsVal) {
        const carEW = (typeof car.electricWindows === "boolean") ? (car.electricWindows ? "Yes" : "No") : "";
        if (carEW !== electricWindowsVal) {
          return false;
        }
      }
      if (safetyFeaturesVal && (!car.safetyFeatures || car.safetyFeatures.toLowerCase().indexOf(safetyFeaturesVal) === -1)) {
        return false;
      }
      if (entertainmentSystemVal && (!car.entertainmentSystem || car.entertainmentSystem.toLowerCase().indexOf(entertainmentSystemVal) === -1)) {
        return false;
      }
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
