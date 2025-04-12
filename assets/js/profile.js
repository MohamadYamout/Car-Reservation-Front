document.addEventListener("DOMContentLoaded", () => {
    // Retrieve the JWT token from localStorage (stored after login)
    const token = localStorage.getItem("token");
    if (!token) {
      // If no token exists, redirect to sign in page
      window.location.href = "signin.html"; // Adjust the path as necessary
      return;
    }
  
    // Fetch the user's profile details from the backend
    fetch("http://localhost:5000/api/auth/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // Send token for authentication
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          console.error("Error retrieving profile data:", data.error);
          return;
        }
  
        // Update the Profile Picture Section: Update user name and "Member since" text
        const profileNameEl = document.querySelector(".profile-picture-section h2");
        if (profileNameEl && data.username) {
          profileNameEl.textContent = data.username;
        }
  
        const memberSinceEl = document.querySelector(".profile-picture-section .member-since");
        if (memberSinceEl && data.createdAt) {
          const createdDate = new Date(data.createdAt);
          const options = { month: "long", year: "numeric" };
          memberSinceEl.textContent = `Member since ${createdDate.toLocaleDateString(undefined, options)}`;
        }
  
        // Update the User Information Section based on the label text of each .info-item
        const infoItems = document.querySelectorAll(".user-info-section .info-item");
        infoItems.forEach(item => {
          const label = item.querySelector("label").textContent.trim();
          const valueEl = item.querySelector("p");
  
          if (label === "Full Name" && data.username) {
            valueEl.textContent = data.username;
          } else if (label === "Email" && data.email) {
            valueEl.textContent = data.email;
          } else if (label === "Phone" && data.phone) {
            valueEl.textContent = data.phone;
          } else if (label === "Address") {
            valueEl.textContent = data.address || "Not provided";
          }
        });
      })
      .catch(error => {
        console.error("Error fetching profile data:", error);
      });
  });
  