// -------------------- PART A: FILTER ALL CARS -------------------- //
let allCars = []; // We'll store ALL cars from the DB here

// 1. Fetch all cars from the database once.
function fetchAllCars() {
  fetch('http://localhost:5000/api/cars')
    .then(response => response.json())
    .then(data => {
      allCars = data;
    })
    .catch(error => {
      console.error("Error fetching all cars:", error);
    });
}

// 2. Initialize event listener for the filter form.
function initFilterForm() {
  const filterForm = document.getElementById("filterForm");
  filterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    applyFilters();
  });
}

// 3. Apply filter criteria to allCars.
function applyFilters() {
  const engineSizeRange = document.getElementById("engineSizeRange").value;
  const minDoors = parseInt(document.getElementById("minDoors").value) || null;
  const maxDoors = parseInt(document.getElementById("maxDoors").value) || null;
  const minPassengers = parseInt(document.getElementById("minPassengers").value) || null;
  const maxPassengers = parseInt(document.getElementById("maxPassengers").value) || null;
  const gearboxSelect = document.getElementById("gearboxSelect").value;
  const acSelect = document.getElementById("acSelect").value;
  const windowsSelect = document.getElementById("windowsSelect").value;

  let filtered = allCars.filter(car => {
    if (engineSizeRange) {
      const engineSize = car.engineSize || 0;
      if (engineSizeRange === "0-1000" && (engineSize < 0 || engineSize > 1000)) return false;
      else if (engineSizeRange === "1001-2000" && (engineSize < 1001 || engineSize > 2000)) return false;
      else if (engineSizeRange === "2001-3000" && (engineSize < 2001 || engineSize > 3000)) return false;
      else if (engineSizeRange === "3001+" && engineSize < 3001) return false;
    }
    if (minDoors !== null && car.doors < minDoors) return false;
    if (maxDoors !== null && car.doors > maxDoors) return false;
    if (minPassengers !== null && car.passengers < minPassengers) return false;
    if (maxPassengers !== null && car.passengers > maxPassengers) return false;
    if (gearboxSelect && car.gearbox !== gearboxSelect) return false;
    if (acSelect === "yes" && !car.hasAC) return false;
    if (acSelect === "no" && car.hasAC) return false;
    if (windowsSelect === "yes" && !car.electricWindows) return false;
    if (windowsSelect === "no" && car.electricWindows) return false;
    return true;
  });

  displayFilteredCars(filtered);
}

// 4. Display the filtered cars in the designated container.
function displayFilteredCars(cars) {
  const container = document.getElementById("filteredCarsContainer");
  container.innerHTML = "";
  if (cars.length === 0) {
    container.textContent = "No cars match your filters.";
    return;
  }

  cars.forEach(car => {
    const carCard = document.createElement("div");
    carCard.classList.add("car-card");

    const imageElement = document.createElement("img");
    imageElement.src = car.image || "placeholder-image.jpg";
    imageElement.alt = `${car.brand} ${car.model}`;
    carCard.appendChild(imageElement);

    const infoDiv = document.createElement("div");
    infoDiv.classList.add("car-info");

    const title = document.createElement("h3");
    title.textContent = `${car.brand} ${car.model}`;
    infoDiv.appendChild(title);

    const price = document.createElement("p");
    price.textContent = `$${car.dailyPrice} per day`;
    infoDiv.appendChild(price);

    carCard.appendChild(infoDiv);

    const reserveBtn = document.createElement("button");
    reserveBtn.classList.add("btn", "reserve-btn");
    reserveBtn.textContent = "Reserve Car";
    reserveBtn.setAttribute("data-count", "0");

    const inlineError = document.createElement("span");
    inlineError.classList.add("error-msg");
    inlineError.style.color = "red";
    inlineError.style.marginLeft = "10px";
    inlineError.style.display = "none";

    reserveBtn.addEventListener("click", function(event) {
      event.stopPropagation();
      inlineError.style.display = "none";
      inlineError.textContent = "";
      const token = localStorage.getItem("token");
      const currentReservationId = localStorage.getItem("reservationId"); // Retrieve the current reservation id.
      const payload = { 
        reservationId: currentReservationId, 
        carId: car._id 
      };
      console.log("Adding car with payload:", payload);
      fetch("http://localhost:5000/api/reservations/selectCar", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify(payload)
      })
        .then(response => {
          console.log("Response status (add car):", response.status);
          if (!response.ok) {
            return response.json().then(errData => {
              console.error("Error response from server:", errData);
              throw new Error("Failed to add car");
            });
          }
          return response.json();
        })
        .then(data => {
          let count = parseInt(reserveBtn.getAttribute("data-count")) || 0;
          count++;
          reserveBtn.setAttribute("data-count", count);
          reserveBtn.textContent = `Reserve Car (+${count})`;
          console.log("Car added. Updated reservation:", data);
        })
        .catch(error => {
          console.error("Error adding car:", error);
          inlineError.textContent = "Error adding car.";
          inlineError.style.display = "inline";
        });
    });

    carCard.appendChild(reserveBtn);
    carCard.appendChild(inlineError);
    container.appendChild(carCard);
  });
}

// -------------------- PART B: GROUP-BASED LOGIC -------------------- //

// Fetch distinct car groups and build the select UI.
function loadCarGroups() {
  fetch('http://localhost:5000/api/cars/groups')
    .then(response => response.json())
    .then(groups => {
      const container = document.getElementById("carGroupsContainer");
      container.innerHTML = "";
      const selectEl = document.createElement("select");
      selectEl.id = "carGroupSelect";
      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = "Select a car group";
      selectEl.appendChild(defaultOption);
      groups.forEach(groupName => {
        const option = document.createElement("option");
        option.value = groupName;
        option.textContent = groupName;
        selectEl.appendChild(option);
      });
      container.appendChild(selectEl);
      const specsContainer = document.getElementById("groupSpecsContainer");
      specsContainer.innerHTML = "";
      selectEl.addEventListener("change", function() {
        const selectedGroup = this.value;
        document.getElementById("carGalleryContainer").innerHTML = "";
        if (selectedGroup !== "") {
          showGroupSpecs(selectedGroup);
          loadCarsByGroup(selectedGroup);
        } else {
          specsContainer.innerHTML = "";
        }
      });
    })
    .catch(error => {
      console.error("Error loading car groups:", error);
    });
}

// Display group specs from hard-coded data.
function showGroupSpecs(groupName) {
  const specsContainer = document.getElementById("groupSpecsContainer");
  specsContainer.innerHTML = "";
  const groupSpecsData = {
    "SUV": {
      "Engine Size (cc)": "2000 cc",
      "Number of Doors": 4,
      "Number of Passengers": 5,
      "Fuel Type": "Gasoline",
      "Gearbox": "Automatic",
      "AC": "Yes",
      "Electric Windows": "Yes"
    },
    "Electric": {
      "Engine Type": "Electric Motor",
      "Horsepower": "300 HP",
      "Number of Doors": 4,
      "Number of Passengers": 5,
      "Fuel Type": "Electric",
      "Gearbox": "Automatic",
      "AC": "Yes",
      "Electric Windows": "Yes"
    },
    "Hybrid": {
      "Engine Size (cc)": "1800 cc + Electric",
      "Horsepower": "220 HP",
      "Number of Doors": 4,
      "Number of Passengers": 5,
      "Fuel Type": "Hybrid",
      "Gearbox": "Automatic",
      "AC": "Yes",
      "Electric Windows": "Yes"
    },
    "Convertible": {
      "Engine Size (cc)": "2500 cc",
      "Number of Doors": 2,
      "Number of Passengers": 2,
      "Fuel Type": "Gasoline",
      "Gearbox": "Automatic",
      "AC": "Yes",
      "Electric Windows": "Yes"
    },
    "Truck": {
      "Engine Size (cc)": "3500 cc",
      "Number of Doors": 2,
      "Number of Passengers": 3,
      "Fuel Type": "Gasoline",
      "Gearbox": "Automatic",
      "AC": "Yes",
      "Electric Windows": "No"
    },
    "Sedan": {
      "Engine Size (cc)": "2000 cc",
      "Number of Doors": 4,
      "Number of Passengers": 5,
      "Fuel Type": "Gasoline",
      "Gearbox": "Automatic",
      "AC": "Yes",
      "Electric Windows": "Yes"
    }
  };
  const specs = groupSpecsData[groupName];
  if (!specs) {
    specsContainer.textContent = "No specs available for this group.";
    return;
  }
  const specsTitle = document.createElement("h3");
  specsTitle.textContent = `${groupName} Common Specs`;
  specsContainer.appendChild(specsTitle);
  const ul = document.createElement("ul");
  for (let key in specs) {
    const li = document.createElement("li");
    li.textContent = `${key}: ${specs[key]}`;
    ul.appendChild(li);
  }
  specsContainer.appendChild(ul);
}

// Fetch and display cars from a specific group.
function loadCarsByGroup(groupName) {
  fetch(`http://localhost:5000/api/cars/group/${encodeURIComponent(groupName)}`)
    .then(response => response.json())
    .then(cars => {
      const galleryContainer = document.getElementById("carGalleryContainer");
      galleryContainer.innerHTML = "";
      if (cars.length === 0) {
        galleryContainer.textContent = "No available cars in this group.";
        return;
      }
      cars.forEach(car => {
        const carCard = document.createElement("div");
        carCard.classList.add("car-card");

        const imageElement = document.createElement("img");
        imageElement.src = car.image || "placeholder-image.jpg";
        imageElement.alt = `${car.brand} ${car.model}`;
        carCard.appendChild(imageElement);

        const infoDiv = document.createElement("div");
        infoDiv.classList.add("car-info");

        const title = document.createElement("h3");
        title.textContent = `${car.brand} ${car.model}`;
        infoDiv.appendChild(title);

        const price = document.createElement("p");
        price.textContent = `$${car.dailyPrice} per day`;
        infoDiv.appendChild(price);

        carCard.appendChild(infoDiv);

        const reserveBtn = document.createElement("button");
        reserveBtn.classList.add("btn", "reserve-btn");
        reserveBtn.textContent = "Reserve Car";
        reserveBtn.setAttribute("data-count", "0");

        const inlineError = document.createElement("span");
        inlineError.classList.add("error-msg");
        inlineError.style.color = "red";
        inlineError.style.marginLeft = "10px";
        inlineError.style.display = "none";

        reserveBtn.addEventListener("click", function(event) {
          event.stopPropagation();
          inlineError.style.display = "none";
          inlineError.textContent = "";
          const token = localStorage.getItem("token");
          const currentReservationId = localStorage.getItem("reservationId");
          const payload = { 
            reservationId: currentReservationId,
            carId: car._id
          };
          console.log("Adding car with payload:", payload);
          fetch("http://localhost:5000/api/reservations/selectCar", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + token
            },
            body: JSON.stringify(payload)
          })
          .then(response => {
            console.log("Response status (add car):", response.status);
            if (!response.ok) {
              return response.json().then(errData => {
                console.error("Error response from server:", errData);
                throw new Error("Failed to add car");
              });
            }
            return response.json();
          })
          .then(data => {
            let count = parseInt(reserveBtn.getAttribute("data-count")) || 0;
            count++;
            reserveBtn.setAttribute("data-count", count);
            reserveBtn.textContent = `Reserve Car (+${count})`;
            console.log("Reservation after adding car:", data);
          })
          .catch(error => {
            console.error("Error adding car:", error);
            inlineError.textContent = "Error adding car.";
            inlineError.style.display = "inline";
          });
        });

        carCard.appendChild(reserveBtn);
        carCard.appendChild(inlineError);
        galleryContainer.appendChild(carCard);
      });
    })
    .catch(error => {
      console.error("Error fetching cars by group:", error);
    });
}

// On DOMContentLoaded, initialize filtering and group functionality, and handle Next button.
window.addEventListener("DOMContentLoaded", () => {
  fetchAllCars();
  initFilterForm();
  loadCarGroups();

  const nextBtn = document.getElementById("nextBtn");
  const nextError = document.getElementById("nextError");
  nextBtn.addEventListener("click", function() {
    const currentReservationId = localStorage.getItem("reservationId");
    fetch("http://localhost:5000/api/reservations/me", {
      headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
    })
      .then(res => res.json())
      .then(data => {
        // Look up the reservation with the stored reservationId.
        const reservation = data.find(r => r._id.toString() === currentReservationId);
        if (!reservation || reservation.cars.length === 0) {
          nextError.textContent = "Please reserve a car before proceeding.";
        } else {
          nextError.textContent = "";
          window.location.href = "order.html";
        }
      })
      .catch(err => console.error("Error checking reservation:", err));
  });
});

