#!/usr/bin/env python3
import os, json, urllib.request, urllib.error

# Read the updated function code
with open("supabase/functions/ai-tutor/index.ts", "r", encoding="utf-8") as f:
    code = f.read()

# Prepare multipart form data
boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
body = (
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="slug"\r\n\r\n'
    f'ai-tutor\r\n'
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="verify_jwt"\r\n\r\n'
    f'false\r\n'
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="file"; filename="index.ts"\r\n'
    f'Content-Type: application/typescript\r\n\r\n'
    f'{code}\r\n'
    f'--{boundary}--\r\n'
).encode("utf-8")

req = urllib.request.Request(
    "https://api.supabase.com/v1/projects/cnkhdwcqfxkdmluvikzv/functions/deploy",
    data=body,
    headers={
        "Authorization": "Bearer sbp_82b8e263a90914d854fd64cd43ee3f8b574b72ef",
        "Content-Type": f"multipart/form-data; boundary={boundary}",
    }
)

try:
    resp = urllib.request.urlopen(req).read()
    print("Deploy response:", resp.decode())
except urllib.error.HTTPError as e:
    print("Deploy error:", e.code, e.read().decode())
