#!/usr/bin/env python3
"""
Create S360 Epics and Stories in Jira via REST API.

Usage:
  export JIRA_URL="https://your-domain.atlassian.net"
  export JIRA_EMAIL="your-email@example.com"
  export JIRA_API_TOKEN="your-api-token"
  pip install requests
  python S360-jira-import.py
"""

import os
import requests
import base64
from typing import Optional

JIRA_URL = os.environ.get("JIRA_URL", "").rstrip("/")
JIRA_EMAIL = os.environ.get("JIRA_EMAIL", "")
JIRA_API_TOKEN = os.environ.get("JIRA_API_TOKEN", "")
PROJECT_KEY = "S360"


def jira_request(method: str, path: str, json_body: Optional[dict] = None):
    auth = base64.b64encode(f"{JIRA_EMAIL}:{JIRA_API_TOKEN}".encode()).decode()
    headers = {
        "Authorization": f"Basic {auth}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    url = f"{JIRA_URL}/rest/api/3{path}"
    resp = requests.request(method, url, headers=headers, json=json_body, timeout=30)
    resp.raise_for_status()
    return resp.json() if resp.text else {}


def adf_text(text: str) -> list:
    """Convert plain text to Atlassian Document Format."""
    return [{"type": "paragraph", "content": [{"type": "text", "text": text}]}]


# Epics: (Summary, Description)
EPICS = [
    (
        "Discord Integration Foundation & Security",
        "Provide a secure multi-tenant integration layer between Nextiva and Discord.",
    ),
    (
        "Discord Admin Configuration Experience",
        "Enable Nextiva admins to connect Discord and manage event mappings.",
    ),
    (
        "Ticket Creation From Discord Messages",
        "Allow authorized Discord users to create Nextiva tickets from Discord.",
    ),
    (
        "Ticket & Alert Notifications to Discord",
        "Deliver ticket lifecycle events and alerts into Discord channels.",
    ),
    (
        "Observability Metrics & Operations",
        "Provide integration health, usage metrics, and operational alerting.",
    ),
]

# Stories: (Summary, Description, Epic index 0-based)
STORIES = [
    ("Register Shared Discord App/Bot", "Register shared Discord App/Bot; store token encrypted.", 0),
    ("Tenant-Discord Server Linking Model", "DB schema and CRUD for tenant-server links.", 0),
    ("Discord Webhook Signature Verification", "Verify Discord webhooks via Ed25519.", 0),
    ("Service-to-Service Auth for Nextiva Events", "Secure internal event endpoint with mTLS/service tokens.", 0),
    ("Connect Discord Server via OAuth", "Admin connects Discord via OAuth; store tokens and guild info.", 1),
    ("List Connected Discord Servers in UI", "Display linked servers via GET /api/integrations/discord/servers.", 1),
    ("Fetch and Display Discord Channels", "List text channels for server; validate bot permissions.", 1),
    ("Configure Event-to-Channel Mappings", "Map event types to channels with filters.", 1),
    ("Slash Command /nextiva-ticket Registration", "Register and handle /nextiva-ticket in Discord.", 2),
    ("Ticket Creation Modal Flow", "Discord modal for Title, Category, Priority.", 2),
    ("Create Ticket in Nextiva From Discord", "Call Nextiva API; store link; post confirmation.", 2),
    ("Role-Based Control for Ticket Creation", "Config for allowed roles/channels; audit blocked attempts.", 2),
    ("Ingest Ticket Lifecycle Events", "Accept ticket.created/resolved at internal endpoint.", 3),
    ("Event Routing Based on Mappings", "Load mappings; apply filters; enqueue dispatch.", 3),
    ("Send Discord Embeds for Ticket Events", "Post rich embeds; handle rate limits.", 3),
    ("Basic Alerting for High-Priority Tickets", "Priority filter; route to #alerts channels.", 3),
    ("Integration Health Status in UI", "Show Connected/Partial/Error status per tenant.", 4),
    ("Usage Metrics Endpoint", "GET /api/integrations/discord/metrics with date range.", 4),
    ("Structured Logging and Alerting", "Logs; dashboards; alerts on failure threshold.", 4),
]


def main():
    if not all([JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN]):
        print("Set JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN")
        return 1

    epic_keys = []

    print("Creating Epics...")
    for summary, desc in EPICS:
        body = {
            "fields": {
                "project": {"key": PROJECT_KEY},
                "summary": summary,
                "issuetype": {"name": "Epic"},
                "description": {"type": "doc", "version": 1, "content": adf_text(desc)},
            }
        }
        created = jira_request("POST", "/issue", body)
        key = created["key"]
        epic_keys.append(key)
        print(f"  {key}: {summary}")

    # Resolve Epic Link field (common Cloud ID)
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
