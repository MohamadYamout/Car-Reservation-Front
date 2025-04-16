document.addEventListener("DOMContentLoaded", function () {
  const stars = document.querySelectorAll(".star");
  const ratingInput = document.getElementById("rating");
  const form = document.getElementById("review-form");
  const messageDiv = document.getElementById("message");

  function setStars(rating) {
    stars.forEach((star) => {
      const starValue = parseInt(star.getAttribute("data-value"), 10);
      star.classList.remove("fas", "far");
      star.classList.add(starValue <= rating ? "fas" : "far");
    });
  }

  stars.forEach((star) => {
    star.addEventListener("click", function () {
      const selectedRating = parseInt(this.getAttribute("data-value"), 10);
      ratingInput.value = selectedRating;
      setStars(selectedRating);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const rating = parseInt(ratingInput.value, 10);
    const title = document.getElementById("title").value.trim();
    const comment = document.getElementById("comment").value.trim();

    if (!rating) {
      messageDiv.textContent = "Please select a rating.";
      messageDiv.className = "error";
      return;
    }

    if (!title) {
      messageDiv.textContent = "Please enter a review title.";
      messageDiv.className = "error";
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      messageDiv.textContent = "You must be logged in to submit a review.";
      messageDiv.className = "error";
      return;
    }

    const reviewData = { rating, title, comment };

    fetch("http://localhost:5000/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reviewData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          messageDiv.textContent = "Error: " + data.error;
          messageDiv.className = "error";
        } else {
          messageDiv.textContent = "Review submitted successfully!";
          messageDiv.className = "success";
          form.reset();
          setStars(0);
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        messageDiv.textContent =
          "An error occurred while submitting your review.";
        messageDiv.className = "error";
      });
  });
});
