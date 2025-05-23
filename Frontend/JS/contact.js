document.getElementById("contactform").addEventListener("submit",async (event) => {
    event.preventDefault();
const farmername = document.getElementById("name").value.trim();
const mobileNumber = document.getElementById("mobile").value.trim();
const email = document.getElementById("email").value.trim();
const message = document.getElementById("message").value.trim();


try
{
    const response = await fetch("http://localhost:9000/api/contact", {
            method : "POST",
            headers : {"Content-Type":"application/json"},
            body : JSON.stringify({farmername,mobileNumber,email,message})
        });

const data  = await response.json();
if(response.ok)
{
   alert(data.message); 
}
else
{
   alert(data.error);
}
}
catch(error)
{
    console.error("Error",error);
    alert("Something went wrong please try again later...");
}
document.getElementById("contactform").reset();


});