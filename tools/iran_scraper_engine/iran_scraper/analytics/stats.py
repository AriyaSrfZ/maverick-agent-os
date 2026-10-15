from __future__ import annotations
import math
from collections import deque
from typing import Tuple, Optional

class WelfordRollingStats:
    def __init__(self, window_size: int = 150):
        self.window = window_size
        self.buffer = deque(maxlen=window_size)

    def add(self, x: float):
        self.buffer.append(x)

    def stats(self) -> Tuple[Optional[float], Optional[float]]:
        n = len(self.buffer)
        if n == 0:
            return None, None
        mu = sum(self.buffer) / n
        if n < 2:
            return mu, 0.0
        variance = sum((val - mu) ** 2 for val in self.buffer) / (n - 1)
        return mu, math.sqrt(variance)
