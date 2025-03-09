let pickupMap, returnMap;
let pickupMarker, returnMarker;
let pickupInput = document.getElementById("pickup-location");
let returnInput = document.getElementById("return-location");

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
    
    // Place branch markers on maps
    branches.forEach(branch => {
        const marker = new google.maps.Marker({
            position: { lat: branch.lat, lng: branch.lng },
            map: pickupMap,
            title: branch.name,
        });

        const infoWindow = new google.maps.InfoWindow({
            content: `<b>${branch.name}</b><br>${branch.info}<br><img src='https://maps.googleapis.com/maps/api/streetview?size=300x200&location=${branch.lat},${branch.lng}&key=AIzaSyCZXzMrcSSxzL-dxxA7-TrT_EwyaoHLluI' alt='Street View' style='width:100%;border-radius:5px;'>`
        });
        
        marker.addListener("click", () => {
            infoWindow.open(pickupMap, marker);
            pickupInput.value = branch.name;
            pickupMap.setCenter(marker.getPosition());
            pickupMap.setZoom(17); // Zoom in to branch location
        });
    });
    
    branches.forEach(branch => {
        const marker = new google.maps.Marker({
            position: { lat: branch.lat, lng: branch.lng },
            map: returnMap,
            title: branch.name,
        });

        const infoWindow = new google.maps.InfoWindow({
            content: `<b>${branch.name}</b><br>${branch.info}<br><img src='https://maps.googleapis.com/maps/api/streetview?size=300x200&location=${branch.lat},${branch.lng}&key=AIzaSyCZXzMrcSSxzL-dxxA7-TrT_EwyaoHLluI' alt='Street View' style='width:100%;border-radius:5px;'>`
        });
        
        marker.addListener("click", () => {
            infoWindow.open(returnMap, marker);
            returnInput.value = branch.name;
            returnMap.setCenter(marker.getPosition());
            returnMap.setZoom(17); // Zoom in to branch location
        });
    });
}

// Form Validation
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
        return;
    }
    
    if (!selectedReturnBranch) {
        messageBox.innerHTML = "<p style='color:red;'>Please select a valid return location.</p>";
        return;
    }

    if (driverAge < 18 || driverAge > 75) {
        messageBox.innerHTML = "<p style='color:red;'>Driver age must be between 18 and 75.</p>";
        return;
    }

    if (dropDate <= pickupDate) {
        messageBox.innerHTML = "<p style='color:red;'>Drop-off date must be after pickup date.</p>";
        return;
    }
    
    // Ensure a minimum 2-hour gap between pickup and return time
    const timeDifference = (dropDate - pickupDate) / (1000 * 60 * 60); // Convert milliseconds to hours
    if (timeDifference < 2) {
        messageBox.innerHTML = "<p style='color:red;'>There must be at least a 2-hour gap between pickup and return time.</p>";
        return;
    }

    if (selectedPickupBranch) {
        const pickupHour = pickupDate.getHours();
        if (pickupHour < selectedPickupBranch.openHour || pickupHour >= selectedPickupBranch.closeHour) {
            messageBox.innerHTML = `<p style='color:red;'>Pickup time must be between ${selectedPickupBranch.openHour}:00 and ${selectedPickupBranch.closeHour}:00.</p>`;
            return;
        }
    }

    if (selectedReturnBranch) {
        const returnHour = dropDate.getHours();
        if (returnHour < selectedReturnBranch.openHour || returnHour >= selectedReturnBranch.closeHour) {
            messageBox.innerHTML = `<p style='color:red;'>Return time must be between ${selectedReturnBranch.openHour}:00 and ${selectedReturnBranch.closeHour}:00.</p>`;
            return;
        }
    }
    
    alert("Reservation Successful!");
} 

document.getElementById("reservation-form").addEventListener("submit", function(event) {
    event.preventDefault();
    validateReservation();
});


