// ============================================
// Data Storage Arrays
// ============================================

// Car fleet data
const carFleet = [
    {
        id: 'CAR001',
        name: 'Toyota Camry',
        category: 'economy',
        icon: '🚗',
        seats: 5,
        transmission: 'Auto',
        dailyRate: 45,
        available: true,
        plate: 'ABC-1234'
    },
    {
        id: 'CAR002',
        name: 'Honda Civic',
        category: 'economy',
        icon: '🚗',
        seats: 5,
        transmission: 'Manual',
        dailyRate: 40,
        available: true,
        plate: 'DEF-5678'
    },
    {
        id: 'CAR003',
        name: 'BMW 5 Series',
        category: 'luxury',
        icon: '🚙',
        seats: 5,
        transmission: 'Auto',
        dailyRate: 120,
        available: true,
        plate: 'GHI-9012'
    },
    {
        id: 'CAR004',
        name: 'Mercedes E-Class',
        category: 'luxury',
        icon: '🚙',
        seats: 5,
        transmission: 'Auto',
        dailyRate: 135,
        available: true,
        plate: 'JKL-3456'
    },
    {
        id: 'CAR005',
        name: 'Tesla Model 3',
        category: 'luxury',
        icon: '⚡',
        seats: 5,
        transmission: 'Auto',
        dailyRate: 95,
        available: true,
        plate: 'MNO-7890'
    },
    {
        id: 'CAR006',
        name: 'Toyota RAV4',
        category: 'suv',
        icon: '🚐',
        seats: 7,
        transmission: 'Auto',
        dailyRate: 70,
        available: true,
        plate: 'PQR-2345'
    },
    {
        id: 'CAR007',
        name: 'Ford Explorer',
        category: 'suv',
        icon: '🚐',
        seats: 7,
        transmission: 'Auto',
        dailyRate: 85,
        available: true,
        plate: 'STU-6789'
    },
    {
        id: 'CAR008',
        name: 'Jeep Wrangler',
        category: 'suv',
        icon: '🚙',
        seats: 5,
        transmission: 'Manual',
        dailyRate: 80,
        available: true,
        plate: 'VWX-0123'
    },
    {
        id: 'CAR009',
        name: 'Hyundai Elantra',
        category: 'economy',
        icon: '🚗',
        seats: 5,
        transmission: 'Auto',
        dailyRate: 42,
        available: true,
        plate: 'YZA-4567'
    },
    {
        id: 'CAR010',
        name: 'Audi A6',
        category: 'luxury',
        icon: '🚙',
        seats: 5,
        transmission: 'Auto',
        dailyRate: 125,
        available: true,
        plate: 'BCD-8901'
    }
];

// Data arrays stored in localStorage
let reservations = JSON.parse(localStorage.getItem('azoom_reservations')) || [];
let activeRentals = JSON.parse(localStorage.getItem('azoom_rentals')) || [];
let pendingReturns = JSON.parse(localStorage.getItem('azoom_returns')) || [];
let completedInspections = JSON.parse(localStorage.getItem('azoom_inspections')) || [];

// ============================================
// Utility Functions
// ============================================

function saveData() {
    localStorage.setItem('azoom_reservations', JSON.stringify(reservations));
    localStorage.setItem('azoom_rentals', JSON.stringify(activeRentals));
    localStorage.setItem('azoom_returns', JSON.stringify(pendingReturns));
    localStorage.setItem('azoom_inspections', JSON.stringify(completedInspections));
}

function generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function formatCurrency(amount) {
    return `$${parseFloat(amount).toFixed(2)}`;
}

function calculateDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
}

// ============================================
// Navigation & Theme
// ============================================

function navigateTo(sectionId) {
    // Update sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Refresh section-specific data
    if (sectionId === 'employee') {
        loadPendingInspections();
    }
}

// Navigation link clicks
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.getAttribute('href').substring(1);
        navigateTo(sectionId);
    });
});

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
let currentTheme = localStorage.getItem('azoom_theme') || 'light';

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeToggle.querySelector('.theme-icon').textContent = theme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('azoom_theme', theme);
}

setTheme(currentTheme);

themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(currentTheme);
});

// ============================================
// 1. RESERVE CAR FUNCTIONALITY
// ============================================

let selectedCar = null;

function renderCarList(category = 'all') {
    const carList = document.getElementById('carList');
    const filteredCars = category === 'all' 
        ? carFleet 
        : carFleet.filter(car => car.category === category);
    
    carList.innerHTML = filteredCars.map(car => `
        <div class="car-item ${selectedCar?.id === car.id ? 'selected' : ''}" 
             onclick="selectCar('${car.id}')"
             data-category="${car.category}">
            <div class="car-icon">${car.icon}</div>
            <div class="car-details">
                <div class="car-name">${car.name}</div>
                <div class="car-category">${car.category.charAt(0).toUpperCase() + car.category.slice(1)}</div>
                <div class="car-features">
                    <span>👥 ${car.seats} seats</span>
                    <span>⚙️ ${car.transmission}</span>
                </div>
            </div>
            <div class="car-price">$${car.dailyRate}/day</div>
        </div>
    `).join('');
}

function selectCar(carId) {
    selectedCar = carFleet.find(car => car.id === carId);
    document.getElementById('selectedCarDisplay').value = selectedCar.name;
    document.getElementById('selectedCarId').value = selectedCar.id;
    document.getElementById('dailyRate').textContent = formatCurrency(selectedCar.dailyRate);
    
    renderCarList(currentCategory);
    calculateTotal();
}

// Filter tabs
let currentCategory = 'all';
document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentCategory = tab.dataset.category;
        renderCarList(currentCategory);
    });
});

// Date inputs for price calculation
['pickupDate', 'returnDate'].forEach(id => {
    document.getElementById(id).addEventListener('change', calculateTotal);
});

function calculateTotal() {
    const pickupDate = document.getElementById('pickupDate').value;
    const returnDate = document.getElementById('returnDate').value;
    
    if (pickupDate && returnDate && selectedCar) {
        const days = calculateDays(pickupDate, returnDate);
        const total = days * selectedCar.dailyRate;
        
        document.getElementById('numDays').textContent = days;
        document.getElementById('totalAmount').textContent = formatCurrency(total);
    }
}

// Card number formatting
document.getElementById('cardNumber').addEventListener('input', (e) => {
    let value = e.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formattedValue;
});

// Card expiry formatting
document.getElementById('cardExpiry').addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;
});

// Reservation form submission
document.getElementById('reserveForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const reservation = {
        id: generateId('RES'),
        carId: selectedCar.id,
        carName: selectedCar.name,
        carPlate: selectedCar.plate,
        customerName: document.getElementById('customerName').value,
        customerEmail: document.getElementById('customerEmail').value,
        customerPhone: document.getElementById('customerPhone').value,
        pickupDate: document.getElementById('pickupDate').value,
        returnDate: document.getElementById('returnDate').value,
        dailyRate: selectedCar.dailyRate,
        totalAmount: parseFloat(document.getElementById('totalAmount').textContent.replace('$', '')),
        cardNumber: document.getElementById('cardNumber').value.slice(-4),
        status: 'confirmed',
        createdAt: new Date().toISOString()
    };
    
    reservations.push(reservation);
    saveData();
    
    showModal(
        'Reservation Confirmed! 🎉',
        `Your reservation has been successfully created.`,
        `
            <div class="detail-row">
                <span class="detail-label">Reservation ID:</span>
                <span class="detail-value">${reservation.id}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Vehicle:</span>
                <span class="detail-value">${reservation.carName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Pick-up Date:</span>
                <span class="detail-value">${formatDate(reservation.pickupDate)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Total Amount:</span>
                <span class="detail-value">${formatCurrency(reservation.totalAmount)}</span>
            </div>
        `
    );
    
    document.getElementById('reserveForm').reset();
    selectedCar = null;
    renderCarList('all');
});

// ============================================
// 2. RENT CAR FUNCTIONALITY (Office Pickup)
// ============================================

function lookupReservation() {
    const lookup = document.getElementById('lookupReservation').value.trim();
    
    if (!lookup) {
        alert('Please enter a reservation ID or email');
        return;
    }
    
    const reservation = reservations.find(r => 
        r.id.toLowerCase() === lookup.toLowerCase() || 
        r.customerEmail.toLowerCase() === lookup.toLowerCase()
    );
    
    if (!reservation) {
        alert('No reservation found. Please check your information.');
        return;
    }
    
    if (reservation.status === 'active') {
        alert('This reservation has already been picked up.');
        return;
    }
    
    // Display reservation details
    document.getElementById('rentCustomerName').textContent = reservation.customerName;
    document.getElementById('rentCarName').textContent = reservation.carName;
    document.getElementById('rentPickupDate').textContent = formatDate(reservation.pickupDate);
    document.getElementById('rentReturnDate').textContent = formatDate(reservation.returnDate);
    document.getElementById('rentTotalAmount').textContent = formatCurrency(reservation.totalAmount);
    
    document.getElementById('reservationDetails').classList.remove('hidden');
    
    // Store current reservation for rental completion
    document.getElementById('completeRental').dataset.reservationId = reservation.id;
}

document.getElementById('completeRental').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const reservationId = e.target.dataset.reservationId;
    const reservation = reservations.find(r => r.id === reservationId);
    
    if (!reservation) return;
    
    const rental = {
        id: generateId('RENT'),
        reservationId: reservation.id,
        carId: reservation.carId,
        carName: reservation.carName,
        carPlate: reservation.carPlate,
        customerName: reservation.customerName,
        customerEmail: reservation.customerEmail,
        pickupDate: reservation.pickupDate,
        returnDate: reservation.returnDate,
        licenseNumber: document.getElementById('licenseNumber').value,
        licenseExpiry: document.getElementById('licenseExpiry').value,
        insuranceAccepted: document.getElementById('insuranceAccept').checked,
        initialMileage: parseInt(document.getElementById('initialMileage').value),
        dailyRate: reservation.dailyRate,
        baseAmount: reservation.totalAmount,
        insuranceCost: document.getElementById('insuranceAccept').checked ? 20 * calculateDays(reservation.pickupDate, reservation.returnDate) : 0,
        status: 'active',
        pickedUpAt: new Date().toISOString()
    };
    
    activeRentals.push(rental);
    
    // Update reservation status
    reservation.status = 'active';
    reservation.rentalId = rental.id;
    
    saveData();
    
    showModal(
        'Rental Complete! 🚗',
        `Vehicle has been released to customer.`,
        `
            <div class="detail-row">
                <span class="detail-label">Rental ID:</span>
                <span class="detail-value">${rental.id}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Customer:</span>
                <span class="detail-value">${rental.customerName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Vehicle:</span>
                <span class="detail-value">${rental.carName} (${rental.carPlate})</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Initial Mileage:</span>
                <span class="detail-value">${rental.initialMileage.toLocaleString()} km</span>
            </div>
        `
    );
    
    document.getElementById('completeRental').reset();
    document.getElementById('reservationDetails').classList.add('hidden');
    document.getElementById('lookupReservation').value = '';
});

// ============================================
// 3. RETURN CAR FUNCTIONALITY
// ============================================

function lookupRental() {
    const lookup = document.getElementById('lookupRental').value.trim();
    
    if (!lookup) {
        alert('Please enter a rental ID or license plate');
        return;
    }
    
    const rental = activeRentals.find(r => 
        r.id.toLowerCase() === lookup.toLowerCase() || 
        r.carPlate.toLowerCase().replace('-', '') === lookup.toLowerCase().replace('-', '')
    );
    
    if (!rental) {
        alert('No active rental found. Please check your information.');
        return;
    }
    
    if (rental.status === 'returned') {
        alert('This vehicle has already been returned.');
        return;
    }
    
    // Display rental details
    document.getElementById('returnCustomerName').textContent = rental.customerName;
    document.getElementById('returnCarName').textContent = `${rental.carName} (${rental.carPlate})`;
    document.getElementById('returnPickupDate').textContent = formatDate(rental.pickupDate);
    document.getElementById('returnExpectedDate').textContent = formatDate(rental.returnDate);
    document.getElementById('returnInitialMileage').textContent = `${rental.initialMileage.toLocaleString()} km`;
    
    document.getElementById('rentalDetails').classList.remove('hidden');
    
    // Store current rental for return completion
    document.getElementById('completeReturn').dataset.rentalId = rental.id;
}

document.getElementById('completeReturn').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const rentalId = e.target.dataset.rentalId;
    const rental = activeRentals.find(r => r.id === rentalId);
    
    if (!rental) return;
    
    const returnData = {
        id: generateId('RET'),
        rentalId: rental.id,
        carId: rental.carId,
        carName: rental.carName,
        carPlate: rental.carPlate,
        customerName: rental.customerName,
        customerEmail: rental.customerEmail,
        pickupDate: rental.pickupDate,
        expectedReturnDate: rental.returnDate,
        actualReturnDate: new Date().toISOString(),
        returnLocation: document.getElementById('returnLocation').value,
        initialMileage: rental.initialMileage,
        finalMileage: parseInt(document.getElementById('finalMileage').value),
        mileageDriven: parseInt(document.getElementById('finalMileage').value) - rental.initialMileage,
        fuelLevel: document.getElementById('fuelLevel').value,
        notes: document.getElementById('returnNotes').value,
        baseAmount: rental.baseAmount,
        insuranceCost: rental.insuranceCost,
        status: 'pending_inspection',
        returnedAt: new Date().toISOString()
    };
    
    pendingReturns.push(returnData);
    
    // Update rental status
    rental.status = 'returned';
    rental.returnId = returnData.id;
    
    saveData();
    
    showModal(
        'Return Submitted! ✅',
        `Thank you for returning the vehicle. An employee will inspect it shortly.`,
        `
            <div class="detail-row">
                <span class="detail-label">Return ID:</span>
                <span class="detail-value">${returnData.id}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Return Location:</span>
                <span class="detail-value">${returnData.returnLocation}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Mileage Driven:</span>
                <span class="detail-value">${returnData.mileageDriven.toLocaleString()} km</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Fuel Level:</span>
                <span class="detail-value">${returnData.fuelLevel}</span>
            </div>
        `
    );
    
    document.getElementById('completeReturn').reset();
    document.getElementById('rentalDetails').classList.add('hidden');
    document.getElementById('lookupRental').value = '';
});

// ============================================
// 4. EMPLOYEE INSPECTION FUNCTIONALITY
// ============================================

let selectedReturn = null;

function loadPendingInspections() {
    const inspectionList = document.getElementById('pendingInspections');
    
    const pending = pendingReturns.filter(r => r.status === 'pending_inspection');
    
    if (pending.length === 0) {
        inspectionList.innerHTML = `
            <div class="empty-state">
                <p>No pending inspections</p>
            </div>
        `;
        return;
    }
    
    inspectionList.innerHTML = pending.map(ret => `
        <div class="inspection-item ${selectedReturn?.id === ret.id ? 'selected' : ''}" 
             onclick="selectInspection('${ret.id}')">
            <h4>${ret.carName} (${ret.carPlate})</h4>
            <p>Customer: ${ret.customerName}</p>
            <div class="inspection-meta">
                <span>📍 ${ret.returnLocation}</span>
                <span>🛣️ ${ret.mileageDriven.toLocaleString()} km driven</span>
                <span>⛽ ${ret.fuelLevel} fuel</span>
            </div>
        </div>
    `).join('');
}

function selectInspection(returnId) {
    selectedReturn = pendingReturns.find(r => r.id === returnId);
    
    if (!selectedReturn) return;
    
    document.getElementById('noInspectionSelected').classList.add('hidden');
    document.getElementById('inspectionFormContainer').classList.remove('hidden');
    
    document.getElementById('inspectionCarName').textContent = 
        `${selectedReturn.carName} (${selectedReturn.carPlate})`;
    document.getElementById('inspectionCustomerInfo').textContent = 
        `Customer: ${selectedReturn.customerName} • Returned: ${formatDate(selectedReturn.actualReturnDate)}`;
    
    loadPendingInspections();
    
    // Store current return for inspection completion
    document.getElementById('inspectionForm').dataset.returnId = selectedReturn.id;
}

// Damage level change handler
document.getElementById('damageLevel').addEventListener('change', (e) => {
    const damageDetailsGroup = document.getElementById('damageDetailsGroup');
    const damageChargeGroup = document.getElementById('damageChargeGroup');
    
    if (e.target.value === 'none') {
        damageDetailsGroup.style.display = 'none';
        damageChargeGroup.style.display = 'none';
        document.getElementById('damageCharge').value = '';
    } else {
        damageDetailsGroup.style.display = 'block';
        damageChargeGroup.style.display = 'block';
        
        // Set suggested charge based on damage level
        const suggestedCharges = {
            'minor': 100,
            'moderate': 350,
            'major': 750
        };
        document.getElementById('damageCharge').value = suggestedCharges[e.target.value];
    }
});

document.getElementById('inspectionForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const returnId = e.target.dataset.returnId;
    const returnData = pendingReturns.find(r => r.id === returnId);
    
    if (!returnData) return;
    
    const damageLevel = document.getElementById('damageLevel').value;
    const damageCharge = damageLevel !== 'none' 
        ? parseFloat(document.getElementById('damageCharge').value || 0) 
        : 0;
    
    // Calculate late fees
    const expectedReturn = new Date(returnData.expectedReturnDate);
    const actualReturn = new Date(returnData.actualReturnDate);
    const lateDays = Math.max(0, Math.ceil((actualReturn - expectedReturn) / (1000 * 60 * 60 * 24)));
    const lateFee = lateDays > 0 ? lateDays * 50 : 0;
    
    // Calculate fuel charge (if not returned full)
    const fuelCharge = returnData.fuelLevel !== 'full' ? 40 : 0;
    
    const inspection = {
        id: generateId('INS'),
        returnId: returnData.id,
        rentalId: returnData.rentalId,
        carId: returnData.carId,
        carName: returnData.carName,
        customerName: returnData.customerName,
        customerEmail: returnData.customerEmail,
        damageLevel: damageLevel,
        damageDetails: document.getElementById('damageDetails').value,
        damageCharge: damageCharge,
        lateDays: lateDays,
        lateFee: lateFee,
        fuelCharge: fuelCharge,
        inspectorNotes: document.getElementById('inspectorNotes').value,
        baseAmount: returnData.baseAmount,
        insuranceCost: returnData.insuranceCost,
        totalCharges: damageCharge + lateFee + fuelCharge,
        finalAmount: returnData.baseAmount + returnData.insuranceCost + damageCharge + lateFee + fuelCharge,
        status: 'completed',
        inspectedAt: new Date().toISOString()
    };
    
    completedInspections.push(inspection);
    
    // Update return status
    returnData.status = 'inspected';
    returnData.inspectionId = inspection.id;
    
    saveData();
    
    showModal(
        'Inspection Complete! ✓',
        `Vehicle inspection has been completed.`,
        `
            <div class="detail-row">
                <span class="detail-label">Vehicle:</span>
                <span class="detail-value">${inspection.carName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Damage Assessment:</span>
                <span class="detail-value">${damageLevel.charAt(0).toUpperCase() + damageLevel.slice(1)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Damage Charge:</span>
                <span class="detail-value">${formatCurrency(damageCharge)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Late Fee (${lateDays} days):</span>
                <span class="detail-value">${formatCurrency(lateFee)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Fuel Charge:</span>
                <span class="detail-value">${formatCurrency(fuelCharge)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label"><strong>Final Amount:</strong></span>
                <span class="detail-value"><strong>${formatCurrency(inspection.finalAmount)}</strong></span>
            </div>
        `
    );
    
    document.getElementById('inspectionForm').reset();
    document.getElementById('inspectionFormContainer').classList.add('hidden');
    document.getElementById('noInspectionSelected').classList.remove('hidden');
    selectedReturn = null;
    loadPendingInspections();
});

// ============================================
// 5. FINAL BILLING (Integrated with Inspection)
// ============================================
// The billing is calculated and displayed during the inspection process
// Additional billing view could be added to show customer their final bill

// ============================================
// Modal Functions
// ============================================

function showModal(title, message, details = '') {
    const modal = document.getElementById('successModal');
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('modalDetails').innerHTML = details;
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('successModal').classList.remove('active');
}

// Click outside modal to close
document.getElementById('successModal').addEventListener('click', (e) => {
    if (e.target.id === 'successModal') {
        closeModal();
    }
});

// ============================================
// Initialize Application
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    renderCarList('all');
    loadPendingInspections();
    
    // Set minimum date for date inputs to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('pickupDate').min = today;
    document.getElementById('returnDate').min = today;
    document.getElementById('licenseExpiry').min = today;
    
    console.log('AZoom Car Rental System Initialized');
    console.log('Current Data:');
    console.log('- Reservations:', reservations.length);
    console.log('- Active Rentals:', activeRentals.length);
    console.log('- Pending Returns:', pendingReturns.length);
    console.log('- Completed Inspections:', completedInspections.length);
});