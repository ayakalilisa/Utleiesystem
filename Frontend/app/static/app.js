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
}

function renderItems(items) {
    const itemList = document.getElementById("item-list");
    const emptyMessage = document.getElementById("empty-item-message");

    itemList.innerHTML = "";

    if (items.length === 0) {
        emptyMessage.classList.remove("hidden");
        return;
    }

    emptyMessage.classList.add("hidden");

    items.forEach(item => {
        const card = document.createElement("article");
        card.classList.add("item-card");

        card.innerHTML = `
            <div class="item-image-placeholder"></div>
            <div class="item-field">ID: ${item.id}</div>
            <div class="item-field">Brand: ${item.brand || "Ikke oppgitt"}</div>
            <div class="item-field">Size: ${item.size || "Ikke oppgitt"}</div>
            <div class="item-field">Status: ${item.status}</div>
            <div class="item-field">Kommentar: ${item.comments || "Ingen kommentar"}</div>
            <button type="button" onclick="showEditItemForm(${item.id})">Rediger</button>
        `;

        itemList.appendChild(card);
    });
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

async function showEditItemForm(itemId) {
    console.log("Opening edit form for item:", itemId);

    const item = allItems.find(currentItem => currentItem.id === itemId);

    if (!item) {
        console.log("Item not found:", itemId);
        return;
    }

    await loadCategories();

    document.getElementById("editItemId").value = item.id;
    document.getElementById("editItemBrand").value = item.brand || "";
    document.getElementById("editItemSize").value = item.size || "";
    document.getElementById("editItemStatus").value = item.status;
    document.getElementById("editItemComment").value = item.comments || "";

    document.getElementById("editItemCategory").value = String(item.category_id);

    console.log("Item category id:", item.category_id);
    console.log(
        "Dropdown value after set:",
        document.getElementById("editItemCategory").value
    );

    document.getElementById("editItemPopup").classList.remove("hidden");
}
async function updateItem(event) {
    event.preventDefault();

    const id = document.getElementById("editItemId").value;
    const itemBrand = document.getElementById("editItemBrand").value.trim();
    const itemSize = document.getElementById("editItemSize").value;
    const itemCategory = document.getElementById("editItemCategory").value;
    const itemStatus = document.getElementById("editItemStatus").value;
    const itemComment = document.getElementById("editItemComment").value.trim();

    console.log("Updating item id:", id);
    console.log("Updating item category:", itemCategory);

    const body = {
            brand: itemBrand || null,
            size: itemSize || null,
            status: itemStatus,
            category_id: Number(itemCategory),
            comments: itemComment || null
    };

    const response = await fetch(`http://127.0.0.1:8000/item/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
    const errorData = await response.json();

    console.log("Status:", response.status);
    console.log("Update item error:", errorData);
    console.log("Request body:", body);

    return;
}

    closePopupForm("editItemPopup");

    await loadItems();
}

async function deleteItem() {
    const id = document.getElementById("editItemId").value;
    console.log("Deleting item id:", id);

    const confirmed = confirm("Er du sikker på at du vil slette denne varen?");

    if (!confirmed) {
        return;
    }

    const response = await fetch(`http://127.0.0.1:8000/item/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${getToken()}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.log("Delete item error:", errorData);
        return;
    }
    const deletedData = await response.json();
    closePopupForm("editItemPopup");

    await loadItems();
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
    const itemBrand = document.getElementById("item-brand").value.trim();
    const itemSize = document.getElementById("item-size").value.trim();
    const itemStatus = document.getElementById("itemStatus").value;
    const itemCategory = document.getElementById("itemCategory").value;
    const itemComment = document.getElementById("itemComment").value.trim();
    const errorMessage = document.getElementById("errorMessage");

    if (errorMessage) {
        errorMessage.textContent = "";
    }


    if (!itemCategory) {
        if (errorMessage) {
            errorMessage.textContent = "Du må velge en kategori.";
        }
        return;
    }

    if (itemCategory === "create-new") {
        ShowAddCategoryForm();
        return;
    }

    const response = await fetch("http://127.0.0.1:8000/item/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify({
            brand: itemBrand || null,
            size: itemSize || null,
            status: itemStatus,
            category_id: Number(itemCategory),
            comments: itemComment || null
        })
    });


    if (!response.ok) {
        const errorData = await response.json();

        if (errorMessage) {
            errorMessage.textContent = errorData.detail || "Kunne ikke opprette ny vare.";
        }

        return;
    }

    const item = await response.json();

    event.target.reset();
    closePopupForm("PopItemForm");

    await loadItems();

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
    const response = await fetch(`${API_BASE_URL}/category/`, {
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
    const addButton = document.getElementById("add-category-button");

    const itemCategorySelect = document.getElementById("itemCategory");
    const editItemCategorySelect = document.getElementById("editItemCategory");
    const filterCategorySelect = document.getElementById("filterCategory");

    // Remove old category tabs
    if (tabs) {
        tabs.querySelectorAll(".category-tab").forEach(tab => {
            tab.remove();
        });
    }

    // Remove old dropdown options
    [itemCategorySelect, editItemCategorySelect, filterCategorySelect].forEach(select => {
        if (select) {
            select.querySelectorAll("option[data-category-option='true']").forEach(option => {
                option.remove();
            });
        }
    });

    categories.forEach(category => {
        // Add category bookmark tab
        if (tabs && addButton) {
            const tab = document.createElement("button");
            tab.type = "button";
            tab.className = "bookmark-tab category-tab";
            tab.dataset.categoryId = category.id;
            tab.textContent = category.category_name;

            tab.onclick = () => {
                ShowCategoryItems(category.id);
            };

            tab.ondblclick = () => {
                showEditCategoryForm(category);
            };

            tabs.insertBefore(tab, addButton);
        }

        // Add to create item dropdown
        if (itemCategorySelect) {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.category_name;
            option.dataset.categoryOption = "true";
            itemCategorySelect.appendChild(option);
        }

        // Add to edit item dropdown
        if (editItemCategorySelect) {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.category_name;
            option.dataset.categoryOption = "true";
            editItemCategorySelect.appendChild(option);
        }

        // Add to filter dropdown
        if (filterCategorySelect) {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.category_name;
            option.dataset.categoryOption = "true";
            filterCategorySelect.appendChild(option);
        }
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
    await loadCategories();
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

    await loadCategories();
    await loadItems();
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
    const categorySelect = document.getElementById("itemCategory");

    if (categorySelect.value === "create-new") {
        ShowAddCategoryForm();
    }
}

async function ShowAddItemForm() {
    console.log("ShowAddItemForm called");

    await loadCategories();

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
let allUsers = [];
let currentEditingUserId = null;

const USER_API_URL = `${API_BASE_URL}/admin/users`;

async function loadUsers() {
    const userList = document.getElementById("user-list");
    if (!userList) {
        return;
    }

    const response = await fetch(`${USER_API_URL}/`, {
        headers: {
            "Authorization": `Bearer ${getToken()}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.log("Could not load users:", errorData);
        return;
    }

    const users = await response.json();

    allUsers = users;
    renderUsers(allUsers);
}


function renderUsers(users) {
    const userList = document.getElementById("user-list");
    const emptyMessage = document.getElementById("empty-item-message");

    if (!userList) {
        return;
    }

    userList.innerHTML = "";

    if (users.length === 0) {
        if (emptyMessage) {
            emptyMessage.classList.remove("hidden");
            emptyMessage.textContent = "Ingen brukere registrert";
        }
        return;
    }

    if (emptyMessage) {
        emptyMessage.classList.add("hidden");
    }

    users.forEach(user => {
    const card = document.createElement("article");
    card.classList.add("user-card");

    const fullName = [user.first_name, user.middle_name, user.last_name]
        .filter(Boolean)
        .join(" ");

    card.innerHTML = `
        <div class="item-field">ID: ${user.id}</div>
        <div class="item-field">${fullName}</div>
        <div class="item-field">${user.email}</div>
        <div class="item-field">${user.contact || "Ikke oppgitt"}</div>

        <button type="button" onclick="showEditUserForm(${user.id})">
            Rediger
        </button>
    `;

    userList.appendChild(card);
    });
}


function AddUserForm() {
    document.getElementById("createUserForm").classList.remove("hidden");
}


async function createUser(event) {
    event.preventDefault();

    const firstName = document.getElementById("first_name").value.trim();
    const middleName = document.getElementById("middle_name").value.trim();
    const lastName = document.getElementById("last_name").value.trim();
    const email = document.getElementById("user-email").value.trim();
    const contact = document.getElementById("contact").value.trim();

    const body = {
        first_name: firstName,
        middle_name: middleName || null,
        last_name: lastName,
        email: email,
        contact: contact || null
    };

    const response = await fetch(`${USER_API_URL}/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.log("Create user error:", errorData);
        return;
    }

    closePopupForm("createUserForm");

    document.getElementById("first_name").value = "";
    document.getElementById("middle_name").value = "";
    document.getElementById("last_name").value = "";
    document.getElementById("user-email").value = "";
    document.getElementById("contact").value = "";

    await loadUsers();
}


function showEditUserForm(userId) {
    const user = allUsers.find(currentUser => currentUser.id === userId);

    if (!user) {
        console.log("User not found:", userId);
        return;
    }

    currentEditingUserId = user.id;

    document.getElementById("editfirst_name").value = user.first_name || "";
    document.getElementById("editmiddle_name").value = user.middle_name || "";
    document.getElementById("editlast_name").value = user.last_name || "";
    document.getElementById("edituser-email").value = user.email || "";
    document.getElementById("editcontact").value = user.contact || "";

    document.getElementById("editUserPopup").classList.remove("hidden");
}


async function updateUser(event) {
    event.preventDefault();

    const id = currentEditingUserId;
    const firstName = document.getElementById("editfirst_name").value.trim();
    const middleName = document.getElementById("editmiddle_name").value.trim();
    const lastName = document.getElementById("editlast_name").value.trim();
    const email = document.getElementById("edituser-email").value.trim();
    const contact = document.getElementById("editcontact").value.trim();

    const body = {
        first_name: firstName,
        middle_name: middleName || null,
        last_name: lastName,
        email: email,
        contact: contact || null
    };

    const response = await fetch(`${USER_API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.log("Update user error:", errorData);
        return;
    }

    closePopupForm("editUserForm");

    await loadUsers();
}


async function deleteUser() {
    const id = currentEditingUserId;
    const confirmed = confirm("Er du sikker på at du vil slette denne brukeren?");

    if (!confirmed) {
        return;
    }

    const response = await fetch(`${USER_API_URL}/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${getToken()}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.log("Delete user error:", errorData);
        return;
    }

    closePopupForm("editUserForm");

    await loadUsers();
}


function applyUserFilters() {
    const sortValue = document.getElementById("sortItems").value;

    let filteredUsers = [...allUsers];

    if (sortValue === "Fornavn-asc") {
        filteredUsers.sort((a, b) => a.first_name.localeCompare(b.first_name));
    }

    if (sortValue === "Fornavn-desc") {
        filteredUsers.sort((a, b) => b.first_name.localeCompare(a.first_name));
    }

    if (sortValue === "Etternavn-asc") {
        filteredUsers.sort((a, b) => a.last_name.localeCompare(b.last_name));
    }

    if (sortValue === "Etternavn-desc") {
        filteredUsers.sort((a, b) => b.last_name.localeCompare(a.last_name));
    }

    renderUsers(filteredUsers);
}

// load
document.addEventListener("DOMContentLoaded", async () => {
    if (document.getElementById("category-tabs")) {
        await loadCategories();
    }

    if (document.getElementById("item-list")) {
        await loadItems();
    }

    if (document.getElementById("user-list")) {
        await loadUsers();
    }
});
