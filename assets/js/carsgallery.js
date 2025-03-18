// Expanded car groups with 4 vehicles per group and complete specs
  
  window.addEventListener("DOMContentLoaded", () => {
    const selectGroupEl = document.getElementById("selectGroup");
    const galleryContainer = document.getElementById("carGalleryContainer");
  
    // Populate the select dropdown with the group names
    carGroupsData.forEach((group, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = group.groupName;
      selectGroupEl.appendChild(option);
    });
  
    // Listen for group selection changes
    selectGroupEl.addEventListener("change", () => {
      displayCarsForGroup(selectGroupEl.value);
    });
  
    // Display cars for the first group by default
    displayCarsForGroup(0);
  
    function displayCarsForGroup(groupIndex) {
      galleryContainer.innerHTML = ""; // Clear previous results
      const selectedGroup = carGroupsData[groupIndex];
      const { cars } = selectedGroup;
  
      cars.forEach(car => {
        // Create a car card
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
  
        galleryContainer.appendChild(carCard);
      });
    }
  });
  
  
  