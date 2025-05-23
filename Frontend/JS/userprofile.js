// Redirect to login if not authenticated
if (!localStorage.getItem("authToken")) {
    alert("Session expired. Please log in again.");
    window.location.href = "login.html";
}

// Function to show different sections
async function showContent(section) {
    let contentDiv = document.getElementById("content");

    if (section === "editProfile") {
        console.log("Loading Edit Profile...");
        const response = await fetch("http://localhost:9000/userprofile", {
            method: "GET",
            headers: { "Authorization": `Bearer ${localStorage.getItem("authToken")}` }
        });

        if (!response.ok) {
            alert("Error loading profile data.");
            return;
        }

        const user = await response.json();
        contentDiv.innerHTML = `
            <h3>Edit Profile</h3>
            <label>Username:</label>
            <input type="text" id="username" value="${user.username}" class="form-control mb-2">
            <button class="btn btn-success" onclick="updateProfile()">Save Changes</button>
        `;
    } 
    
   
    
    else if (section === "changePassword") {
        contentDiv.innerHTML = `
            <h3>Change Password</h3>
            <input type="password" id="oldPassword" placeholder="Old Password" class="form-control mb-2">
            <input type="password" id="newPassword" placeholder="New Password" class="form-control mb-2">
            <input type="password" id="confirmPassword" placeholder="Confirm New Password" class="form-control mb-2">
            <button class="btn btn-success" onclick="changePassword()">Update Password</button>
        `;
    }
}

// Function to update profile
async function updateProfile() {
    const username = document.getElementById("username").value;
    const response = await fetch("http://localhost:9000/api/updateprofile", {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify({ username })
    });

    if (response.ok) {
        alert("Profile updated successfully!");
    } else {
        alert("Failed to update profile.");
    }
}

// Function to change password
async function changePassword() {
    const oldPassword = document.getElementById("oldPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
        alert("New passwords do not match!");
        return;
    }

    const response = await fetch("http://localhost:9000/api/changepassword", {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
    });

    if (response.ok) {
        alert("Password updated successfully!");
        logout();
    } else {
        alert("Failed to update password.");
    }
}

// Function to logout
function logout() {
    localStorage.removeItem("authToken");
    alert("You have been logged out.");
    window.location.href = "login.html";
}

// Make functions globally accessible
window.showContent = showContent;
window.updateProfile = updateProfile;
window.changePassword = changePassword;
window.logout = logout;
