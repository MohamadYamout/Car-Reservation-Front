document.addEventListener("DOMContentLoaded", () => {
  // Retrieve the JWT token from localStorage (stored after login)
  const token = localStorage.getItem("token");
  if (!token) {
    // If no token exists, redirect to sign in page
    window.location.href = "SignInSignUp.html";
    return;
  }

  // Add logout functionality
  const logoutButton = document.querySelector('.logout');
  if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
      e.preventDefault();
      // Clear all auth-related localStorage items
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('current-user');
      localStorage.removeItem('reservationDetails');
      localStorage.removeItem('reservationId');
      // Redirect to landing page
      window.location.href = "../index.html";
    });
  }

  // Fetch the user's profile details from the backend
  fetch("http://localhost:5000/api/auth/profile", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        console.error("Error retrieving profile data:", data.error);
        return;
      }

      // Update Profile Picture Section
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

      // Update User Information Section
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
        } else if (label === "Points") {
          valueEl.textContent = data.points ?? 0;
        }
      });

      // Update Profile Picture
      if (data.profilePicture) {
        document.getElementById('profile-img').src = data.profilePicture;
      }
      
      // Update localStorage with the latest user data including isAdmin status
      const isAdmin = data.isAdmin !== undefined ? data.isAdmin : 
                      (JSON.parse(localStorage.getItem('user'))?.isAdmin || false);
      
      // Create a new updated user object with isAdmin flag
      const updatedUser = { 
        ...data,
        isAdmin 
      };
      
      // Store only one user object
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('Profile updated user with isAdmin:', isAdmin);
    })
    .catch(error => {
      console.error("Error fetching profile data:", error);
    });
  
  // File upload listener for profile picture update
  document.getElementById('profile-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      // Display local preview
      const reader = new FileReader();
      reader.onload = function(e) {
        document.getElementById('profile-img').src = e.target.result;
      };
      reader.readAsDataURL(file);
      
      // Prepare and send upload
      const formData = new FormData();
      formData.append('profilePicture', file);
      fetch("http://localhost:5000/api/auth/profile/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          if (data.error) console.error("Upload error:", data.error);
          else {
            console.log("Profile picture updated:", data.profilePicture);
            // Update the user data in localStorage with new profile picture
            const currentUser = JSON.parse(localStorage.getItem('user')) || {};
            currentUser.profilePicture = data.profilePicture;
            localStorage.setItem('user', JSON.stringify(currentUser));
          }
        })
        .catch(error => console.error("Error uploading file:", error));
    }
  });

  // Fetch and Display Logged-in User's Reviews
  fetch("http://localhost:5000/api/reviews/myreviews", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  })
    .then(response => response.json())
    .then(reviews => {
      const reviewsGrid = document.querySelector('.reviews-grid');
      reviewsGrid.innerHTML = "";

      reviews.forEach(review => {
        // Build review card (unchanged from before)
        const card = document.createElement('div');
        card.className = 'review-card';

        const header = document.createElement('div');
        header.className = 'review-header';

        const carInfo = document.createElement('div');
        carInfo.className = 'car-info';
        const titleElem = document.createElement('h4');
        titleElem.textContent = review.title && review.title.trim() !== ""
          ? review.title
          : "My Review"; 
        carInfo.appendChild(titleElem);
        header.appendChild(carInfo);

        const ratingDiv = document.createElement('div');
        ratingDiv.className = 'rating';
        const fullStars = Math.floor(review.rating);
        const halfStar = (review.rating - fullStars) >= 0.5;
        for (let i = 0; i < fullStars; i++) {
          const star = document.createElement('i');
          star.className = 'fas fa-star';
          ratingDiv.appendChild(star);
        }
        if (halfStar) {
          const star = document.createElement('i');
          star.className = 'fas fa-star-half-alt';
          ratingDiv.appendChild(star);
        }
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
          const star = document.createElement('i');
          star.className = 'far fa-star';
          ratingDiv.appendChild(star);
        }
        header.appendChild(ratingDiv);
        card.appendChild(header);

        const reviewText = document.createElement('p');
        reviewText.className = 'review-text';
        reviewText.textContent = `"${review.comment}"`;
        card.appendChild(reviewText);

        const dateElem = document.createElement('p');
        dateElem.className = 'review-date';
        dateElem.textContent = `Reviewed on ${new Date(review.date).toLocaleDateString()}`;
        card.appendChild(dateElem);

        reviewsGrid.appendChild(card);
      });
    })
    .catch(error => console.error("Error fetching reviews:", error));
});
