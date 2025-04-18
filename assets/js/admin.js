// Base URL for API
const API_URL = 'http://localhost:5000/api/admin';
let token;

// DOM Elements
const adminUsername = document.getElementById('adminUsername');
const logoutButton = document.getElementById('logoutButton');
const totalUsers = document.getElementById('totalUsers');
const totalCars = document.getElementById('totalCars');
const totalReservations = document.getElementById('totalReservations');

// Tables
const userTableBody = document.getElementById('userTableBody');
const carTableBody = document.getElementById('carTableBody');
const groupTableBody = document.getElementById('groupTableBody');
const reservationTableBody = document.getElementById('reservationTableBody');
const pointsTableBody = document.getElementById('pointsTableBody');

// Buttons
const saveUserBtn = document.getElementById('saveUserBtn');
const updateUserBtn = document.getElementById('updateUserBtn');
const saveCarBtn = document.getElementById('saveCarBtn');
const updateCarBtn = document.getElementById('updateCarBtn');
const addGroupBtn = document.getElementById('addGroupBtn');
const updateReservationBtn = document.getElementById('updateReservationBtn');
const editReservationBtn = document.getElementById('editReservationBtn');

// Check if user is logged in and is admin
document.addEventListener('DOMContentLoaded', () => {
    // Get token from localStorage
    token = localStorage.getItem('token');
    
    // Remove any standalone isAdmin keys that might exist
    localStorage.removeItem('isAdmin');
    
    // Check if token exists
    if (!token) {
        window.location.href = '../pages/SignInSignUp.html';
        return;
    }
    
    // Decode token to verify admin status
    const tokenPayload = parseJwt(token);
    const isAdminFromToken = tokenPayload.isAdmin === true;
    
    if (!isAdminFromToken) {
        window.location.href = '../pages/SignInSignUp.html';
        return;
    }
    
    // Get user data for display
    const user = JSON.parse(localStorage.getItem('user')) || {};
    adminUsername.textContent = user.username || 'Admin';
    
    // Refresh user data from server
    refreshCurrentUserData();
    
    // Initialize dashboard
    loadDashboard();
    
    // Initialize event listeners
    initEventListeners();
});

// Logout function
logoutButton.addEventListener('click', () => {
    localStorage.clear(); // Clear all localStorage data
    window.location.href = '../index.html';
});

// Initialize event listeners
function initEventListeners() {
    // User management
    saveUserBtn.addEventListener('click', saveUser);
    updateUserBtn.addEventListener('click', updateUser);
    
    // Car management
    saveCarBtn.addEventListener('click', saveCar);
    updateCarBtn.addEventListener('click', updateCar);
    
    // Car group management
    addGroupBtn.addEventListener('click', showAddGroupPrompt);
    
    // Reservation management
    updateReservationBtn.addEventListener('click', updateReservation);
    editReservationBtn.addEventListener('click', showEditReservationModal);
    
    // Tab change listeners
    document.querySelectorAll('.nav-link').forEach(tab => {
        tab.addEventListener('click', function(e) {
            const tabId = this.getAttribute('href').substring(1);
            
            // Load data based on selected tab
            switch (tabId) {
                case 'users':
                    loadUsers();
                    break;
                case 'cars':
                    loadCars();
                    loadCarGroups('carGroup'); // For dropdown in add car modal
                    break;
                case 'cargroups':
                    loadCarGroupsTable();
                    break;
                case 'reservations':
                    loadReservations();
                    break;
                case 'points':
                    loadPoints();
                    break;
            }
        });
    });
}

// API Helper Function
async function fetchAPI(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    try {
        // Fix URL construction to handle endpoints with or without leading slash
        const url = endpoint.startsWith('/') 
            ? `${API_URL}${endpoint}` 
            : `${API_URL}/${endpoint}`;
        
        const response = await fetch(url, options);
        
        // Check if response is ok before trying to parse JSON
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server returned ${response.status}: ${errorText.substring(0, 100)}`);
        }
        
        // Try to parse JSON response
        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            throw new Error('Invalid response format from server');
        }
        
        return data;
    } catch (error) {
        showAlert(error.message, 'danger');
        return null;
    }
}

// Alert Helper
function showAlert(message, type = 'success', timeout = 3000) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.querySelector('.admin-content').prepend(alertDiv);
    
    if (timeout) {
        setTimeout(() => {
            alertDiv.remove();
        }, timeout);
    }
}

// Dashboard
async function loadDashboard() {
    try {
        const users = await fetchAPI('users');
        const cars = await fetchAPI('cars');
        const reservations = await fetchAPI('reservations');
        
        if (users) totalUsers.textContent = users.length;
        if (cars) totalCars.textContent = cars.length;
        if (reservations) totalReservations.textContent = reservations.length;
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// =============== USER MANAGEMENT ===============
async function loadUsers() {
    try {
        const users = await fetchAPI('users');
        
        if (!users) return;
        
        userTableBody.innerHTML = '';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.phone || 'N/A'}</td>
                <td>${user.isAdmin ? 'Yes' : 'No'}</td>
                <td>${user.points || 0}</td>
                <td>
                    <button class="btn btn-sm btn-primary edit-user-btn" data-id="${user._id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-user-btn" data-id="${user._id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            userTableBody.appendChild(row);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('.edit-user-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const userId = btn.getAttribute('data-id');
                loadUserForEdit(userId);
            });
        });
        
        document.querySelectorAll('.delete-user-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const userId = btn.getAttribute('data-id');
                deleteUser(userId);
            });
        });
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function saveUser() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const isAdmin = document.getElementById('isAdmin').checked;
    
    try {
        await fetchAPI('users', 'POST', {
            username,
            email,
            phone,
            password,
            isAdmin
        });
        
        showAlert('User created successfully');
        loadUsers();
        
        // Reset form and close modal
        document.getElementById('addUserForm').reset();
        bootstrap.Modal.getInstance(document.getElementById('addUserModal')).hide();
    } catch (error) {
        console.error('Error creating user:', error);
    }
}

async function loadUserForEdit(userId) {
    try {
        const user = await fetchAPI(`users/${userId}`);
        
        if (!user) return;
        
        document.getElementById('editUserId').value = user._id;
        document.getElementById('editUsername').value = user.username;
        document.getElementById('editEmail').value = user.email;
        document.getElementById('editPhone').value = user.phone || '';
        document.getElementById('editPoints').value = user.points || 0;
        document.getElementById('editIsAdmin').checked = user.isAdmin;
        
        // Show modal
        new bootstrap.Modal(document.getElementById('editUserModal')).show();
    } catch (error) {
        console.error('Error loading user for edit:', error);
    }
}

async function updateUser() {
    const userId = document.getElementById('editUserId').value;
    const username = document.getElementById('editUsername').value;
    const email = document.getElementById('editEmail').value;
    const phone = document.getElementById('editPhone').value;
    const points = document.getElementById('editPoints').value;
    const isAdmin = document.getElementById('editIsAdmin').checked;
    
    try {
        await fetchAPI(`users/${userId}`, 'PUT', {
            username,
            email,
            phone,
            points,
            isAdmin
        });
        
        showAlert('User updated successfully');
        loadUsers();
        
        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('editUserModal')).hide();
    } catch (error) {
        console.error('Error updating user:', error);
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }
    
    try {
        await fetchAPI(`users/${userId}`, 'DELETE');
        
        showAlert('User deleted successfully');
        loadUsers();
    } catch (error) {
        console.error('Error deleting user:', error);
    }
}

// =============== CAR MANAGEMENT ===============
async function loadCars() {
    try {
        const cars = await fetchAPI('cars');
        
        if (!cars) return;
        
        carTableBody.innerHTML = '';
        
        cars.forEach(car => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${car.brand}</td>
                <td>${car.model}</td>
                <td>${car.group}</td>
                <td>${car.engineSize}</td>
                <td>${car.fuelType}</td>
                <td>$${car.dailyPrice}</td>
                <td>
                    <button class="btn btn-sm btn-primary edit-car-btn" data-id="${car._id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-car-btn" data-id="${car._id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            carTableBody.appendChild(row);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('.edit-car-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const carId = btn.getAttribute('data-id');
                loadCarForEdit(carId);
            });
        });
        
        document.querySelectorAll('.delete-car-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const carId = btn.getAttribute('data-id');
                deleteCar(carId);
            });
        });
    } catch (error) {
        console.error('Error loading cars:', error);
    }
}

async function loadCarGroups(selectId, selectedValue = '') {
    try {
        const groups = await fetchAPI('car-groups');
        
        if (!groups) return;
        
        const select = document.getElementById(selectId);
        
        // Keep the first option and remove the rest
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // Add options
        groups.forEach(group => {
            const option = document.createElement('option');
            option.value = group;
            option.textContent = group;
            if (group === selectedValue) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading car groups:', error);
    }
}

async function saveCar() {
    const brand = document.getElementById('carBrand').value;
    const model = document.getElementById('carModel').value;
    const group = document.getElementById('carGroup').value;
    const engineSize = document.getElementById('engineSize').value;
    const doors = document.getElementById('doors').value;
    const passengers = document.getElementById('passengers').value;
    const fuelType = document.getElementById('fuelType').value;
    const gearbox = document.getElementById('gearbox').value;
    const hasAC = document.getElementById('hasAC').checked;
    const electricWindows = document.getElementById('electricWindows').checked;
    const image = document.getElementById('carImage').value;
    const dailyPrice = document.getElementById('dailyPrice').value;
    
    try {
        await fetchAPI('cars', 'POST', {
            brand,
            model,
            group,
            engineSize,
            doors,
            passengers,
            fuelType,
            gearbox,
            hasAC,
            electricWindows,
            image,
            dailyPrice
        });
        
        showAlert('Car created successfully');
        loadCars();
        
        // Reset form and close modal
        document.getElementById('addCarForm').reset();
        bootstrap.Modal.getInstance(document.getElementById('addCarModal')).hide();
    } catch (error) {
        console.error('Error creating car:', error);
    }
}

async function loadCarForEdit(carId) {
    try {
        const car = await fetchAPI(`cars/${carId}`);
        
        if (!car) return;
        
        document.getElementById('editCarId').value = car._id;
        document.getElementById('editCarBrand').value = car.brand;
        document.getElementById('editCarModel').value = car.model;
        
        // Load car groups for the dropdown
        await loadCarGroups('editCarGroup', car.group);
        
        document.getElementById('editEngineSize').value = car.engineSize;
        document.getElementById('editDoors').value = car.doors;
        document.getElementById('editPassengers').value = car.passengers;
        document.getElementById('editFuelType').value = car.fuelType;
        document.getElementById('editGearbox').value = car.gearbox;
        document.getElementById('editHasAC').checked = car.hasAC;
        document.getElementById('editElectricWindows').checked = car.electricWindows;
        document.getElementById('editCarImage').value = car.image;
        document.getElementById('editDailyPrice').value = car.dailyPrice;
        
        // Show modal
        new bootstrap.Modal(document.getElementById('editCarModal')).show();
    } catch (error) {
        console.error('Error loading car for edit:', error);
    }
}

async function updateCar() {
    const carId = document.getElementById('editCarId').value;
    const brand = document.getElementById('editCarBrand').value;
    const model = document.getElementById('editCarModel').value;
    const group = document.getElementById('editCarGroup').value;
    const engineSize = document.getElementById('editEngineSize').value;
    const doors = document.getElementById('editDoors').value;
    const passengers = document.getElementById('editPassengers').value;
    const fuelType = document.getElementById('editFuelType').value;
    const gearbox = document.getElementById('editGearbox').value;
    const hasAC = document.getElementById('editHasAC').checked;
    const electricWindows = document.getElementById('editElectricWindows').checked;
    const image = document.getElementById('editCarImage').value;
    const dailyPrice = document.getElementById('editDailyPrice').value;
    
    try {
        await fetchAPI(`cars/${carId}`, 'PUT', {
            brand,
            model,
            group,
            engineSize,
            doors,
            passengers,
            fuelType,
            gearbox,
            hasAC,
            electricWindows,
            image,
            dailyPrice
        });
        
        showAlert('Car updated successfully');
        loadCars();
        
        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('editCarModal')).hide();
    } catch (error) {
        console.error('Error updating car:', error);
    }
}

async function deleteCar(carId) {
    if (!confirm('Are you sure you want to delete this car?')) {
        return;
    }
    
    try {
        await fetchAPI(`cars/${carId}`, 'DELETE');
        
        showAlert('Car deleted successfully');
        loadCars();
    } catch (error) {
        console.error('Error deleting car:', error);
    }
}

// =============== CAR GROUPS MANAGEMENT ===============
async function loadCarGroupsTable() {
    try {
        const groups = await fetchAPI('car-groups');
        const cars = await fetchAPI('cars');
        
        if (!groups || !cars) return;
        
        // Count cars in each group
        const groupCounts = {};
        groups.forEach(group => {
            groupCounts[group] = cars.filter(car => car.group === group).length;
        });
        
        groupTableBody.innerHTML = '';
        
        groups.forEach(group => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${group}</td>
                <td>${groupCounts[group]}</td>
                <td>
                    <button class="btn btn-sm btn-danger delete-group-btn" data-group="${group}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            groupTableBody.appendChild(row);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('.delete-group-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const group = btn.getAttribute('data-group');
                deleteCarGroup(group, groupCounts[group]);
            });
        });
    } catch (error) {
        console.error('Error loading car groups:', error);
    }
}

function showAddGroupPrompt() {
    const groupName = prompt('Enter new car group name:');
    
    if (!groupName) return;
    
    // Add the new group by creating a car with the new group
    addCarGroup(groupName);
}

async function addCarGroup(groupName) {
    try {
        // Here we just create a placeholder car to establish the new group
        // In a real API you might have a dedicated endpoint for car groups
        await fetchAPI('cars', 'POST', {
            brand: 'Placeholder',
            model: 'Placeholder',
            group: groupName,
            engineSize: '1.0',
            doors: 2,
            passengers: 2,
            fuelType: 'Petrol',
            gearbox: 'Manual',
            hasAC: true,
            electricWindows: true,
            image: 'placeholder.jpg',
            dailyPrice: 0
        });
        
        showAlert(`Car group "${groupName}" created successfully`);
        loadCarGroupsTable();
    } catch (error) {
        console.error('Error creating car group:', error);
    }
}

async function deleteCarGroup(group, carsCount) {
    if (carsCount > 0) {
        alert(`Cannot delete group "${group}" because it contains ${carsCount} cars. Remove all cars from this group first.`);
        return;
    }
    
    if (!confirm(`Are you sure you want to delete the car group "${group}"?`)) {
        return;
    }
    
    try {
        // In a real API, you would have a dedicated endpoint for deleting car groups
        // Here we just update UI since we're using a workaround
        showAlert(`Car group "${group}" deleted successfully`);
        loadCarGroupsTable();
    } catch (error) {
        console.error('Error deleting car group:', error);
    }
}

// =============== RESERVATION MANAGEMENT ===============
async function loadReservations() {
    try {
        const reservations = await fetchAPI('reservations');
        
        if (!reservations) return;
        
        reservationTableBody.innerHTML = '';
        
        reservations.forEach(reservation => {
            const pickupDate = new Date(reservation.pickupDateTime).toLocaleDateString();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${reservation._id}</td>
                <td>${reservation.userId.username}</td>
                <td>${reservation.cars.length} car(s)</td>
                <td>${reservation.pickupLocation}</td>
                <td>${pickupDate}</td>
                <td>
                    <button type="button" class="btn btn-sm btn-info" onclick="viewReservationDetails('${reservation._id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            reservationTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading reservations:', error);
    }
}


async function viewReservationDetails(reservationId) {
    try {
        const reservation = await fetchAPI(`reservations/${reservationId}`);
        
        if (!reservation) return;
        
        // Store the current reservation for editing
        currentReservation = reservation;
        
        const pickupDate = new Date(reservation.pickupDateTime).toLocaleString();
        const dropoffDate = new Date(reservation.dropoffDateTime).toLocaleString();
        
        const content = document.getElementById('reservationDetailContent');
        content.innerHTML = `
            <div class="mb-4">
                <h6>Reservation ID</h6>
                <p>${reservation._id}</p>
            </div>
            <div class="mb-4">
                <h6>User Information</h6>
                <p>
                    <strong>Name:</strong> ${reservation.userId.username}<br>
                    <strong>Email:</strong> ${reservation.userId.email}<br>
                    <strong>Phone:</strong> ${reservation.userId.phone || 'N/A'}
                </p>
            </div>
            <div class="mb-4">
                <h6>Driver Information</h6>
                <p>
                    <strong>Name:</strong> ${reservation.driverName}<br>
                    <strong>Age:</strong> ${reservation.driverAge}
                </p>
            </div>
            <div class="mb-4">
                <h6>Reservation Details</h6>
                <p>
                    <strong>Pickup:</strong> ${reservation.pickupLocation} (${pickupDate})<br>
                    <strong>Dropoff:</strong> ${reservation.dropoffLocation} (${dropoffDate})<br>
                </p>
            </div>
            <div class="mb-4">
                <h6>Cars (${reservation.cars.length})</h6>
                <ul class="list-group">
                    ${reservation.cars.map(car => `
                        <li class="list-group-item">
                            ${car.carId.brand} ${car.carId.model} (${car.carId.group})
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
        
        // Show modal
        new bootstrap.Modal(document.getElementById('reservationDetailModal')).show();
    } catch (error) {
        console.error('Error loading reservation details:', error);
    }
}

// Variable to store the current reservation being edited
let currentReservation = null;

function showEditReservationModal() {
    if (!currentReservation) return;
    
    // Fill form with current reservation data
    document.getElementById('editReservationId').value = currentReservation._id;
    document.getElementById('editPickupLocation').value = currentReservation.pickupLocation;
    document.getElementById('editDropoffLocation').value = currentReservation.dropoffLocation;
    document.getElementById('editDriverName').value = currentReservation.driverName;
    document.getElementById('editDriverAge').value = currentReservation.driverAge;
    
    // Format datetime for input elements
    const pickupDateTime = new Date(currentReservation.pickupDateTime);
    const dropoffDateTime = new Date(currentReservation.dropoffDateTime);
    
    document.getElementById('editPickupDateTime').value = formatDateTimeForInput(pickupDateTime);
    document.getElementById('editDropoffDateTime').value = formatDateTimeForInput(dropoffDateTime);
    
    // Hide detail modal and show edit modal
    bootstrap.Modal.getInstance(document.getElementById('reservationDetailModal')).hide();
    new bootstrap.Modal(document.getElementById('editReservationModal')).show();
}

function formatDateTimeForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

async function updateReservation() {
    const reservationId = document.getElementById('editReservationId').value;
    const pickupLocation = document.getElementById('editPickupLocation').value;
    const dropoffLocation = document.getElementById('editDropoffLocation').value;
    const driverName = document.getElementById('editDriverName').value;
    const driverAge = document.getElementById('editDriverAge').value;
    const pickupDateTime = document.getElementById('editPickupDateTime').value;
    const dropoffDateTime = document.getElementById('editDropoffDateTime').value;
    
    try {
        await fetchAPI(`reservations/${reservationId}`, 'PUT', {
            pickupLocation,
            dropoffLocation,
            driverName,
            driverAge,
            pickupDateTime,
            dropoffDateTime
        });
        
        showAlert('Reservation updated successfully');
        loadReservations();
        
        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('editReservationModal')).hide();
    } catch (error) {
        console.error('Error updating reservation:', error);
    }
}

// =============== POINTS MANAGEMENT ===============
async function loadPoints() {
    try {
        const users = await fetchAPI('points');
        
        if (!users) return;
        
        pointsTableBody.innerHTML = '';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.points || 0}</td>
            `;
            pointsTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading points:', error);
    }
}

// Function to refresh current user data from server
async function refreshCurrentUserData() {
    try {
        // Fetch fresh user data
        const response = await fetch("http://localhost:5000/api/auth/profile", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to refresh user data');
        }
        
        const data = await response.json();
        
        if (!data.error) {
            // Decode token to get admin status
            const tokenPayload = parseJwt(token);
            const isAdminFromToken = tokenPayload.isAdmin === true;
            
            // Update localStorage with latest user data
            const updatedUser = { ...data, isAdmin: isAdminFromToken };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Update username display
            if (adminUsername) {
                adminUsername.textContent = updatedUser.username;
            }
        }
    } catch (error) {
        console.error('Error refreshing user data:', error);
    }
}

// Function to decode JWT token
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error parsing JWT token:', error);
        return {};
    }
}