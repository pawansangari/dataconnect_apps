from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI()

target_dir = "static"

app.mount("/", StaticFiles(directory=target_dir, html=True), name="site")

