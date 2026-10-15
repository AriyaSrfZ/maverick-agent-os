"""Structured JSON logging configuration."""

from __future__ import annotations

import json
import logging


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "time": self.formatTime(record, "%Y-%m-%dT%H:%M:%SZ"),
        }
        if record.exc_info:
            payload["exc"] = self.formatException(record.exc_info)
        extra = {k: v for k, v in record.__dict__.items()
                 if k not in {"name", "msg", "args", "levelname", "levelno", "pathname",
                              "filename", "module", "exc_info", "exc_text", "stack_info",
                              "lineno", "funcName", "created", "msecs", "relativeCreated",
                              "thread", "threadName", "processName", "process", "message",
                              "taskName", "asctime"}}
        payload.update(extra)
        return json.dumps(payload, ensure_ascii=False)


def configure_logging(verbose: bool = False) -> None:
    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())
    root = logging.getLogger()
    root.handlers = [handler]
    root.setLevel(logging.DEBUG if verbose else logging.INFO)
