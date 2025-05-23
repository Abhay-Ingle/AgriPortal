document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const response = await fetch("http://localhost:9000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);

            // Store authentication token and user details in localStorage
            localStorage.setItem("authToken", data.token);
            localStorage.setItem("user", JSON.stringify(data.user)); // Store user details

            if (data.role === "Admin") {
                window.location.href = "../Pages_html/admin_dashboard.html";
            } else {
                window.location.href = "../Pages_html/home.html";
            }
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong. Please try again.");
    }
});
