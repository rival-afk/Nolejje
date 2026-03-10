from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.requests import Request
from starlette.exceptions import HTTPException as StarletteHTTPException

app = FastAPI()

@app.get("/")
def root():
    return {"message": "School API is running"}

@app.get("/subjects")
def get_subjects():
    return [
        {"id": 1, "name": "Math"},
        {"id": 2, "name": "Physics"},
        {"id": 3, "name": "History"}
    ]

@app.get("/info")
def get_info():
    return {
        "name": "School API",
        "version": "0.1"
    }

@app.get("/students")
def get_students():
    return [
        {"id": 1, "name": "Ivan"},
        {"id": 2, "name": "Anna"}
    ]

@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={"error": "Not Found :("}
    )