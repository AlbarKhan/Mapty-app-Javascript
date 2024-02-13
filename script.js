"use strict";

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (posi) {
      const { latitude } = posi.coords;
      const { longitude } = posi.coords;

      console.log(latitude, longitude);
      const cords = [latitude, longitude];
      const map = L.map("map").setView(cords, 13);

      L.tileLayer("https://tile.openstreetmap.fr/hot/ {z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      console.log(map);
      map.on("click", function (mapEvent) {
        console.log(mapEvent);
        const { lat, lng } = mapEvent.latlng;
        console.log(lat, lng);
        L.marker([lat, lng]).addTo(map).bindPopup("WorkOut").openPopup();
      });
    },
    function () {
      alert("not working");
    }
  );
}
