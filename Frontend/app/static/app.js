//This is what the frontend do
// Backend URL

console.log("app.js loaded");
const API_BASE_URL = "http://127.0.0.1:8000";
const USER_API_URL = `${API_BASE_URL}/admin/users`;

let allItems = [];
let selectedCategoryId = "all";
let allBookings = [];
let bookingCalendar = null;
let selectedBookingItems = [];
let allUsers = [];
let currentEditingUserId = null;
let currentRenderedBookings = [];
let expandedBookingGroupId = null;
let currentEditingBookingGroupId = null;
let isEditingBookingGroup = false;
let allCategories = [];

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

function getCategoryName(categoryId) {
    const category = allCategories.find(category => {
        return Number(category.id) === Number(categoryId);
    });

    return category ? category.category_name : "Ukjent kategori";
}

function renderItems(items) {
    const itemList = document.getElementById("item-list");
    const emptyMessage = document.getElementById("empty-item-message");

    if (!itemList) {
        return;
    }

    itemList.innerHTML = "";

    if (items.length === 0) {
        if (emptyMessage) {
            emptyMessage.classList.remove("hidden");
        }
        return;
    }

    if (emptyMessage) {
        emptyMessage.classList.add("hidden");
    }

    items.forEach(item => {
        const card = document.createElement("article");
        card.classList.add("item-card");

        card.innerHTML = `
            <div class="item-image-placeholder"></div>
            <div class="item-field">ID: ${item.id}</div>
            <div class="item-field">Kategori: ${getCategoryName(item.category_id)}</div>
            <div class="item-field">Brand: ${item.brand || "Ikke oppgitt"}</div>
            <div class="item-field">Size: ${item.size || "Ikke oppgitt"}</div>
            <div class="item-field">Status: ${item.status}</div>
            <div class="item-field">Kommentar: ${item.comments || "Ingen kommentar"}</div>
            <button type="button" onclick="showEditItemForm(${item.id})">
                Rediger
            </button>
        `;

        itemList.appendChild(card);
    });
}

function getUserFullName(user) {
    return [
        user.first_name,
        user.middle_name,
        user.last_name
    ]
        .filter(Boolean)
        .join(" ");
}


function userMatchesSearch(user, searchText) {
    const fullName = getUserFullName(user).toLowerCase();
    const email = (user.email || "").toLowerCase();
    const contact = (user.contact || "").toLowerCase();

    return (
        fullName.includes(searchText) ||
        email.includes(searchText) ||
        contact.includes(searchText)
    );
}

// Items
// Load items
async function loadItems() {
    const response = await fetch("http://127.0.0.1:8000/item/", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${getToken()}`
        }
    });

    if (!response.ok) {
        console.log("Could not load items");
        return;
    }

    const items = await response.json();

    allItems = items;

    ShowCategoryItems(selectedCategoryId);
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
    selectedCategoryId = String(categoryId);

    if (selectedCategoryId === "all") {
        renderItems(allItems);
        return;
    }

    const filteredItems = allItems.filter(item => {
        return String(item.category_id) === selectedCategoryId;
    });

    renderItems(filteredItems);
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
    allCategories = categories; // Store it in a global list

    const tabs = document.getElementById("category-tabs");
    const addButton = document.getElementById("add-category-button");

    const itemCategorySelect = document.getElementById("itemCategory");
    const editItemCategorySelect = document.getElementById("editItemCategory");
    const filterCategorySelect = document.getElementById("filterCategory");
    const bookingCategorySelect = document.getElementById("categoryBooking");

    // Remove old category tabs
    if (tabs) {
        tabs.querySelectorAll(".category-tab").forEach(tab => {
            tab.remove();
        });
    }

    // Remove old dynamic dropdown options
    [
        itemCategorySelect,
        editItemCategorySelect,
        filterCategorySelect,
        bookingCategorySelect
    ].forEach(select => {
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

        // Add to booking category dropdown
        if (bookingCategorySelect) {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.category_name;
            option.dataset.categoryOption = "true";
            bookingCategorySelect.appendChild(option);
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

//A common close window function, insert correct id to close
function closePopupForm(popupId){
    const popupform = document.getElementById(popupId);
    popupform.classList.add("hidden");
    }

//Users
//Render through all users
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

        <button type="button" onclick="ShowEditUserForm(${user.id})">
            Rediger
        </button>
    `;

    userList.appendChild(card);
    });
}

// Load user
async function loadUsers() {
    console.log("loadUsers called");

    const response = await fetch(`${API_BASE_URL}/admin/users/`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${getToken()}`
        }
    });

    console.log("loadUsers status:", response.status);

    if (!response.ok) {
        const errorData = await response.json();
        console.log("Could not load users:", errorData);
        return;
    }

    const users = await response.json();

    allUsers = users;

    console.log("allUsers after loading:", allUsers);

    if (document.getElementById("user-list")) {
        renderUsers(allUsers);
    }
}

// User search function with option and fasten the chosen user on top
function searchUsersOnUserPage() {
    const searchInput = document.getElementById("userPageSearch");
    const resultsBox = document.getElementById("userPageSearchResults");

    if (!searchInput || !resultsBox) {
        return;
    }

    const searchText = searchInput.value.trim().toLowerCase();

    resultsBox.innerHTML = "";

    if (!searchText) {
        resultsBox.classList.add("hidden");
        renderUsers(allUsers);
        return;
    }

    const matchingUsers = allUsers.filter(user => {
        return userMatchesSearch(user, searchText);
    });

    renderUsers(matchingUsers);

    if (matchingUsers.length === 0) {
        resultsBox.innerHTML = `<p class="search-result-empty">Ingen bruker funnet</p>`;
        resultsBox.classList.remove("hidden");
        return;
    }

    matchingUsers.forEach(user => {
        const button = document.createElement("button");
        button.type = "button";
        button.classList.add("search-result-button");

        button.textContent = `${getUserFullName(user)} - ${user.email}`;

        button.onclick = () => {
            selectUserOnUserPage(user);
        };

        resultsBox.appendChild(button);
    });

    resultsBox.classList.remove("hidden");
}


function selectUserOnUserPage(user) {
    const searchInput = document.getElementById("userPageSearch");
    const resultsBox = document.getElementById("userPageSearchResults");
    const preview = document.getElementById("selectedUserPreview");

    searchInput.value = getUserFullName(user);

    resultsBox.innerHTML = "";
    resultsBox.classList.add("hidden");

    if (preview) {
        preview.innerHTML = `
            <strong>Valgt bruker:</strong>
            ${getUserFullName(user)} -
            ${user.email} -
            ${user.contact || "Ingen telefon"}
        `;
        preview.classList.remove("hidden");
    }

    const selectedFirst = [
        user,
        ...allUsers.filter(currentUser => currentUser.id !== user.id)
    ];

    renderUsers(selectedFirst);
}
//Show the form
function AddUserForm() {
    document.getElementById("createUserForm").classList.remove("hidden");
}

//Create User
async function createUser(event) {
    event.preventDefault();

    const firstName = document.getElementById("first_name").value.trim();
    const middleName = document.getElementById("middle_name").value.trim();
    const lastName = document.getElementById("last_name").value.trim();
    const email = document.getElementById("user-email").value.trim();
    const contact = document.getElementById("contact").value.trim();
    const errorMessage = document.getElementById("error-Message-create-User");

    if (errorMessage) {
        errorMessage.textContent = "";
    }

    // Make sure allUsers is updated before checking duplicates
    await loadUsers();

    const emailAlreadyExists = allUsers.some(user => {
        return user.email.toLowerCase() === email.toLowerCase();
    });

    if (emailAlreadyExists) {
        if (errorMessage) {
            errorMessage.textContent = "Denne e-posten er allerede i bruk.";
        }
        return;
    }

    const contactAlreadyExists = allUsers.some(user => {
        return user.contact && contact && user.contact === contact;
    });

    if (contactAlreadyExists) {
        if (errorMessage) {
            errorMessage.textContent = "Dette telefonnummeret er allerede i bruk.";
        }
        return;
    }

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

        if (errorMessage) {
            if (response.status === 409) {
                errorMessage.textContent = errorData.detail || "E-post eller telefonnummer er allerede i bruk.";
            } else if (response.status === 422) {
                errorMessage.textContent = "Ugyldig informasjon. Sjekk feltene.";
            } else {
                errorMessage.textContent = errorData.detail || "Kunne ikke opprette bruker.";
            }
        }

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


function ShowEditUserForm(userId) {
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

//Update User
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

    closePopupForm("editUserPopup");

    await loadUsers();
}

//function to delete User
async function deleteUser() {
    console.log("deleteUser called");
    console.log("currentEditingUserId:", currentEditingUserId);
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

    closePopupForm("editUserPopup");

    await loadUsers();
}

// Calendar
async function AddBookingForm() {
    await loadUsers();
    await loadCategories();
    await loadItems();
    await loadBookings();

    selectedBookingItems = [];
    renderSelectedBookingItems();

    document.getElementById("createBookingPopup").classList.remove("hidden");
}

async function ShowAddItemInBookingPopup() {
    const startDate = document.getElementById("bookingStartDate").value;
    const endDate = document.getElementById("bookingEndDate").value;

    if (!startDate || !endDate) {
        alert("Velg fra-dato og til-dato først.");
        return;
    }

    if (endDate < startDate) {
        alert("Til-dato kan ikke være før fra-dato.");
        return;
    }

    await loadCategories();
    await loadItems();
    await loadBookings();

    resetBookingItemPopup();

    document.getElementById("AddItemInBookingPopup").classList.remove("hidden");
}

function resetBookingItemPopup() {
    const categorySelect = document.getElementById("categoryBooking");
    const brandSelect = document.getElementById("brandBooking");
    const sizeSelect = document.getElementById("sizeBooking");
    const amountInput = document.getElementById("bookingAmount");
    const availableMessage = document.getElementById("availableBookingAmount");

    if (categorySelect) {
        categorySelect.value = "";
    }

    if (brandSelect) {
        brandSelect.innerHTML = `<option value="">Velg merke</option>`;
    }

    if (sizeSelect) {
        sizeSelect.innerHTML = `<option value="">Velg størrelse</option>`;
    }

    if (amountInput) {
        amountInput.value = 1;
        amountInput.removeAttribute("max");
    }

    if (availableMessage) {
        availableMessage.textContent = "Tilgjengelig: 0";
    }
}

async function addItemToBookingList() {
    const itemSelect = document.getElementById("itemBooking");

    const itemId = Number(itemSelect.value);
    const itemText = itemSelect.options[itemSelect.selectedIndex].textContent;

    if (!itemId) {
        alert("Velg en vare først");
        return;
    }

    const alreadyAdded = selectedBookingItems.some(item => item.id === itemId);

    if (alreadyAdded) {
        alert("Denne varen er allerede lagt til");
        return;
    }

    selectedBookingItems.push({
        id: itemId,
        text: itemText
    });

    renderSelectedBookingItems();
}

function renderSelectedBookingItems() {
    const container = document.getElementById("selectedBookingItems");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (selectedBookingItems.length === 0) {
        container.innerHTML = `<p>Ingen varer lagt til.</p>`;
        return;
    }

    selectedBookingItems.forEach((group, index) => {
        const row = document.createElement("div");
        row.classList.add("selected-booking-item");

        row.innerHTML = `
            <span>
                ${group.categoryName} - ${group.brand} - størrelse ${group.size} - antall ${group.amount}
            </span>

            <button type="button" onclick="removeSelectedBookingItem(${index})">
                Fjern
            </button>
        `;

        container.appendChild(row);
    });
}

function removeSelectedBookingItem(index) {
    selectedBookingItems.splice(index, 1);
    renderSelectedBookingItems();
}

function loadBookingItemsByCategory() {
    const categoryId = Number(document.getElementById("categoryBooking").value);
    const itemSelect = document.getElementById("itemBooking");

    itemSelect.innerHTML = `<option value="">Velg vare</option>`;

    const filteredItems = allItems.filter(item => item.category_id === categoryId);

    if (filteredItems.length === 0) {
        itemSelect.innerHTML = `<option value="">Ingen varer i denne kategorien</option>`;
        return;
    }

    filteredItems.forEach(item => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = `${item.brand || "Ukjent merke"} - ${item.size || "Ukjent størrelse"} - ${item.status}`;
        itemSelect.appendChild(option);
    });
}

async function loadBookings() {
    const response = await fetch(`${API_BASE_URL}/booking/`, {
        headers: {
            "Authorization": `Bearer ${getToken()}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.log("Could not load bookings:", errorData);
        return;
    }

    allBookings = await response.json();
}
// Display on the RHS in html booking after opprettelse
function getUserDisplayName(userId){
    const user = allUsers.find(user => Number(user.id) === Number(userId));

    if(!user){
        return `Bruker ${userId}`};

    return [
        user.first_name,
        user.middle_name,
        user.last_name
        ].filter(Boolean).join("")
}

function getCategoryName(categoryId) {
    const category = allCategories.find(category => {
        return Number(category.id) === Number(categoryId);
    });

    return category ? category.category_name : "Ukjent kategori";
}


function getItemDisplayName(itemId) {
    const item = allItems.find(item => Number(item.id) === Number(itemId));

    if (!item) {
        return `Vare ${itemId}`;
    }

    return `${item.brand || "Ukjent merke"} - størrelse ${item.size || "Ukjent størrelse"}`;
}


function groupBookingsByGroupId(bookings) {
    const groups = {};

    bookings.forEach(booking => {
        const groupId = booking.group_id;

        if (!groups[groupId]) {
            groups[groupId] = {
                group_id: groupId,
                user_id: booking.user_id,
                start_date: booking.start_date,
                end_date: booking.end_date,
                comment: booking.comment || "",
                active: booking.active,
                bookings: []
            };
        }

        groups[groupId].bookings.push(booking);
    });

    return Object.values(groups);
}


// This is to convert to FullCalendar style
function addOneDay(dateString) {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
}

function bookingToCalendarEvent(booking) {
    return {
        id: String(booking.id),
        title: `Vare ${booking.item_id}`,
        start: booking.start_date,
        end: addOneDay(booking.end_date),
        allDay: true
    };
}
//Calender display
async function initBookingPage() {
    const calendarEl = document.getElementById("calendar");

    if (!calendarEl) {
        return;
    }

    await loadUsers();
    await loadCategories();
    await loadItems();
    await loadBookings();

    console.log("Booking page users:", allUsers);
    console.log("Booking page categories:", allCategories);
    console.log("Booking page items:", allItems);
    console.log("Booking page bookings:", allBookings);

    bookingCalendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        locale: "nb",
        height: "auto",

        events: groupBookingsByGroupId(allBookings).map(bookingGroupToCalendarEvent),

        dateClick: function(info) {
            showBookingsForDate(info.dateStr);
        },

        datesSet: function(info) {
            showBookingsForMonth(info.view.currentStart);
        }
    });

    bookingCalendar.render();

    showBookingsForMonth(new Date());
}

function isDateInsideBooking(dateString, booking) {
    return dateString >= booking.start_date && dateString <= booking.end_date;
}

function showBookingsForDate(dateString) {
    const title = document.getElementById("booking-panel-title");


    title.textContent = `Bestillinger ${dateString}`;

    const bookingsForDate = allBookings.filter(booking => {
        return isDateInsideBooking(dateString, booking);
    });

    currentRenderedBookings = bookingsForDate;

    renderBookingList(bookingsForDate, "Ingen bestillinger denne dagen");
}

function showBookingsForMonth(date) {
    const title = document.getElementById("booking-panel-title");

    const year = date.getFullYear();
    const month = date.getMonth();

    title.textContent = "Bestillinger denne måneden";

    const bookingsForMonth = allBookings.filter(booking => {
        const bookingStart = new Date(booking.start_date);
        const bookingEnd = new Date(booking.end_date);

        return (
            bookingStart.getFullYear() === year &&
            bookingStart.getMonth() === month
        ) || (
            bookingEnd.getFullYear() === year &&
            bookingEnd.getMonth() === month
        );
    });

    currentRenderedBookings = bookingsForMonth;

    renderBookingList(bookingsForMonth, "Ingen bestillinger denne måneden");
}

function renderBookingList(bookings, emptyMessage) {
    const bookingList = document.getElementById("booking-list");

    if (!bookingList) {
        return;
    }

    bookingList.innerHTML = "";

    if (bookings.length === 0) {
        bookingList.innerHTML = `<p>${emptyMessage}</p>`;
        return;
    }

    const bookingGroups = groupBookingsByGroupId(bookings);

    bookingGroups.forEach(group => {
        const card = document.createElement("article");
        card.classList.add("booking-summary-card");

        const shortGroupId = String(group.group_id).slice(0, 8);
        const userName = getUserDisplayName(group.user_id);
        const itemCount = group.bookings.length;
        const isExpanded = expandedBookingGroupId === group.group_id;

        card.innerHTML = `
            <div class="booking-summary-row">
                <div><strong>Booking ID:</strong> ${shortGroupId}</div>
                <div><strong>Bruker:</strong> ${userName}</div>
                <div><strong>Dato:</strong> ${group.start_date} - ${group.end_date}</div>
                <div><strong>Antall varer:</strong> ${itemCount}</div>

                <button type="button" onclick="toggleBookingDetails('${group.group_id}')">
                    ${isExpanded ? "Skjul detaljer" : "Vis detaljer"}
                </button>
            </div>

            <div class="booking-details ${isExpanded ? "" : "hidden"}">
                ${renderBookingGroupDetails(group)}
            </div>
        `;

        bookingList.appendChild(card);
    });
}
//Booking summary report card -row
function renderBookingGroupDetails(group) {
    const groupedItems = {};
    console.log("Booking group:", group);
    console.log("group.bookings:", group.bookings);
    console.log("allItems:", allItems);
    console.log("allCategories:", allCategories);

    group.bookings.forEach(booking => {
        const item = allItems.find(item => Number(item.id) === Number(booking.item_id));

        if (!item) {
            return;
        }

        const categoryName = getCategoryName(item.category_id);
        const brand = item.brand || "Ukjent merke";
        const size = item.size || "Ukjent størrelse";

        const key = `${item.category_id}|${brand}|${size}`;

        if (!groupedItems[key]) {
            groupedItems[key] = {
                categoryName: categoryName,
                brand: brand,
                size: size,
                amount: 0
            };
        }

        groupedItems[key].amount += 1;
    });

    const itemRows = Object.values(groupedItems).map(itemGroup => {
        return `
            <div class="booking-detail-item">
                <p><strong>Kategori:</strong> ${itemGroup.categoryName}</p>
                <p><strong>Merke:</strong> ${itemGroup.brand}</p>
                <p><strong>Størrelse:</strong> ${itemGroup.size}</p>
                <p><strong>Antall:</strong> ${itemGroup.amount}</p>
            </div>
        `;
    }).join("");

    return `
        <div class="booking-detail-box">
            <p><strong>Kommentar:</strong> ${group.comment || "Ingen kommentar"}</p>

            <div class="booking-detail-items">
                ${itemRows || "<p>Ingen varer funnet.</p>"}
            </div>

            <div class="booking-detail-actions">
                <button type="button" onclick="openEditBookingGroup('${group.group_id}')">
                    Rediger bestilling
                </button>

                <button type="button" onclick="deleteBookingGroup('${group.group_id}')">
                    Slett bestilling
                </button>
            </div>
        </div>
    `;
}

function toggleBookingDetails(groupId) {
    if (expandedBookingGroupId === groupId) {
        expandedBookingGroupId = null;
    } else {
        expandedBookingGroupId = groupId;
    }

    renderBookingList(currentRenderedBookings, "Ingen bestillinger");
}

async function createBooking(event) {
    event.preventDefault();

    const userId = Number(document.getElementById("bookingUserId").value);
    const startDate = document.getElementById("bookingStartDate").value;
    const endDate = document.getElementById("bookingEndDate").value;
    const comment = document.getElementById("bookingComment").value.trim();

    if (!userId) {
        alert("Du må velge en bruker fra søket.");
        return;
    }

    if (!startDate || !endDate) {
        alert("Velg utleieperiode.");
        return;
    }

    if (endDate < startDate) {
        alert("Til-dato kan ikke være før fra-dato.");
        return;
    }

    if (selectedBookingItems.length === 0) {
        alert("Legg til minst én vare.");
        return;
    }

    const itemIds = selectedBookingItems.flatMap(group => group.itemIds);

    if (itemIds.length === 0) {
        alert("Ingen varer valgt.");
        return;
    }

    // Simple edit strategy:
    // delete old group first, then create a new group
    if (isEditingBookingGroup && currentEditingBookingGroupId) {
        const deleted = await deleteBookingGroup(currentEditingBookingGroupId, false);

        if (!deleted) {
            return;
        }
    }

    const body = {
        user_id: userId,
        item_ids: itemIds,
        start_date: startDate,
        end_date: endDate,
        comment: comment || null
    };

    const response = await fetch(`${API_BASE_URL}/booking/group`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.log("Create booking group error:", errorData);
        alert(errorData.detail || "Kunne ikke opprette bestilling.");
        return;
    }

    selectedBookingItems = [];
    renderSelectedBookingItems();

    isEditingBookingGroup = false;
    currentEditingBookingGroupId = null;

    event.target.reset();

    const title = document.querySelector("#createBookingPopup h2");
    if (title) {
        title.textContent = "Opprett ny bestilling";
    }

    closePopupForm("createBookingPopup");

    await refreshBookingDisplay();
}

//search for the user to create booking
async function searchBookingUsers() {
    const searchInput = document.getElementById("bookingUserSearch");
    const resultsBox = document.getElementById("bookingUserResults");
    const hiddenUserId = document.getElementById("bookingUserId");

    if (!searchInput || !resultsBox || !hiddenUserId) {
        return;
    }

    if (allUsers.length === 0) {
        await loadUsers();
    }

    console.log("Booking search allUsers:", allUsers);

    const searchText = searchInput.value.trim().toLowerCase();

    hiddenUserId.value = "";
    resultsBox.innerHTML = "";

    if (!searchText) {
        resultsBox.classList.add("hidden");
        return;
    }

    const matchingUsers = allUsers.filter(user => {
        return userMatchesSearch(user, searchText);
    });

    if (matchingUsers.length === 0) {
        resultsBox.innerHTML = `<p class="search-result-empty">Ingen bruker funnet</p>`;
        resultsBox.classList.remove("hidden");
        return;
    }

    matchingUsers.forEach(user => {
        const button = document.createElement("button");
        button.type = "button";
        button.classList.add("search-result-button");

        button.textContent = `${getUserFullName(user)} - ${user.email}`;

        button.onclick = () => {
            selectBookingUser(user);
        };

        resultsBox.appendChild(button);
    });

    resultsBox.classList.remove("hidden");
}
function selectBookingUser(user) {
    const searchInput = document.getElementById("bookingUserSearch");
    const hiddenUserId = document.getElementById("bookingUserId");
    const resultsBox = document.getElementById("bookingUserResults");

    searchInput.value = getUserFullName(user);
    hiddenUserId.value = user.id;

    resultsBox.innerHTML = "";
    resultsBox.classList.add("hidden");

    console.log("Selected booking user:", user);
}
// Check no other booking is overlapping
function bookingOverlaps(booking, startDate, endDate) {
    return booking.active &&
        booking.start_date <= endDate &&
        booking.end_date >= startDate;
}

//Check available items in this period
function isItemBookedInPeriod(itemId, startDate, endDate) {
    return allBookings.some(booking => {
        return Number(booking.item_id) === Number(itemId) &&
            bookingOverlaps(booking, startDate, endDate);
    });
}

//Getting the available items from that selected category
function getAvailableItemsForBookingSelection() {
    const categoryId = Number(document.getElementById("categoryBooking").value);
    const brand = document.getElementById("brandBooking").value;
    const size = document.getElementById("sizeBooking").value;

    const startDate = document.getElementById("bookingStartDate").value;
    const endDate = document.getElementById("bookingEndDate").value;

    if (!categoryId || !brand || !size || !startDate || !endDate) {
        return [];
    }

    return allItems.filter(item => {
        return Number(item.category_id) === categoryId &&
            String(item.brand || "") === brand &&
            String(item.size || "") === size &&
            item.status !== "Kan ikke leie ut" &&
            !isItemBookedInPeriod(item.id, startDate, endDate);
    });
}
//Update the available amount
function updateAvailableBookingAmount() {
    const availableItems = getAvailableItemsForBookingSelection();
    const amountInput = document.getElementById("bookingAmount");
    const message = document.getElementById("availableBookingAmount");

    if (!amountInput || !message) {
        return;
    }

    message.textContent = `Tilgjengelig: ${availableItems.length}`;

    amountInput.max = availableItems.length;

    if (availableItems.length === 0) {
        amountInput.value = 0;
    } else if (Number(amountInput.value) > availableItems.length) {
        amountInput.value = availableItems.length;
    }
}

//Fill brand dropdown after category is chosen
function updateBookingBrandOptions() {
    const categoryId = Number(document.getElementById("categoryBooking").value);
    const brandSelect = document.getElementById("brandBooking");
    const sizeSelect = document.getElementById("sizeBooking");

    brandSelect.innerHTML = `<option value="">Velg merke</option>`;
    sizeSelect.innerHTML = `<option value="">Velg størrelse</option>`;

    if (!categoryId) {
        updateAvailableBookingAmount();
        return;
    }

    const brands = [...new Set(
        allItems
            .filter(item => Number(item.category_id) === categoryId)
            .map(item => item.brand)
            .filter(Boolean)
    )];

    brands.forEach(brand => {
        const option = document.createElement("option");
        option.value = brand;
        option.textContent = brand;
        brandSelect.appendChild(option);
    });

    updateAvailableBookingAmount();
}

//Fill size dropdown after brand is chosen
function updateBookingSizeOptions() {
    const categoryId = Number(document.getElementById("categoryBooking").value);
    const brand = document.getElementById("brandBooking").value;
    const sizeSelect = document.getElementById("sizeBooking");

    sizeSelect.innerHTML = `<option value="">Velg størrelse</option>`;

    if (!categoryId || !brand) {
        updateAvailableBookingAmount();
        return;
    }

    const sizes = [...new Set(
        allItems
            .filter(item => {
                return Number(item.category_id) === categoryId &&
                    String(item.brand || "") === brand;
            })
            .map(item => item.size)
            .filter(size => size !== null && size !== undefined)
            .map(size => String(size))
    )];

    sizes.forEach(size => {
        const option = document.createElement("option");
        option.value = size;
        option.textContent = size;
        sizeSelect.appendChild(option);
    });

    updateAvailableBookingAmount();
}

//Choose item to book
function addBookingSelection(event) {
    event.preventDefault();

    const categorySelect = document.getElementById("categoryBooking");
    const categoryId = Number(categorySelect.value);
    const categoryName = categorySelect.options[categorySelect.selectedIndex]?.textContent || "";

    const brand = document.getElementById("brandBooking").value;
    const size = document.getElementById("sizeBooking").value;
    const amount = Number(document.getElementById("bookingAmount").value);

    const availableItems = getAvailableItemsForBookingSelection();

    if (!categoryId || !brand || !size) {
        alert("Velg kategori, merke og størrelse.");
        return;
    }

    if (amount <= 0) {
        alert("Antall må være minst 1.");
        return;
    }

    if (amount > availableItems.length) {
        alert(`Det finnes bare ${availableItems.length} tilgjengelig.`);
        return;
    }

    const chosenItems = availableItems.slice(0, amount);

    selectedBookingItems.push({
        categoryId: categoryId,
        categoryName: categoryName,
        brand: brand,
        size: size,
        amount: amount,
        itemIds: chosenItems.map(item => item.id)
    });

    renderSelectedBookingItems();

    closePopupForm("AddItemInBookingPopup");
}

//Calender highlight
function bookingGroupToCalendarEvent(group) {
    return {
        id: String(group.group_id),
        title: `Bestilling ${String(group.group_id).slice(0, 8)}`,
        start: group.start_date,
        end: addOneDay(group.end_date),
        allDay: true
    };
}

// Edit booking
async function openEditBookingGroup(groupId) {
    await loadUsers();
    await loadCategories();
    await loadItems();
    await loadBookings();

    const group = groupBookingsByGroupId(allBookings).find(group => {
        return group.group_id === groupId;
    });

    if (!group) {
        alert("Fant ikke bestillingen.");
        return;
    }

    currentEditingBookingGroupId = group.group_id;
    isEditingBookingGroup = true;

    const user = allUsers.find(user => Number(user.id) === Number(group.user_id));

    if (user) {
        document.getElementById("bookingUserSearch").value = getUserDisplayName(user.id);
        document.getElementById("bookingUserId").value = user.id;
    }

    document.getElementById("bookingStartDate").value = group.start_date;
    document.getElementById("bookingEndDate").value = group.end_date;
    document.getElementById("bookingComment").value = group.comment || "";

    selectedBookingItems = buildSelectedBookingItemsFromBookingGroup(group);

    renderSelectedBookingItems();

    const title = document.querySelector("#createBookingPopup h2");
    if (title) {
        title.textContent = "Rediger bestilling";
    }

    document.getElementById("createBookingPopup").classList.remove("hidden");
}

function buildSelectedBookingItemsFromBookingGroup(group) {
    const itemGroups = {};

    group.bookings.forEach(booking => {
        const item = allItems.find(item => Number(item.id) === Number(booking.item_id));

        if (!item) {
            return;
        }

        const key = [
            item.category_id,
            item.brand || "",
            item.size || ""
        ].join("|");

        if (!itemGroups[key]) {
            itemGroups[key] = {
                categoryId: item.category_id,
                categoryName: getCategoryName(item.category_id),
                brand: item.brand || "Ukjent merke",
                size: item.size || "Ukjent størrelse",
                amount: 0,
                itemIds: []
            };
        }

        itemGroups[key].amount += 1;
        itemGroups[key].itemIds.push(item.id);
    });

    return Object.values(itemGroups);
}

async function deleteBookingGroup(groupId, askConfirm = true) {
    const group = groupBookingsByGroupId(allBookings).find(group => {
        return group.group_id === groupId;
    });

    if (!group) {
        alert("Fant ikke bestillingen.");
        return false;
    }

    if (askConfirm) {
        const confirmed = confirm("Er du sikker på at du vil slette hele bestillingen?");

        if (!confirmed) {
            return false;
        }
    }

    for (const booking of group.bookings) {
        const response = await fetch(`${API_BASE_URL}/booking/${booking.id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${getToken()}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.log("Delete booking error:", errorData);
            alert(`Kunne ikke slette booking ${booking.id}`);
            return false;
        }
    }

    if (askConfirm) {
        await refreshBookingDisplay();
    }

    return true;
}

async function refreshBookingDisplay() {
    await loadBookings();

    if (bookingCalendar) {
        bookingCalendar.removeAllEvents();

        const bookingGroups = groupBookingsByGroupId(allBookings);

        bookingGroups.forEach(group => {
            bookingCalendar.addEvent(bookingGroupToCalendarEvent(group));
        });
    }

    expandedBookingGroupId = null;

    showBookingsForMonth(new Date());
}
// load
document.addEventListener("DOMContentLoaded", async () => {
    if (
        document.getElementById("user-list") ||
        document.getElementById("bookingUserSearch")
    ) {
        await loadUsers();
    }

    if (document.getElementById("calendar")) {
        await initBookingPage();
    }

    if (document.getElementById("category-tabs")) {
        await loadCategories();
    }

    if (document.getElementById("item-list")) {
        await loadItems();
    }
});