"use strict";

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputElevation = document.querySelector(".form__input--elevation");
const inputCadence = document.querySelector(".form__input--cadence");

let map, mapEvent;
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (posi) {
      const { latitude } = posi.coords;
      const { longitude } = posi.coords;

      console.log(latitude, longitude);
      const cords = [latitude, longitude];
      map = L.map("map").setView(cords, 13);

      L.tileLayer("https://tile.openstreetmap.fr/hot/ {z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      console.log(map);
      map.on("click", function (mapE) {
        mapEvent = mapE;
        form.classList.remove("hidden");
      });
    },
    function () {
      alert("Could not get the location");
    }
  );
}

form.addEventListener("submit", function (e) {
  e.preventDefault();

  inputDistance.value =
    inputDuration.value =
    inputCadence.value =
    inputElevation.value =
      "";
  // console.log(mapEvent);
  // console.log(lat, lng);
  const { lat, lng } = mapEvent.latlng;
  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: "running-popup",
      })
    )
    .setPopupContent("Workout")
    .openPopup();
});

inputType.addEventListener("change", function (e) {
  console.log(e.target.value);

  inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
});
