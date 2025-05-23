

document.addEventListener("DOMContentLoaded", function () {

    const token = localStorage.getItem("authToken");
    const userProfileDropdown = document.getElementById("userProfileDropdown");

    if (!token) {
        userProfileDropdown.style.display = "none"; // Hide profile dropdown if not logged in
    } else {
        userProfileDropdown.style.display = "block";
    }

    const username = localStorage.getItem("username");
    if (username && document.getElementById("welcomeUser")) {
        document.getElementById("welcomeUser").innerText = `Welcome, ${username}`;
    }

    // Load crop prices for the default state (Maharashtra)
    fetchCropPrices("Maharashtra");
});

const techLinks = {
    "drone technology": "https://www.faa.gov/uas",
    "iot-based irrigation": "https://www.iotforall.com/agriculture-iot",
    "ai-powered crop analysis": "https://ai.google/research/",
};

document.querySelectorAll(".tech-card").forEach(card => {
    card.style.cursor = "pointer"; // Add pointer cursor for better UX

    card.addEventListener("click", function (event) {
        // Ensure the click is on the card and not inner elements
        if (!event.target.closest(".tech-card")) return;

        // Normalize title for matching
        const title = this.querySelector(".card-title").innerText.trim().toLowerCase();
        
        if (techLinks[title]) {
            window.open(techLinks[title], "_blank");
        }
    });
});



function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("username");
    window.location.href = "../Pages_html/login.html";
}

async function getWeather(latitude, longitude) {
    const apiKey = "5f49bc05f8217b5e9445b15a5d5a3854"; // Your OpenWeather API key
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod === 200) {
            document.getElementById("weather").innerHTML = `
                <h3 class="text-success">${data.name}, ${data.sys.country}</h3>
                <p class="fs-5">🌡️ Temperature: <strong>${data.main.temp}°C</strong></p>
                <p class="fs-5">☁️ Weather: <strong>${data.weather[0].description}</strong></p>
            `;
        } else {
            document.getElementById("weather").innerHTML = `<p class="text-danger">${data.message}</p>`;
        }
    } catch (error) {
        document.getElementById("weather").innerHTML = `<p class="text-danger">Error fetching weather data!</p>`;
        console.error("Fetch error:", error);
    }
}

async function fetchCropPrices(state) {
    const apiKey = "579b464db66ec23bdd0000018d04290097a04710467ead3e3f40ed9b";
    const resourceID = "35985678-0d79-46b4-9ed6-6f13308a1d24";
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formattedDate = yesterday.toISOString().split('T')[0]; // yyyy-MM-dd format

    const url = `https://api.data.gov.in/resource/${resourceID}?api-key=${apiKey}&format=json&limit=20&filters[State]=${state}&filters[Arrival_Date]=${formattedDate}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); // Directly parse the response as JSON
        console.log("Parsed Data:", data);

        if (data.records && data.records.length > 0) {
            updateCropPricesTable(data.records);
        } else {
            document.getElementById("cropPricesBody").innerHTML = `<tr><td colspan="3">No crop price data available for ${state}</td></tr>`;
        }
    } catch (error) {
        console.error("Error fetching crop prices:", error);
        document.getElementById("cropPricesBody").innerHTML = `<tr><td colspan="3">Failed to load crop prices. Try again later.</td></tr>`;
    }
}



function updateCropPricesTable(records) {
    const tableBody = document.getElementById("cropPricesBody");
    tableBody.innerHTML = ""; // Clear previous content

    records.forEach(record => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${record.Commodity || "N/A"}</td>
            <td>₹ ${record.Modal_Price || "N/A"}</td>
            <td>${record.Market || "N/A"}</td>
        `;
        tableBody.appendChild(row);
    });
}

function getLocation() {
    if (!navigator.geolocation) {
        document.getElementById("weather").innerHTML = `<p class="text-danger">Geolocation is not supported by this browser.</p>`;
        return;
    }
    navigator.geolocation.getCurrentPosition(
        position => getWeather(position.coords.latitude, position.coords.longitude),
        error => {
            document.getElementById("weather").innerHTML = `<p class="text-danger">Location access denied!</p>`;
            console.error("Geolocation error:", error);
        }
    );
}
