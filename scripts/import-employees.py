#!/usr/bin/env python3
"""Import the Doner employee roster from xlsx into Supabase.

Usage:
    python3 scripts/import-employees.py [path-to-xlsx]

Defaults to ~/Downloads/Employee List 4.23.26.xlsx.

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


def parse_xlsx(path: Path) -> list[dict]:
    wb = openpyxl.load_workbook(path, data_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    if not rows:
        return []

    header = [str(h or "").strip() for h in rows[0]]

    def col(name: str) -> int:
        for i, h in enumerate(header):
            if h.lower() == name.lower():
                return i
        raise ValueError(f"Column {name!r} not found in {header}")

    email_idx = col("Email Address")
    name_idx = col("Employee Name (First MI Last Suffix)")
    title_idx = col("Job Title")

    out: list[dict] = []
    for row in rows[1:]:
        email_raw = row[email_idx] if email_idx < len(row) else None
        name_raw = row[name_idx] if name_idx < len(row) else None
        title_raw = row[title_idx] if title_idx < len(row) else None

        email = str(email_raw or "").strip().lower()
        name = str(name_raw or "").strip()
        title = str(title_raw or "").strip()

        if not email or "@" not in email or not name:
            continue

        out.append({
            "email": email,
            "full_name": name,
            "job_title": title or None,
            "agency": "Doner",
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
