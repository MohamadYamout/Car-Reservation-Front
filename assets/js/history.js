// Mobile menu toggle
document.querySelector('.menu-btn').addEventListener('click', function() {
    document.querySelector('.nav-links').classList.toggle('active');
});

// Function to download invoice
function downloadInvoice(invoiceId) {
    // This is a placeholder function - implement actual invoice download logic
    alert('Downloading invoice: ' + invoiceId);
}

// Function to format date
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(new Date(date));
}

// Function to create a booking card
function createBookingCard(booking) {
    const card = document.createElement('div');
    card.className = 'booking-card';
    
    card.innerHTML = `
        <div class="booking-date">Booked on: ${formatDate(booking.bookingDate)}</div>
        <div class="car-details">
            <h3>${booking.carModel}</h3>
            <p>Rental Period: ${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}</p>
        </div>
        <span class="booking-status status-${booking.status.toLowerCase()}">${booking.status}</span>
        <div class="booking-actions">
            <span class="booking-price">$${booking.price.toFixed(2)}</span>
            <a href="#" class="btn-invoice" onclick="downloadInvoice('${booking.invoiceId}')">Download Invoice</a>
        </div>
    `;
    
    return card;
}

// Function to fetch and display booking history
async function loadBookingHistory() {
    try {
        // This is where you would typically fetch the booking history from your backend
        // For now, we'll use sample data
        const sampleBookings = [
            {
                bookingDate: '2024-04-05',
                carModel: 'Tesla Model 3',
                startDate: '2024-04-10',
                endDate: '2024-04-15',
                status: 'Active',
                price: 450.00,
                invoiceId: 'INV-2024-001'
            },
            {
                bookingDate: '2024-03-15',
                carModel: 'BMW 3 Series',
                startDate: '2024-03-20',
                endDate: '2024-03-25',
                status: 'Completed',
                price: 575.00,
                invoiceId: 'INV-2024-002'
            },
            {
                bookingDate: '2024-02-28',
                carModel: 'Mercedes-Benz C-Class',
                startDate: '2024-03-01',
                endDate: '2024-03-03',
                status: 'Cancelled',
                price: 320.00,
                invoiceId: 'INV-2024-003'
            }
        ];

        const bookingGrid = document.getElementById('bookingGrid');
        const noBookings = document.getElementById('noBookings');

        // Clear existing content
        bookingGrid.innerHTML = '';

        if (sampleBookings.length === 0) {
            noBookings.style.display = 'block';
            bookingGrid.style.display = 'none';
        } else {
            noBookings.style.display = 'none';
            bookingGrid.style.display = 'grid';
            
            // Add booking cards
            sampleBookings.forEach(booking => {
                bookingGrid.appendChild(createBookingCard(booking));
            });
        }
    } catch (error) {
        console.error('Error loading booking history:', error);
        // Show error message to user
        const bookingGrid = document.getElementById('bookingGrid');
        bookingGrid.innerHTML = `
            <div class="no-bookings">
                <h3>Error Loading Bookings</h3>
                <p>There was an error loading your booking history. Please try again later.</p>
            </div>
        `;
    }
}

// Load booking history when the page loads
document.addEventListener('DOMContentLoaded', loadBookingHistory); 