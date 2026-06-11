//This is what the frontend do
// Backend URL

console.log("app.js loaded");
const API_BASE_URL = "http://127.0.0.1:8000";

let allItems = [];
let selectedCategoryId = "all";

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

function renderItems(items) {
    const itemList = document.getElementById("item-list");
    const emptyMessage = document.getElementById("empty-item-message");

    // clear old cards
    itemList.innerHTML = "";

    // if no items
    if (items.length === 0) {
        emptyMessage.classList.remove("hidden");
        return;
    }

    // hide empty message
    emptyMessage.classList.add("hidden");

    // create item cards
    items.forEach(item => {
        const card = document.createElement("article");
        card.classList.add("item-card");

        card.innerHTML = `
            <div class="item-image-placeholder"></div>
            <div>ID: ${item.id}</div>
            <div>Status: ${item.status}</div>
            <div>Kommentar: ${item.comments || "Ingen kommentar"}</div>
            <button type="button">Rediger</button>
        `;

        itemList.appendChild(card);
    });
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

    allItems = items;

    renderItems(allItems);
}

function ShowCategoryItems(categoryId) {
    selectedCategoryId = categoryId;

    let itemsToShow = [...allItems];

    if (categoryId !== "all") {
        itemsToShow = itemsToShow.filter(
            item => item.category_id === Number(categoryId)
        );
    }

    renderItems(itemsToShow);
}

async function createItem(event) {
    event.preventDefault();

    const itemId = document.getElementById("itemId").value;
    const itemBrand = document.getElementById("itemBrand").value;
    const itemSize = document.getElementById("itemSize").value;
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
            brand: itemBrand,
            size: itemSize,
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


//Filter remember to add in size filter and brand filer later!
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

    if (!response.ok) {
        console.log("Could not load categories");
        return;
    }

    const categories = await response.json();

    const tabs = document.getElementById("category-tabs");
    const placeholder = document.getElementById("category-placeholder");
    const addButton = document.getElementById("add-category-button");

    if (categories.length === 0) {
        placeholder.style.display = "inline";
        return;
    }

    // Hide placeholder once categories exist
    placeholder.style.display = "none";

    categories.forEach(category => {
        // Do not add the same category tab twice
        const existingTab = document.querySelector(
            `.category-tab[data-category-id="${category.id}"]`
        );

        if (existingTab) {
            return;
        }

        const tab = document.createElement("button");
        tab.type = "button";
        tab.className = "bookmark-tab";
        tab.dataset.categoryId = category.id;
        tab.textContent = category.category_name;

        tab.ondblclick = () => {
            showEditCategoryForm(category);
        };
        tab.onclick = () => {
            console.log("Clicked category:", category.category_name);
        };

        tabs.insertBefore(tab, addButton);
    });
}

async function createCategory(event) {
    event.preventDefault();

    const categoryName = document.getElementById("categoryName").value.trim();
    const descriptionInput = document.getElementById("categoryDescription").value.trim();

    if (!categoryName) {
        alert("Kategori navn er påkrevd.");
        return;
    }

    if (descriptionInput.length > 0 && descriptionInput.length < 10) {
        alert("Beskrivelse må være minst 10 tegn, eller være tom.");
        return;
    }

    const categoriesResponse = await fetch("http://127.0.0.1:8000/category/", {
        headers: {
            "Authorization": `Bearer ${getToken()}`
        }
    });

    if (!categoriesResponse.ok) {
        console.log("Could not load categories");
        return;
    }

    const categories = await categoriesResponse.json();

    const alreadyExists = categories.some(category =>
        category.category_name.toLowerCase() === categoryName.toLowerCase()
    );

    if (alreadyExists) {
        alert("Denne kategorien finnes allerede.");
        return;
    }

    const body = {
        category_name: categoryName
    };

    if (descriptionInput.length > 0) {
        body.description = descriptionInput;
    }

    const response = await fetch("http://127.0.0.1:8000/category/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.log("Create category error:", errorData);
        return;
    }

    event.target.reset();
    loadCategories();
}

async function updateCategory(event) {
    event.preventDefault();

    const id = document.getElementById("editCategoryId").value;
    const categoryName = document.getElementById("editCategoryName").value.trim();
    const descriptionInput = document.getElementById("editCategoryDescription").value.trim();

    const body = {
        category_name: categoryName
    };

    if (descriptionInput.length > 0) {
        body.description = descriptionInput;
    }

    const response = await fetch(`http://127.0.0.1:8000/category/${id}`, {
        method: "PUT", // use PATCH if your backend uses PATCH
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.log("Update category error:", errorData);
        return;
    }

    closePopupForm("editCategoryPopup");

    const tab = document.querySelector(`.category-tab[data-category-id="${id}"]`);
    if (tab) {
        tab.textContent = categoryName;
    }
}

async function deleteCategory() {
    const id = document.getElementById("editCategoryId").value;

    const confirmed = confirm("Er du sikker på at du vil slette denne kategorien?");

    if (!confirmed) {
        return;
    }

    const response = await fetch(`http://127.0.0.1:8000/category/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${getToken()}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.log("Delete category error:", errorData);
        return;
    }

    closePopupForm("editCategoryPopup");

    const tab = document.querySelector(`.category-tab[data-category-id="${id}"]`);
    if (tab) {
        tab.remove();
    }

    const remainingTabs = document.querySelectorAll(".category-tab");

    if (remainingTabs.length === 0) {
        document.getElementById("category-placeholder").style.display = "inline";
    }
}

function showEditCategoryForm(category) {
    document.getElementById("editCategoryId").value = category.id;
    document.getElementById("editCategoryName").value = category.category_name;
    document.getElementById("editCategoryDescription").value = category.description || "";

    document.getElementById("editCategoryPopup").classList.remove("hidden");
}

function ShowAddCategoryForm(){
    console.log("ShowAddCategoryForm called");
    const form = document.getElementById("PopCategoryForm");
    form.classList.remove("hidden");
    }

function handleCategoryChoice() {
    const categorySelect = document.getElementById("itemCategoryId");

    if (categorySelect.value === "create-new") {
        ShowAddCategoryForm();
    }
}
function ShowAddItemForm(){
    console.log("ShowAddItemForm called");
    const form = document.getElementById("PopItemForm");
    form.classList.remove("hidden");
    }

function closePopupForm(popupId){
    const popupform = document.getElementById(popupId);
    popupform.classList.add("hidden");
    }


// Bookings
function loadBookings(){}
function createBooking(event){
    event.preventDefault();}

//Users
function showAddUserForm() {}
function createUser(event) {
    event.preventDefault();}

// Checkpoints
document.addEventListener("DOMContentLoaded", () => {
    loadCategories();
});

