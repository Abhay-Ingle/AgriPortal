document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("authToken");

    // Load the alert modal HTML
    fetch("../Pages_html/alert.html")
        .then(response => response.text())
        .then(html => {
            document.body.insertAdjacentHTML("beforeend", html);

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

    // After modal logic, attach form event listener
    const complaintForm1 = document.getElementById("complaintForm");
    const complaintCategory = document.getElementById("complaintCategory");
    const otherComplaintDiv = document.getElementById("otherComplaintDiv");
    const otherComplaintInput = document.getElementById("otherComplaint");

    // Show/Hide "Other Complaint" field based on selection
    complaintCategory.addEventListener("change", function () {
        if (this.value === "others") {
            otherComplaintDiv.style.display = "block";
            otherComplaintInput.setAttribute("required", "true");
        } else {
            otherComplaintDiv.style.display = "none";
            otherComplaintInput.removeAttribute("required");
        }
    });

    // Handle form submission
    complaintForm1.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("farmerName").value.trim();
        const mobileNumber = document.getElementById("mobileNumber").value.trim();
        const description = document.getElementById("description").value.trim();
        const uploadDocs = document.getElementById("uploadDocs");
        const complaintCategoryValue = complaintCategory.value;
        const otherComplaintValue = otherComplaintInput.value.trim();
        const submitBtn = document.querySelector("#complaintForm button[type='submit']");

        // Validation
        const mobilePattern = /^[6-9]\d{9}$/;
        if (!mobilePattern.test(mobileNumber)) {
            alert("Invalid mobile number.");
            return;
        }

        if (complaintCategoryValue === "others" && !otherComplaintValue) {
            alert("Please specify the complaint.");
            return;
        }

        if (uploadDocs.files.length > 0) {
            for (let i = 0; i < uploadDocs.files.length; i++) {
                const fileSize = uploadDocs.files[i].size / 1024 / 1024;
                if (fileSize > 4) {
                    alert("One or more files exceed the 4MB size limit.");
                    return;
                }
            }
        }

        // Prepare form data
        const formData = new FormData();
        formData.append("name", name);
        formData.append("mobileNumber", mobileNumber);
        formData.append("complaintCategory", complaintCategoryValue);
        formData.append("description", description);

        if (complaintCategoryValue === "others") {
            formData.append("otherComplaint", otherComplaintValue);
        }

        if (uploadDocs.files.length > 0) {
            formData.append("uploadDocs", uploadDocs.files[0]);
        }

        // Disable button while submitting
        submitBtn.disabled = true;
        submitBtn.innerText = "Submitting...";

        try {
            console.log("Sending grievance request to backend...");
            console.log("Token:", token);
            for (let pair of formData.entries()) {
                console.log(`${pair[0]}:`, pair[1]);
            }

            const response = await fetch("http://localhost:9000/grivience", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData,
            });

            console.log("Raw Response:", response);
            console.log("Response Status:", response.status);

            let data = {};
            try {
                data = await response.json();
                console.log("API Response:", data);
            } catch (error) {
                console.error("Error parsing JSON:", error);
                alert("Failed to parse server response.");
                return;
            }

            // Handle the response based on status
            if (response.ok) {
                // Show success alert
                const alertBox = document.getElementById("grievanceSuccess");
                alertBox.classList.remove("d-none");

                // Auto-hide after 5 seconds (optional)
                setTimeout(() => {
                    alertBox.classList.add("d-none");
                }, 5000);

                // Reset form
                // document.getElementById("complaintForm").reset();
                document.getElementById("otherComplaintDiv").style.display = "none";
            } else {
                alert(data?.error || "Grievance submission failed. Please try again.");
            }

        } catch (err) {
            console.error("Error submitting grievance:", err);
            alert("An error occurred. Please try again.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = "Submit";
        }
    });
});
