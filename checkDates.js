const fs = require('fs');
const readline = require('readline-sync');  
const fetch = require("node-fetch");
let availableNames = [];

// PUT YOUR NEW JSON FILE IN THE FOLLOWING LINE!
let dictionary = require("./results_11-10-2020/availableNames.json");

console.log("This script runs a username every 3 seconds, make sure your computer stays on.");
console.log("The bearer token is valid for 1 hour. You can find it in your cookies on minecraft.net when logged in.");
console.log("If you get lots of 'Banned' results, you're token is invalid.");
const token = readline.question("Enter your bearer token:");  

let d = new Date();
d.setDate(d.getDate()-37);
const secondsSinceEpoch = Math.round(d.getTime() / 1000);  

const checkNameUUID = async (name) => {
    const response = await fetch("https://api.mojang.com/users/profiles/minecraft/" + name + "?at=" + secondsSinceEpoch, {
        headers: { 'Authorization': 'Bearer ' + token },
    });
    if (!response.ok && response.status != 404) {
        throw new Error(`HTTP error! status: ${response.status}. Response: `);
    } else {
        //Name is free or banned
        if(response.status == 204) {
            return "blocked";
        } else if (response.status == 404) {
            return false;
        } else {
            //Check when name is available by looking at UUID
            const newName = await response.json();
            //Check if name is actually occupied
            if (newName.name.toLowerCase() == name) return "occupied";
            else return newName.id;
        }
    }
}

const getDate = async (id) => {
    const response = await fetch("https://api.mojang.com/user/profiles/" + id + "/names");
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}. Response: `);
    } else {
        const names = await response.json();
        //Check when name was last changed
        let changedAt = new Date(names[names.length-1].changedToAt);
        //Set date 37 days further to when it's available
        changedAt.setDate(changedAt.getDate()+37);
        return changedAt.toLocaleString();
    }
}

//This can be nicer with a while loop
let counter = 0;
const totalRequests = dictionary.length;

const letsRoll = async () => {

    const current = {
        name: dictionary.shift(),
        available: "Yes",
        date: ""
    }

    //Saving after every 50 requests in case something breaks
    if (counter % 16 == 0 && counter != 0) {
        //Temp write to file
        fs.writeFile("dateNamesTemp.json", JSON.stringify(availableNames, null, 2), (err) => {
            if (err) console.log(err);
            else console.log("Wrote temp file");
        });
    }

    //Main loop, keep going until we reach totalRequests
    if (counter < totalRequests) {
        const nameUUID = await checkNameUUID(current.name).catch(e => console.log(e));

        if (nameUUID == "occupied") {
            current.available = "No"
        } else if (nameUUID == "blocked") {
            current.available = "Blocked"
        } else if (nameUUID) {
            const date = await getDate(nameUUID).catch(e => console.log(e));
            current.available = "Soon";
            current.date = date;
        } 

        availableNames.push(current);
        console.log("Currently at " + counter + "/" + totalRequests + ", " + current.name + " is " + current.available);
        counter++;

    } else {
        //Stop timer
        clearInterval(timerID);
        //Get Date
        const date = new Date()
        //Write to file
        fs.writeFile("dateNamesOn" + date.toLocaleDateString().replace(/\//g,"-") + ".json", JSON.stringify(availableNames, null, 2), (err) => {
            if (err) console.log(err);
            else console.log("Wrote final file");
        });
    }

}

//Runs around every 3 seconds, API requirements says 1 sec but doesn't seem to be enough.
let timerID = setInterval(letsRoll, 2800);
letsRoll();