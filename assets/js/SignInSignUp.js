document.addEventListener("DOMContentLoaded", function () {
  let isSignUpVisible = true;

  const signUpForm = document.getElementById("signup-form");
  const signInForm = document.getElementById("signin-form");
  const switchLink = document.getElementById("switch-link");
  const toggleText = document.getElementById("toggle-text");
  const signupMessageBox = document.getElementById("signup-message-box");
  const signinMessageBox = document.getElementById("signin-message-box");

  // Toggle between forms
  switchLink.addEventListener("click", function (e) {
    e.preventDefault();
    isSignUpVisible = !isSignUpVisible;

    signUpForm.classList.toggle("hidden", !isSignUpVisible);
    signInForm.classList.toggle("hidden", isSignUpVisible);

    switchLink.textContent = isSignUpVisible ? "Sign In" : "Sign Up";
    toggleText.textContent = isSignUpVisible
      ? "Already have an account? "
      : "Don't have an account? ";

    // Clear messages on switch
    signupMessageBox.className = "message-box";
    signupMessageBox.style.display = "none";
    signupMessageBox.innerText = "";

    signinMessageBox.className = "message-box";
    signinMessageBox.style.display = "none";
    signinMessageBox.innerText = "";
  });

  // Message display function
  function showMessage(type, text, context) {
    const box = context === "signup" ? signupMessageBox : signinMessageBox;
    box.className = `message-box ${type}`; // e.g. "message-box error"
    box.innerText = text;
    box.style.display = "block";
  }

  // Email validation using regex
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Check password strength (8+ characters, with at least one uppercase, one number, and one special character)
  function isStrongPassword(password) {
    return /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password);
  }

  // Sign Up: Use backend API (POST /api/auth/signup)
  window.signUp = function () {
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();
    const confirmPassword = document.getElementById("signup-confirm-password").value.trim();
    const firstName = document.getElementById("signup-firstname").value.trim();
    const lastName = document.getElementById("signup-lastname").value.trim();
    const phone = document.getElementById("signup-phone").value.trim(); // Capture phone number

    if (!email || !password || !confirmPassword || !firstName || !lastName || !phone) {
      showMessage("error", "Please fill all fields.", "signup");
      return;
    }

    if (!isValidEmail(email)) {
      showMessage("error", "Invalid email address.", "signup");
      return;
    }

    if (!isStrongPassword(password)) {
      showMessage("error", "Password must be 8+ chars, 1 uppercase, 1 number, 1 special character.", "signup");
      return;
    }

    if (password !== confirmPassword) {
      showMessage("error", "Passwords do not match.", "signup");
      return;
    }

    // Prepare data payload including phone number
    const payload = {
      username: `${firstName} ${lastName}`,
      email,
      password,
      phone
    };

    fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          showMessage("error", data.error || "Signup failed", "signup");
        } else {
          showMessage("success", "Sign Up Successful! Please log in.", "signup");
          // Switch to sign in form after successful signup
          setTimeout(() => {
            switchLink.click();
          }, 1500);
        }
      })
      .catch((err) => {
        console.error("Signup error:", err);
        showMessage("error", "Signup failed. Please try again later.", "signup");
      });
  };

  // Sign In: Use backend API (POST /api/auth/login)
  window.signIn = function () {
    const email = document.getElementById("signin-email").value.trim();
    const password = document.getElementById("signin-password").value.trim();

    if (!email || !password) {
      showMessage("error", "Please fill in both email and password.", "signin");
      return;
    }

    fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          showMessage("error", data.error || "Login failed", "signin");
        } else {
          // Save the token and user details for further authenticated requests
          localStorage.setItem("token", data.token);
          localStorage.setItem("current-user", JSON.stringify(data.user));
          showMessage("success", "Login successful! Redirecting...", "signin");
          setTimeout(() => {
            window.location.href = "../index.html"; // Adjust if your home page path is different
          }, 1500);
        }
      })
      .catch((err) => {
        console.error("Login error:", err);
        showMessage("error", "Login failed. Please try again later.", "signin");
      });
  };
});


