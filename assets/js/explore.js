$(document).ready(function () {
    const favArray = [];

    // Containers where the cards will be added
    const cardContainer = $('#cards-container');
    const favCardContainer = $('#favourite-card-container');

    // Data array for places
    const places = [
        {
            name: "Serendah Waterfall",
            location: "Hulu Selangor, Selangor",
            desc: "A peaceful natural escape surrounded by lush forest, perfect for eco-travelers.",
            tags: ["Eco-friendly", "Nature"],
            img: "/assets/images/ecowaterfall.jpg"
        },
        {
            name: "Green Bean Café",
            location: "Bangsar, Kuala Lumpur",
            desc: "A sustainable café using biodegradable packaging and sourcing local organic ingredients.",
            tags: ["Sustainable", "Vegan Options"],
            img: "/assets/images/cafe.jpeg"
        },
        {
            name: "Bukit Gasing Forest Reserve",
            location: "Petaling Jaya, Selangor",
            desc: "A well-maintained urban forest with guided eco-hikes and nature preservation education.",
            tags: ["Hiking", "Educational"],
            img: "/assets/images/bukit.jpg"
        }
    ];

    // Function to generate card HTML
    function createCard(place) {
        return `
        <div class="col-md-4 mb-4">
            <div class="card" data-name="${place.name}" data-location="${place.location}" data-desc="${place.desc}" data-tags="${place.tags.join(', ')}" data-img="${place.img}" data-toggle="modal" data-target="#placeDetailModal">
                <img src="${place.img}" class="card-img-top" alt="${place.name}" style="height: 200px; object-fit: cover;">
                <div class="card-body">
                    <h5 class="card-title">${place.name}</h5>
                    <p class="card-text">${place.desc}</p>
                    <p class="text-muted"><i class="bi bi-geo-alt-fill"></i> ${place.location}</p>
                    ${place.tags.map(tag => `<span class="badge badge-success">${tag}</span>`).join(' ')}
                </div>
                <div class="card-footer text-right bg-white">
                    <button class="btn btn-outline-success btn-sm add-to-favourite">Add to favourite</button>
                </div>
            </div>
        </div>
        `;
    }

    // Function to generate a favourite card
    function createFavCard(place) {
        // Ensure tags is always an array
        const tags = Array.isArray(place.tags) ? place.tags : []; // Default to empty array if tags isn't an array

        return `
        <div class="col-md-4 mb-4">
            <div class="card">
                <img src="${place.img}" class="card-img-top" alt="${place.name}" style="height: 200px; object-fit: cover;">
                <div class="card-body">
                    <h5 class="card-title">${place.name}</h5>
                    <p class="card-text">${place.desc}</p>
                    <p class="text-muted"><i class="bi bi-geo-alt-fill"></i> ${place.location}</p>
                    ${tags.map(tag => `<span class="badge badge-success">${tag}</span>`).join(' ')}
                </div>
                <div class="card-footer text-right bg-white">
                    <button class="btn btn-outline-danger btn-sm remove-from-favourite">Remove from favourite</button>
                </div>
            </div>
        </div>
    `;
    }


    // Append each card to the main container
    places.forEach(place => {
        const cardHtml = createCard(place);
        cardContainer.append(cardHtml);
    });

    // Modal functionality for card click
    $('#placeDetailModal').on('show.bs.modal', function (event) {
        const card = $(event.relatedTarget); // Get the card that triggered the modal
        const name = card.data('name');
        const location = card.data('location');
        const desc = card.data('desc');
        const tags = card.data('tags');
        const img = card.data('img');

        $('#modalPlaceTitle').text(name);
        $('#modalPlaceLocation').html('<i class="bi bi-geo-alt-fill"></i> ' + location);
        $('#modalPlaceDesc').text(desc);
        $('#modalPlaceTags').text(tags);
        $('#modalPlaceImage').attr('src', img).attr('alt', name);

        // Check if tags exist, then split and map to badges
        if (tags) {
            const tagArray = tags.split(',').map(function (tag) {
                return '<span class="badge badge-success me-2">' + tag.trim() + '</span>';
            }).join(''); // Join badges with spaces between them

            // Insert the badges into the modal's tag section
            $('#modalPlaceTags').html(tagArray);
        } else {
            $('#modalPlaceTags').html('No tags available');
        }
    });

    // Add/Remove from favourites logic
    $('.add-to-favourite').on('click', function (event) {
        event.stopPropagation(); // Prevent triggering modal

        const card = $(this).closest('.card');
        const name = card.data('name');
        const location = card.data('location');
        const desc = card.data('desc');
        const tags = card.data('tags');
        const img = card.data('img');

        const index = favArray.findIndex(item => item.name === name);

        if (index === -1) {
            // Not in favourites – add it
            favArray.push({ name, location, desc, tags, img });
            console.log(`${name} added to favourites.`);

            // Change button to filled heart
            $(this).html('<i class="bi bi-heart-fill text-danger"></i>');
        } else {
            // Already in favourites – remove it
            favArray.splice(index, 1);
            console.log(`${name} removed from favourites.`);

            // Change button to "Add to favourite" text
            $(this).html('Add to favourite');
        }

        console.log(favArray); // Debug
    });




    // Handle Favourite Button Click
    $('.fav-btn').on('click', function () {
        $(this).toggleClass('active');

        // If button is active, show favourites only
        if ($(this).hasClass('active')) {
            cardContainer.hide(); // Hide the main card container
            favCardContainer.show(); // Show the favourite card container

            // Clear the favourite container and append fav cards or message
            updateFavContainer();
        } else {
            // If button is not active, show all cards
            cardContainer.show(); // Show the main card container
            favCardContainer.hide(); // Hide the favourite card container
        }
    });


    // Remove from favourites functionality (for "Remove from favourite" button)
    $(document).on('click', '.remove-from-favourite', function () {
        const card = $(this).closest('.card');
        const name = card.find('.card-title').text(); // Get the name directly from the card
        const location = card.find('.text-muted').text().trim(); // Get the location from the card
        const desc = card.find('.card-text').text(); // Get the description from the card
        const tags = card.data('tags'); // Get the tags directly from the card's data
        const img = card.find('img').attr('src'); // Get the image from the card

        const index = favArray.findIndex(item => item.name === name);

        if (index !== -1) {
            // If it's in favourites – remove it
            favArray.splice(index, 1);
            console.log(`${name} removed from favourites.`);

            // Change the button back to "Add to favourite"
            $(this).closest('.card').find('.add-to-favourite').html('Add to favourite');
            updateAddToFavouriteButton(name, 'empty');
        }

        console.log(favArray); // Debug
        updateFavContainer();

    });

    // Function to update the favourite container
    function updateFavContainer() {
        // Clear the fav card container
        favCardContainer.empty();

        // Check if favArray is empty
        if (favArray.length === 0) {
            // Append a "No favourites" message if favArray is empty
            favCardContainer.append('<p>No favourites yet. Add some places to your favourites!</p>');
        } else {
            // Otherwise, append the fav cards
            favArray.forEach(favPlace => {
                const favCardHtml = createFavCard(favPlace);
                favCardContainer.append(favCardHtml);
            });
        }
    }


    function updateAddToFavouriteButton(name, status) {
        // Find the card in the main container
        const card = cardContainer.find(`.card[data-name="${name}"]`);
        const button = card.find('.add-to-favourite');

        if (status === 'filled') {
            button.html('<i class="bi bi-heart-fill text-danger"></i>');
        } else {
            button.html('Add to favourite');
        }
    }
});
