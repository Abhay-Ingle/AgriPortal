document.addEventListener("DOMContentLoaded", function () {
    const GrivienceTableBody = document.getElementById("GrivienceTableBody");


    // Fetch and display grievances 
    async function fetchGriviences() {
        try {
            const response = await fetch("http://localhost:9000/grivience");
            const griviences = await response.json();
            displayGriviences(griviences);
        } catch(error) {
            console.error("Error:", error);
        }
    }

    function displayGriviences(griviences) {
        GrivienceTableBody.innerHTML = ""; // Clear previous data

        griviences.forEach((farmer, index) => {
            let row = `<tr>
                <td>${index + 1}</td>
                <td>${farmer.name}</td>
                <td>${farmer.mobileNumber}</td>
                <td>${farmer.complaintCategory}</td>
                <td>${farmer.description}</td>
                <td>${farmer.otherComplaint ? farmer.otherComplaint : "N/A"}</td>
                <td>${farmer.document ? `<a href="${farmer.document}" target="_blank">View Document</a>` : "No Document"}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteGrivience('${farmer._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>`;
            GrivienceTableBody.innerHTML += row;
        });
    }

    // Search Functionality
    window.searchGriviences = function () {
        let input = document.getElementById("searchInput").value.toLowerCase();
        let rows = GrivienceTableBody.getElementsByTagName("tr");

        for (let row of rows) {
            let name = row.cells[1].innerText.toLowerCase();
            let mobile = row.cells[2].innerText.toLowerCase(); // Corrected column index
            row.style.display = (name.includes(input) || mobile.includes(input)) ? "" : "none";
        }
    };

    // Delete Farmer Functionality
    window.deleteGrivience= async function (farmerId) {
        if (confirm("Are you sure you want to delete this grievance?")) {
            try {
                const response = await fetch(`http://localhost:9000/api/grivience/${farmerId}`, { method: "DELETE" });
                const result = await response.json();
                alert(result.message);
                fetchGriviences(); // Refresh the list
            } catch (error) {
                console.error("Error deleting grievance:", error);
            }
        }
    };

    // Load grievances when the "submitform" button is clicked
  

    // Automatically fetch data when the page loads
    fetchGriviences();
});
