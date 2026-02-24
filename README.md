# Orari Bus GTT
This project is a simple HTML + CSS + JavaScript frontend that allows users to view bus schedules for the public transportation system in Turin.

## How to use the app
The app is in Italian language, but it is very intuitive:
* Gruppo = Group
* Fermata = Stop
* Linea = Line

A group is composed of one or more stops. Each stop is associated to one or more lines. The user can choose which stops to include in a group, and for each stop, which lines to include.
This allows the user to create a customized view including only the strictly necessary information for him.

That being said, the app is very simple: 
* If a **group** is selected, the app will show the bus schedules for all the stops included in that group.
* A specific **stop** can be selected, and the app will show the bus schedules for that stop.

## Customizing the groups
Groups can be customized by clicking on the button at the very top of the page.
Three containers will appear on the screen, respectively for groups, stops and lines.
For every category, the user can select an item and either modify it (with a click on the pen symbol) or delete it (with a click on the X symbol). New items can be added by clicking on the + symbol.

### Example
Let's say that the user wants to create a group called "Home" including the stop "100", with the lines "9" and "11".
The steps are the following:
1. Click on the pen button at the top of the page
2. Click on the + symbol in the "Gruppi" container
3. Modify the name inside the textbox ("Home") **and click on the associated pen symbol** to save the changes
4. Click on the + symbol in the "Fermate" container 
5. Modify the name inside the textbox ("100") **and click on the associated pen symbol** to save the changes
6. Click on the + symbol in the "Linee" container
7. Modify the name inside the textbox ("9") **and click on the associated pen symbol** to save the changes
8. Repeat step 6 and 7 for line "11"
9. **Click on the save symbol** at the bottom of the three containers to save the changes in the local storage

### Local storage
When the save symbol is clicked, groups, stops and lines are saved in the local storage of the browser. This means that they will be available even after closing the browser, but they will not be available on other devices or browsers.

### Important notes
If a stop or a line does not exist, no data will be shown for that stop or line, but no error will be raised. This means that the user can create groups with non-existing stops or lines, but they will not show any data.

## Backend
Arrival times are retrieved thanks to GTFS data provided by GTT, the public transportation company of Turin. It provides a both a heavy static GTFS dataset, as well as a light realtime GTFS dataset.

Static GTFS data is updated by GTT every 24 hours, and contains the static information about bus arrival times, routes, stops,... 

Realtime GTFS data, instead, is updated every small amount of time and provides real-time information about bus delta times with respect to the static schedules.

The backend is a node.js server connected to a MongoDB database. Real-time GTFS data is managed directly by the backend, while static data is daily uploaded to the database. 
The trigger is a Netlify function, scheduled to run at 5:00 AM every day. It deletes the old content of the database and uploads the new static GTFS data. The database is necessary, as otherwise every API call would require to parse the whole static GTFS dataset, which is very heavy and would cause a lot of latency. With the database, instead, the backend can easily query the necessary information for each API call, without having to parse the whole dataset every time.

The frontend makes API calls to the backend, using as body a simple JSON object containing the list of stop codes for which the user wants to retrieve the bus schedules:
```json
body = { "stops": ["stop1", "stop2", ...] }
```

The backend, then, queries the database for the static GTFS data and directly downloads the realtime GTFS data.
After some processing, the API response is a JSON object in the following format:
```json
[
    {
    "stop": "stop_code",
    "line": "line_number",
    "hour": "23:44:11",
    "delay": delta_time_in_minutes,
    "realtime": true
    }
]
```
Where `delay` is the real-time delta time with respect to the static schedule and `hour` is the static scheduled time.

More details about the backend can be found in the [backend repository](https://github.com/stefano-galati/GTFS-test).

## Final comments
The main goal was to create a working app able to provide users with real-time schedules for the bus lines they are interested in. Comparing this app with other similar applications, this one is completely customizable, allowing users to quickly access groups of stops with a single click, without having to search for different stops.
The code is not optimized at all. It is actually quite messy and redundant, but for the purpose of this project it is not a problem. Thanks to this project I had the opportunity to work with GTFS data, query a MongoDB database and connecting the frontend with the backend through API calls. Overall it was very educational and I am satisfied with the result.