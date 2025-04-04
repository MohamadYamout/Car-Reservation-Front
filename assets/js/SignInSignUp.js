document.addEventListener("DOMContentLoaded", function () {
  let isSignUpVisible = true;

  const signUpForm = document.getElementById("signup-form");
  const signInForm = document.getElementById("signin-form");
  const switchLink = document.getElementById("switch-link");
  const toggleText = document.getElementById("toggle-text");
  const messageBox = document.getElementById("message-box");

  switchLink.addEventListener("click", function (e) {
    e.preventDefault();
    isSignUpVisible = !isSignUpVisible;

    if (isSignUpVisible) {
      signUpForm.classList.remove("hidden");
      signInForm.classList.add("hidden");
      switchLink.textContent = "Sign In";
      toggleText.textContent = "Already have an account? ";
    } else {
      signUpForm.classList.add("hidden");
      signInForm.classList.remove("hidden");
      switchLink.textContent = "Sign Up";
      toggleText.textContent = "Don't have an account? ";
    }

    messageBox.innerText = "";
    messageBox.className = "";
  });

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
      messageBox.className = "error";
      messageBox.innerText = "Please fill all fields.";
      return;
    }

    if (!isValidEmail(email)) {
      messageBox.className = "error";
      messageBox.innerText = "Invalid email address.";
      return;
    }

    if (!isStrongPassword(password)) {
      messageBox.className = "error";
      messageBox.innerText =
        "Password must be 8+ chars, 1 uppercase, 1 number, 1 special character.";
      return;
    }

    if (password !== confirmPassword) {
      messageBox.className = "error";
      messageBox.innerText = "Passwords do not match.";
      return;
    }

    if (localStorage.getItem(email)) {
      messageBox.className = "error";
      messageBox.innerText = "This email is already registered.";
      return;
    }

    const user = { firstName, lastName, phone, email, password };
    localStorage.setItem(email, JSON.stringify(user));

    messageBox.className = "success";
    messageBox.innerText = "Sign Up Successful! Please log in.";
  };

  window.signIn = function () {
    const email = document.getElementById("signin-email").value.trim();
    const password = document.getElementById("signin-password").value.trim();

    const stored = localStorage.getItem(email);
    if (!stored) {
      messageBox.className = "error";
      messageBox.innerText = "Account not found.";
      return;
    }

    const user = JSON.parse(stored);
    if (user.password !== password) {
      messageBox.className = "error";
      messageBox.innerText = "Incorrect password.";
      return;
    }

    localStorage.setItem("current-user", email);
    messageBox.className = "success";
    messageBox.innerText = "Login successful! Redirecting...";
    setTimeout(() => {
      window.location.href = "/index.html";
    }, 1500);
  };
});
