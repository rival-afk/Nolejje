from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.requests import Request
from starlette.exceptions import HTTPException
from db import db_url
import asyncpg

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
        "name": "Nolejje",
        "version": "alpha 0.1"
    }

@app.get("/students")
async def get_students(student_id: int):
    
    conn = await asyncpg.connect(db_url)
    
    rows = await conn.fetch("""SELECT users.name FROM students
                            JOIN users ON students.user_id = users.id
                            WHERE students.id = $1""", student_id)
    
    await conn.close()
    
    
    if rows is None:
        raise HTTPException(
            status_code=404,
            detail="No students in table :/"
        )
    return [dict(row) for row in rows]

@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={"error": "Not Found :("}
    )