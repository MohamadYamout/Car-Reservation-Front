document.addEventListener("DOMContentLoaded", async function () {
  const reviewsContainer = document.getElementById("reviewsContainer");
  async function fetchReviews() {
    try {
      const response = await fetch(
        "http://localhost:5000/api/reviews?all=true"
      );
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

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  function createReviewCard(review) {
    const card = document.createElement("div");
    card.classList.add("review-card");

    const topContainer = document.createElement("div");
    topContainer.classList.add("top-container");

    const avatarDiv = document.createElement("div");
    avatarDiv.classList.add("author-avatar");
    if (review.profilePic && review.profilePic.trim() !== "") {
      const img = document.createElement("img");
      img.src = review.profilePic;
      img.alt = review.name;
      avatarDiv.appendChild(img);
    } else {
      avatarDiv.textContent = review.name
        ? review.name.charAt(0).toUpperCase()
        : "";
    }
    topContainer.appendChild(avatarDiv);

    const topInfoDiv = document.createElement("div");
    topInfoDiv.classList.add("top-info");

    // ⭐ Font Awesome star rendering
    const ratingStars = document.createElement("div");
    ratingStars.classList.add("rating-stars");
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement("i");
      star.className = i <= review.rating ? "fas fa-star" : "far fa-star";
      ratingStars.appendChild(star);
    }
    topInfoDiv.appendChild(ratingStars);

    const nameElem = document.createElement("p");
    nameElem.classList.add("review-name");
    nameElem.textContent = review.name || "Anonymous";
    topInfoDiv.appendChild(nameElem);

    const titleElem = document.createElement("h4");
    titleElem.textContent =
      review.title && review.title.trim() !== "" ? review.title : "Review";
    topInfoDiv.appendChild(titleElem);

    topContainer.appendChild(topInfoDiv);
    card.appendChild(topContainer);

    const commentP = document.createElement("p");
    commentP.classList.add("review-text");
    commentP.textContent = `"${review.comment}"`;
    card.appendChild(commentP);

    const dateP = document.createElement("p");
    dateP.classList.add("review-date");
    const reviewDate = new Date(review.date);
    dateP.textContent = `Reviewed on ${reviewDate.toLocaleDateString()}`;
    card.appendChild(dateP);

    return card;
  }

  async function displayReviews() {
    reviewsContainer.innerHTML = "";
    const reviews = await fetchReviews();
    if (reviews.length === 0) {
      reviewsContainer.textContent = "No reviews available.";
      return;
    }
    const shuffledReviews = shuffleArray(reviews);
    shuffledReviews.forEach((review) => {
      const card = createReviewCard(review);
      reviewsContainer.appendChild(card);
    });
  }

  displayReviews();
});
