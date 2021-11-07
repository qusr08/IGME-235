// 1
window.onload = (e) => {
    document.querySelector("#search").onclick = searchButtonClicked
};

// 2
let displayTerm = "";

// 3
function searchButtonClicked() {
    // console.log("searchButtonClicked() called");

    const GIPHY_URL = "https://api.giphy.com/v1/gifs/search?";
    let GIPHY_KEY = "dc6zaTOxFJmzC";

    // Build beginning of URL string
    let url = GIPHY_URL;
    url += "api_key=" + GIPHY_KEY;

    // Get the term that the user entered that we want to search for
    let term = document.querySelector("#searchterm").value;
    displayTerm = term;

    // Encode spaces and special characters to work in a url
    term = term.trim();
    term = encodeURIComponent(term);

    // If the term is less than 1 character long, don't search because nothing was entered
    if (term.length < 1) {
        return;
    }

    // Append the search term to the url
    url += "&q=" + term;

    // Append the user chosen search limit to the url
    let limit = document.querySelector("#limit").value;
    url += "&limit=" + limit;

    // Update the UI to inform the user that it is searching for a result
    document.querySelector("#status").innerHTML = "<b>Searching for '" + displayTerm + "'</b>";

    console.log(url);

    getData(url);
}

function getData(url) {
    let xhr = new XMLHttpRequest();

    // Set onload and onerror functions
    xhr.onload = dataLoaded;
    xhr.onerror = dataError;

    xhr.open("GET", url);
    xhr.send();
}

function dataLoaded(e) {
    // Print the loaded data
    let xhr = e.target;
    // console.log(xhr.responseText);

    // Parse all of the JSON data into an object
    let obj = JSON.parse(xhr.responseText);

    // If the object is null or doesn't contain anything, then there were no results or something else went wrong
    if (!obj.data || obj.data.length == 0) {
        document.querySelector("#status").innerHTML = "<b>No results found for '" + displayTerm + "'</br>";
        return;
    }

    // Get all of the results
    let results = obj.data;
    console.log("results.length = " + results.length);
    let bigString = "<p><i>Here are " + results.length + " results for '" + displayTerm + "'</i></p>";

    bigString += "<div class='results'>";

    // Loop through each of the results and add them to the content of the page
    for (let i = 0; i < results.length; i++) {
        let result = results[i];

        // Get the url to the gif
        let smallURL = result.images.fixed_width_downsampled.url;
        if (!smallURL) {
            smallURL = "images/no-image-found.png";
        }

        // Get the url to the Giphy page
        let url = result.url;

        // Build a <div> to hold each result
        let line = `<div class='result'><img src='${smallURL}' title='${result.id}'/>`;
        line += `<span><a target='_blank' href='${url}'>View on Giphy</a>`;
        line += `<p>Rating: ${(result.rating).toUpperCase()}</p></span></div>`;

        // Append the <div> to the main string
        bigString += line;
    }

    bigString += "</div>";

    // HTML has finished building, so display it to the user
    document.querySelector("#content").innerHTML = bigString;
    document.querySelector("#status").innerHTML = "<b>Success!</b>";
}

function dataError(e) {
    console.log("An error occurred. Yikes...");
}