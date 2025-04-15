document.addEventListener("DOMContentLoaded", () => {
    fetch('http://localhost:5000/api/stats/popular-car')
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok.");
        }
        return response.json();
      })
      .then(carData => {
        const container = document.getElementById("popularCarContainer");
        if (!container) return;
  
        // Create a card element to display the popular car's details
        const card = document.createElement("div");
        card.classList.add("popular-car-card");
  
        // Car title (brand and model)
        const title = document.createElement("h3");
        title.textContent = `${carData.brand} ${carData.model}`;
        card.appendChild(title);
  
        // Car image
        const img = document.createElement("img");
        img.src = carData.image || "placeholder-image.jpg";  // Fallback image if none is provided
        img.alt = `${carData.brand} ${carData.model}`;
        card.appendChild(img);
  
        // Daily rental fee
        const price = document.createElement("p");
        price.textContent = `Daily Rental Fee: $${carData.dailyPrice}`;
        card.appendChild(price);
  
        // // Display the number of reservations for that car
        // const reservations = document.createElement("p");
        // reservations.textContent = `Reserved ${carData.reservationsCount} times`;
        // card.appendChild(reservations);
  
        container.appendChild(card);
      })
      .catch(error => {
        console.error("Error fetching popular car data:", error);
      });
  });