document.addEventListener("DOMContentLoaded", function () {
  // Fetch random reviews from the backend.
  fetch("http://localhost:5000/api/reviews/random")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((reviews) => {
      const testimonialsContainer = document.querySelector(".testimonial-grid");
      if (!testimonialsContainer) {
        console.error("Could not find element with class 'testimonial-grid'");
        return;
      }
      testimonialsContainer.innerHTML = "";

      if (!reviews.length) {
        testimonialsContainer.innerHTML = "<p>No reviews available.</p>";
        return;
      }

      reviews.forEach((review) => {
        const card = document.createElement("div");
        card.classList.add("testimonial-card");

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

        const detailsDiv = document.createElement("div");
        detailsDiv.classList.add("name-rating-container");

        const nameHeading = document.createElement("h4");
        nameHeading.classList.add("review-name");
        nameHeading.textContent = review.name || "Anonymous";

        const ratingStarsContainer = document.createElement("div");
        ratingStarsContainer.classList.add("rating-stars");
        for (let i = 1; i <= 5; i++) {
          const star = document.createElement("i");
          if (i <= review.rating) {
            star.className = "fas fa-star";
          } else {
            star.className = "far fa-star";
          }
          ratingStarsContainer.appendChild(star);
        }

        detailsDiv.appendChild(nameHeading);
        detailsDiv.appendChild(ratingStarsContainer);
        topContainer.appendChild(detailsDiv);
        card.appendChild(topContainer);

        if (review.title && review.title.trim() !== "") {
          const reviewTitle = document.createElement("h5");
          reviewTitle.classList.add("review-title");
          reviewTitle.textContent = review.title;
          card.appendChild(reviewTitle);
        }

        const reviewText = document.createElement("p");
        reviewText.classList.add("testimonial-text");
        reviewText.textContent = `"${review.comment}"`;
        card.appendChild(reviewText);

        const reviewDate = new Date(review.date);
        const formattedDate = reviewDate.toLocaleDateString();
        const dateParagraph = document.createElement("p");
        dateParagraph.classList.add("review-date");
        dateParagraph.textContent = `Reviewed on ${formattedDate}`;
        card.appendChild(dateParagraph);

        testimonialsContainer.appendChild(card);
      });
    })
    .catch((error) => {
      console.error("Error fetching reviews:", error);
    });
});
