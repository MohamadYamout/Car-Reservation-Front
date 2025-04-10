document.getElementById("contactForm").addEventListener("submit", function(e) {
    e.preventDefault();
    alert("Your message has been sent. We will get back to you soon.");
    this.reset();
  });
  