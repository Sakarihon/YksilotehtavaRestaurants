async function fetchUser() {
  try {
    const response = await fetch('https://media2.edu.metropolia.fi/restaurant/api/v1/restaurants');
    if (!response.ok) throw new Error('Network response was not ok');

    const restaurants = await response.json();
    console.log(restaurants)
    restaurants.sort((a, b) => a.name.localeCompare(b.name));

    const tbody = document.querySelector('tbody');
    const dialog = document.querySelector('dialog');
    const dialogContent = document.getElementById('dialogContent');
    const todayBtn = document.getElementById('todayBtn');
    const weekBtn = document.getElementById('weekBtn');
    const closeBtn = document.getElementById('closeBtn');
    const restaurantMenu = document.getElementById('restaurantMenu');

    let selectedRestaurant = null;

    closeBtn.addEventListener('click', () => dialog.close());

    for (const restaurant of restaurants) {
      const tr = document.createElement('tr');
      const tdName = document.createElement('td');
      tdName.textContent = restaurant.name;
      const tdAddress = document.createElement('td');
      tdAddress.textContent = restaurant.address;

      tr.addEventListener('click', () => {
        document.querySelectorAll('tr').forEach(row => row.classList.remove('highlight'));
        tr.classList.add('highlight');

        selectedRestaurant = restaurant;

        dialogContent.innerHTML = `<h2>${restaurant.name}</h2>
          <p>${restaurant.address}</p>
          <p>${restaurant.city}, ${restaurant.postalCode}</p>
          <p>Phone: ${restaurant.phone}</p>
          <p>Company: ${restaurant.company}</p>`;

        restaurantMenu.textContent = '';
        dialog.showModal();
      });

      tr.appendChild(tdName);
      tr.appendChild(tdAddress);
      tbody.appendChild(tr);
    }

    todayBtn.addEventListener('click', () => {
      if (selectedRestaurant) restaurantMenu.textContent = selectedRestaurant.menuToday || 'No daily menu available';
    });

    weekBtn.addEventListener('click', () => {
      if (selectedRestaurant) restaurantMenu.textContent = selectedRestaurant.menuWeek || 'No weekly menu available';
    });

  } catch (error) {
    console.error('Fetch error:', error);
  }
}

fetchUser();
