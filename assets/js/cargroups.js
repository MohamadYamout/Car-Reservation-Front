// SAMPLE DATA: Car groups and their full specs
const carGroups = [
    {
      groupName: "SUV",
      specs: {
        "Engine Size": "2000 cc",
        "Horsepower": "250 HP",
        "Torque": "320 Nm",
        "Number of Doors": 4,
        "Passengers": 5,
        "Fuel Type": "Gasoline",
        "Gearbox": "Automatic",
        "Drive Type": "All-Wheel Drive (AWD)",
        "Fuel Consumption": "8.5 L/100km",
        "AC": true,
        "Electric Windows": true,
        "Safety Features": "ABS, Airbags, Lane Assist",
        "Entertainment System": "10-inch Touchscreen, Bluetooth",
        "Interior Material": "Leather Seats"
      }
    },
    {
      groupName: "Electric",
      specs: {
        "Engine Type": "Electric Motor",
        "Horsepower": "300 HP",
        "Torque": "450 Nm",
        "Number of Doors": 4,
        "Passengers": 5,
        "Fuel Type": "Electric",
        "Gearbox": "Single-speed",
        "Drive Type": "Rear-Wheel Drive (RWD)",
        "Range Per Charge": "400 km",
        "Charging Time": "Fast Charging (80% in 30 min)",
        "AC": true,
        "Electric Windows": true,
        "Safety Features": "Autopilot, Collision Avoidance",
        "Entertainment System": "12-inch Touchscreen, Wireless Charging",
        "Interior Material": "Vegan Leather"
      }
    },
    {
      groupName: "Hybrid",
      specs: {
        "Engine Size": "1800 cc + Electric Motor",
        "Horsepower": "220 HP",
        "Torque": "280 Nm",
        "Number of Doors": 4,
        "Passengers": 5,
        "Fuel Type": "Hybrid (Gasoline + Electric)",
        "Gearbox": "Automatic",
        "Drive Type": "Front-Wheel Drive (FWD)",
        "Fuel Consumption": "5.2 L/100km",
        "AC": true,
        "Electric Windows": true,
        "Safety Features": "Blind Spot Monitoring, Emergency Braking",
        "Entertainment System": "Apple CarPlay, Android Auto",
        "Interior Material": "Fabric + Synthetic Leather"
      }
    },
    {
      groupName: "Convertible",
      specs: {
        "Engine Size": "2500 cc",
        "Horsepower": "350 HP",
        "Torque": "400 Nm",
        "Number of Doors": 2,
        "Passengers": 2,
        "Fuel Type": "Gasoline",
        "Gearbox": "Automatic",
        "Drive Type": "Rear-Wheel Drive (RWD)",
        "Fuel Consumption": "10 L/100km",
        "AC": true,
        "Electric Windows": true,
        "Roof Type": "Retractable Hardtop",
        "Safety Features": "Roll Bars, Traction Control",
        "Entertainment System": "Premium Bose Sound System",
        "Interior Material": "Nappa Leather"
      }
    },
    {
      groupName: "Bus",
      specs: {
        "Engine Size": "4000 cc",
        "Horsepower": "180 HP",
        "Torque": "600 Nm",
        "Number of Doors": 2,
        "Passengers": 15,
        "Fuel Type": "Diesel",
        "Gearbox": "Manual",
        "Drive Type": "Rear-Wheel Drive (RWD)",
        "Fuel Consumption": "15 L/100km",
        "AC": false,
        "Electric Windows": false,
        "Safety Features": "Seatbelts for All Seats, Stability Control",
        "Entertainment System": "Microphone System, Overhead Speakers",
        "Interior Material": "Cloth Seats"
      }
    },
    {
      groupName: "Pickup Truck",
      specs: {
        "Engine Size": "3000 cc",
        "Horsepower": "400 HP",
        "Torque": "650 Nm",
        "Number of Doors": 2,
        "Passengers": 4,
        "Fuel Type": "Diesel",
        "Gearbox": "Manual",
        "Drive Type": "4x4 (Four-Wheel Drive)",
        "Fuel Consumption": "12 L/100km",
        "AC": false,
        "Electric Windows": false,
        "Towing Capacity": "5000 kg",
        "Safety Features": "Rear Parking Sensors, Traction Control",
        "Entertainment System": "Basic Radio + USB",
        "Interior Material": "Vinyl Seats"
      }
    },
    {
      groupName: "Minivan",
      specs: {
        "Engine Size": "2200 cc",
        "Horsepower": "200 HP",
        "Torque": "300 Nm",
        "Number of Doors": 4,
        "Passengers": 7,
        "Fuel Type": "Gasoline",
        "Gearbox": "Automatic",
        "Drive Type": "Front-Wheel Drive (FWD)",
        "Fuel Consumption": "7.8 L/100km",
        "AC": true,
        "Electric Windows": true,
        "Safety Features": "360° Camera, Adaptive Cruise Control",
        "Entertainment System": "Rear Seat Screens, Bluetooth",
        "Interior Material": "Soft Fabric + Leather Inserts"
      }
    }
  ];
  
  // Function to display the car groups on the webpage
  window.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("carGroupsContainer");
  
    carGroups.forEach(group => {
      // Create a block for each group
      const groupDiv = document.createElement("div");
      groupDiv.classList.add("car-group-card"); // Add a CSS class for styling
  
      // Group name
      const title = document.createElement("h2");
      title.textContent = group.groupName;
      groupDiv.appendChild(title);
  
      // List common specs
      const specsList = document.createElement("ul");
  
      for (let specName in group.specs) {
        const listItem = document.createElement("li");
  
        // Format Boolean values properly
        let displayValue = group.specs[specName];
        if (typeof displayValue === "boolean") {
          displayValue = displayValue ? "Yes" : "No"; // Convert true/false to Yes/No
        }
  
        listItem.textContent = `${specName}: ${displayValue}`;
        specsList.appendChild(listItem);
      }
  
      groupDiv.appendChild(specsList);
      container.appendChild(groupDiv);
    });
  });
  