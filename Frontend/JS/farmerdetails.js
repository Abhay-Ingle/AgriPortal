document.addEventListener("DOMContentLoaded", function () {
    fetch("../Pages_html/alert.html")
        .then(response => response.text())
        .then(html => {
            document.body.insertAdjacentHTML("beforeend", html);

            const token = localStorage.getItem("authToken");

            if (!token) {
                const alertModal = new bootstrap.Modal(document.getElementById("customAlertModal"), {
                    backdrop: 'static',
                    keyboard: false
                });

                alertModal.show();

                document.getElementById("redirectToLogin").addEventListener("click", function () {
                    window.location.href = "../Pages_html/login.html";
                });

                document.getElementById("closeAlertModal").addEventListener("click", function () {
                    window.location.href = "../Pages_html/home.html";
                });
            }

            console.log("Token found:", token);
        })
        .catch(error => console.error("Error loading alert.html:", error));
});

document.getElementById("registerForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    // Get form data
    const fullName = document.getElementById("fullName").value.trim();
    const dob = document.getElementById("dob").value;
    const gender = document.getElementById("gender").value;
    const aadhar = document.getElementById("aadhar").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const address = document.getElementById("issueDescription").value.trim();
    const farmArea = document.getElementById("farmArea").value.trim();
    const landOwnership = document.getElementById("landOwnership").value;
    const soilType = document.getElementById("soilType").value;
    const waterSource = document.getElementById("waterSource").value;
    const irrigationFacility = document.querySelector('input[name="irrigation"]:checked');
    const cropType = document.getElementById("cropType").value.trim();
    const farmingType = document.getElementById("farmingType").value;

    // Client-side validation
    if (!fullName) return alert("Full Name is required.");
    if (!dob) return alert("Date of Birth is required.");
    if (!gender) return alert("Please select your Gender.");
    if (!aadhar.match(/^\d{12}$/)) return alert("Aadhar number must be exactly 12 digits.");
    if (!mobile.match(/^[6-9]\d{9}$/)) return alert("Mobile number must be 10 digits and start with 6-9.");
    if (!address) return alert("Address is required.");
    if (!farmArea || isNaN(farmArea) || Number(farmArea) <= 0) return alert("Please enter a valid Farm Area in acres.");
    if (!landOwnership) return alert("Please select Land Ownership.");
    if (!soilType) return alert("Please select Soil Type.");
    if (!waterSource) return alert("Please select Water Source.");
    if (!irrigationFacility) return alert("Please select if you have an Irrigation Facility.");
    if (!cropType) return alert("Please enter the Types of Crops Grown.");
    if (!farmingType) return alert("Please select Farming Type.");

    const farmerData = {
        fullName,
        dob,
        gender,
        aadhar,
        mobile,
        address,
        farmArea,
        landOwnership,
        soilType,
        waterSource,
        irrigationFacility: irrigationFacility.value,
        cropType,
        farmingType
    };

    const token = localStorage.getItem("authToken");
    if (!token) {
        alert("Unauthorized access! Please login.");
        return (window.location.href = "../Pages_html/login.html");
    }

    try {
        const response = await fetch("http://localhost:9000/farmerdetails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(farmerData),
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message || "Registration successful!");
            document.getElementById("registerForm").reset();
            window.location.href = "../Pages_html/home.html";
        } else {
            // Handle known errors (e.g. duplicate aadhar)
            if (result?.error) {
                alert(result.error);
            } else {
                alert("Registration failed. Please try again.");
            }
        }
    } catch (error) {
        console.error("Error submitting farmer data:", error);
        alert("An error occurred while submitting the form.");
    }
});
