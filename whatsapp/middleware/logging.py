import time
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("whatsapp-service")

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        logger.info(f"Incoming Request: {request.method} {request.url.path}")
        
        try:
            response = await call_next(request)
            duration = (time.time() - start_time) * 1000
            logger.info(f"Completed Request: {response.status_code} in {duration:.2f}ms")
            return response
        except Exception as e:
            duration = (time.time() - start_time) * 1000
            logger.error(f"Failed Request: {str(e)} in {duration:.2f}ms", exc_info=True)
            raise e
