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
    const response = await fetch("http://127.0.0.1:8000/category", {
        method: "GET",
        headers: {"Authorization": `Bearer ${getToken()}`
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
async function loadItems(){
    const response = await fetch("http://127.0.0.1:8000/item", {
        method: "GET",
        header: {"Authorization": `Bearer ${getToken()}`
        });
        const items = await response.json();

        const tabs = document.getElementById("item-tabs");
        const sections = document.getElementById("item-sections");

        return item
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
loadBookings()
createBooking()

// Page startup
DOMContentLoaded