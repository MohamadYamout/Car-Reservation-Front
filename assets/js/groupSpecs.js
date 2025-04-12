// groupSpecs.js

document.addEventListener("DOMContentLoaded", function() {
    // Parse query parameters to get the group name
    const params = new URLSearchParams(window.location.search);
    const group = params.get('group');
  
    const groupTitle = document.getElementById('groupTitle');
    if (!group) {
      groupTitle.textContent = "No Group Selected";
      return;
    }
    groupTitle.textContent = group + " Specifications";
  
    // Hard-coded common specs for groups
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
      // Add more groups if needed.
    };
  
    const specs = groupSpecsData[group];
    const container = document.getElementById("groupSpecsContainer");
    container.innerHTML = ""; // Clear any existing content
  
    if (!specs) {
      container.textContent = "No specifications available for this group.";
      return;
    }
  
    // Render the specs in a grid (each spec in its own box)
    for (const key in specs) {
      const specItem = document.createElement("div");
      specItem.classList.add("spec-item");
      specItem.innerHTML = `<strong>${key}:</strong> ${specs[key]}`;
      container.appendChild(specItem);
    }
  });
  