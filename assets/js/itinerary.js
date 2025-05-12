// Store itinerary as an array
let itineraryList = [];

// Search toggle functionality
const searchToggleBtn = document.getElementById('searchToggleBtn');
const searchContainer = document.getElementById('searchContainer');

searchToggleBtn.addEventListener('click', function () {
    searchContainer.style.display = (searchContainer.style.display === 'none' || searchContainer.style.display === '') ? 'block' : 'none';
});

// Calculate trip days
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const dayCountDiv = document.getElementById("day-count");

function calculateDays() {
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);

    if (startDate && endDate && endDate >= startDate) {
        const timeDiff = endDate - startDate;
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
        dayCountDiv.textContent = `Trip duration: ${daysDiff} day(s)`;

        // Enable day options when dates are valid
        generateDayOptions(daysDiff);
    } else {
        dayCountDiv.textContent = '';
    }
}

startDateInput.addEventListener("change", calculateDays);
endDateInput.addEventListener("change", calculateDays);

// Generate day options dynamically
function generateDayOptions(daysDiff) {
    const dayOptions = document.querySelectorAll('.day-options');

    dayOptions.forEach(optionContainer => {
        const selectElement = optionContainer.querySelector('select');
        selectElement.innerHTML = ''; // Clear previous options

        // Create the default "Select a day" option
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        defaultOption.textContent = "Select a day";
        selectElement.appendChild(defaultOption);

        // Create and append day options
        for (let i = 1; i <= daysDiff; i++) {
            const option = document.createElement('option');
            option.value = `Day ${i}`;
            option.textContent = `Day ${i}`;
            selectElement.appendChild(option);
        }

        // Reset to default when regenerating
        selectElement.value = "";
    });
}

document.querySelectorAll('.day-select').forEach(daySelect => {
    daySelect.addEventListener('change', function () {
        const card = daySelect.closest('.card');
        const title = card.querySelector('.card-title').textContent.trim();
        const selectedDay = daySelect.value;

        // Check if the destination has already been added for the selected day
        const alreadyAdded = itineraryList.some(item => item.title === title && item.day === selectedDay);

        const button = card.querySelector('.add-to-fave');

        if (alreadyAdded) {
            // If already added, update button text and disable it
            button.textContent = "Added";
            button.disabled = true; // Disable the button for that day
        } else {
            // If not added, reset button to "Add to Itinerary" and enable it
            button.textContent = "Add to Itinerary";
            button.disabled = false; // Enable the button
        }
    });
});


// Listen for all "Add to Itinerary" buttons
document.querySelectorAll('.add-to-fave').forEach(button => {
    button.addEventListener('click', function () {
        const card = button.closest('.card');
        const title = card.querySelector('.card-title').textContent.trim();
        const daySelect = card.querySelector('.day-select');
        const selectedDay = daySelect ? daySelect.value : "";

        if (!selectedDay) {
            alert('Please select a day before adding to itinerary.');
            return;
        }

        // Check if the destination has already been added
        const alreadyAdded = itineraryList.some(item => item.title === title && item.day === selectedDay);
        if (alreadyAdded) {
            // If already added, remove it from itinerary

            button.textContent = "Added";
            button.disabled = true; // Enable the button after removal
        } else {
            // Add to itinerary
            itineraryList.push({ title, day: selectedDay });
            button.textContent = "Added";
            button.disabled = true; // Disable the button for that day
        }

        updateItineraryModal();
    });
});

// Reset modal contents when it opens
$('#availableModal').on('show.bs.modal', function () {
    // Reset each day-select dropdown in the modal to default (Select a day)
    $('.day-select').each(function () {
        $(this).val(''); // Reset to default (empty value, "Select a day")
    });

    // Reset all "Add to Itinerary" buttons to default state (text and enabled)
    $('.add-to-fave').each(function () {
        $(this).text('Add to Itinerary'); // Reset button text
        $(this).prop('disabled', false); // Enable button if it was disabled
    });
});

$('#availableModal').on('show.bs.modal', function () {
    // Reset each day-select dropdown in the modal

});

// Update itinerary modal to group destinations by day and include remove button
function updateItineraryModal() {
    const container = document.getElementById('itineraryList');
    container.innerHTML = '';

    
    if (itineraryList.length === 0) {
        container.innerHTML = '<p class="text-muted">No destinations added yet.</p>';
        return;
    }

    // Group by day and display them in the modal
    const groupedByDay = itineraryList.reduce((acc, item) => {
        if (!acc[item.day]) {
            acc[item.day] = [];
        }
        acc[item.day].push(item);
        return acc;
    }, {});

    Object.keys(groupedByDay).forEach(day => {
        const daySection = document.createElement('div');
        daySection.classList.add('day-section');
        daySection.innerHTML = `<h6 class="font-weight-bold"> ${day}</h6>`;

        groupedByDay[day].forEach((item, index) => {
            const entry = document.createElement('div');
            entry.className = 'mb-2 d-flex justify-content-between align-items-center';
            entry.innerHTML = `
                <strong>${item.title}</strong>
                <button class="btn btn-sm btn-danger" onclick="removeItinerary(${index}, '${item.day}')">Remove</button>
            `;
            daySection.appendChild(entry);
        });

        container.appendChild(daySection);
    });
}

// Remove item from itinerary
function removeItinerary(index, day) {
    const removedItem = itineraryList.splice(index, 1)[0];  // Get the removed item
    updateItineraryModal();

    // Reset the button back to "Add to Itinerary" after removal
    document.querySelectorAll('.add-to-fave').forEach(button => {
        const card = button.closest('.card');
        const titleInCard = card.querySelector('.card-title').textContent.trim();
        const daySelect = card.querySelector('.day-select');
        const selectedDay = daySelect ? daySelect.value : "";

        if (titleInCard === removedItem.title && selectedDay === removedItem.day) {
            button.textContent = "Add to Itinerary";
            button.disabled = false; // Enable the button after removal
        }
    });
}

// Download itinerary as PDF
document.getElementById("downloadItineraryBtn").addEventListener("click", function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const cloned = document.getElementById("itineraryList").cloneNode(true);
    cloned.querySelectorAll("button").forEach(btn => btn.remove());
    const itineraryContent = cloned.innerText;

    doc.text("Green Itinerary", 10, 10);
    doc.text(itineraryContent, 10, 20);
    doc.save("green-itinerary.pdf");
});

// Add active class to navbar links based on the current page URL
document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('.navbar .nav-link');
    const currentUrl = window.location.href;

    navLinks.forEach(function (link) {
        const linkUrl = link.getAttribute('href');
        if (currentUrl.includes(linkUrl)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});

// search function
document.getElementById('searchInput').addEventListener('input', function () {
    const query = this.value.toLowerCase();
    const cards = document.querySelectorAll('#availableModal .card');

    cards.forEach(card => {
        const title = card.querySelector('.card-title').textContent.toLowerCase();
        if (title.includes(query)) {
            card.parentElement.style.display = ''; // .col-md-4
        } else {
            card.parentElement.style.display = 'none'; // Hide the whole column
        }
    });
});
