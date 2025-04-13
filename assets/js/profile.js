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
      "Authorization": `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      console.error("Error retrieving profile data:", data.error);
      return;
    }

    // Update the Profile Picture Section: update user name and "Member since" text
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

    // Update the User Information Section based on the label text
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

    // If a profile picture is provided by the server, update the image source
    if (data.profilePicture) {
      document.getElementById('profile-img').src = data.profilePicture;
    }
  })
  .catch(error => {
    console.error("Error fetching profile data:", error);
  });
  
  // Add file upload listener for profile picture update
  document.getElementById('profile-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      // Display local preview
      const reader = new FileReader();
      reader.onload = function(e) {
        document.getElementById('profile-img').src = e.target.result;
      };
      reader.readAsDataURL(file);
      
      // Prepare the file for upload
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      fetch("http://localhost:5000/api/auth/profile/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          console.error("Upload error:", data.error);
        } else {
          console.log("Profile picture updated:", data.profilePicture);
        }
      })
      .catch(error => console.error("Error uploading the file:", error));
    }
  });
});
