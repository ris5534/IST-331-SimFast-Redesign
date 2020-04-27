'use strict';

import Flight from './Flight.js';
import FlightManager from './FlightManager.js';

const coordsArray = [
    [39.87189865112305, -75.24109649658203], //PHLCoords
    [39.861698150635, -104.672996521],       // DENCoords
    [25.79319953918457, -80.29060363769531], // MIACoords
    [44.8820, -93.221802],                   // MSPCoords
    [40.63980103, -73.77890015]              // JFKCoords
]

export default class FlightController {

    constructor() {
        this.flightManager = new FlightManager();
    }

    init() {
        console.log('init');
        for (let i = 0; i < 6; ++i) {
            this.flightManager.addRandomFlight();
        }
        // for (let i = coordsArray.length - 1; 1 < i; --i) {
        //   flightManager.addFlight(new Flight(coordsArray[i], coordsArray[i-1]))
        // }

        ////////////////////////////////////////
        ////Event listeners for UI elements/////
        ////////////////////////////////////////
        let runConsole = () => {
            this.flightManager.runCommand(document.getElementById('console-input').value);
            document.getElementById('console-input').value = '';
        }

        document.getElementById('button-emergency-landing').addEventListener('click', () => {
            this.flightManager.getSelectedFlight().setAction('land');
        });
        document.getElementById('button-hold').addEventListener('click', () => {
            this.flightManager.getSelectedFlight().setAction('hold')
        });

        document.getElementById('button-takeoff').addEventListener('click', () => {
            this.flightManager.getSelectedFlight().setAction('fly');
        });

        // document.getElementById('button-start').addEventListener('click', () => {
        //   flightManager.start();
        // })
        document.getElementById('console-enter').addEventListener('click', runConsole)

        window.onkeyup = (e) => {
            let key = e.keyCode ? e.keyCode : e.which;
            if (key == 13) runConsole();
        }

        document.getElementById('pause-simulation').addEventListener('click', () => {
            this.flightManager.pause();
            console.log('Simulation paused');
        });

        document.getElementById('play-simulation').addEventListener('click', () => {
            this.flightManager.play();
            console.log('Simulation resumed');
        });

        document.getElementById('simulation-speed').addEventListener('change', (e) => {
            console.log('changed the value of the slider');
            this.flightManager.setTickRate(e.target.value);
        });

        document.getElementById('console-show-keyboard').addEventListener('click', (e) => {
            document.getElementById('on-screen-keyboard').classList.toggle('hidden');
        })

        let keyboardButtons = document.getElementsByClassName('keyboard-button');
        for (let button of keyboardButtons) {
            let consoleInputEl = document.getElementById('console-input');

            if (button.innerHTML.length === 1) {
                button.addEventListener('click', (e) => {
                    let buttonValue = e.target.innerHTML;
                    consoleInputEl.value = (consoleInputEl.value.length < 1 ? buttonValue : consoleInputEl.value + buttonValue);
                });
            }
            if (button.innerHTML === "SPACE") {
                button.addEventListener('click', () => {
                    consoleInputEl.value = (consoleInputEl.value.length < 1 ? ' ' : consoleInputEl.value + ' ');
                })
            }

            if (button.innerHTML === "CLEAR") {
                button.addEventListener('click', () => {
                    consoleInputEl.value = '';
                })
            }

            if (button.innerHTML == "BACK<br>SPACE") {
                button.addEventListener('click', () => {
                    consoleInputEl.value = consoleInputEl.value.substr(0, consoleInputEl.value.length - 1);
                })
            }

            if (button.innerHTML == "ENTER") {
                button.addEventListener('click', () => {
                    runConsole();
                })
            }
        }

        this.flightManager.executeTick();

        // this.flightManager.play();
    }
}