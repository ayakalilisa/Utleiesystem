from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="Utleiesystem Frontend")

app.mount("/static", StaticFiles(directory="app/static"), name="static")

templates = Jinja2Templates(directory="app/templates")


@app.get("/")
def home(request: Request):
    return templates.TemplateResponse(
        "login.html",
        {"request": request}
    )


@app.get("/login")
def login_page(request: Request):
    return templates.TemplateResponse(
        "login.html",
        {"request": request}
    )

@app.get("/dashboard")
def dashboard(request: Request):
    return templates.TemplateResponse(
        "dashboard.html",
        {"request": request}
    )

@app.get("/bookings")
def bookings(request: Request):
    return templates.TemplateResponse(
        "bookings.html",
        {"request": request}
    )

@app.get("/items")
def items(request: Request):
    return templates.TemplateResponse(
        "items.html",
        {"request": request}
    )

@app.get("/users")
def users(request: Request):
    return templates.TemplateResponse(
        "users.html",
        {"request": request}
    )

@app.get("/register")
def register_page(request: Request):
    return templates.TemplateResponse(
        "register.html",
        {"request": request}
    )