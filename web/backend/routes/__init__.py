# Routes module for API endpoints
try:
    from .api import router
except ImportError:
    from web.backend.routes.api import router

__all__ = ["router"]

