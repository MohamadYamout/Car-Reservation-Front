// Contact form email functionality
function sendEmail(event) {
  event.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const subject = document.getElementById('subject').value;
  const message = document.getElementById('message').value;
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address');
    return false;
  }
  
  // Construct email body
  let emailBody = `Name: ${name}%0D%0A`;
  emailBody += `Email: ${email}%0D%0A`;
  if (phone) emailBody += `Phone: ${phone}%0D%0A`;
  emailBody += `%0D%0A${message}`;
  
  // Create mailto link and open it
  const mailtoLink = `mailto:mohamadyamout2004@gmail.com?subject=${encodeURIComponent(subject)}&body=${emailBody}`;
  window.location.href = mailtoLink;
  
  // Reset form after sending
  document.getElementById('contactForm').reset();
  
  // Show success message
  document.getElementById('successMessage').style.display = 'block';
  
  // Hide success message after 5 seconds
  setTimeout(() => {
    document.getElementById('successMessage').style.display = 'none';
  }, 5000);
  
  return false;
}

// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('.menu-btn').addEventListener('click', function() {
    document.querySelector('.nav-links').classList.toggle('active');
  });
});
  