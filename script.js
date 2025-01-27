const map = document.querySelector("svg");
const regions = document.querySelectorAll("path");
const sidePanel = document.querySelector(".side-panel");
const infoContainer = document.querySelector(".side-panel .container");
const closeButton = document.querySelector(".close-btn");
const loadingMessage = document.querySelector(".loading");
const rtNumberDisplay = document.querySelector(".rtNumber");
const houseNumberDisplay = document.querySelector(".house");
const headNumberDisplay = document.querySelector(".head");
const headName = document.querySelector(".name");

const regionData = {}; // Stores RT-level information grouped by house number and RT

// Automatically load Excel data
const loadExcelData = async (filePath) => {
    try {
        console.log(`Loading Excel file from: ${filePath}`);
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${filePath}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        if (!sheet) {
            throw new Error("No sheet found in the Excel file.");
        }
        const data = XLSX.utils.sheet_to_json(sheet);
        console.log(`Loaded data from ${filePath}:`, data);
        return data;
    } catch (error) {
        console.error(`Error loading Excel file (${filePath}):`, error);
        return [];
    }
};

const loadAndSyncData = async () => {
    try {
        // Load data from Excel files
        const biyenganData = await loadExcelData("./DataBiyengan.xlsx");

        // Process and separate family and RT data by house number and RT
        biyenganData.forEach((entry) => {
            const houseNumber = entry["No. Rumah"] || "Unknown";
            const rtNumber = entry["RT"] || "-";
            const key = `${houseNumber}-${rtNumber}`;

            // Initialize RT data if not already present
            if (!regionData[key]) {
                regionData[key] = {
                    rtNumber: rtNumber,
                    houseNumber: houseNumber,
                    family: [],
                };
            }

            // Add family data to the appropriate house and RT
            const familyEntry = {
                head: entry["No. Urut Keluarga"] || "Tidak Diketahui",
                name: entry["Kepala Keluarga"],
            };

            regionData[key].family.push(familyEntry);
        });

        console.log("Region Data:", regionData);
    } catch (error) {
        console.error("Error synchronizing data:", error);
    }
};

// Call the function to load and sync data
loadAndSyncData();

// Event listeners for map interactions
regions.forEach((region) => {
    // Click event for loading data
    region.addEventListener("click", function (e) {
        // Show loading message
        loadingMessage.innerText = "Loading...";
        infoContainer.classList.add("hide");
        loadingMessage.classList.remove("hide");
        sidePanel.classList.add("side-panel-open");

        // Extract the house number and RT from the class
        const className = e.target.classList.value; // Example: "1-RT01"
        const key = className; // Use the full class as the key

        if (!className) {
            loadingMessage.innerText = "No Data Available for Selected Region";
            return;
        }

        // Retrieve region data by the key
        const data = regionData[key];
        if (!data) {
            console.error(`No data found for house and RT: ${key}`);
            loadingMessage.innerText = "No Data Available for Selected Region";
            return;
        }

        // Render region data to the sidebar
        setTimeout(() => {
            rtNumberDisplay.innerText = data.rtNumber;

            const familyListHTML = data.family
                .map(
                    (family) =>
                        `<li><strong>No. Urut Keluarga ${family.head}</strong> (${family.name})</li>`
                )
                .join("");

            const familyContainer = document.querySelector(".family-list");
            familyContainer.innerHTML =
                familyListHTML || "<li>Tidak ada data Keluarga</li>";

            infoContainer.classList.remove("hide");
            loadingMessage.classList.add("hide");
        }, 500);
    });
});

// Close panel
closeButton.addEventListener("click", () => {
    sidePanel.classList.remove("side-panel-open");
});
