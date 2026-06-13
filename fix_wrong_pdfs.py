"""Fix the 3 wrong/missing PDF uploads."""
import json, urllib.request, urllib.error, os

NEW_URL = "https://cnkhdwcqfxkdmluvikzv.supabase.co"
NEW_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNua2hkd2NxZnhrZG1sdXZpa3p2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDYxNzU0OCwiZXhwIjoyMDkwMTkzNTQ4fQ.lUA7LxZCP2MVCIEq0-Pn-C-OlGAiKIq4vC4qXSDziMs"
DOWNLOADS = os.path.expanduser("~/Downloads")

# Exact mappings for the 3 problematic books
FIXES = [
    # (book_title_keyword, exact_local_filename)
    ("Javascript", "JavaScript (new).pdf"),
    ("React Js", "React JS (new).pdf"),
]

def rest_get(path):
    req = urllib.request.Request(
        f"{NEW_URL}/rest/v1/{path}",
        headers={"apikey": NEW_SERVICE_KEY, "Authorization": f"Bearer {NEW_SERVICE_KEY}"}
    )
    return json.loads(urllib.request.urlopen(req).read())

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
    urllib.request.urlopen(req)
    return True

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
    urllib.request.urlopen(req)
    return f"{NEW_URL}/storage/v1/object/public/book-pdfs/{storage_path}"

books = rest_get("books?select=id,title,pdf_url")

for keyword, filename in FIXES:
    book = next((b for b in books if keyword.lower() in b["title"].lower()), None)
    if not book:
        print(f"Book '{keyword}' not found")
        continue

    local_path = os.path.join(DOWNLOADS, filename)
    if not os.path.exists(local_path):
        print(f"File not found: {local_path}")
        continue

    print(f"[{book['title']}] -> {filename}")
    public_url = upload_pdf(local_path, f"{book['id']}.pdf")
    rest_patch(f"books?id=eq.{book['id']}", {"pdf_url": public_url})
    print(f"  FIXED: {public_url}")

print("\nDone. If you have a PHP PDF, add it to ~/Downloads and let me know.")
