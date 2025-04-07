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
    box.className = `message-box ${type}`;
    box.innerText = text;
    box.style.display = "block";
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isStrongPassword(password) {
    return /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password);
  }

  window.signUp = function () {
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();
    const confirmPassword = document
      .getElementById("signup-confirm-password")
      .value.trim();
    const firstName = document.getElementById("signup-firstname").value.trim();
    const lastName = document.getElementById("signup-lastname").value.trim();
    const phone = document.getElementById("signup-phone").value.trim();

    if (
      !email ||
      !password ||
      !confirmPassword ||
      !firstName ||
      !lastName ||
      !phone
    ) {
      showMessage("error", "Please fill all fields.", "signup");
      return;
    }

    if (!isValidEmail(email)) {
      showMessage("error", "Invalid email address.", "signup");
      return;
    }

    if (!isStrongPassword(password)) {
      showMessage(
        "error",
        "Password must be 8+ chars, 1 uppercase, 1 number, 1 special character.",
        "signup"
      );
      return;
    }

    if (password !== confirmPassword) {
      showMessage("error", "Passwords do not match.", "signup");
      return;
    }

    if (localStorage.getItem(email)) {
      showMessage("error", "This email is already registered.", "signup");
      return;
    }

    const user = { firstName, lastName, phone, email, password };
    localStorage.setItem(email, JSON.stringify(user));

    showMessage("success", "Sign Up Successful! Please log in.", "signup");
  };

  window.signIn = function () {
    const email = document.getElementById("signin-email").value.trim();
    const password = document.getElementById("signin-password").value.trim();

    const stored = localStorage.getItem(email);
    if (!stored) {
      showMessage("error", "Account not found.", "signin");
      return;
    }

    const user = JSON.parse(stored);
    if (user.password !== password) {
      showMessage("error", "Incorrect password.", "signin");
      return;
    }

    localStorage.setItem("current-user", email);
    showMessage("success", "Login successful! Redirecting...", "signin");

    setTimeout(() => {
      window.location.href = "/index.html";
    }, 1500);
  };
});
