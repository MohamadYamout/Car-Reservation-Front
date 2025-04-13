document.addEventListener("DOMContentLoaded", function() {
    // Fetch random reviews from the backend on port 5000.
    fetch("http://localhost:5000/api/reviews/random")
      .then(response => {
        // Ensure the response is valid.
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(reviews => {
        // Select the container that holds the testimonials.
        const testimonialsContainer = document.querySelector(".testimonial-grid");
        if (!testimonialsContainer) {
          console.error("Could not find element with class 'testimonial-grid'");
          return;
        }
        // Clear any static testimonial cards.
        testimonialsContainer.innerHTML = "";
  
        // If there are no reviews, optionally display a message.
        if (!reviews.length) {
          testimonialsContainer.innerHTML = "<p>No reviews available.</p>";
          return;
        }
  
        // Loop through the reviews and create testimonial cards.
        reviews.forEach(review => {
          // Create the main testimonial card.
          const card = document.createElement("div");
          card.classList.add("testimonial-card");
  
          // TOP CONTAINER: Holds the avatar and (name + rating) side by side.
          const topContainer = document.createElement("div");
          topContainer.classList.add("top-container");
  
          // 1) Avatar (Profile Picture or First Initial)
          const avatarDiv = document.createElement("div");
          avatarDiv.classList.add("author-avatar");
          if (review.profilePic && review.profilePic.trim() !== "") {
            const img = document.createElement("img");
            img.src = review.profilePic;
            img.alt = review.name;
            avatarDiv.appendChild(img);
          } else {
            // Fallback to first letter of the user's name
            avatarDiv.textContent = review.name ? review.name.charAt(0).toUpperCase() : "";
          }
          topContainer.appendChild(avatarDiv);
  
          // 2) Details DIV: For Name and Rating side by side.
          const detailsDiv = document.createElement("div");
          detailsDiv.classList.add("name-rating-container");
          
          // Name
          const nameHeading = document.createElement("h4");
          nameHeading.classList.add("review-name");
          nameHeading.textContent = review.name || "Anonymous";
          
          // Rating
          const ratingStarsContainer = document.createElement("div");
          ratingStarsContainer.classList.add("rating-stars");
          for (let i = 1; i <= 5; i++) {
            const starSpan = document.createElement("span");
            starSpan.innerHTML = i <= review.rating ? "&#9733;" : "&#9734;";
            ratingStarsContainer.appendChild(starSpan);
          }
  
          // Append name + rating to detailsDiv, then append detailsDiv to topContainer
          detailsDiv.appendChild(nameHeading);
          detailsDiv.appendChild(ratingStarsContainer);
          topContainer.appendChild(detailsDiv);
  
          // Add topContainer to card
          card.appendChild(topContainer);
  
          // BELOW TOP CONTAINER: The review comment
          const reviewText = document.createElement("p");
          reviewText.classList.add("testimonial-text");
          reviewText.textContent = `"${review.comment}"`;
          card.appendChild(reviewText);
  
          // BELOW THE COMMENT: The review date
          const reviewDate = new Date(review.date);
          const formattedDate = reviewDate.toLocaleDateString();
          const dateParagraph = document.createElement("p");
          dateParagraph.classList.add("review-date");
          dateParagraph.textContent = `Reviewed on ${formattedDate}`;
          card.appendChild(dateParagraph);
  
          // Finally, append the card to the main testimonials container
          testimonialsContainer.appendChild(card);
        });
      })
      .catch(error => {
        console.error("Error fetching reviews:", error);
      });
  });  