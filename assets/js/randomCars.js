// randomCars.js

document.addEventListener("DOMContentLoaded", function() {
    fetch('http://localhost:5000/api/cars')
      .then(response => response.json())
      .then(cars => {
        // Group cars by their 'group' property
        const groups = {};
        cars.forEach(car => {
          if (!groups[car.group]) {
            groups[car.group] = [];
          }
          groups[car.group].push(car);
        });
  
        // Get an array of distinct group names
        const groupKeys = Object.keys(groups);
  
        // If there are less than three groups, use available groups; otherwise randomly choose 3 groups.
        let selectedGroups = [];
        if (groupKeys.length <= 3) {
          selectedGroups = groupKeys;
        } else {
          while (selectedGroups.length < 3) {
            const randomKey = groupKeys[Math.floor(Math.random() * groupKeys.length)];
            if (!selectedGroups.includes(randomKey)) {
              selectedGroups.push(randomKey);
            }
          }
        }
  
        // For each selected group, pick one random car.
        const randomCars = selectedGroups.map(groupKey => {
          const groupCars = groups[groupKey];
          const randomIndex = Math.floor(Math.random() * groupCars.length);
          return groupCars[randomIndex];
        });
  
        // Display the random cars using the same styling as your feature cards
        displayRandomCars(randomCars);
      })
      .catch(error => {
        console.error("Error fetching random cars: ", error);
      });
  });
  
  function displayRandomCars(randomCars) {
    const container = document.getElementById("randomCarsContainer");
    if (!container) {
      console.error("Container with id 'randomCarsContainer' not found.");
      return;
    }
    container.innerHTML = ""; // Clear any previous content
  
    randomCars.forEach(car => {
      // Create the card using the "feature-card" class to match your features section styling
      const card = document.createElement("div");
      card.classList.add("feature-card");
      
      // Add click event to navigate to the group specs page for the car's group
      card.addEventListener("click", function() {
        window.location.href = '/pages/groupSpecs.html?group=' + encodeURIComponent(car.group);
      });
  
      // Create the title element displaying the car's name at the top
      const title = document.createElement("h3");
      title.textContent = `${car.brand} ${car.model}`;
      card.appendChild(title);
  
      // Create the image element for the car and add it to the card
      const img = document.createElement("img");
      img.src = car.image || "placeholder-image.jpg";  // Provide a fallback image if none is provided
      img.alt = `${car.brand} ${car.model}`;
      card.appendChild(img);
  
      // Append the card to the main container
      container.appendChild(card);
    });
  }
  
  