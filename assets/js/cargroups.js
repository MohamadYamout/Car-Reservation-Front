// -------------------- PART A: FILTER ALL CARS -------------------- //
let allCars = []; // We'll store ALL cars from the DB here

// 1. Fetch all cars from the database once, on DOMContentLoaded
function fetchAllCars() {
  fetch('http://localhost:5000/api/cars')
    .then(response => response.json())
    .then(data => {
      allCars = data; // Store all cars globally for filtering
    })
    .catch(error => {
      console.error("Error fetching all cars:", error);
    });
}

// 2. Initialize event listener for the filter form
function initFilterForm() {
  const filterForm = document.getElementById("filterForm");
  filterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    applyFilters();
  });
}

// 3. Apply the filter logic to `allCars`
function applyFilters() {
  // Get references to the DOM elements
  const engineSizeRange = document.getElementById("engineSizeRange").value;
  const minDoors = parseInt(document.getElementById("minDoors").value) || null;
  const maxDoors = parseInt(document.getElementById("maxDoors").value) || null;
  const minPassengers = parseInt(document.getElementById("minPassengers").value) || null;
  const maxPassengers = parseInt(document.getElementById("maxPassengers").value) || null;
  const acSelect = document.getElementById("acSelect").value; // "yes", "no", or ""
  const windowsSelect = document.getElementById("windowsSelect").value; // "yes", "no", or ""

  // Filter the cars based on the criteria
  let filtered = allCars.filter(car => {
    // 1) Engine size range filtering
    if (engineSizeRange) {
      const engineSize = car.engineSize || 0;
      if (engineSizeRange === "0-1000") {
        if (engineSize < 0 || engineSize > 1000) return false;
      } else if (engineSizeRange === "1001-2000") {
        if (engineSize < 1001 || engineSize > 2000) return false;
      } else if (engineSizeRange === "2001-3000") {
        if (engineSize < 2001 || engineSize > 3000) return false;
      } else if (engineSizeRange === "3001+") {
        if (engineSize < 3001) return false;
      }
    }

    // 2) Doors range filtering
    if (minDoors !== null && car.doors < minDoors) return false;
    if (maxDoors !== null && car.doors > maxDoors) return false;

    // 3) Passengers range filtering
    if (minPassengers !== null && car.passengers < minPassengers) return false;
    if (maxPassengers !== null && car.passengers > maxPassengers) return false;

    // 4) AC filtering
    if (acSelect === "yes" && !car.hasAC) return false;
    if (acSelect === "no" && car.hasAC) return false;

    // 5) Electric windows filtering
    if (windowsSelect === "yes" && !car.electricWindows) return false;
    if (windowsSelect === "no" && car.electricWindows) return false;

    return true; // Passed all filters
  });

  displayFilteredCars(filtered);
}

// 4. Display the filtered cars in the #filteredCarsContainer
function displayFilteredCars(cars) {
  const container = document.getElementById("filteredCarsContainer");
  container.innerHTML = ""; // Clear previous results

  if (cars.length === 0) {
    container.textContent = "No cars match your filters.";
    return;
  }

  cars.forEach(car => {
    const carCard = document.createElement("div");
    carCard.classList.add("car-card");

    // Car image
    const imageElement = document.createElement("img");
    imageElement.src = car.image || "placeholder-image.jpg";
    imageElement.alt = `${car.brand} ${car.model}`;
    carCard.appendChild(imageElement);

    // Car info container
    const infoDiv = document.createElement("div");
    infoDiv.classList.add("car-info");

    // Car title
    const title = document.createElement("h3");
    title.textContent = `${car.brand} ${car.model}`;
    infoDiv.appendChild(title);

    // Price
    const price = document.createElement("p");
    price.textContent = `$${car.dailyPrice} per day`;
    infoDiv.appendChild(price);

    carCard.appendChild(infoDiv);
    container.appendChild(carCard);
  });
}

// -------------------- PART B: GROUP-BASED LOGIC -------------------- //

// Hard-coded group specs for demonstration (optional)
const groupSpecsData = {
  "SUV": {
    "Engine Size (cc)": "2000 cc",
    "Number of Doors": 4,
    "Number of Passengers": 5,
    "Fuel Type": "Gasoline",
    "Gearbox": "Automatic",
    "AC": "Yes",
    "Electric Windows": "Yes",
  },
  "Electric": {
    "Engine Type": "Electric Motor",
    "Horsepower": "300 HP",
    "Number of Doors": 4,
    "Number of Passengers": 5,
    "Fuel Type": "Electric",
    "Gearbox": "Automatic",
    "AC": "Yes",
    "Electric Windows": "Yes",
  },
  "Hybrid": {
    "Engine Size (cc)": "1800 + Electric",
    "Horsepower": "220 HP",
    "Number of Doors": 4,
    "Number of Passengers": 5,
    "Fuel Type": "Hybrid",
    "Gearbox": "Automatic",
    "AC": "Yes",
    "Electric Windows": "Yes",
  },
  "Convertible": {
    "Engine Size (cc)": "2500 cc",
    "Number of Doors": 2,
    "Number of Passengers": 2,
    "Fuel Type": "Gasoline",
    "Gearbox": "Automatic",
    "AC": "Yes",
    "Electric Windows": "Yes",
  },
  "Truck": {
    "Engine Size (cc)": "3500 cc",
    "Number of Doors": 2,
    "Number of Passengers": 3,
    "Fuel Type": "Gasoline",
    "Gearbox": "Automatic",
    "AC": "Yes",
    "Electric Windows": "No",
  },
  "Sedan": {
    "Engine Size (cc)": "2000 cc",
    "Number of Doors": 4,
    "Number of Passengers": 5,
    "Fuel Type": "Gasoline",
    "Gearbox": "Automatic",
    "AC": "Yes",
    "Electric Windows": "Yes",
  },
  // Extend as needed...
};

// Fetch the distinct car groups and build the group select UI
function loadCarGroups() {
  fetch('http://localhost:5000/api/cars/groups')
    .then(response => response.json())
    .then(groups => {
      const container = document.getElementById("carGroupsContainer");
      container.innerHTML = ""; // Clear content

      // Create the select
      const selectEl = document.createElement("select");
      selectEl.id = "carGroupSelect";

      // Default option
      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = "Select a car group";
      selectEl.appendChild(defaultOption);

      // Populate with group names
      groups.forEach(groupName => {
        const option = document.createElement("option");
        option.value = groupName;
        option.textContent = groupName;
        selectEl.appendChild(option);
      });

      container.appendChild(selectEl);

      // Container for group specs
      const specsContainer = document.getElementById("groupSpecsContainer");
      specsContainer.innerHTML = "";

      // Handle select change
      selectEl.addEventListener("change", function() {
        const selectedGroup = this.value;
        // Clear the gallery
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

// Show the chosen group's specs (hard-coded from groupSpecsData)
function showGroupSpecs(groupName) {
  const specsContainer = document.getElementById("groupSpecsContainer");
  specsContainer.innerHTML = "";

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

// Fetch and display cars from a specific group
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
        galleryContainer.appendChild(carCard);
      });
    })
    .catch(error => {
      console.error("Error fetching cars by group:", error);
    });
}

// DOMContentLoaded => Initialize everything
window.addEventListener("DOMContentLoaded", () => {
  // PART A (filtering)
  fetchAllCars();
  initFilterForm();

  // PART B (groups)
  loadCarGroups();
});




