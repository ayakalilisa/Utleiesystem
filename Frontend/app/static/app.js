//This is what the frontend do
// Backend URL
console.log("app.js loaded");
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
    console.log("loginAdmin was called");
    event.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const errorBox = document.getElementById("error-message-box");
    const errorMessage = document.getElementById("error-message");

    errorMessage.textContent = "";
    errorBox.classList.add("hidden");

    try {
        const response = await fetch("http://127.0.0.1:8000/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        if (!response.ok) {
            const errorData = await response.json();

            errorBox.classList.remove("hidden");

            if (response.status === 422 && Array.isArray(errorData.detail)) {
                const firstError = errorData.detail[0];
                const field = firstError.loc[firstError.loc.length - 1];

                if (field === "email") {
                    errorMessage.textContent = "Ugyldig e-postadresse.";
                } else if (field === "password") {
                    errorMessage.textContent = "Passordet må være mellom 6 og 20 tegn.";
                } else {
                    errorMessage.textContent = "Ugyldig innlogging. Sjekk feltene.";
                }

                return;
            }

            errorMessage.textContent = errorData.detail || "Innlogging feilet.";
            return;
        }

        const data = await response.json();
        saveToken(data.access_token);
        window.location.href = "/dashboard";

    } catch (error) {
        errorMessage.textContent = "Kunne ikke koble til serveren";
        errorBox.classList.remove("hidden");
    }
}


function closeErrorMessage() {
    const errorBox = document.getElementById("error-message-box");
    const errorMessage = document.getElementById("error-message");

    errorMessage.textContent = "";
    errorBox.classList.add("hidden");
}


//Register
async function RegisterAdmin(event) {
    console.log("RegisterAdmin was called");
    event.preventDefault();

    const FN = document.getElementById("firstname").value;
    const MN = document.getElementById("middlename").value;
    const EN = document.getElementById("lastname").value;
    const telefon = document.getElementById("telefon").value;
    const email = document.getElementById("register-email").value;
    const confirmEmail = document.getElementById("repeat-email").value;
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("repeat-password").value;

    const errorBox = document.getElementById("register-error-box");
    const errorMessage = document.getElementById("register-error-message");

    const successBox = document.getElementById("register-success-box");
    const successMessage = document.getElementById("register-success-message");

    errorMessage.textContent = "";
    errorBox.classList.add("hidden");

    successMessage.textContent = "";
    successBox.classList.add("hidden");



    if (!FN || !EN || !telefon || !email || !confirmEmail || !password || !confirmPassword) {
        errorBox.classList.remove("hidden");
        errorMessage.textContent = "Alle felt med * må fylles ut.";
        return;
    }

    if (email !== confirmEmail) {
        errorBox.classList.remove("hidden");
        errorMessage.textContent = "E-postadressene er ikke like.";
        return;
    }

    if (password !== confirmPassword) {
        errorBox.classList.remove("hidden");
        errorMessage.textContent = "Passordene er ikke like.";
        return;
    }

    if (password.length < 6 || password.length > 20) {
        errorBox.classList.remove("hidden");
        errorMessage.textContent = "Passordet må være mellom 6 og 20 tegn.";
        return;
    }

    const response = await fetch("http://127.0.0.1:8000/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            first_name: FN,
            middle_name: MN || null,
            last_name: EN,
            contact: telefon,
            email: email,
            password: password
        })
    });

    if (!response.ok) {
        const errorData = await response.json();

        errorBox.classList.remove("hidden");
        errorMessage.textContent = errorData.detail || "Kunne ikke registrere admin.";
        return;
    }

    event.target.reset();

    if(response.ok){
        successBox.classList.remove("hidden");
        successMessage.textContent = "Vellykket! Omdirigerer tilbake til innloggingssiden";

        setTimeout(() => {
        window.location.href = "/login";
            }, 3000);
        }

}

function closeRegisterErrorMessage() {
    const errorBox = document.getElementById("register-error-box");
    const errorMessage = document.getElementById("register-error-message");

    errorMessage.textContent = "";
    errorBox.classList.add("hidden");
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


//Filter
function applyItemFilters() {
    const selectedStatus = document.getElementById("filterStatus").value;
    const selectedCategory = document.getElementById("filterCategory").value;
    const sortValue = document.getElementById("sortItems").value;

    let filteredItems = [...allItems];

    if (selectedStatus) {
        filteredItems = filteredItems.filter(item => item.status === selectedStatus);
    }

    if (selectedCategory) {
        filteredItems = filteredItems.filter(
            item => item.category_id === Number(selectedCategory)
        );
    }

    if (sortValue === "id-asc") {
        filteredItems.sort((a, b) => a.id - b.id);
    }

    if (sortValue === "id-desc") {
        filteredItems.sort((a, b) => b.id - a.id);
    }

    if (sortValue === "status-asc") {
        filteredItems.sort((a, b) => a.status.localeCompare(b.status));
    }

    if (sortValue === "category-asc") {
        filteredItems.sort((a, b) => a.category_id - b.category_id);
    }

    renderItems(filteredItems);
}



// Categories
async function loadCategories() {
    const response = await fetch("http://127.0.0.1:8000/category/", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${getToken()}`
        }
    });

    const categories = await response.json();

    const tabs = document.getElementById("category-tabs");
    const placeholder = document.getElementById("category-placeholder");
    const sections = document.getElementById("category-sections");

    if (categories.length === 0) {
        placeholder.style.display = "inline";
        return;
    }

    placeholder.style.display = "none";

    categories.forEach(category => {
        // create bookmark tab
        // create matching section
    });
}


async function createCategory(event) {
    event.preventDefault();

    const categoryName = document.getElementById("categoryName").value;
    const description = document.getElementById("categoryDescription").value;
    const errorMessage = document.getElementById("errorMessage");

    if (errorMessage) {
        errorMessage.textContent = "";
    }

    const response = await fetch("http://127.0.0.1:8000/category/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify({
            category_name: categoryName,
            description: description
        })
    });

    if (!response.ok) {
        if (errorMessage) {
            errorMessage.textContent = "Kunne ikke opprette kategori.Ikke autorisert.";
        }
        return;
    }

    const category = await response.json();
    event.target.reset();
    loadCategories();

    return category;
}

function AddCategoryForm(){
    const form = document.getElementById("AddCategoryForm");
    form.classList.remove("hidden");
    }

function handleCategoryChoice() {
    const categorySelect = document.getElementById("itemCategoryId");

    if (categorySelect.value === "create-new") {
        AddCategoryForm();
    }
}





// Items
async function loadItems() {
    const response = await fetch("http://127.0.0.1:8000/item/", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${getToken()}`
        }
    });

    const items = await response.json();

    const tabs = document.getElementById("item-tabs");
    const sections = document.getElementById("item-sections");

    return items;
}


async function createItem(event) {
    event.preventDefault();

    const itemId = document.getElementById("itemId").value;
    const itemStatus = document.getElementById("itemStatus").value;
    const itemCategory = document.getElementById("itemCategory").value;
    const itemComment = document.getElementById("itemComment").value;
    const errorMessage = document.getElementById("errorMessage");

    if (errorMessage) {
        errorMessage.textContent = "";
    }

    const response = await fetch("http://127.0.0.1:8000/item/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify({
            name: itemName,
            status: itemStatus,
            category_id: Number(itemCategoryId),
            comments: itemComment
        })
    });

    if (!response.ok) {
        if (errorMessage) {
            errorMessage.textContent = "Kunne ikke opprette ny vare.";
        }
        return;
    }

    const item = await response.json();

    event.target.reset();
    loadItems();

    return item;
}


function AddItemForm(){
    const form = document.getElementById("AddItemForm");
    form.classList.remove("hidden");
    }


// Bookings
function loadBookings(){}
function createBooking(event){
    event.preventDefault();}
}

//Users
function showAddUserForm() {}
function createUser(event) {
    event.preventDefault();
}
function showAddCategoryForm() {}
function createCategory(event) {
    event.preventDefault();
}
function createItem(event) {
    event.preventDefault();
}

// Checkpoints
window.RegisterAdmin = RegisterAdmin;
console.log("RegisterAdmin type:", typeof RegisterAdmin);