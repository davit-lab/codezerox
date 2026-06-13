"""
Restore PDFs from local Downloads to current Supabase project.

USAGE:
  python3 restore_pdfs.py

This script:
  1. Fetches all books from the current Supabase project
  2. Matches each book title to a PDF in ~/Downloads
  3. Uploads the PDF to the 'book-pdfs' bucket
  4. Updates the book's pdf_url in the database
"""
import json, urllib.request, urllib.error, os, glob

# Current (new) project credentials
NEW_URL = "https://cnkhdwcqfxkdmluvikzv.supabase.co"
NEW_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNua2hkd2NxZnhrZG1sdXZpa3p2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDYxNzU0OCwiZXhwIjoyMDkwMTkzNTQ4fQ.lUA7LxZCP2MVCIEq0-Pn-C-OlGAiKIq4vC4qXSDziMs"

DOWNLOADS_DIR = os.path.expanduser("~/Downloads")

# Map book title keywords to local PDF filenames
# Keys are lowercase keywords found in book titles, values are glob patterns for Downloads
TITLE_TO_FILE = {
    "c++": "C++*new*.pdf",
    "c#": "C#*new*.pdf",
    "csharp": "C#*new*.pdf",
    "java": "Java (new)*.pdf",
    "javascript": "JavaScript (new)*.pdf",
    "js": "JavaScript (new)*.pdf",
    "python": "Python (new)*.pdf",
    "react": "React JS*new*.pdf",
    "react js": "React JS*new*.pdf",
    "css": "css*new*.pdf",
    "mysql": "MySQL*new*.pdf",
    "figma": "Figma.pdf",
    "acronis": "acronis*.pdf",
    "html": "176928*.pdf",
    "kali": "*Kali*.pdf",
    "php": "*PHP*.pdf",
}

def rest_get(path):
    req = urllib.request.Request(
        f"{NEW_URL}/rest/v1/{path}",
        headers={"apikey": NEW_SERVICE_KEY, "Authorization": f"Bearer {NEW_SERVICE_KEY}"}
    )
    try:
        return json.loads(urllib.request.urlopen(req).read())
    except urllib.error.HTTPError as e:
        print(f"  GET error {e.code}: {e.read().decode()[:150]}")
        return None

def rest_patch(path, body):
    data = json.dumps(body).encode()
    req = urllib.request.Request(
        f"{NEW_URL}/rest/v1/{path}",
        data=data,
        method="PATCH",
        headers={
            "apikey": NEW_SERVICE_KEY,
            "Authorization": f"Bearer {NEW_SERVICE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        }
    )
    try:
        urllib.request.urlopen(req)
        return True
    except urllib.error.HTTPError as e:
        print(f"  PATCH error {e.code}: {e.read().decode()[:150]}")
        return False

def upload_pdf(local_path, storage_path):
    with open(local_path, "rb") as f:
        pdf_data = f.read()
    req = urllib.request.Request(
        f"{NEW_URL}/storage/v1/object/book-pdfs/{storage_path}",
        data=pdf_data,
        method="POST",
        headers={
            "apikey": NEW_SERVICE_KEY,
            "Authorization": f"Bearer {NEW_SERVICE_KEY}",
            "Content-Type": "application/pdf",
            "x-upsert": "true"
        }
    )
    try:
        urllib.request.urlopen(req)
        return f"{NEW_URL}/storage/v1/object/public/book-pdfs/{storage_path}"
    except urllib.error.HTTPError as e:
        print(f"  UPLOAD error {e.code}: {e.read().decode()[:150]}")
        return None

def find_local_pdf(title):
    title_lower = title.lower()
    for keyword, pattern in TITLE_TO_FILE.items():
        if keyword in title_lower:
            matches = glob.glob(os.path.join(DOWNLOADS_DIR, pattern))
            if matches:
                return matches[0]  # return first match
    # fallback: try to find any PDF with similar name
    words = title_lower.split()
    for word in words:
        if len(word) < 3:
            continue
        matches = glob.glob(os.path.join(DOWNLOADS_DIR, f"*{word}*.pdf"))
        if matches:
            return matches[0]
    return None

def main():
    print("=== Fetching books from current project ===")
    books = rest_get("books?select=id,title,pdf_url&order=title")
    if not books:
        print("No books found or API error")
        return

    print(f"Found {len(books)} books\n")

    ok = 0
    skip = 0
    fail = 0
    missing = []

    for book in books:
        bid = book["id"]
        title = book["title"]
        print(f"[{title}]")

        local_path = find_local_pdf(title)
        if not local_path:
            print(f"  NO LOCAL PDF FOUND")
            missing.append(title)
            fail += 1
            continue

        print(f"  Found: {os.path.basename(local_path)}")

        # Upload with clean path: {book_id}.pdf
        storage_path = f"{bid}.pdf"
        public_url = upload_pdf(local_path, storage_path)
        if not public_url:
            fail += 1
            continue

        # Update book record
        if rest_patch(f"books?id=eq.{bid}", {"pdf_url": public_url}):
            print(f"  OK -> {public_url}")
            ok += 1
        else:
            fail += 1

    print(f"\n=== Done: {ok} uploaded, {fail} failed, {skip} skipped ===")
    if missing:
        print(f"\nMissing PDFs for: {', '.join(missing)}")
        print(f"\nAdd them manually to {DOWNLOADS_DIR} and re-run.")

if __name__ == "__main__":
    main()
