document.addEventListener("DOMContentLoaded", async function() {
    const reviewsContainer = document.getElementById("reviewsContainer");
  
    /**
     * Fetch all reviews from the backend.
     * This assumes your GET endpoint at /api/reviews returns all reviews when ?all=true is appended.
     */
    async function fetchReviews() {
      try {
        const response = await fetch("http://localhost:5000/api/reviews?all=true");
        if (!response.ok) {
          console.error("Error fetching reviews. HTTP status:", response.status);
          return [];
        }
        return await response.json();
      } catch (err) {
        console.error("Error fetching reviews:", err);
        return [];
      }
    }
  
    /**
     * Shuffle an array in place using the Fisher–Yates algorithm.
     * @param {Array} array The array to shuffle.
     * @returns {Array} The shuffled array.
     */
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }
  
    /**
     * Create and return a DOM element for a review card.
     * This version displays the reviewer's profile picture (if available),
     * then the star rating and name, followed by the review comment and date.
     * @param {Object} review The review object.
     * @returns {HTMLElement} The review card element.
     */
    function createReviewCard(review) {
      // Create review-card container
      const card = document.createElement("div");
      card.classList.add("review-card");
  
      // Create top container for avatar and author info (rating & name)
      const topContainer = document.createElement("div");
      topContainer.classList.add("top-container");
  
      // Create avatar element for profile picture
      const avatarDiv = document.createElement("div");
      avatarDiv.classList.add("author-avatar");
      if (review.profilePic && review.profilePic.trim() !== "") {
        const img = document.createElement("img");
        img.src = review.profilePic;
        img.alt = review.name;
        avatarDiv.appendChild(img);
      } else {
        // Fallback to first letter of the name
        avatarDiv.textContent = review.name ? review.name.charAt(0).toUpperCase() : "";
      }
      topContainer.appendChild(avatarDiv);
  
      // Container for rating and name
      const topInfoDiv = document.createElement("div");
      topInfoDiv.classList.add("top-info");
  
      // Star rating display
      const ratingDiv = document.createElement("div");
      ratingDiv.classList.add("rating-stars");
      for (let i = 1; i <= 5; i++) {
        const starSpan = document.createElement("span");
        starSpan.innerHTML = i <= review.rating ? "&#9733;" : "&#9734;";
        ratingDiv.appendChild(starSpan);
      }
      topInfoDiv.appendChild(ratingDiv);
  
      // Name display
      const nameHeading = document.createElement("h4");
      nameHeading.classList.add("review-name");
      nameHeading.textContent = review.name || "Anonymous";
      topInfoDiv.appendChild(nameHeading);
  
      topContainer.appendChild(topInfoDiv);
      card.appendChild(topContainer);
  
      // The review comment
      const commentP = document.createElement("p");
      commentP.classList.add("review-text");
      commentP.textContent = `"${review.comment}"`;
      card.appendChild(commentP);
  
      // The review date
      const dateP = document.createElement("p");
      dateP.classList.add("review-date");
      const reviewDate = new Date(review.date);
      dateP.textContent = `Reviewed on ${reviewDate.toLocaleDateString()}`;
      card.appendChild(dateP);
  
      return card;
    }
  
    /**
     * Fetch reviews, shuffle them, and display them.
     */
    async function displayReviews() {
      reviewsContainer.innerHTML = ""; // Clear any existing reviews
      const reviews = await fetchReviews();
      if (reviews.length === 0) {
        reviewsContainer.textContent = "No reviews available.";
        return;
      }
      // Shuffle the reviews randomly
      const shuffledReviews = shuffleArray(reviews);
      shuffledReviews.forEach(review => {
        const card = createReviewCard(review);
        reviewsContainer.appendChild(card);
      });
    }
  
    // On page load, fetch, shuffle, and display all reviews.
    displayReviews();
  });
  