let pickupMap, returnMap;
let pickupInput, returnInput;

// Updated list of branches with operating hours.
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
  
  pickupInput = document.getElementById("pickup-location");
  returnInput = document.getElementById("return-location");
  
  branches.forEach(branch => {
    const marker = new google.maps.Marker({
      position: { lat: branch.lat, lng: branch.lng },
      map: pickupMap,
      title: branch.name,
    });
    const infoWindow = new google.maps.InfoWindow({
      content: `<b>${branch.name}</b><br>${branch.info}<br>
                <img src='https://maps.googleapis.com/maps/api/streetview?size=300x200&location=${branch.lat},${branch.lng}&key=AIzaSyCZXzMrcSSxzL-dxxA7-TrT_EwyaoHLluI' alt='Street View' style='width:100%;border-radius:5px;'>`
    });
    marker.addListener("click", () => {
      infoWindow.open(pickupMap, marker);
      pickupInput.value = branch.name;
      pickupMap.setCenter(marker.getPosition());
      pickupMap.setZoom(17);
    });
  });
  
  branches.forEach(branch => {
    const marker = new google.maps.Marker({
      position: { lat: branch.lat, lng: branch.lng },
      map: returnMap,
      title: branch.name,
    });
    const infoWindow = new google.maps.InfoWindow({
      content: `<b>${branch.name}</b><br>${branch.info}<br>
                <img src='https://maps.googleapis.com/maps/api/streetview?size=300x200&location=${branch.lat},${branch.lng}&key=AIzaSyCZXzMrcSSxzL-dxxA7-TrT_EwyaoHLluI' alt='Street View' style='width:100%;border-radius:5px;'>`
    });
    marker.addListener("click", () => {
      infoWindow.open(returnMap, marker);
      returnInput.value = branch.name;
      returnMap.setCenter(marker.getPosition());
      returnMap.setZoom(17);
    });
  });
}

function validateReservation() {
  const driverAge = parseInt(document.getElementById("driver-age").value, 10);
  const pickupDate = new Date(document.getElementById("pickup-datetime").value);
  const dropDate = new Date(document.getElementById("drop-datetime").value);
  const messageBox = document.getElementById("message-box");
  const selectedPickupBranch = branches.find(branch => branch.name === pickupInput.value);
  const selectedReturnBranch = branches.find(branch => branch.name === returnInput.value);
  const currentDate = new Date();

  messageBox.innerHTML = "";
  messageBox.classList.remove("error");

  if (!selectedPickupBranch) {
    messageBox.innerHTML = "<p>Please select a valid pickup location.</p>";
    messageBox.classList.add("error");
    return false;
  }
  
  if (!selectedReturnBranch) {
    messageBox.innerHTML = "<p>Please select a valid return location.</p>";
    messageBox.classList.add("error");
    return false;
  }
  
  if (driverAge < 18 || driverAge > 75) {
    messageBox.innerHTML = "<p>Driver age must be between 18 and 75.</p>";
    messageBox.classList.add("error");
    return false;
  }
  
  if (pickupDate < currentDate) {
    messageBox.innerHTML = "<p>Pickup date cannot be in the past. Please select a future date and time.</p>";
    messageBox.classList.add("error");
    return false;
  }
  
  if (dropDate < currentDate) {
    messageBox.innerHTML = "<p>Return date cannot be in the past. Please select a future date and time.</p>";
    messageBox.classList.add("error");
    return false;
  }
  
  if (dropDate <= pickupDate) {
    messageBox.innerHTML = "<p>Drop-off date must be after pickup date.</p>";
    messageBox.classList.add("error");
    return false;
  }
  
  const timeDifference = (dropDate - pickupDate) / (1000 * 60 * 60);
  if (timeDifference < 2) {
    messageBox.innerHTML = "<p>There must be at least a 2-hour gap between pickup and return time.</p>";
    messageBox.classList.add("error");
    return false;
  }
  
  const pickupHour = pickupDate.getHours();
  if (pickupHour < selectedPickupBranch.openHour || pickupHour >= selectedPickupBranch.closeHour) {
    messageBox.innerHTML = `<p>Pickup time must be between ${selectedPickupBranch.openHour}:00 and ${selectedPickupBranch.closeHour}:00.</p>`;
    messageBox.classList.add("error");
    return false;
  }
  
  const returnHour = dropDate.getHours();
  if (returnHour < selectedReturnBranch.openHour || returnHour >= selectedReturnBranch.closeHour) {
    messageBox.innerHTML = `<p>Return time must be between ${selectedReturnBranch.openHour}:00 and ${selectedReturnBranch.closeHour}:00.</p>`;
    messageBox.classList.add("error");
    return false;
  }
  
  return true;
}

document.getElementById("reservation-form").addEventListener("submit", function(event) {
  event.preventDefault();
  
  if (!validateReservation()) {
    return;
  }
  
  const reservationDetails = {
    pickupLocation: pickupInput.value,
    dropoffLocation: returnInput.value,
    driverName: document.getElementById("driver-name").value,
    driverAge: document.getElementById("driver-age").value,
    pickupDateTime: document.getElementById("pickup-datetime").value,
    dropoffDateTime: document.getElementById("drop-datetime").value,
    cars: [] // Initially empty, to be updated when adding cars.
  };

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
      localStorage.setItem("reservationDetails", JSON.stringify(data));
      // Store the reservation id so that subsequent pages use the correct reservation.
      localStorage.setItem("reservationId", data._id);
      // Redirect to the car groups page.
      window.location.href = "cargroups.html";
    })
    .catch(err => {
      console.error("Error saving reservation:", err);
      const messageBox = document.getElementById("message-box");
      messageBox.innerHTML = "<p>Error saving reservation. Please try again.</p>";
      messageBox.classList.add("error");
    });
});