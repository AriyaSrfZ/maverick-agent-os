from __future__ import annotations
from urllib.robotparser import RobotFileParser
from yarl import URL

class RobotsManager:
    def __init__(self, user_agent: str):
        self.user_agent = user_agent
        self.parsers: dict[str, RobotFileParser] = {}

    async def can_crawl(self, http_client, target_url: str) -> bool:
        u = URL(target_url)
        base = f"{u.scheme}://{u.host}"
        if base not in self.parsers:
            robots_ep = f"{base}/robots.txt"
            rp = RobotFileParser()
            status, content, _ = await http_client.fetch(robots_ep, retries=1)
            if status == 200 and content:
                rp.parse(content.splitlines())
            else:
                rp.parse([])
            self.parsers[base] = rp

        return self.parsers[base].can_fetch(self.user_agent, target_url)
