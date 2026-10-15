# Social Media Admin Capabilities & Bulk Archiving Playbook
## Programmatic vs Native Feed Cleanup for Instagram, Facebook, YouTube, and TikTok
**Curated For:** Ariya Sarrafzadeh (HaroSS) | Maverick Agent OS  
**Target Accounts:** Instagram (`ariya.sarrafzadeh`), Facebook (`1411269572065616`), YouTube (`Forbidden Genesis`), TikTok (`ariyasarrafzadeh`)  

---

## 1. Executive Findings: Archiving vs Deleting

When repositioning existing personal accounts into professional creator and enterprise authority profiles, cleaning up outdated personal photos, memes, and irrelevant posts is mandatory. 

### Why You Must Archive Rather Than Delete
1. **Preserves Algorithmic Trust & Account Age:** Older accounts with uninterrupted activity history have significantly higher trust scores with Meta and Google spam filters. Deleting large volumes of posts can trigger algorithmic penalties or wipe historical engagement graphs. Archiving hides content from public view while preserving all underlying account metadata.
2. **Preserves Likes & Engagement Memory:** Archived posts retain their full engagement logs in the platform database.
3. **Instant Reversibility:** Archived posts can be restored to the exact original timestamp in the public feed with a single tap if ever needed.
4. **Zero Regulatory / Legal Deletion Footprint:** Useful for professional record keeping.

---

## 2. Platform Admin Capabilities Audit

### A. Meta / Instagram Graph API (Developer & MCP Layer)
* **API Capability:** The official Instagram Graph API (`graph.facebook.com`) allows:
  * Publishing media (Reels, Carousels, Single Images, Stories).
  * Retrieving media insights (impressions, reach, engagement).
  * Managing incoming comments and replies.
  * Direct post deletion (`DELETE /{instagram-media-id}`).
* **Critical Limitation:** Meta **does NOT expose an archive endpoint** in the public Graph API. Meta deliberately restricts feed archiving to the native mobile user interface to prevent rogue third-party apps from modifying user profile displays invisibly.
* **Security Guard:** Do **NOT** use unofficial Python private API scripts (`instagrapi`, Selenium scraping, or private endpoint injection `i.instagram.com/api/v1/...`) for bulk archiving. Meta's automated security monitors detect non-mobile user agents accessing private endpoints and instantly trigger SMS checkpoints, temporary blocks, or shadowbans.

### B. The Native Mobile Solution: Instagram "Your Activity" (Bulk Archiving Engine)
Instagram has a built-in native bulk management tool directly inside the mobile app that allows you to safely archive hundreds of old posts in under 60 seconds without risk.

#### Step-by-Step Execution Protocol:
1. Open the **Instagram App** on your phone (logged into `ariya.sarrafzadeh`).
2. Go to your **Profile** (bottom right icon).
3. Tap the **Hamburger Menu** (three horizontal lines, top right).
4. Tap **Your Activity** (فعالیت‌های شما).
5. Under "Content you shared", tap **Posts** (پست‌ها).
6. Tap **Sort & Filter** (مرتب‌سازی و فیلتر):
   * Select **Sort by:** *Oldest to newest* (از قدیمی‌ترین به جدیدترین).
   * Optional: Set **Date range** (e.g., from account inception up to 2024).
7. Tap **Select** (انتخاب) in the top right corner.
8. Tap to select all old, irrelevant, or personal posts you want hidden from the public feed (you can select up to 100 posts in a single batch).
9. Tap **Archive** (بایگانی) at the bottom left.
10. Confirm the prompt.

**Result:** All selected posts vanish from your public feed instantly. They are stored safely in your private **Archive** (`Profile -> Menu -> Archive`), accessible only to you.

---

## 3. Facebook Page & Profile Admin Cleanup

For Facebook (`1411269572065616`):
1. Navigate to your Facebook Profile or Page on desktop Chrome.
2. Click your profile avatar -> **Settings & Privacy** -> **Activity Log** (گزارش فعالیت).
3. In the left sidebar, click **Your Posts** -> **Photos and Videos** (or **Text updates**).
4. Click **Manage Your Posts**.
5. Check the top checkbox **All** (to select all visible items).
6. Click **Archive** (بایگانی) or **Move to Trash** (سطل زباله):
   * **Archive:** Kept permanently private, viewable only by you.
   * **Trash:** Kept for 30 days before automatic permanent deletion.

---

## 4. YouTube Channel Cleanup (`Forbidden Genesis`)

If cleaning up old test shorts or unrelated videos:
1. Open **YouTube Studio** (`studio.youtube.com`).
2. Click **Content** in the left menu.
3. Check the box at the top left of the video list to select all videos on the page (or click "Select all" to span all pages).
4. Click **Edit** in the black action bar at the top.
5. Select **Visibility** -> Set to **Unlisted** (غیرعلنی) or **Private** (خصوصی).
6. Click **Update Videos**.

**Result:** Keeps all view counts and channel watch hours intact toward monetization thresholds, but removes old videos from public browse recommendations.

---

## 5. TikTok Profile Cleanup (`ariyasarrafzadeh`)

TikTok does not offer a single-button "Archive All", but offers bulk privacy adjustment:
1. Open the **TikTok App** -> Go to **Profile**.
2. Tap the **Manage Topics / Videos** under Creator tools.
3. For individual or grouped videos: Tap the video -> Three dots (`...`) -> **Privacy Settings** -> Change "Who can watch this video" from **Everyone** to **Only me** (فقط خودم).

---

## 6. Checklist: The Clean Profile Handoff

Before launching the beginner AI guides and enterprise content on Instagram (`ariya.sarrafzadeh`):
- [ ] Run the **Your Activity** bulk archive on Instagram to clear out non-professional legacy posts.
- [ ] Ensure the Bio reflects the dual authority anchor:
  > Technical Product Owner & Solutions Architect  
  > Telecom Infrastructure • National Payment Rails • Applied AI  
  > Building sovereign systems & high-throughput architectures.
- [ ] Maintain Highlights for:
  * `AI Guides` (آموزش‌های کاربردی هوش مصنوعی)
  * `Architecture` (زیرساخت و سامانه‌های مقیاس بالا)
  * `Case Studies` (مطالعات موردی و تجربیات فنی)
