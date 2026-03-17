#!/usr/bin/env python3
import os
import sys
import json
import urllib.request
import urllib.error

# JIRA Configuration
JIRA_URL = os.environ.get("JIRA_URL", "https://your-domain.atlassian.net")
JIRA_EMAIL = os.environ.get("JIRA_EMAIL")
JIRA_API_TOKEN = os.environ.get("JIRA_API_TOKEN")
PROJECT_KEY = os.environ.get("JIRA_PROJECT_KEY", "S360") # User previously used S360 or provide new

# Epics: (Summary, Description)
EPICS = [
    (
        "Agent Assist Phase 1: Assistant Foundation & Secure Retrieval",
        "Provides agents with immediate, verified answers to customer questions from within their text editor.",
    ),
    (
        "Agent Assist Phase 1: Intelligent Text Manipulation & Suggestions",
        "Empowers agents to immediately improve, adapt, and generate the perfect response length and tone during customer interactions.",
    ),
]

# Stories: (Summary, Description, Epic index 0-based)
STORIES = [
    # Epic 1
    ("Core API Gateway & Authentication Pipeline", "As a System Admin, I want an API Gateway with Agent authentication...", 0),
    ("RAG Pipeline & Vector DB Connection", "As a Backend Engineer, I want the LLM to query only our specific Vector Database...", 0),
    ("Safe 'Out of Scope' (OOS) Handling", "As a Support Agent, I want the AI to explicitly tell me when it doesn't know the answer...", 0),
    ("Unibox Editor Plugin Integration (Search UI)", "As a Support Agent, I want a simple sidebar or contextual menu in my Unibox Editor...", 0),

    # Epic 2
    ("Rephrase Selected Text", "As a Support Agent, I want to select text and click 'Rephrase'...", 1),
    ("Shorten Selected Text", "As a Support Agent, I want to select long-winded text and click 'Shorten'...", 1),
    ("Expand (Make it Larger) from Shorthand", "As a Support Agent, I want to type brief notes and click 'Expand'...", 1),
    ("Translate Text to Customer Language", "As a Support Agent, I want to select my drafted response and click 'Translate'...", 1),
    ("Summarize Long Customer Queries", "As a Support Agent, I want to select a long customer block of text or chat history and click 'Summarize'...", 1),
    ("Suggest Response based on Context", "As a Support Agent, I want to click 'Suggest Response'...", 1),
]

def adf_text(text):
    return [
        {
            "type": "paragraph",
            "content": [{"type": "text", "text": text}]
        }
    ]

def jira_request(method, path, body=None):
    url = f"{JIRA_URL}/rest/api/3{path}"
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    
    auth_str = f"{JIRA_EMAIL}:{JIRA_API_TOKEN}"
    import base64
    b64_auth = base64.b64encode(auth_str.encode()).decode()
    headers["Authorization"] = f"Basic {b64_auth}"

    data = None
    if body:
        data = json.dumps(body).encode("utf-8")

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        print(f"Error {e.code}: {e.read().decode()}")
        sys.exit(1)

def main():
    if not all([JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN, PROJECT_KEY]):
        print("Please set JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN, and JIRA_PROJECT_KEY environment variables.")
        return 1

    epic_keys = []

    print(f"Creating Epics in {PROJECT_KEY}...")
    for summary, desc in EPICS:
        body = {
            "fields": {
                "project": {"key": PROJECT_KEY},
                "summary": summary,
                "issuetype": {"name": "Epic"},
                "description": {"type": "doc", "version": 1, "content": adf_text(desc)},
                "customfield_15297": {"value": "No"}, # UX Research Needed?
                "customfield_14736": {"value": "No"}, # UX Design Needed?
                "customfield_16373": {"value": "No"}  # Release Notes Worthy
            }
        }
        created = jira_request("POST", "/issue", body)
        key = created["key"]
        epic_keys.append(key)
        print(f"  {key}: {summary}")

    fields = jira_request("GET", "/field")
    epic_link_id = None
    for f in fields:
        if f.get("name") == "Epic Link" or f.get("id") == "customfield_10014":
            epic_link_id = f["id"]
            break

    if not epic_link_id:
        print("Warning: Epic Link field not found. Stories will be created without Epic link.")

    print("\nCreating Stories...")
    for summary, desc, epic_idx in STORIES:
        fields = {
            "project": {"key": PROJECT_KEY},
            "summary": summary,
            "issuetype": {"name": "Story"},
            "description": {"type": "doc", "version": 1, "content": adf_text(desc)},
            "customfield_15297": {"value": "No"}, # UX Research Needed?
            "customfield_14736": {"value": "No"}, # UX Design Needed?
            "customfield_16373": {"value": "No"}  # Release Notes Worthy
        }
        if epic_link_id and epic_idx < len(epic_keys):
            fields[epic_link_id] = epic_keys[epic_idx]
        body = {"fields": fields}
        created = jira_request("POST", "/issue", body)
        print(f"  {created['key']}: {summary} -> {epic_keys[epic_idx]}")

    print(f"\nDone. Created {len(EPICS)} Epics and {len(STORIES)} Stories.")
    return 0

if __name__ == "__main__":
    exit(main())
