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
  clicks = 0;
  constructor(cords, distance, duration) {
    this.cords = cords; //[lat,lng]
    this.distance = distance; //in km
    this.duration = duration; // in min
  }

  _setDescription() {
    //prettier-ignore
    const months = ['January','Feburary','March','April','May','June','July','August','September','October','November','December'];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }

  click() {
    this.clicks++;
  }
}

class Running extends WorkOut {
  type = "running";
  constructor(cords, distance, duration, cadence) {
    super(cords, duration, distance);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends WorkOut {
  type = "cycling";
  constructor(cords, distance, duration, elevationGain) {
    super(cords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
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
    this._getLocalStroage();
    this._getPosition();
    form.addEventListener("submit", this._newWorkout.bind(this));
    inputType.addEventListener("change", this._toggleElevationField);
    containerWorkouts.addEventListener("click", this._moveToPopup.bind(this));
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
    this.workouts.forEach((work) => {
      this._renderWokoutMarker(work);
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove("hidden");
    inputDistance.focus();
  }

  _newWorkout(e) {
    e.preventDefault();
    const validInput = (...inputs) => {
      return inputs.every((inp) => Number.isFinite(inp));
    };

    const allPositive = (...inputs) => {
      return inputs.every((inp) => inp > 0);
    };
    // Get Data from form
    let type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;
    // Check if Data is Valid

    // if Workout running , create running object
    if (type === "cycling") {
      const elevation = +inputElevation.value;
      if (
        !validInput(distance, duration, elevation) ||
        !allPositive(distance, duration)
      ) {
        return alert("Inputs have yo be positive");
      }

      workout = new Cycling([lat, lng], distance, duration, elevation);
      type = "cycling";
    }
    // if workout cycling,create cycling object
    if (type === "running") {
      const cadence = +inputCadence.value;
      if (
        !validInput(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      ) {
        return alert("Inputs have yo be positive");
      }
      workout = new Running([lat, lng], distance, duration, cadence);
      type = "running";
    }

    // Add new Workout to workout array
    this.workouts.push(workout);
    // console.log(workout);

    this._renderWokoutMarker(workout);

    this._renderWorkout(workout);

    this._hideForm();

    this._setLocalStorage();
  }

  _hideForm() {
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        "";

    form.classList.add("hidden");
  }

  _renderWokoutMarker(workout) {
    L.marker(workout.cords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"
            }</span>
            <span class="workout__value">${workout.distances}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
    `;

    if (workout.type === "running") {
      html += `
      <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
      `;
    }
    if (workout.type === "cycling") {
      html += `
      <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
      `;
    }
    form.insertAdjacentHTML("afterend", html);
  }

  _toggleElevationField() {
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
  }

  _moveToPopup(e) {
    const workoutEl = e.target.closest(".workout");

    if (!workoutEl) return;
    // console.log(workoutEl);

    const workout = this.workouts.find(
      (work) => work.id === workoutEl.dataset.id
    );

    this.#map.setView(workout.cords, 13, {
      animate: true,
      pan: { duration: 1 },
    });
    console.log(workout);
    // workout.click();
  }

  _setLocalStorage() {
    localStorage.setItem("workouts", JSON.stringify(this.workouts));
  }

  _getLocalStroage() {
    const data = JSON.parse(localStorage.getItem("workouts"));
    // console.log(data);
    if (!data) return;

    this.workouts = data;

    this.workouts.forEach((work) => {
      this._renderWorkout(work);
    });
  }
}

const app = new App();
