let pickupMap, returnMap;
let pickupMarker, returnMarker;
let pickupInput, returnInput;

// Updated List of Branches with Operating Hours
const branches = [
  { name: "Beirut - Sakiat Al Janzeer", lat: 33.8886, lng: 35.4821, info: "Opens: 8 AM - 8 PM, Phone: +961123456", openHour: 8, closeHour: 20 },
  { name: "Tripoli - Sa7at Al Nour", lat: 34.4361, lng: 35.8449, info: "Opens: 9 AM - 6 PM, Phone: +961987654", openHour: 9, closeHour: 18 },
  { name: "Saida - Kal3at Saida", lat: 33.5606, lng: 35.3750, info: "Opens: 9 AM - 7 PM, Phone: +961789123", openHour: 9, closeHour: 19 }
];

function initMap() {
  pickupMap = new google.maps.Map(document.getElementById("pickup-map"), {
    center: { lat: 33.8886, lng: 35.4821 },
    zoom: 9,
    mapTypeId: 'hybrid'
  });
  returnMap = new google.maps.Map(document.getElementById("return-map"), {
    center: { lat: 33.8886, lng: 35.4821 },
    zoom: 9,
    mapTypeId: 'hybrid'
  });
  
  // Get input fields (they exist due to the defer attribute)
  pickupInput = document.getElementById("pickup-location");
  returnInput = document.getElementById("return-location");
  
  // Place branch markers on the pickup map
  branches.forEach(branch => {
    const marker = new google.maps.Marker({
      position: { lat: branch.lat, lng: branch.lng },
      map: pickupMap,
      title: branch.name,
    });
    const infoWindow = new google.maps.InfoWindow({
      content: `<b>${branch.name}</b><br>${branch.info}<br>
                <img src='https://maps.googleapis.com/maps/api/streetview?size=300x200&location=${branch.lat},${branch.lng}&key=YOUR_API_KEY' alt='Street View' style='width:100%;border-radius:5px;'>`
    });
    
    marker.addListener("click", () => {
      infoWindow.open(pickupMap, marker);
      pickupInput.value = branch.name;
      pickupMap.setCenter(marker.getPosition());
      pickupMap.setZoom(17);
    });
  });
  
  // Place branch markers on the return map
  branches.forEach(branch => {
    const marker = new google.maps.Marker({
      position: { lat: branch.lat, lng: branch.lng },
      map: returnMap,
      title: branch.name,
    });
    const infoWindow = new google.maps.InfoWindow({
      content: `<b>${branch.name}</b><br>${branch.info}<br>
                <img src='https://maps.googleapis.com/maps/api/streetview?size=300x200&location=${branch.lat},${branch.lng}&key=YOUR_API_KEY' alt='Street View' style='width:100%;border-radius:5px;'>`
    });
    
    marker.addListener("click", () => {
      infoWindow.open(returnMap, marker);
      returnInput.value = branch.name;
      returnMap.setCenter(marker.getPosition());
      returnMap.setZoom(17);
    });
  });
}

// Updated validation function now returns true if all fields are valid
function validateReservation() {
  const driverAge = document.getElementById("driver-age").value;
  const pickupDate = new Date(document.getElementById("pickup-datetime").value);
  const dropDate = new Date(document.getElementById("drop-datetime").value);
  const messageBox = document.getElementById("message-box");
  const selectedPickupBranch = branches.find(branch => branch.name === pickupInput.value);
  const selectedReturnBranch = branches.find(branch => branch.name === returnInput.value);

  messageBox.innerHTML = "";

  if (!selectedPickupBranch) {
    messageBox.innerHTML = "<p style='color:red;'>Please select a valid pickup location.</p>";
    return false;
  }
  
  if (!selectedReturnBranch) {
    messageBox.innerHTML = "<p style='color:red;'>Please select a valid return location.</p>";
    return false;
  }

  if (driverAge < 18 || driverAge > 75) {
    messageBox.innerHTML = "<p style='color:red;'>Driver age must be between 18 and 75.</p>";
    return false;
  }

  if (dropDate <= pickupDate) {
    messageBox.innerHTML = "<p style='color:red;'>Drop-off date must be after pickup date.</p>";
    return false;
  }
  
  const timeDifference = (dropDate - pickupDate) / (1000 * 60 * 60); // in hours
  if (timeDifference < 2) {
    messageBox.innerHTML = "<p style='color:red;'>There must be at least a 2-hour gap between pickup and return time.</p>";
    return false;
  }

  const pickupHour = pickupDate.getHours();
  if (pickupHour < selectedPickupBranch.openHour || pickupHour >= selectedPickupBranch.closeHour) {
    messageBox.innerHTML = `<p style='color:red;'>Pickup time must be between ${selectedPickupBranch.openHour}:00 and ${selectedPickupBranch.closeHour}:00.</p>`;
    return false;
  }
  
  const returnHour = dropDate.getHours();
  if (returnHour < selectedReturnBranch.openHour || returnHour >= selectedReturnBranch.closeHour) {
    messageBox.innerHTML = `<p style='color:red;'>Return time must be between ${selectedReturnBranch.openHour}:00 and ${selectedReturnBranch.closeHour}:00.</p>`;
    return false;
  }
  
  // All validations passed.
  return true;
}

// Single event listener on the reservation form submit
document.getElementById("reservation-form").addEventListener("submit", function(event) {
  event.preventDefault();
  
  if (!validateReservation()) {
    return;
  }
  
  // Build the reservation object.
  const reservationDetails = {
    pickupLocation: pickupInput.value,
    dropoffLocation: returnInput.value, // Note: Use 'dropoffLocation' to match your Reservation schema
    driverName: document.getElementById("driver-name").value,
    driverAge: document.getElementById("driver-age").value,
    pickupDateTime: document.getElementById("pickup-datetime").value, // Use camel-case as in the schema
    dropoffDateTime: document.getElementById("drop-datetime").value   // Use camel-case as in the schema
  };

  // Log the token to check if it exists.
  const token = localStorage.getItem("token");
  console.log("Token being sent:", token);

  fetch("http://localhost:5000/api/reservations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify(reservationDetails)
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(errData => Promise.reject(errData));
      }
      return response.json();
    })
    .then(data => {
      // Save the returned reservation details locally (if needed)
      localStorage.setItem("reservationDetails", JSON.stringify(data));
      // Redirect to the order page (Choose A Car)
      window.location.href = "cargroups.html";
    })
    .catch(err => {
      console.error("Error saving reservation:", err);
      document.getElementById("message-box").innerHTML = "<p style='color:red;'>Error saving reservation. Please try again.</p>";
    });
});




