// Check if user is logged in and is admin
document.addEventListener('DOMContentLoaded', () => {
    const adminNavItem = document.getElementById('adminNavItem');
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    
    // Remove any standalone isAdmin keys that might exist
    localStorage.removeItem('isAdmin');
    
    let user = JSON.parse(localStorage.getItem('user'));
    
    if (token) {
        // Get admin status from token
        const isAdmin = parseJwtForAdmin(token);
        
        // Update user object with admin status from token
        if (user) {
            user.isAdmin = isAdmin;
            localStorage.setItem('user', JSON.stringify(user));
        }
        
        // Show admin link if needed
        if (isAdmin && adminNavItem) {
            adminNavItem.style.display = 'block';
        }
    }
    
    // Fetch latest user data from the server if logged in
    if (token && user) {
        fetch("http://localhost:5000/api/auth/profile", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (!data.error) {
                // Remove any standalone isAdmin keys again (in case they were created)
                localStorage.removeItem('isAdmin');
                
                // Get existing isAdmin value
                const currentIsAdmin = user ? user.isAdmin : false;
                
                // Only use data.isAdmin if it's explicitly defined
                const isAdmin = data.isAdmin === true || data.isAdmin === false ? data.isAdmin : currentIsAdmin;
                
                // Update localStorage with latest user data
                const updatedUser = { ...data, isAdmin };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                // Show admin link if needed
                if (isAdmin) {
                    adminNavItem.style.display = 'block';
                }
            }
        })
        .catch(err => console.error("Error fetching user profile:", err));
    }
    
    // Mobile menu toggle
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
    
    // Close menu when clicking on a link
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // Logout functionality
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.clear(); // Clear all localStorage data
            window.location.href = '../index.html';
        });
    }
});

// JWT parser function for main.js
function parseJwtForAdmin(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const payload = JSON.parse(jsonPayload);
        return payload.isAdmin === true;
    } catch (error) {
        console.error('Error parsing JWT token:', error);
        return false;
    }
}