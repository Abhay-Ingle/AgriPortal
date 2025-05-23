document.addEventListener("DOMContentLoaded", async function () {
    const farmerTableBody = document.getElementById("farmerTableBody");
    document.getElementById("submitform").addEventListener("submit",function() {
        window.location.href="../Pages_html/view_grivience.html";
});
    // Fetch and display farmer details
    async function fetchFarmers() {
        try {
            const response = await fetch("http://localhost:9000/farmers");
            const farmers = await response.json();
            displayFarmers(farmers);
        } catch (error) {
            console.error("Error fetching farmers:", error);
        }
    }

    function displayFarmers(farmers) {
        farmerTableBody.innerHTML = ""; // Clear previous data

        farmers.forEach((farmer, index) => {
            let row = `<tr>
                <td>${index + 1}</td>
                <td>${farmer.fullName}</td>
                <td>${farmer.dob}</td>
                <td>${farmer.gender}</td>
                <td>${farmer.aadhar}</td>
                <td>${farmer.mobile}</td>
                <td>${farmer.address}</td>
                <td>${farmer.farmArea} acres</td>
                <td>${farmer.landOwnership}</td>
                <td>${farmer.soilType}</td>
                <td>${farmer.waterSource}</td>
                <td>${farmer.irrigation}</td>
                <td>${farmer.cropType}</td>
                <td>${farmer.farmingType}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteFarmer('${farmer._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>`;
            farmerTableBody.innerHTML += row;
        });
    }

    // Search Functionality
    window.searchFarmers = function () {
        let input = document.getElementById("searchInput").value.toLowerCase();
        let rows = farmerTableBody.getElementsByTagName("tr");

        for (let row of rows) {
            let name = row.cells[1].innerText.toLowerCase();
            let mobile = row.cells[5].innerText.toLowerCase();
            row.style.display = (name.includes(input) || mobile.includes(input)) ? "" : "none";
        }
    };

    // Delete Farmer Functionality
    window.deleteFarmer = async function (farmerId) {
        if (confirm("Are you sure you want to delete this farmer?")) {
            try {
                const response = await fetch(`http://localhost:9000/api/farmerdetails/${farmerId}`, { method: "DELETE" });
                const result = await response.json();
                alert(result.message);
                fetchFarmers(); // Refresh the list
            } catch (error) {
                console.error("Error deleting farmer:", error);
            }
        }
    };

    await fetchFarmers(); // Load farmers when the page loads


  

});
