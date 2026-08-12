import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routes import weather

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("weather_explorer")

app = FastAPI(
    title="Weather Explorer API",
    description="FastAPI service for fetching, storing, and visualizing Open-Meteo historical weather data.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS setup
origins = [
    settings.frontend_origin,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"status": "error", "message": "An internal server error occurred."},
    )


@app.get("/")
async def root():
    return {
        "status": "ok",
        "service": "Weather Explorer API",
        "docs": "/docs",
    }


app.include_router(weather.router)
