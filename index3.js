/**  FOR DELHI */

const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');

console.log("before");

// Define the base URL
const baseUrl = "https://www.amazon.in/s?k=laptops&i=computers&rh=n%3A1375424031&page=";

// Array to store all data
let allData = [];
let lastPage = 8; // Set the last page number

// Function to fetch data for a given page
function fetchData(page) {
  const url = baseUrl + page;

  axios.get(url, {
    headers: {
      Accept: '*/*',
      host: 'www.amazon.in',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
    }
  })
    .then(response => {
      handleHtml(response.data, page);
    })
    .catch(error => {
      // Handle errors
      console.error("error:", error);
    });
}

// Function to handle HTML data
function handleHtml(data, page) {
  let selTool = cheerio.load(data);
  let targetedDivs = selTool('div.a-section.a-spacing-small.a-spacing-top-small');
  let res = [];
  targetedDivs.each((index, element) => {
    const divElement = selTool(element);
    const name = divElement.find('h2').text().trim();
    const price = divElement.find('span.a-price-whole').text().trim();
    let objName = name ? name : "not available";
    let objPrice = price ? price : "not available";
    res.push({ objName, objPrice });
  });
  allData = allData.concat(res);

  // If this is the last page, save all data to a single file
  if (allData.length && page === lastPage) {
    saveData(allData);
  }
}

// Function to save data to a single JSON file
function saveData(data) {
  const fileName = `lapdata_all_pages_${Date.now()}.json`;
  const filePath = path.join(__dirname, 'Data', fileName);

  // Write the accumulated data array to a single JSON file
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  console.log(`Data saved to file: ${filePath}`);
}

// Fetch data for pages 2 to lastPage
for (let page = 2; page <= lastPage; page++) {
  fetchData(page);
}
