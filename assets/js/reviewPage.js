document.addEventListener("DOMContentLoaded", async function() {
  const reviewsContainer = document.getElementById("reviewsContainer");

  // Fetch all reviews from the backend with ?all=true
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

  // Shuffle an array (Fisher–Yates algorithm)
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Create and return a DOM element for a review card.
   * Star rating -> Name -> Title, then the comment and date below.
   */
  function createReviewCard(review) {
    // Main container
    const card = document.createElement("div");
    card.classList.add("review-card");

    // Top container for avatar + review info
    const topContainer = document.createElement("div");
    topContainer.classList.add("top-container");

    // Avatar
    const avatarDiv = document.createElement("div");
    avatarDiv.classList.add("author-avatar");
    if (review.profilePic && review.profilePic.trim() !== "") {
      const img = document.createElement("img");
      img.src = review.profilePic;
      img.alt = review.name;
      avatarDiv.appendChild(img);
    } else {
      // Fallback: first letter of the name
      avatarDiv.textContent = review.name ? review.name.charAt(0).toUpperCase() : "";
    }
    topContainer.appendChild(avatarDiv);

    // The right side container for rating, name, and title
    const topInfoDiv = document.createElement("div");
    topInfoDiv.classList.add("top-info");

    // 1. Star rating
    const ratingStars = document.createElement("div");
    ratingStars.classList.add("rating-stars");
    for (let i = 1; i <= 5; i++) {
      const starSpan = document.createElement("span");
      starSpan.innerHTML = i <= review.rating ? "&#9733;" : "&#9734;";
      ratingStars.appendChild(starSpan);
    }
    topInfoDiv.appendChild(ratingStars);

    // 2. Reviewer name
    const nameElem = document.createElement("p");
    nameElem.classList.add("review-name");
    nameElem.textContent = review.name || "Anonymous";
    topInfoDiv.appendChild(nameElem);

    // 3. Review title
    const titleElem = document.createElement("h4");
    titleElem.textContent = (review.title && review.title.trim() !== "") ? review.title : "Review";
    topInfoDiv.appendChild(titleElem);

    topContainer.appendChild(topInfoDiv);
    card.appendChild(topContainer);

    // Review comment
    const commentP = document.createElement("p");
    commentP.classList.add("review-text");
    commentP.textContent = `"${review.comment}"`;
    card.appendChild(commentP);

    // Review date
    const dateP = document.createElement("p");
    dateP.classList.add("review-date");
    const reviewDate = new Date(review.date);
    dateP.textContent = `Reviewed on ${reviewDate.toLocaleDateString()}`;
    card.appendChild(dateP);

    return card;
  }

  // Fetch reviews, shuffle them, and display them
  async function displayReviews() {
    reviewsContainer.innerHTML = "";
    const reviews = await fetchReviews();
    if (reviews.length === 0) {
      reviewsContainer.textContent = "No reviews available.";
      return;
    }
    const shuffledReviews = shuffleArray(reviews);
    shuffledReviews.forEach(review => {
      const card = createReviewCard(review);
      reviewsContainer.appendChild(card);
    });
  }

  // On page load, fetch & display
  displayReviews();
});
