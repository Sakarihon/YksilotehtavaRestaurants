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
    const sortName = document.getElementById('sortName')
    const sortAddress = document.getElementById('sortAddress')

    makeTable(restaurants)


    let selectedRestaurant = null;

    closeBtn.addEventListener('click', () => dialog.close());

    //dialog
    function openDialog(restaurant){
      selectedRestaurant = restaurant;

        dialogContent.innerHTML = `<h2>${restaurant.name}</h2>
          <p>${restaurant.address}</p>
          <p>${restaurant.city}, ${restaurant.postalCode}</p>
          <p>Phone: ${restaurant.phone}</p>
          <p>Company: ${restaurant.company}</p>`;

        restaurantMenu.textContent = '';
        dialog.showModal();
    }

    //makes restaurants to table
    function makeTable(restaurants){
      tbody.innerHTML = '';   

      for (const restaurant of restaurants) {
      const tr = document.createElement('tr');
      const tdName = document.createElement('td');
      tdName.textContent = restaurant.name;
      const tdAddress = document.createElement('td');
      tdAddress.textContent = restaurant.address;

      tr.addEventListener('click', () => {
        tbody.querySelectorAll('tr').forEach(row => row.classList.remove('highlight'));
        tr.classList.add('highlight');
        openDialog(restaurant)
      });

      tr.appendChild(tdName);
      tr.appendChild(tdAddress);
      tbody.appendChild(tr);
    }}

    //sort name
    sortName.addEventListener('click',() =>{
      restaurants.sort((a, b) => a.name.localeCompare(b.name));
      makeTable(restaurants)
    })
    //sort adress
    sortAddress.addEventListener('click',() =>{
      restaurants.sort((a, b) => a.address.localeCompare(b.address));
      makeTable(restaurants)
    })



    //map
    const map = L.map('map').setView([62.6, 27.7], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    for (let restaurant of restaurants) {
      const marker = L.marker([
        restaurant.location.coordinates[1],
        restaurant.location.coordinates[0],
      ]).addTo(map);

      marker.on('click', () => openDialog(restaurant));

    }

    //centering map to closest restaurant
    navigator.geolocation.getCurrentPosition(
    position => {
      const userLon = position.coords.longitude;
      const userLat = position.coords.latitude;

      let closest = restaurants[0];
      let minDist = Math.sqrt(
        Math.pow(closest.location.coordinates[0] - userLon, 2) +
        Math.pow(closest.location.coordinates[1] - userLat, 2)
      );

    for (const restaurant of restaurants) {
      const dist = Math.sqrt(
        Math.pow(restaurant.location.coordinates[0] - userLon, 2) +
        Math.pow(restaurant.location.coordinates[1] - userLat, 2)
      );
      if (dist < minDist) {
        minDist = dist;
        closest = restaurant;
      }
    }

    //marker for user location
    L.marker([userLat, userLon])
      .addTo(map)
      .bindPopup("You are here")
      .openPopup();
      
    //marker for closest restaurant
    const closestMarker=L.marker([
    closest.location.coordinates[1],
    closest.location.coordinates[0]])
    .addTo(map)
    .bindPopup(`Closest restaurant: ${closest.name}`)
    closestMarker.on("click", () => openDialog(closest));

    map.setView([closest.location.coordinates[1], closest.location.coordinates[0]], 12);
    },
    err => {
      console.warn('Geolocation failed:', err);
      // fallback coordinates Kuopio
      const fallbackLon = 27.6822;
      const fallbackLat = 62.601;
      map.setView([fallbackLat, fallbackLon], 13);
    },
    {
      enableHighAccuracy: false,
      timeout: 30000,
      maximumAge: 0,
    }
    );

    //today button in dialog
    todayBtn.addEventListener('click', async () => {
      const response = await fetch(`https://media2.edu.metropolia.fi/restaurant/api/v1/restaurants/weekly/${selectedRestaurant._id}/fi`);
      const menu = await response.json();
      let todayIndex = new Date().getDay();
      if (todayIndex===0){
        todayIndex=6}
      else{todayIndex =todayIndex-1}
      const today=menu.days[todayIndex]
        console.log(menu);
        console.log(today);
        console.log(todayIndex)

      restaurantMenu.innerHTML=``

      if (today && today.courses &&  today.courses.length>0){
      restaurantMenu.innerHTML = `
      <h2>Päivän lista</h2>
      <ul>
      ${today.courses.map(c => `<li>${c.name}${c.price ? ` (${c.price})` : ''}</li>`).join("")}</ul>`
      }else{
      restaurantMenu.innerHTML =
      `<ul>
      <li> no courses today </li>

      </ul>`}
    });    

    //week button in dialog
    weekBtn.addEventListener('click', async () => {
      
      const response = await fetch(`https://media2.edu.metropolia.fi/restaurant/api/v1/restaurants/weekly/${selectedRestaurant._id}/fi`);
      const menu = await response.json();
      
        console.log(menu);

      const weekdayLabels = [
      'maanantai', 'tiistai', 'keskiviikko',
      'torstai', 'perjantai', 'lauantai', 'sunnuntai'
      ];
      restaurantMenu.innerHTML = ''

      for (let i=0;i<7;i++){
      if(!menu.days[i]){
        
        restaurantMenu.innerHTML+=`
        <h2>${weekdayLabels[i]}</h2>  
        <p>no data </p>`}
      else{
      restaurantMenu.innerHTML += `
      <h2>${menu.days[i].date}</h2>  
      <ul>
      ${menu.days[i].courses && menu.days[i].courses.length > 0
      ? menu.days[i].courses.map(c => `<li>${c.name}${c.price ? ` (${c.price})` : ''}</li>`).join("")
      : `<li>no courses today</li>`
     }</ul>`

      }}}
  )}
  catch (error) {
    console.error('Fetch error:', error);
  }
}

fetchUser();
