const map = document.querySelector("svg");
const countries = document.querySelectorAll("path");
const sidePanel = document.querySelector(".side-panel");
const container = document.querySelector(".side-panel .container");
const closeBtn = document.querySelector(".close-btn");
const loading = document.querySelector(".loading");
const zoomInBtn = document.querySelector(".zoom-in");
const zoomOutBtn = document.querySelector(".zoom-out");
const zoomValueOutput = document.querySelector(".zoom-value");
const countryNameOutput = document.querySelector(".country-name");
const countryFlagOutput = document.querySelector(".country-flag");
const cityOutput = document.querySelector(".city");
const areaOutput = document.querySelector(".area");
const currencyOutput = document.querySelector(".currency");
const LanguagesOutput = document.querySelector(".languages");

let countryData = {};

// Automatically load Excel data
const loadExcelData = async () => {
    try {
        const response = await fetch('./Data.xlsx'); // Ensure the file is in the same directory
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const parsedData = XLSX.utils.sheet_to_json(sheet);

        // Process data into a usable format
        countryData = parsedData.reduce((acc, country) => {
            acc[country.Name.toLowerCase()] = country; // Assuming "Name" column
            return acc;
        }, {});

        console.log("Excel file loaded successfully!");
    } catch (error) {
        console.error("Error loading Excel file:", error);
        loading.innerText = "Failed to load Excel data.";
    }
};

// Call the function on page load
loadExcelData();

// Event listeners for map interactions
countries.forEach((country) => {
    country.addEventListener("mouseenter", function () {
        const selector = "." + [...this.classList].join(".");
        document.querySelectorAll(selector).forEach((el) => (el.style.fill = "#e92021"));
    });

    country.addEventListener("mouseout", function () {
        const selector = "." + [...this.classList].join(".");
        document.querySelectorAll(selector).forEach((el) => (el.style.fill = "#1a1a1a"));
    });

    country.addEventListener("click", function (e) {
        loading.innerText = "Loading...";
        container.classList.add("hide");
        loading.classList.remove("hide");
        console.log("Country clicked! Opening sidebar...");
        sidePanel.classList.add("side-panel-open");

        const clickedCountryName = e.target.getAttribute("name")?.toLowerCase() || e.target.classList.value.toLowerCase();
        console.log("Clicked country name:", clickedCountryName); // Debug name

        const data = countryData[clickedCountryName];
        if (!data) {
            console.error(`No data found for country: ${clickedCountryName}`);
            loading.innerText = "No Data Available for Selected Country";
            return;
        }

        setTimeout(() => {
            countryNameOutput.innerText = data.Name;
            countryFlagOutput.src = data.Flag; // Ensure Excel column has valid image URLs
            cityOutput.innerText = data.Capital;
            areaOutput.innerHTML = `${Number(data.Area).toLocaleString()} km<sup>2</sup>`;
            currencyOutput.innerHTML = `<li>${data.Currency}</li>`;
            LanguagesOutput.innerHTML = `<li>${data.Languages}</li>`;
            countryFlagOutput.onload = () => {
                container.classList.remove("hide");
                loading.classList.add("hide");
            };
        }, 500);
    });
});

// Close panel
closeBtn.addEventListener("click", () => {
    sidePanel.classList.remove("side-panel-open");
});

// Zoom controls
let zoomValue = 100;
zoomOutBtn.disabled = true;

zoomInBtn.addEventListener("click", () => {
    zoomOutBtn.disabled = false;
    zoomValue += 100;
    if (zoomValue >= 500) zoomInBtn.disabled = true;
    map.style.width = zoomValue + "vw";
    map.style.height = zoomValue + "vh";
    zoomValueOutput.innerText = zoomValue + "%";
});

zoomOutBtn.addEventListener("click", () => {
    zoomInBtn.disabled = false;
    zoomValue -= 100;
    if (zoomValue <= 100) zoomOutBtn.disabled = true;
    map.style.width = zoomValue + "vw";
    map.style.height = zoomValue + "vh";
    zoomValueOutput.innerText = zoomValue + "%";
});
