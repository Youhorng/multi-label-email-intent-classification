# Middleware module for request/response processing
try:
    from .logging_middleware import setup_logging_middleware
    from .error_handler import setup_error_handlers
except ImportError:
    from web.backend.middleware.logging_middleware import setup_logging_middleware
    from web.backend.middleware.error_handler import setup_error_handlers

__all__ = ["setup_logging_middleware", "setup_error_handlers"]

