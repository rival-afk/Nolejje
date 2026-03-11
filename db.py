import asyncpg
from dotenv import load_dotenv
import os

load_dotenv()

db_url = os.getenv("db_url", "postgres://postgres@localhost/nolejje")

async def connect_db():
  return await asyncpg.connect(db_url)