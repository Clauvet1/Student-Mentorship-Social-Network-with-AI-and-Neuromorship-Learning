from fastapi import FastAPI
from routes_messages import router

app = FastAPI()
app.include_router(router)


@app.get("/")
def root():
    return {"Backend Working"}
