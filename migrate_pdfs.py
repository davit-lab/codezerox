"""
PDF Migration Script
====================
Copies all book PDFs from the OLD Supabase project storage to the NEW one.

USAGE:
  python3 migrate_pdfs.py <OLD_SERVICE_ROLE_KEY>

HOW TO GET THE OLD SERVICE ROLE KEY:
  1. Go to https://supabase.com/dashboard/project/rcralnajyjodfdbnuvdq
  2. Settings -> API -> service_role (secret key)
  3. Run: python3 migrate_pdfs.py eyJhbGci...
"""
import sys, json, urllib.request, urllib.error

if len(sys.argv) < 2:
    print(__doc__)
    sys.exit(1)

OLD_SERVICE_KEY = sys.argv[1]
OLD_URL = "https://rcralnajyjodfdbnuvdq.supabase.co"
NEW_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNua2hkd2NxZnhrZG1sdXZpa3p2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDYxNzU0OCwiZXhwIjoyMDkwMTkzNTQ4fQ.lUA7LxZCP2MVCIEq0-Pn-C-OlGAiKIq4vC4qXSDziMs"
NEW_URL = "https://cnkhdwcqfxkdmluvikzv.supabase.co"

# Get all pdf_url values from the new project's books table
print("=== Fetching book pdf_urls from new project ===")
req = urllib.request.Request(
    f"{NEW_URL}/rest/v1/books?select=id,title,pdf_url",
    headers={"apikey": NEW_SERVICE_KEY, "Authorization": f"Bearer {NEW_SERVICE_KEY}"}
)
books = json.loads(urllib.request.urlopen(req).read())
pdf_files = [(b["title"], b["pdf_url"]) for b in books if b.get("pdf_url")]
print(f"Found {len(pdf_files)} books with PDF")

ok = 0
skip = 0
fail = 0

for title, pdf_path in pdf_files:
    # Normalize path
    path = pdf_path.split("book-pdfs/")[1] if "book-pdfs/" in pdf_path else pdf_path
    print(f"\n  [{title[:40]}] -> {path}")

    # Step 1: Download from old project using service role
    try:
        dl_req = urllib.request.Request(
            f"{OLD_URL}/storage/v1/object/book-pdfs/{path}",
            headers={
                "apikey": OLD_SERVICE_KEY,
                "Authorization": f"Bearer {OLD_SERVICE_KEY}"
            }
        )
        pdf_data = urllib.request.urlopen(dl_req).read()
        print(f"    Downloaded {len(pdf_data)//1024} KB")
    except urllib.error.HTTPError as e:
        body = e.read().decode()[:100]
        print(f"    DOWNLOAD FAILED {e.code}: {body}")
        fail += 1
        continue

    # Step 2: Upload to new project
    try:
        ul_req = urllib.request.Request(
            f"{NEW_URL}/storage/v1/object/book-pdfs/{path}",
            data=pdf_data,
            method="POST",
            headers={
                "apikey": NEW_SERVICE_KEY,
                "Authorization": f"Bearer {NEW_SERVICE_KEY}",
                "Content-Type": "application/pdf",
                "x-upsert": "true"
            }
        )
        urllib.request.urlopen(ul_req).read()
        print(f"    Uploaded OK")
        ok += 1
    except urllib.error.HTTPError as e:
        body = e.read().decode()[:100]
        print(f"    UPLOAD FAILED {e.code}: {body}")
        fail += 1

print(f"\n=== Done: {ok} uploaded, {skip} skipped, {fail} failed ===")
