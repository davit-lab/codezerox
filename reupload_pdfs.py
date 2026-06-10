"""Re-upload PDFs with proper multipart encoding."""
import json, urllib.request, urllib.request, uuid, os

NEW_URL = "https://cnkhdwcqfxkdmluvikzv.supabase.co"
NEW_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNua2hkd2NxZnhrZG1sdXZpa3p2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDYxNzU0OCwiZXhwIjoyMDkwMTkzNTQ4fQ.lUA7LxZCP2MVCIEq0-Pn-C-OlGAiKIq4vC4qXSDziMs"
DOWNLOADS = os.path.expanduser("~/Downloads")

# Exact mappings: book title keyword -> local filename
BOOKS = [
    ("Acronis", "acronis პროგრამული უზრუნველყოფა.pdf"),
    ("C#", "C# (new).pdf"),
    ("C++", "C++(new).pdf"),
    ("CSS", "css (new).pdf"),
    ("figma", "Figma.pdf"),
    ("html", "1769281525574.pdf"),
    ("Java", "Java (new).pdf"),
    ("Javascript", "JavaScript (new).pdf"),
    ("Kali linux", "Beginning Ethical Hacking with Kali Linux_ Computational Techniques for Resolving Security Issues ( PDFDrive ).pdf"),
    ("MYSQL", "MySQL(new).pdf"),
    ("Python", "Python (new).pdf"),
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
        data=data, method="PATCH",
        headers={
            "apikey": NEW_SERVICE_KEY,
            "Authorization": f"Bearer {NEW_SERVICE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        }
    )
    urllib.request.urlopen(req)
    return True

def upload_multipart(local_path, storage_path):
    """Upload using multipart/form-data which Supabase Storage expects."""
    with open(local_path, "rb") as f:
        file_data = f.read()
    filename = os.path.basename(local_path)
    boundary = uuid.uuid4().hex
    
    # Build multipart body
    parts = []
    parts.append(f"--{boundary}".encode())
    parts.append(f'Content-Disposition: form-data; name="file"; filename="{filename}"'.encode())
    parts.append(b"Content-Type: application/pdf")
    parts.append(b"")
    parts.append(file_data)
    parts.append(f"--{boundary}--".encode())
    body = b"\r\n".join(parts)
    
    req = urllib.request.Request(
        f"{NEW_URL}/storage/v1/object/book-pdfs/{storage_path}",
        data=body,
        method="POST",
        headers={
            "apikey": NEW_SERVICE_KEY,
            "Authorization": f"Bearer {NEW_SERVICE_KEY}",
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "x-upsert": "true"
        }
    )
    try:
        resp = urllib.request.urlopen(req)
        return f"{NEW_URL}/storage/v1/object/public/book-pdfs/{storage_path}"
    except urllib.error.HTTPError as e:
        print(f"  UPLOAD ERROR {e.code}: {e.read().decode()[:200]}")
        return None

books = rest_get("books?select=id,title")
ok = 0
fail = 0

for keyword, filename in BOOKS:
    book = next((b for b in books if keyword.lower() in b["title"].lower()), None)
    if not book:
        print(f"[SKIP] Book '{keyword}' not found")
        fail += 1
        continue
    
    local_path = os.path.join(DOWNLOADS, filename)
    if not os.path.exists(local_path):
        print(f"[SKIP] File not found: {filename}")
        fail += 1
        continue
    
    file_size = os.path.getsize(local_path)
    print(f"[{book['title']}] {file_size//1024} KB -> uploading...")
    
    storage_path = f"{book['id']}.pdf"
    url = upload_multipart(local_path, storage_path)
    if url:
        rest_patch(f"books?id=eq.{book['id']}", {"pdf_url": url})
        print(f"  OK")
        ok += 1
    else:
        fail += 1

print(f"\n=== Done: {ok} uploaded, {fail} failed ===")
