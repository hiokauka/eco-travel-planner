 document.addEventListener('DOMContentLoaded', function () {
      // Highlight active nav link (your existing code)
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

    function calculateCarbon() {
      $('#calculateModal').modal('show');
    }
    function showHistory() {
      $('#historyModal').modal('show');
    }
    function showTips() {
      $('#tipsModal').modal('show');
    }

    let cities = [];

    fetch('assets/data/cities_data.json')
      .then(response => response.json())
      .then(data => {
        cities = data;
        console.log('Loaded cities:', cities);
      })
      .catch(error => console.error('Error loading city data:', error));


    // Autocomplete handler - no filtering by country now
    function setupAutocomplete(inputId, suggestionsId) {
      const input = document.getElementById(inputId);
      const suggestionsBox = document.getElementById(suggestionsId);

      input.addEventListener('input', function () {
        const val = this.value.toLowerCase();
        suggestionsBox.innerHTML = '';

        if (!val) return;

        const matches = cities.filter(city => city.city && city.city.toLowerCase().startsWith(val));

        matches.forEach(city => {
          const div = document.createElement('div');
          div.textContent = city.city;
          div.classList.add('autocomplete-suggestion');
          div.addEventListener('click', () => {
            input.value = city.city;
            suggestionsBox.innerHTML = '';
          });
          suggestionsBox.appendChild(div);
        });
      });


      // Close suggestions if clicked outside
      document.addEventListener('click', function (e) {
        if (e.target !== input) {
          suggestionsBox.innerHTML = '';
        }
      });
    }

    setupAutocomplete('fromInput', 'fromSuggestions');
    setupAutocomplete('toInput', 'toSuggestions');

    console.log(cities);