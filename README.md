# Minecraft Batch Username Search

Quick batch search of names in JSON file (dictionary with 3 to 6 letter words provided as `words_alpha_6.json`). Done for fun as a favour so provided as is. The results folder has a file you can use for deepsearch and a file with the deepsearch results given at the time (no 6 letter words).

---

```
yarn start
```
First checks basic availability with this command. It runs `checkExists.js` and finishes with a JSON array file that can go straight in the deep search. 


```
yarn deepsearch
```
Properly checks if its available now, soon or blocked, much slower than the first command. It runs `checkDates.js` and finishes with a JSON object file.
