#!/usr/bin/env python3
"""
GapGPT API Tester and Status Inspector
Validates OpenAI SDK connection against GapGPT endpoint (https://api.gapgpt.app/v1).
"""

import os
import sys
import openai

GAPGPT_BASE_URL = os.environ.get("GAPGPT_BASE_URL", "https://api.gapgpt.app/v1")
GAPGPT_API_KEY = os.environ.get("GAPGPT_API_KEY")

if not GAPGPT_API_KEY:
    # Attempt to load from ~/.bashrc if not exported in current subshell
    bashrc_path = os.path.expanduser("~/.bashrc")
    if os.path.exists(bashrc_path):
        with open(bashrc_path, "r", encoding="utf-8") as bf:
            for line in bf:
                if line.startswith("export GAPGPT_API_KEY="):
                    GAPGPT_API_KEY = line.split("=", 1)[1].strip().strip('"').strip("'")
                    break

if not GAPGPT_API_KEY:
    print("ERROR: GAPGPT_API_KEY is not set in environment or ~/.bashrc")
    sys.exit(1)

def main():
    print("Initializing GapGPT client...")
    print(f"Base URL: {GAPGPT_BASE_URL}")
    print(f"API Key: {GAPGPT_API_KEY[:8]}...{GAPGPT_API_KEY[-4:]}")
    
    client = openai.OpenAI(
        base_url=GAPGPT_BASE_URL,
        api_key=GAPGPT_API_KEY
    )
    
    print("\n[1/2] Testing API Authentication & Model Enumeration:")
    try:
        models = client.models.list()
        model_count = len(models.data)
        print(f"SUCCESS: Connected to GapGPT. Total models available: {model_count}")
        print("Sample active models:")
        for m in models.data[:8]:
            print(f"  * {m.id}")
    except Exception as exc:
        print(f"FAILED to fetch models: {exc}")
        sys.exit(1)

    print("\n[2/2] Testing Inference Call (gpt-4o-mini / gpt-5.3-codex):")
    test_models = ["gpt-4o-mini", "gpt-3.5-turbo", "gpt-5.3-codex"]
    for model_name in test_models:
        try:
            print(f"Sending test completion to '{model_name}'...")
            res = client.chat.completions.create(
                model=model_name,
                messages=[{"role": "user", "content": "ping"}],
                max_tokens=5
            )
            content = res.choices[0].message.content.strip()
            print(f"Response from {model_name}: {content}")
            break
        except openai.PermissionDeniedError as pde:
            print(f"Quota notice for {model_name}: {pde}")
            break
        except Exception as exc:
            print(f"Attempt failed on {model_name}: {exc}")

if __name__ == "__main__":
    main()
