//This is what the frontend do
// Backend URL
const API_BASE_URL = "http://127.0.0.1:8000";

// Token helpers
function getToken() {
    return localStorage.getItem("access_token");
}

function saveToken(token) {
    localStorage.setItem("access_token", token);
}

function logout() {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
}

function authHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
    };
}

// Login
async function loginAdmin(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");

    errorMessage.textContent = "";

    try{
        const response = await fetch("http://127.0.0.1:8000/auth/login",
        {method: "POST",
        headers: { "Content-Type": "application/json"},
                    body: JSON.stringify({
                    email: email,
                    password: password
                  })
        });

        if (!response.ok){
        errorMessage.textContent = "Feil e-post eller passord.";
        return;
        }
        const data = await response.json();
        saveToken(data.access_token);
        window.location.href = "/dashboard";

        } catch (error) {
            errorMessage.textContent = "Kunne ikke koble til serveren";
            }
        }

// Users
async function loadUsers(){
    const response = await fetch ("http://127.0.0.1:8000/users",
    {method:"GET",
    headers: {"Authorization": `Bearer ${getToken()}`}
    });

    const user = await response.json();

    if (!response.ok){
    errorMessage.textContent = "Finnes ingen varer";

    return user;
    }


createUser()

// Categories
loadCategories()
createCategory()

// Items
loadItems()
createItem()

// Bookings
loadBookings()
createBooking()

// Page startup
DOMContentLoaded