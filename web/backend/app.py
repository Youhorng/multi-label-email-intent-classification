# Main FastAPI application entry point
import sys
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Setup path for imports - works both when run as module and directly
_backend_dir = Path(__file__).parent
_web_dir = _backend_dir.parent
_project_root = _web_dir.parent

# Add project root to path if not already there (for direct execution)
if str(_project_root) not in sys.path:
    sys.path.insert(0, str(_project_root))

# Try relative imports first (when run as module), fall back to absolute (when run directly)
try:
    from .config import API_TITLE
    from .routes import router
    from .middleware import setup_logging_middleware, setup_error_handlers
    from .services.model_service import get_model_service
except ImportError:
    from web.backend.config import API_TITLE
    from web.backend.routes import router
    from web.backend.middleware import setup_logging_middleware, setup_error_handlers
    from web.backend.services.model_service import get_model_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup - initialize model service
    get_model_service()
    print(f"Model service initialized. Device: {get_model_service().get_device_info()}")
    
    # Yield control to the application
    yield


# Initialize FastAPI app with lifespan
app = FastAPI(title=API_TITLE, lifespan=lifespan)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins - adjust for production
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Setup middleware on the FastAPI app
app = setup_logging_middleware(app)
app = setup_error_handlers(app)
# Include routes on the FastAPI app
app.include_router(router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
