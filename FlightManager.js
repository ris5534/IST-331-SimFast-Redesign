'use strict';

import Flight from './Flight.js';

// Constants
const PHLCoords = [39.87189865112305, -75.24109649658203];
const DENCoords = [39.861698150635, -104.672996521];
const MIACoords = [25.79319953918457, -80.29060363769531];
const MSPCoords = [44.8820, -93.221802];
const JFKCoords = [40.63980103, -73.77890015];
const coordsArray = [PHLCoords, DENCoords, MIACoords, MSPCoords, JFKCoords];

const SIMULATION_SPEED = 128; // ms per tick, minimum for most browsers is 15-16
const TICK_TRAVEL = 0.01; // Normalized displacement vector multiplier
let GPS_ERROR_MARGIN = 50; // Margin of error for landing detection

export default class FlightManager {
    constructor() {
        // Coordinates of airports
        const airportCoords = coordsArray;
        // Create airport icon
        const airportIcon = L.icon({
            iconUrl: "./assets/airport-circle.png",
            iconSize: [32, 32], // size of the icon
            iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
        });
        this.playing = false;
        // Stores flights
        this.flights = [];
        // Initializes interactive map
        this.map = L.map('mapid', {
            center: [39.8736, -75.239],
            zoom: 8,
            attributionControl: false,
            zoomControl: false
        });
        // Initialize tiles on map
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(this.map);
        // Add markers to map
        for (let coords of airportCoords) {
            L.marker(coords, {icon: airportIcon}).addTo(this.map);
        }
        this.tickRate = SIMULATION_SPEED;  //The tick rate in ms/tick cannot be less than 16
        this.selectedFlight = null;
        this.startTime = Date.now();
        this.tickCount = 0;
        this.tickInterval = null;
    }

    setTickRate(rate) {
        this.pause();

        if (rate < 16) this.tickRate = 16;
        if (rate > 1000) this.tickRate = 1200;
        else this.tickRate = rate;

        this.play();
    }

    pause() {
        clearInterval(this.tickInterval);
        this.playing = false;
    }

    play() {
        this.tickInterval = setInterval(() => this.executeTick(), this.tickRate);
        this.playing = true;
    }

    removeFlight(flightToRemove) {
        console.log('removing flight');
        for (let i = 0; i < this.flights.length; ++i) {
            if (this.flights[i].getCallsign() === flightToRemove.getCallsign()) {
                this.map.removeLayer(flightToRemove.getMarker());
                document.getElementById(`select-${flightToRemove.getCallsign()}`).remove();
                this.flights.splice(i, 1);
            }
        }
    }

    addRandomFlight() {
        let randOrigin = Math.floor(Math.random() * Math.floor(coordsArray.length - 1)); //Get random index for origin of flight
        let randDestination = -1; //Get random index for destination of flight

        do { //Make sure the origin and destination are NOT the same
            randDestination = Math.floor(Math.random() * Math.floor(coordsArray.length - 1));
        }
        while (randDestination === randOrigin)

        this.addFlight(new Flight(coordsArray[randOrigin], coordsArray[randDestination]));
    }

    executeTick() {
        for (let flight of this.flights) {
            flight.onTick(this.tickCount);
            if (flight.hasLanded()) {
                this.removeFlight(flight);
                this.addRandomFlight();
            }
        }
        ++this.tickCount;
        document.getElementById('clock').innerHTML = this.getSimulationTime();
    }

    getFlightByCallsign(callsign) {
        for (let i = 0; i < this.flights.length; ++i) {
            if (callsign === this.flights[i].getCallsign()) {
                return this.flights[i];
            }
        }
        return null;
    }

    selectFlight(flight) {
        if (this.selectedFlight) {
            document.getElementById(`select-${this.selectedFlight.getCallsign()}`).classList.remove('active');
            this.selectedFlight.deSelect();
        }
        this.selectedFlight = flight;
        this.selectedFlight.select();
        this.map.setView(flight.getLatLng(), 10);
        document.getElementById(`select-${this.selectedFlight.getCallsign()}`).classList.add('active');
    }

    getSelectedFlight() {
        return this.selectedFlight;
    }

    addFlight(flight) {
        this.flights.push(flight);
        flight.getMarker().addTo(this.map).on('click', () => {
            this.selectFlight(flight)
        });

        let currentCallsign = flight.getCallsign();
        let selectFlightButton = `<a href="#" class="list-group-item" id="select-${currentCallsign}">${flight.getFlightName()}</a>`
        document.getElementById('flight-selector').insertAdjacentHTML('beforeend', selectFlightButton);
        document.getElementById(`select-${currentCallsign}`).addEventListener('click', () => {
            this.selectFlight(flight);
        });
        // this.selectFlight();
        // flight.focus();
    }

    // res

    getSimulationTime() {
        let runTimeInMs = this.tickCount * 128;
        let minutes = Math.floor(runTimeInMs / 60000);
        let seconds = ((runTimeInMs % 60000) / 1000).toFixed(0);
        return '00:' + (minutes < 10 ? '0' : '') + (seconds == 60 ? (minutes + 1) + ":00" : minutes + ":" + (seconds < 10 ? "0" : "") + seconds);
    }

    runCommand(command) {
        let commandArr = command.split(' ');
        let callsign = commandArr[0].toUpperCase();
        let inputCommand = commandArr[1].toUpperCase();
        let value = commandArr[2].toUpperCase();

        let flightIndex = 0;

        let commandFlight = this.getFlightByCallsign(commandArr[0]);
        if (!commandFlight) {
            throw(`Flight: ${commandFlight} could not be found`);
            return;
        }

        switch (inputCommand) {
            case 'H': {
                commandFlight.setBearing(commandArr[2]);
                commandFlight.setAction('bearing');
                break;
            }
            case 'A': {
                commandFlight.setAltitude(commandArr[2]);
                break;
            }
            case 'FLYTO': {
                throw('unimplemented');
            }
        }
    }
}