const fs = require('fs');
const fetch = require("node-fetch");
let dictionary = require('./words_alpha_6.json');
let availableNames = [];

const getAvailableNames = async (names) => {
    const response = await fetch('https://api.mojang.com/profiles/minecraft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(names)
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}. Response: `);
    } else {
        const fullList = await response.json();
        //Only take the names from the JSON, make it lowercase
        const takenNames = fullList.map(item => item.name.toLowerCase());
        //Compare 2 lists and show only available ones 
        return names.filter(f => !takenNames.includes(f));
    }
}

//This can be nicer with a while loop
let counter = 0;
//Each request allows for 10 usernames
const totalRequests = Math.round(dictionary.length / 10);

const letsRoll = async () => {

    //Saving after every 50 requests in case something breaks
    if (counter % 16 == 0 && counter != 0) {
        //Sort them by length
        availableNames.sort((a, b) => a.length - b.length);
        //Temp write to file
        fs.writeFile("availableNamesTemp.json", JSON.stringify(availableNames, null, 2), (err) => {
            if (err) console.log(err);
            else console.log("Wrote temp file");
        });
    }

    //Main loop, keep going until we reach totalRequests
    if (counter < totalRequests) {
        //Take next 10 names and check if they are available
        const names = await getAvailableNames(dictionary.splice(0, 10)).catch(e => console.log(e));
        availableNames.push(...names);
        console.log("Currently at " + counter + "/" + totalRequests + ", found: " + names.join(","));
        counter++;

    } else {
        //Stop timer
        clearInterval(timerID);
        //Sort them by length
        availableNames.sort((a, b) => a.length - b.length);
        //Get Date
        const date = new Date()
        //Write to file
        fs.writeFile("availableNamesOn" + date.toLocaleDateString().replace(/\//g,"-") + ".json", JSON.stringify(availableNames, null, 2), (err) => {
            if (err) console.log(err);
            else console.log("Wrote final file");
        });
    }

}

//Runs around every 3 seconds, API requirements says 1 sec but doesn't seem to be enough.
let timerID = setInterval(letsRoll, 2700);
letsRoll();