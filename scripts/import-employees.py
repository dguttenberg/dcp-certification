#!/usr/bin/env python3
"""Import an employee roster (Doner or Colle McVoy) from xlsx into Supabase.

Usage:
    python3 scripts/import-employees.py [path-to-xlsx]

Defaults to ~/Downloads/Employee List 4.23.26.xlsx. Pass any other roster
file as the first argument. The script auto-detects the column schema and
derives the agency from each email address's domain, so the same script
works for any new agency you add.

Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local.
The xlsx itself is read by absolute path and never copied into the repo.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

try:
    import openpyxl
except ImportError:
    sys.stderr.write(
        "Missing dependency: openpyxl.\n"
        "Install with:  pip3 install openpyxl\n"
    )
    sys.exit(1)


DEFAULT_XLSX = Path.home() / "Downloads" / "Employee List 4.23.26.xlsx"
DEFAULT_ADMIN = "dguttenberg@doner.com"


def load_env_local(path: Path = Path(".env.local")) -> None:
    if not path.exists():
        return
    for raw in path.read_text().splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


def agency_from_email(email: str) -> str:
    """Map an email domain to an agency name."""
    domain = email.split("@", 1)[-1].lower()
    if domain in {"doner.com", "donercx.com", "donerpartnersnetwork.com"}:
        return "Doner"
    if domain == "collemcvoy.com":
        return "Colle McVoy"
    return "Unknown"


def parse_xlsx(path: Path) -> list[dict]:
    """Parse an employee xlsx with either of the supported schemas:

    - Doner: 'Email Address' + 'Employee Name (First MI Last Suffix)' + 'Job Title'
    - Colle McVoy: 'Email Address' + 'First Name' + 'Last Name' + 'Department'
    """
    wb = openpyxl.load_workbook(path, data_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    if not rows:
        return []

    header = [str(h or "").strip() for h in rows[0]]

    def find_col(candidates: list[str]) -> int:
        for cand in candidates:
            for i, h in enumerate(header):
                if h.lower() == cand.lower():
                    return i
        return -1

    email_idx = find_col(["Email Address", "Email"])
    full_name_idx = find_col([
        "Employee Name (First MI Last Suffix)",
        "Full Name",
        "Name",
    ])
    first_name_idx = find_col(["First Name", "FirstName"])
    last_name_idx = find_col(["Last Name", "LastName"])
    title_idx = find_col(["Job Title", "Title"])
    dept_idx = find_col(["Department", "Dept"])

    if email_idx == -1:
        raise ValueError(f"Couldn't find an Email column in {header}")
    if full_name_idx == -1 and (first_name_idx == -1 or last_name_idx == -1):
        raise ValueError(
            f"Couldn't find name columns. Need 'Employee Name' OR ('First Name' + 'Last Name'). Header: {header}"
        )

    out: list[dict] = []
    for row in rows[1:]:
        def cell(idx: int) -> str:
            if idx < 0 or idx >= len(row):
                return ""
            return str(row[idx] or "").strip()

        email = cell(email_idx).lower()
        if not email or "@" not in email:
            continue

        if full_name_idx >= 0:
            name = cell(full_name_idx)
        else:
            name = f"{cell(first_name_idx)} {cell(last_name_idx)}".strip()
        if not name:
            continue

        # Job title falls back to department when the file doesn't have a title column.
        title = cell(title_idx) if title_idx >= 0 else cell(dept_idx)

        out.append({
            "email": email,
            "full_name": name,
            "job_title": title or None,
            "agency": agency_from_email(email),
        })
    return out


def supabase_request(
    method: str,
    url: str,
    key: str,
    path: str,
    body: object | None = None,
    params: dict | None = None,
    extra_headers: dict | None = None,
) -> bytes:
    target = url.rstrip("/") + path
    if params:
        target += "?" + urllib.parse.urlencode(params)
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }
    if extra_headers:
        headers.update(extra_headers)
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(target, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.read()
    except urllib.error.HTTPError as e:
        msg = e.read().decode(errors="ignore")
        sys.stderr.write(f"HTTP {e.code} {method} {path}: {msg}\n")
        raise


def upsert_employees(records: list[dict], url: str, key: str) -> None:
    batch_size = 200
    total = len(records)
    for i in range(0, total, batch_size):
        batch = records[i:i + batch_size]
        supabase_request(
            "POST",
            url,
            key,
            "/rest/v1/employees",
            body=batch,
            params={"on_conflict": "email"},
            extra_headers={"Prefer": "resolution=merge-duplicates,return=minimal"},
        )
        done = min(i + batch_size, total)
        print(f"  upserted {done}/{total}")


def mark_admin(email: str, url: str, key: str) -> None:
    supabase_request(
        "PATCH",
        url,
        key,
        "/rest/v1/employees",
        body={"is_admin": True},
        params={"email": f"eq.{email}"},
        extra_headers={"Prefer": "return=minimal"},
    )
    print(f"  marked admin: {email}")


def count_employees(url: str, key: str) -> int:
    target = url.rstrip("/") + "/rest/v1/employees?select=id"
    req = urllib.request.Request(
        target,
        method="GET",
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Prefer": "count=exact",
            "Range": "0-0",
        },
    )
    with urllib.request.urlopen(req) as resp:
        cr = resp.headers.get("Content-Range") or ""
    # Format: "0-0/281"
    if "/" in cr:
        try:
            return int(cr.split("/", 1)[1])
        except ValueError:
            pass
    return -1


def main() -> int:
    load_env_local()

    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        sys.stderr.write(
            "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local\n"
        )
        return 1

    xlsx_path = Path(sys.argv[1]).expanduser() if len(sys.argv) > 1 else DEFAULT_XLSX
    if not xlsx_path.exists():
        sys.stderr.write(f"File not found: {xlsx_path}\n")
        return 1

    print(f"Reading {xlsx_path}")
    records = parse_xlsx(xlsx_path)
    print(f"Parsed {len(records)} employees")

    if not records:
        sys.stderr.write("No records to import.\n")
        return 1

    print("Upserting into employees…")
    upsert_employees(records, url, key)

    print("Setting initial admin…")
    mark_admin(DEFAULT_ADMIN, url, key)

    total = count_employees(url, key)
    if total >= 0:
        print(f"employees row count: {total}")
    print("Done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
