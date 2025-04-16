document.addEventListener("DOMContentLoaded", () => {
  // Retrieve the JWT token from localStorage (stored after login)
  const token = localStorage.getItem("token");
  if (!token) {
    // If no token exists, redirect to sign in page
    window.location.href = "SignInSignUp.html"; // Adjust the path as necessary
    return;
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

      // Update the Profile Picture Section: user name and "Member since" text
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

      // Update the User Information Section
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
      
      // Prepare the file for upload
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
          if (data.error) {
            console.error("Upload error:", data.error);
          } else {
            console.log("Profile picture updated:", data.profilePicture);
          }
        })
        .catch(error => console.error("Error uploading the file:", error));
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
      // Clear any static content
      reviewsGrid.innerHTML = "";

      reviews.forEach(review => {
        // Create a card container
        const card = document.createElement('div');
        card.className = 'review-card';

        // Create a header container
        const header = document.createElement('div');
        header.className = 'review-header';

        // "car-info" container to hold the review title (or fallback)
        const carInfo = document.createElement('div');
        carInfo.className = 'car-info';

        // Review Title
        const titleElem = document.createElement('h4');
        titleElem.textContent = review.title && review.title.trim() !== ""
          ? review.title
          : "My Review"; 
        carInfo.appendChild(titleElem);

        header.appendChild(carInfo);

        // Rating container
        const ratingDiv = document.createElement('div');
        ratingDiv.className = 'rating';
        const rating = review.rating;
        const fullStars = Math.floor(rating);
        const halfStar = (rating - fullStars) >= 0.5;

        // Full stars
        for (let i = 0; i < fullStars; i++) {
          const star = document.createElement('i');
          star.className = 'fas fa-star';
          ratingDiv.appendChild(star);
        }
        // Half star if needed
        if (halfStar) {
          const star = document.createElement('i');
          star.className = 'fas fa-star-half-alt';
          ratingDiv.appendChild(star);
        }
        // Empty stars
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
          const star = document.createElement('i');
          star.className = 'far fa-star';
          ratingDiv.appendChild(star);
        }

        header.appendChild(ratingDiv);
        card.appendChild(header);

        // Review text (comment) displayed BEFORE the date
        const reviewText = document.createElement('p');
        reviewText.className = 'review-text';
        reviewText.textContent = `"${review.comment}"`;
        card.appendChild(reviewText);

        // Now display the date AFTER the review text
        const dateElem = document.createElement('p');
        dateElem.className = 'review-date';
        const reviewDate = new Date(review.date);
        dateElem.textContent = `Reviewed on ${reviewDate.toLocaleDateString()}`;
        card.appendChild(dateElem);

        // Append card to the reviews grid
        reviewsGrid.appendChild(card);
      });
    })
    .catch(error => console.error("Error fetching reviews:", error));
});
