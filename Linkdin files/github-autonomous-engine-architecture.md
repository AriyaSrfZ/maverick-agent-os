# Autonomous LinkedIn Engine: Ban-Proof Architecture Guide (GitHub + Local Runner)

## 1. Why Pure Cloud GitHub Actions Gets Accounts Banned

If you attempt to run browser automation directly on GitHub Actions (hosted on Azure/AWS):
1. **Datacenter IP Flagging**: Microsoft Azure datacenter IPs (`20.x.x.x`) are blacklisted by LinkedIn's bot detection (Kasada / PerimeterX). Personal accounts connecting from cloud datacenters are flagged in <48 hours.
2. **Impossible Travel Anomaly**: Connecting from Tehran at 10:00 PM and Virginia at 8:00 AM triggers automated security checkpoints demanding passport verification.
3. **Headless Browser Signatures**: Default headless Chromium in cloud containers lacks GPU hardware acceleration, producing detectable Canvas and WebGL fingerprints.

---

## 2. The Ban-Proof Solution: GitHub Self-Hosted Runner on Your PC

This architecture gives you the best of both worlds:
- **Code, logs, and content are managed on GitHub.**
- **Execution happens on your local machine using your residential IP and existing Chrome session.**

```
┌────────────────────────────────────────────────────────┐
│                   GitHub Repository                    │
│   • Content Calendar (50 posts in Markdown)            │
│   • Cron Workflow: schedule-morning-post.yml           │
│   • Audit Logs and Council Directives                  │
└───────────────────────────┬────────────────────────────┘
                            │ (Triggers at 08:00 AM)
                            ▼
┌────────────────────────────────────────────────────────┐
│      Self-Hosted Runner on Your Local Linux PC         │
│   • Runs as a background systemd service               │
│   • Connects over CDP (localhost:9222)                 │
│   • Reuses your existing, verified Chrome profile      │
│   • Uses your exact residential IP & Canvas fingerprint│
└───────────────────────────┬────────────────────────────┘
                            │ (DOM-Level Human Execution)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   LinkedIn Platform                    │
│   • Sees normal human session from your home IP        │
│   • Zero authentication friction, zero ban risk        │
└────────────────────────────────────────────────────────┘
```

---

## 3. How to Set Up the 2-Month Engine (Step-by-Step)

### Step 1: Push This Workspace to Your Private GitHub Repo
```bash
git remote add origin git@github.com:YOUR_USERNAME/linkedin-career-engine.git
git branch -M master
git push -u origin master
```

### Step 2: Install GitHub Self-Hosted Runner on This PC
In your GitHub repo:
1. Go to **Settings -> Actions -> Runners -> New self-hosted runner**.
2. Select **Linux**.
3. Run the 3 download and configure commands in your terminal.
4. Run `sudo ./svc.sh install` and `sudo ./svc.sh start` so the runner runs automatically even across reboots.

### Step 3: The Automated GitHub Actions Workflow (`.github/workflows/morning-engine.yml`)
The workflow triggers at 08:00 AM UAE / 07:30 AM Tehran time:
```yaml
name: 08:00 AM LinkedIn Career Engine

on:
  schedule:
    # 04:00 UTC = 07:30 AM Tehran / 08:00 AM Dubai
    - cron: '0 4 * * 0,2,3,4'
  workflow_dispatch:

jobs:
  run-daily-flow:
    runs-on: self-hosted  # Runs on your local machine, NOT Azure
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Run Morning Publish & Triage
        run: |
          node run_morning_automation.js
```

---

## 4. How the PC Handles Locked Screens & Suspension

* **Locked Screen Reality**: You do **not** need to unlock your desktop. Chrome DevTools Protocol (port 9222) interacts directly with Chrome's internal memory and DOM rendering tree. Scripts execute cleanly behind a locked desktop.
* **Suspension & Sleep Prevention**:
  To ensure the PC stays available or wakes up:
  ```bash
  # Option A: Prevent system sleep while you are running the 2-month campaign
  sudo systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target

  # Option B: Automatic Hardware Wakeup via RTC Timer (wakes at 07:25 AM)
  sudo rtcwake -m no -t $(date -d "tomorrow 07:25" +%s)
  ```
