import json
import urllib.request
import re
import time

raw_urls = [
    "https://x.com/frontm_an/status/2110666569168654474",
    "https://x.com/He1s_Sammy/status/2110719621401551273",
    "https://x.com/eng_khairallah1/status/2110339397782749331/photo/1",
    "https://x.com/0xAminMAD/status/2061392522933334261",
    "https://x.com/0xAminMAD/status/2061537738789429307",
    "https://x.com/initfortechonly/status/1951226407092174953",
    "https://x.com/patterniha/status/2091828314893652171",
    "https://x.com/codecloude/status/2092739157198360923",
    "https://x.com/ai_ba_reza/status/2095042886824034610",
    "https://x.com/MatinSenPai/status/2095098331676528698",
    "https://x.com/TechElyra/status/2101868663578190276",
    "https://x.com/Hamed_abdm/status/2102342066822873501"
]

def extract_user_and_id(url):
    m = re.search(r"x\.com/([^/]+)/status/(\d+)", url)
    if m:
        return m.group(1), m.group(2)
    return None, None

results = []

for url in raw_urls:
    user, tweet_id = extract_user_and_id(url)
    if not user or not tweet_id:
        continue
    api_url = f"https://api.fxtwitter.com/{user}/status/{tweet_id}"
    req = urllib.request.Request(
        api_url,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode('utf-8', errors='ignore'))
            if data.get("code") == 200:
                t = data.get("tweet", {})
                author = t.get("author", {})
                media = t.get("media", {})
                
                # Collect media URLs
                media_list = []
                if "all" in media:
                    for m in media["all"]:
                        media_list.append({
                            "type": m.get("type"),
                            "url": m.get("url"),
                            "thumbnail_url": m.get("thumbnail_url")
                        })
                elif "photos" in media:
                    for p in media["photos"]:
                        media_list.append({
                            "type": "photo",
                            "url": p.get("url")
                        })
                elif "videos" in media:
                    for v in media["videos"]:
                        media_list.append({
                            "type": "video",
                            "url": v.get("url"),
                            "thumbnail_url": v.get("thumbnail_url")
                        })

                results.append({
                    "original_url": url,
                    "id": tweet_id,
                    "author_name": author.get("name"),
                    "author_handle": author.get("screen_name"),
                    "text": t.get("text"),
                    "created_at": t.get("created_at"),
                    "likes": t.get("likes"),
                    "retweets": t.get("retweets"),
                    "views": t.get("views"),
                    "media": media_list,
                    "status": "success"
                })
                print(f"[OK] @{author.get('screen_name')}: {t.get('text')[:60]}...")
            else:
                results.append({
                    "original_url": url,
                    "id": tweet_id,
                    "status": "error",
                    "message": data.get("message")
                })
                print(f"[FAIL] {url} - {data.get('message')}")
    except Exception as e:
        results.append({
            "original_url": url,
            "id": tweet_id,
            "status": "error",
            "message": str(e)
        })
        print(f"[ERROR] {url} - {e}")
    time.sleep(0.5)

with open("reports/x_posts_extracted.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"\nAll done. {len(results)} items saved to reports/x_posts_extracted.json")
