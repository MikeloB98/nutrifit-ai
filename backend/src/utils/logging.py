import logging
import time
from functools import wraps
from typing import Callable

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)-30s | %(levelname)-7s | %(message)s",
    datefmt="%H:%M:%S",
)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(f"nutrifit.{name}")


def log_agent_execution(agent_name: str):
    """Decorador para logear la ejecución de un agente."""

    def decorator(func: Callable):
        logger = get_logger(agent_name)

        @wraps(func)
        async def wrapper(*args, **kwargs):
            logger.info("Iniciando ejecución")
            start = time.perf_counter()
            try:
                result = await func(*args, **kwargs)
                elapsed = time.perf_counter() - start
                logger.info("Completado en %.2fs", elapsed)
                return result
            except Exception as e:
                elapsed = time.perf_counter() - start
                logger.error("Error tras %.2fs: %s", elapsed, e)
                raise

        return wrapper

    return decorator
