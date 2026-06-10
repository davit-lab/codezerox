"""Verify PDFs are actually in storage and accessible."""
import json, urllib.request, urllib.error

NEW_URL = "https://cnkhdwcqfxkdmluvikzv.supabase.co"
NEW_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNua2hkd2NxZnhrZG1sdXZpa3p2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDYxNzU0OCwiZXhwIjoyMDkwMTkzNTQ4fQ.lUA7LxZCP2MVCIEq0-Pn-C-OlGAiKIq4vC4qXSDziMs"

# 1. Check bucket exists
print("=== Checking storage buckets ===")
req = urllib.request.Request(
    f"{NEW_URL}/storage/v1/bucket",
    headers={"apikey": NEW_SERVICE_KEY, "Authorization": f"Bearer {NEW_SERVICE_KEY}"}
)
try:
    buckets = json.loads(urllib.request.urlopen(req).read())
    for b in buckets:
        print(f"  Bucket: {b['name']} (public={b.get('public', '?')}, id={b['id']})")
except urllib.error.HTTPError as e:
    print(f"  ERROR: {e.code} - {e.read().decode()[:200]}")

# 2. Check objects in book-pdfs
print("\n=== Checking objects in 'book-pdfs' ===")
req = urllib.request.Request(
    f"{NEW_URL}/storage/v1/object/list/book-pdfs",
    data=b'{"prefix":"","limit":100}',
    headers={
        "apikey": NEW_SERVICE_KEY,
        "Authorization": f"Bearer {NEW_SERVICE_KEY}",
        "Content-Type": "application/json"
    }
)
try:
    resp = urllib.request.urlopen(req)
    data = json.loads(resp.read())
    objects = data if isinstance(data, list) else data.get("data", [])
    print(f"  Found {len(objects)} objects")
    for obj in objects[:20]:
        print(f"    {obj.get('name','?')} ({obj.get('size',0)//1024} KB)")
except urllib.error.HTTPError as e:
    print(f"  ERROR: {e.code} - {e.read().decode()[:200]}")

# 3. Check book pdf_urls
print("\n=== Checking books table pdf_urls ===")
req = urllib.request.Request(
    f"{NEW_URL}/rest/v1/books?select=id,title,pdf_url&pdf_url=not.is.null",
    headers={"apikey": NEW_SERVICE_KEY, "Authorization": f"Bearer {NEW_SERVICE_KEY}"}
)
books = json.loads(urllib.request.urlopen(req).read())
print(f"  {len(books)} books have pdf_url")
for b in books:
    pdf = b.get("pdf_url", "")
    print(f"  [{b['title'][:30]}] -> {pdf[:80]}...")
    # Try HEAD request to verify accessible
    if pdf:
        try:
            hreq = urllib.request.Request(pdf, method="HEAD")
            hresp = urllib.request.urlopen(hreq, timeout=5)
            print(f"    ACCESSIBLE ({hresp.status})")
        except Exception as e:
            print(f"    NOT ACCESSIBLE: {str(e)[:100]}")
