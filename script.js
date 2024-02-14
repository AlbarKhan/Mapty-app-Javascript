"use strict";

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputElevation = document.querySelector(".form__input--elevation");
const inputCadence = document.querySelector(".form__input--cadence");

let map, mapEvent;

class WorkOut {
  date = new Date();
  id = (Date.now() + "").slice(-10);
  constructor(cords, distance, duration) {
    this.cords = cords; //[lat,lng]
    this.distance = distance; //in km
    this.duration = duration; // in min
  }
}

class Running extends WorkOut {
  constructor(cords, distance, duration, cadence) {
    super(cords, duration, distance);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends WorkOut {
  constructor(cords, distance, duration, elevationGain) {
    super(cords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

/////////////////////Application Architecture///////////////
class App {
  #map;
  #mapEvent;
  workouts = [];
  constructor() {
    this._getPosition();
    form.addEventListener("submit", this._newWorkout.bind(this));
    inputType.addEventListener("change", this._toggleElevationField);
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("Could not get the location");
        }
      );
    }
  }

  _loadMap(posi) {
    const { latitude } = posi.coords;
    const { longitude } = posi.coords;

    const cords = [latitude, longitude];
    this.#map = L.map("map").setView(cords, 13);

    L.tileLayer("https://tile.openstreetmap.fr/hot/ {z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on("click", this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove("hidden");
    inputDistance.focus();
  }

  _newWorkout(e) {
    e.preventDefault();
    const validInput = (...inputs) => {
      inputs.every((inp) => Number.isFinite(inp));
    };

    const allPositive = (...inputs) => {
      inputs.every((inp) => inp > 0);
    };
    // Get Data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;
    // Check if Data is Valid

    // if Workout running , create running object
    if (type === "cycling") {
      const elevation = +inputElevation.value;
      if (!validInput(distance, duration) || !allPositive) {
        return alert("Inputs have yo be positive");
      }

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }
    // if workout cycling,create cycling object
    if (type === "running") {
      const cadence = +inputCadence.value;
      if (!validInput(distance, duration, cadence) || !allPositive) {
        return alert("Inputs have yo be positive");
      }
      workout = new Cycling([lat, lng], distance, duration, cadence);
    }

    // Add new Workout to workout array
    this.workouts.push(workout);
    // inputDistance.value =
    //   inputDuration.value =
    //   inputCadence.value =
    //   inputElevation.value =
    //     "";

    L.marker([lat, lng])
      .addTo(this.#map)
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
  }

  _toggleElevationField() {
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
  }
}

const app = new App();
