let selectedGroup = null;
let selectedStop = null;
let departures = [];

const groupsDiv = document.getElementById("groups");
const stopsDiv = document.getElementById("bus_stops");
const departuresDiv = document.getElementById("next_departures");
const modifiedGroupsDiv = document.getElementById("groups_modified");
const modifiedStopsDiv = document.getElementById("stops_modified");
const modifiedBusesDiv = document.getElementById("buses_modified");

const trams = ["3", "4", "9", "10", "13", "15", "16"];
const trainStations = ["TO Porta Susa", "TO Corso Grosseto"];

let modifyingGroups = false;

let groups = [
    {name: "Dalla Metro",
        stops: [
            {
                number: "TO Porta Susa",
                buses: []
            },
            {
                number: "597",
                buses: ["9", "16"]
            },
            {
                number: "3545",
                buses: ["60"]
            },
            {
                number: "3502",
                buses: ["2"]
            },
            {
                number: "1853",
                buses: ["62", "VE1"]
            }
        ]
    },
    {name: "Campus Einaudi",
        stops: [
            {
                number: "2293",
                buses: ["6", "19", "68"]
            },
            {
                number: "2286",
                buses: ["75", "77"]
            },
            {
                number: "212",
                buses: ["3"]
            },
            {
                number: "640",
                buses: ["16"]
            }
        ]
    }
];


function displayGroups() {
    // add groups into the "groups" div
    groupsDiv.innerHTML = "";
    
    groups.forEach(x => {
        let elem = document.createElement("div");
        let text = document.createElement("p");
        text.innerText = x.name;
        text.classList.add("group_text");
        elem.classList.add("group");
        elem.id = "Group_" + x.name;
        elem.appendChild(text);

        elem.addEventListener("click", async () => {
            departures = [];    // clear departures when changing group
            selectedGroup = groups.find(g => g.name == x.name);
            selectedStop = null;
            console.log("Selected group:", selectedGroup.name);
            console.log("Selected stop:", selectedStop?.number);
            updateScreen();
            await getDepartures();
        });

        groupsDiv.appendChild(elem);
    });
}

function appendTextBoxEditAndDeleteButtons(elem, text, on_change, on_delete) {
    // let textElem = document.createElement("p");
    // textElem.innerText = text;
    // elem.appendChild(textElem);

    let textBox = document.createElement("input");
    textBox.type = "text";
    textBox.value = text;
    // textBox.classList.add("hidden");
    elem.appendChild(textBox);

    let editButton = document.createElement("button");
    editButton.classList.add("edit_group_button");
    editButton.innerHTML = '<i class="fa-solid fa-pen"></i>';
    elem.appendChild(editButton);

    let deleteButton = document.createElement("button");
    deleteButton.classList.add("delete_group_button");
    deleteButton.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    elem.appendChild(deleteButton);

    editButton.addEventListener("click", () => {
        on_change(textBox.value);
    });
    deleteButton.addEventListener("click", () => {
        on_delete();
    });
}

function displayModifiedGroups(){
    modifiedGroupsDiv.innerHTML = "";
    
    groups.forEach(x => {
        let elem = document.createElement("div");
        appendTextBoxEditAndDeleteButtons(elem, x.name, (value) => {
            //on_change
            const index = groups.findIndex(g => g.name == x.name)
            groups[index].name = value;
            updateScreen();
        }, () => { 
            //on_delete
            groups.splice(groups.findIndex(g => g.name == x.name), 1);
            modifiedGroupsDiv.removeChild(elem);
            updateScreen();
        });

        elem.addEventListener("click", async () => {
            //console.log("Selected group:", x.name);
            modifiedBusesDiv.innerHTML = ""; // clear modified buses when changing group
            displayModifiedStops(x);
        });

        modifiedGroupsDiv.appendChild(elem);
    });

    // add button to add new group

    const addButton = document.createElement("button");
    addButton.id = "add_group_button";
    addButton.classList.add("add_button");
    addButton.innerHTML = '<i class="fa-solid fa-plus"></i>';
    addButton.addEventListener("click", () => {
        if(groups.find(g => g.name == "new")) {
            return; // prevent adding multiple "new" groups at once
        }
        
        const elem = document.createElement("div");
        groups.push({name: "new", stops: []});
        const newGroup = groups.find(g => g.name == "new");

        appendTextBoxEditAndDeleteButtons(elem, "new", (value) => {
            //on_change
            const index = groups.findIndex(g => g.name == "new");
            groups[index].name = value;
            updateScreen();
        }, () => {
            //on_delete
            groups.splice(groups.findIndex(g => g.name == "new"), 1);
            modifiedGroupsDiv.removeChild(elem);
            updateScreen();
        });

        elem.addEventListener("click", async () => {
            displayModifiedStops(newGroup);
        });

        modifiedGroupsDiv.insertBefore(elem, addButton);
        updateScreen();
    });

    modifiedGroupsDiv.appendChild(addButton);
}

function displayStops() {
    stopsDiv.innerHTML = "";
    selectedGroup.stops.forEach(x => {
        let elem = document.createElement("div");
        let text = document.createElement("p");
        text.innerText = x.number;
        text.classList.add("stop_text");
        elem.classList.add("stop");
        elem.id = "Stop_" + x.number;
        elem.appendChild(text);

        elem.addEventListener("click", () => {
            if(selectedStop && selectedStop.number == x.number) {
                selectedStop = null;
            }
            else{
                selectedStop = selectedGroup.stops
                    .find(s => s.number == x.number);
            }
            console.log("Selected group:", selectedGroup.name);
            console.log("Selected stop:", selectedStop?.number);
            updateScreen();
        });

        stopsDiv.appendChild(elem);
    });
}

function displayModifiedStops(group) {
    selectedGroup = group
    modifiedStopsDiv.innerHTML = "";

    selectedGroup.stops.forEach(x => {
        let elem = document.createElement("div");
        appendTextBoxEditAndDeleteButtons(elem, x.number, (value) => {
            //on_change
            x.number = value;
            updateScreen();
        }, () => {
            //on_delete
            selectedGroup.stops.splice(selectedGroup.stops.findIndex(s => s.number == x.number), 1);
            modifiedStopsDiv.removeChild(elem);
            updateScreen();
        });

        elem.addEventListener("click", async () => {
            //console.log("Selected group:", x.name);
            displayModifiedBuses(x);
        });

        modifiedStopsDiv.appendChild(elem);
    });

    // add button to add new stop
    const addButton = document.createElement("button");
    addButton.id = "add_stop_button";
    addButton.classList.add("add_button");
    addButton.innerHTML = '<i class="fa-solid fa-plus"></i>';
    addButton.addEventListener("click", () => {
        if(selectedGroup.stops.find(s => s.number == "new")) {
            return; // prevent adding multiple "new" stops at once
        }

        const elem = document.createElement("div");
        selectedGroup.stops.push({number: "new", buses: []});
        appendTextBoxEditAndDeleteButtons(elem, "new", (value) => {
            //on_change
            console.log("Change")
            const index = selectedGroup.stops.findIndex(s => s.number == "new");
            selectedGroup.stops[index].number = value;
            updateScreen();
        }, () => {
            //on_delete
            console.log("Delete")
            selectedGroup.stops.splice(selectedGroup.stops.findIndex(s => s.number == "new"), 1);
            modifiedStopsDiv.removeChild(elem);
            updateScreen();
        });
        modifiedStopsDiv.insertBefore(elem, addButton);
        updateScreen();
    });

    modifiedStopsDiv.appendChild(addButton);
}

function displayModifiedBuses(stop) {
    modifiedBusesDiv.innerHTML = "";

    stop.buses.forEach(x => {
        let elem = document.createElement("div");
        appendTextBoxEditAndDeleteButtons(elem, x, (value) => {
            //on_change
            const index = stop.buses.findIndex(b => b == x);
            stop.buses[index] = value;
            updateScreen();
        }, () => {
            //on_delete
            stop.buses.splice(stop.buses.findIndex(b => b == x), 1);
            modifiedBusesDiv.removeChild(elem);
            updateScreen();
        });
        modifiedBusesDiv.appendChild(elem);
    });

    // add button to add new bus
    const addButton = document.createElement("button");
    addButton.id = "add_bus_button";
    addButton.classList.add("add_button");
    addButton.innerHTML = '<i class="fa-solid fa-plus"></i>';
    addButton.addEventListener("click", () => {
        console.log(stop)
        if(stop.buses.find(b => b == "new")) {
            return; // prevent adding multiple "new" stops at once
        }

        const elem = document.createElement("div");
        stop.buses.push("new");
        appendTextBoxEditAndDeleteButtons(elem, "new", (value) => {
            //on_change
            const index = stop.buses.findIndex(b => b == "new");
            stop.buses[index] = value;
            updateScreen();
        }, () => {
            //on_delete
            stop.buses.splice(stop.buses.findIndex(b => b == "new"), 1);
            modifiedBusesDiv.removeChild(elem);
            updateScreen();
        });
        modifiedBusesDiv.insertBefore(elem, addButton);
        updateScreen();
    });

    modifiedBusesDiv.appendChild(addButton);
}

function updateScreen() {
    displayGroups();
    displayStops();
    displayDepartures();

    // modify style of selected group and stop
    if (selectedGroup) {
        document.getElementById("Group_" + selectedGroup.name)
            .classList.add("selected_group");
    }
    if (selectedStop) {
        document.getElementById("Stop_" + selectedStop.number)
            .classList.add("selected_stop");
    }
}

async function getDepartures() {
    //get bus departures
    console.log("Getting bus departures...");
    loading_screen();
    await getBusDepartures();
    //await simulateWait();
    //get train departures
    console.log("Getting train departures...");
    const trainStationsInGroup = selectedGroup.stops
        .map(s => s.number)
        .filter(n => trainStations.includes(n));
    for (const station of trainStationsInGroup) {
        const trainDepartures = await getTrainDepartures(station);
        departures = departures.concat(trainDepartures);
    }

    //sort departures by minuteDifference and update screen
    departures.sort((a, b) => a.minuteDifference > b.minuteDifference ? 1 : -1);
    console.log("All departures:");
    console.log(departures);
    updateScreen();
}

async function getBusDepartures() {
    const stopCodes = selectedGroup.stops.map(s => s.number); //train stop codes are not present in GTT data
    const body = { "stops": stopCodes }

    try{
        let response = [];

        if(!modifyingGroups) {
            response = await fetch(`https://gttrealtimearrivals.netlify.app/.netlify/functions/getarrival`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });
        }
        
        if (!response.ok) throw new Error("Network response was not ok");
        
        // const response = []; //mock response for testing without hitting the API too much

        let data = await response.json();
        console.log("Raw data:");
        console.log(data);

        data = data.filter(d => selectedGroup.stops.find(s => s.number == d.stop)
            .buses.includes(d.line));
        // add stop number and remove seconds from hour
        data = data.map(d => ({...d, hour: d.hour.split(":").slice(0,2).join(":"), 
            minuteDifference: getMinuteDifference(d.hour)}));
        
        departures = data;

        departures.sort((a, b) => a.minuteDifference > b.minuteDifference ? 1 : -1);
        console.log("Filtered departures:");
        console.log(departures);
        updateScreen();

    } catch (error) {
        departuresDiv.innerText = "Failed to load departures.";
        console.error(error);
    }
}

async function getTrainDepartures(station) {

    let filename = "";
    if(station === "TO Porta Susa") filename = "treniVersoGrosseto" 
    else if(station === "TO Corso Grosseto") filename = "treniVersoSusa"
    else return;
    
    const time = new Date();
    let trainDepartures = [];

    try {
        const response = await fetch("./" + filename + ".json");
        if (!response.ok) throw new Error("Failed to fetch train departures");
        trainDepartures = await response.json();
    } catch (error) {
        console.error(error);
        return;
    }

    const newDepartures = trainDepartures
        .filter(x => x.hour * 60 + x.minute >= time.getHours() * 60 + time.getMinutes())
        //no need to deal with after-midnight problems, as there are no trains then
        .filter(x => x.day.includes(time.getDay())) // filter by day of the week
        .slice(0, 2)  // get only the next 2 departures
        .map(x => {
            return {
                line: x.id,
                hour: x.hour.toString() + ":" + x.minute.toString().padStart(2, "0"),
                realtime: false,
                minuteDifference: getMinuteDifference(x.hour.toString() + ":" + x.minute.toString().padStart(2, "0")),
                stop: station
            }
        });

    console.log("newDepartures");
    console.log(newDepartures);
    return newDepartures;
}

function displayDepartures() {
    departuresDiv.innerHTML = "";

    if (departures.length === 0) {
        departuresDiv.innerText = "Nessuna partenza in programma";
    }
    else{
        departures.forEach(d => {
            // if a stop is selected, show only departures for that stop
            if(selectedStop && d.stop != selectedStop.number){
                return;
            }

            let elem = document.createElement("div");
            elem.classList.add("departure");
            if(d.realtime) {
                elem.classList.add("realtime");
            }

            let icon = document.createElement("i");
            if(trams.includes(d.line)) {
                icon.classList.add("icon", "fa-solid", "fa-train-tram", "fa-xl");
            }
            else if(trainStations.includes(d.stop)){
                icon.classList.add("icon", "fa-solid", "fa-train", "fa-xl");
            }
            else{
                icon.classList.add("icon", "fa-solid", "fa-bus-simple", "fa-xl");
            }

            let internalDiv = document.createElement("div");
            internalDiv.classList.add("departure_internal_div");

            let stopName = document.createElement("p");
            stopName.classList.add("stop_name");
            stopName.innerText = d.stop;

            let lineNumber = document.createElement("p");
            lineNumber.innerText = d.line;
            lineNumber.classList.add("line_number");

            internalDiv.appendChild(lineNumber);
            internalDiv.appendChild(stopName);

            /*
            let departureTime = document.createElement("p");
            departureTime.innerText = d.hour;
            departureTime.classList.add("departure_time");
            */

            let remainingTime = document.createElement("p");
            remainingTime.innerText = d.minuteDifference.toString() + " min"
                + (d.realtime ? "*" : "");
            remainingTime.classList.add("remaining_time");
            
            elem.appendChild(icon);
            elem.appendChild(internalDiv);
            elem.appendChild(remainingTime);
            //elem.appendChild(departureTime);
            departuresDiv.appendChild(elem);
        });
    }
}

function getMinuteDifference(scheduledTime) {
    const time = new Date();
    const hour = time.getHours();
    const minute = time.getMinutes();
    const day = time.getDay();

    const [schedHour, schedMinute, schedSeconds] = scheduledTime.split(":").map(Number);
    let minutes = (schedHour - hour) * 60 + (schedMinute - minute);
    
    if(schedHour==0 & hour==23) {
        minutes += 24 * 60; // handle next day departures
    }

    return minutes;
}

async function simulateWait() {
    loading_screen();
    // simulate waiting for 5 seconds
    return new Promise(resolve => setTimeout(resolve, 5000));
}

function loading_screen(){
    const elem = document.createElement("img");
    elem.id = "loading_image";
    elem.classList.add("wiggly-spin");
    elem.src = "images/tram_transparent.png";

    departuresDiv.innerHTML = "";
    departuresDiv.appendChild(elem);
}

function initial_setup() {
    // initial setup

    const customizeButton = document.getElementById("modify_groups_button");
    customizeButton.addEventListener("click", () => {
        const customizeDiv = document.getElementById("modify_groups_container");
        customizeDiv.classList.toggle("hidden");
        modifyingGroups = !modifyingGroups;
        customizeButton.style.backgroundColor = modifyingGroups ? "yellow" : "lightblue";
        displayModifiedGroups();
    });

    const localSaveButton = document.getElementById("local_save_button");
    localSaveButton.addEventListener("click", () => {
        console.log("Saving to local storage...");
        console.log(groups);
        localStorage.setItem("groups", JSON.stringify(groups));
    });

    const local_storage = localStorage.getItem("groups");
    if(local_storage) {
        try {
            const parsedGroups = JSON.parse(local_storage);
            groups = parsedGroups;
            console.log("Loaded groups from local storage");
            console.log(groups);
        }
        catch (error) {
            console.error("Failed to parse groups from local storage:", error);
        }
    }

    selectedGroup = groups[0];
    console.log("Selected group:", selectedGroup.name);
    console.log("Selected stop:", selectedStop?.number);
    updateScreen();
    getDepartures();
}

initial_setup();