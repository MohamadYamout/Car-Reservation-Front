document.addEventListener("DOMContentLoaded", function () {
    function isValidEmail(email) {
        let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isStrongPassword(password) {
        let passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }

    function signUp() {
        let email = document.getElementById('signup-email').value;
        let password = document.getElementById('signup-password').value;
        let messageBox = document.getElementById('message-box');
        
        if (!email || !password) {
            messageBox.innerText = 'Please fill all fields.';
            return;
        }

        if (!isValidEmail(email)) {
            messageBox.innerText = 'Please enter a valid email address.';
            return;
        }

        if (!isStrongPassword(password)) {
            messageBox.innerText = 'Password must be at least 8 characters long and include at least 1 uppercase letter, 1 number, and 1 special character.';
            return;
        }

        localStorage.setItem(email, password);
        messageBox.innerText = 'Sign Up Successful! Please Log In.';
    }

    function signIn() {
        let email = document.getElementById('signin-email').value;
        let password = document.getElementById('signin-password').value;
        let messageBox = document.getElementById('message-box');
        
        if (localStorage.getItem(email) === password) {
            localStorage.setItem('current-user', email);
            messageBox.innerText = 'Login Successful! Redirecting...';
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1500);
        } else {
            messageBox.innerText = 'Invalid Credentials!';
        }
    }

    window.signUp = signUp;
    window.signIn = signIn;
});