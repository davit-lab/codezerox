import json, urllib.request, urllib.error, uuid

NEW_URL  = "https://cnkhdwcqfxkdmluvikzv.supabase.co"
NEW_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNua2hkd2NxZnhrZG1sdXZpa3p2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDYxNzU0OCwiZXhwIjoyMDkwMTkzNTQ4fQ.lUA7LxZCP2MVCIEq0-Pn-C-OlGAiKIq4vC4qXSDziMs"
MGMT_PAT = "sbp_82b8e263a90914d854fd64cd43ee3f8b574b72ef"

USERS = [
    {"id":"47b87cc3-2fb3-42c3-937b-67073cfa60f5","email":"datosandro951@gmail.com",         "hash":"$2a$10$Gmq6KyahVMon5A6cQZ1ZHOOyJeBDm0ZiX4L3v.iceRLw2s2Gcd6Pq","created":"2026-01-22T18:59:02.938142+00:00","confirmed":"2026-01-22T18:59:02.979691+00:00","name":"Datosandro"},
    {"id":"77f6aadc-2838-40f4-b5f2-9afbebf4815c","email":"jincharadzezaza78@gmail.com",      "hash":"$2a$10$k2xysgooNL6FArKHpcpFqO2z3w6nQ3ZN4V5gHXDb0AtWpzrnc3ZIa","created":"2026-03-02T17:07:12.765715+00:00","confirmed":"2026-03-02T17:07:12.829127+00:00","name":"Zaza Jincharadze"},
    {"id":"ce74ca99-535b-426f-91f8-906638659b6e","email":"nana.qarcxia8282@gmail.com",       "hash":"$2a$10$MjjBDffmXkCOkn6i17ru5eMlTyK/Nf01I3m3F3bbzXiSQoueKbWTa","created":"2026-03-02T17:32:24.98112+00:00", "confirmed":"2026-03-02T17:32:25.029143+00:00","name":"Nana Karckhia"},
    {"id":"53fa9388-64c6-4be5-9342-fad7c7417ce9","email":"besokibernetika@gmail.com",         "hash":"$2a$10$xypBKRqJnu91PY.1mLEamO7wPDTnz/7B/m38b/PsoBEvD3VM4jBwK","created":"2026-03-02T17:44:08.647256+00:00","confirmed":"2026-03-02T17:44:08.748087+00:00","name":"Beso Beso"},
    {"id":"f3dda953-c30d-4926-80af-d4602167f90e","email":"salome.chkhitunidze@gmail.com",    "hash":"$2a$10$fXvxeEBdC6hrCx6DxkwKTeEA84f0kzoKVCOxdAA9IaiAMY11wdcYO","created":"2026-03-02T17:52:54.57259+00:00", "confirmed":"2026-03-02T17:52:54.637289+00:00","name":"Salome Chkhitunidze"},
    {"id":"a6e0cd6c-62f4-483e-aa82-74fbe420ad8d","email":"besonikolaishvili@hotmail.com",    "hash":"$2a$10$hR/NF6aWHrCMLhJHGFTx0.0dySEGDwO02XX1LyotlHKr/m8fkpmoO","created":"2026-03-03T08:11:28.425437+00:00","confirmed":"2026-03-03T08:11:28.46278+00:00", "name":"Besarion Nikolaishvili"},
    {"id":"a932c85a-80a0-4f33-82f1-0ac2dd78f44f","email":"gochasand@gmail.com",              "hash":"$2a$10$Gjkv8gU0AAD0qbZ3ydNgpeGfw/0FVAwgw1npzV9wE0V6qr01kJ9pm","created":"2026-03-03T09:39:59.049296+00:00","confirmed":"2026-03-03T09:39:59.14852+00:00", "name":"Gocha Sandukhadze"},
    {"id":"83ca6dc4-3f1c-4237-9a64-60b8da6eed52","email":"da@gmail.com",                     "hash":"$2a$10$ozT/efOtICZ3kvjvmO.E2ebQJ/fWYLrhcsd5LUbz3OPivz/NR9pwC","created":"2026-03-03T22:05:26.004329+00:00","confirmed":"2026-03-03T22:05:26.049138+00:00","name":"mk k"},
    {"id":"29b3a2f8-b974-4898-9116-0f9be0ca8b44","email":"testuser@example.com",             "hash":"$2a$10$gjUvnfC3OBPtj67n/WS2uOy3J.69I/kSOPosxTLVkovQDOPxy002.","created":"2026-03-08T07:15:47.684171+00:00","confirmed":"2026-03-08T07:15:47.7648+00:00",  "name":"Test User"},
    {"id":"e6622a95-a7dd-4030-a53c-1395a866fb96","email":"takougulava2005@gmail.com",        "hash":"$2a$10$hQsF2ogihT5GH7.ZyreuBuzfGJoIapbAbfiBMA9JpUscqf6LDvGtO","created":"2026-03-08T08:58:21.212256+00:00","confirmed":"2026-03-08T08:58:21.272355+00:00","name":"Tako Ugulava"},
    {"id":"76bb48ef-3663-45bc-a7c7-f36e3e36848e","email":"sgmaisuradze@gmail.com",           "hash":"$2a$10$FJKZeiNUMy/iEJZsI0lUaeo8W5yV3Bnn5a1L3mySCk9KN8UZdYZfW","created":"2026-03-10T07:09:22.535762+00:00","confirmed":"2026-03-10T07:09:22.612335+00:00","name":"Sandro Maisuradze"},
    {"id":"7dd008a3-ffc5-4188-b8de-335b9bf3814c","email":"malkhazpaksashvili@gmail.com",     "hash":"$2a$10$wk8JAOXFn0btn47nS8ixvenV/K4vA/InEP10Sd9uaSHvR2ofpDNNq","created":"2026-03-13T11:28:11.255712+00:00","confirmed":"2026-03-13T11:28:11.334096+00:00","name":"Malkhaz Paksashvili"},
    {"id":"11033449-40c1-4427-8b9c-18c2983d39b6","email":"levanichitanava.2022@gmail.com",   "hash":"$2a$10$LWqtjdm6X1DRYdsrxKMJi.OQcBMeeU595m4rs2n7XcnehrQKr9/gW","created":"2026-03-18T04:17:18.517915+00:00","confirmed":"2026-03-18T04:17:18.605837+00:00","name":"Levani Chitanava"},
    {"id":"7d238f3c-e08a-4148-8bf5-d1cb45ade7d0","email":"kashiashvili555@gmail.com",        "hash":"$2a$10$PvJ2tnUZwy30.kzFRRhMrOieGuX97aq04JA1IZu8XXFCuEAUDD9QK","created":"2026-03-18T18:36:30.219188+00:00","confirmed":"2026-03-18T18:36:30.258756+00:00","name":"Kashiashvili"},
    {"id":"8c88427c-655d-4f72-8cbd-8ab7e080099f","email":"iliabarn@gmail.com",               "hash":"$2a$10$ujmTlP1SGr52nyNrWkXix.b28zGWD3SAgrXwG0B/D22sJ3T2WIAKm","created":"2026-03-18T18:40:52.336708+00:00","confirmed":"2026-03-18T18:40:52.382159+00:00","name":"Ilia Barnovi"},
    {"id":"574e1c28-26ac-4814-b5db-8cf9ce02b29d","email":"marina.mosulishvili01@gmail.com",  "hash":"$2a$10$bU2NJfVsif2Az9PLINXs3eVSR64OEsBhY/.2bEL/4ZbHRBijA4t5m","created":"2026-03-24T05:04:25.459162+00:00","confirmed":"2026-03-24T05:04:25.618685+00:00","name":"Marina Mosulishvili"},
    {"id":"e15cedde-8924-4cac-89e2-b6c7ce32039b","email":"mamadato212@gmail.com",            "hash":"$2a$10$PoUimsVcPieKR8O8tFkO8e5A2O9v5neKRJJc5xB2kRya9OvimsW7K","created":"2026-03-25T19:16:01.007165+00:00","confirmed":"2026-03-25T19:16:01.016637+00:00","name":"Davit Ugu"},
]

def admin_api(method, path, body=None):
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(
        f"{NEW_URL}/auth/v1/admin/{path}",
        data=data,
        method=method,
        headers={
            "apikey": NEW_KEY,
            "Authorization": f"Bearer {NEW_KEY}",
            "Content-Type": "application/json"
        }
    )
    try:
        return json.loads(urllib.request.urlopen(req).read())
    except urllib.error.HTTPError as e:
        return {"__error__": e.code, "body": e.read().decode()[:300]}

def mgmt_sql(query):
    data = json.dumps({"query": query}).encode()
    req = urllib.request.Request(
        "https://api.supabase.com/v1/projects/cnkhdwcqfxkdmluvikzv/database/query",
        data=data,
        headers={"Authorization": f"Bearer {MGMT_PAT}", "Content-Type": "application/json"}
    )
    try:
        return json.loads(urllib.request.urlopen(req).read())
    except urllib.error.HTTPError as e:
        return {"__error__": e.code, "body": e.read().decode()[:300]}

def upsert_rest(table, rows):
    data = json.dumps(rows).encode()
    req = urllib.request.Request(
        f"{NEW_URL}/rest/v1/{table}",
        data=data,
        method="POST",
        headers={
            "apikey": NEW_KEY,
            "Authorization": f"Bearer {NEW_KEY}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=minimal"
        }
    )
    try:
        urllib.request.urlopen(req).read()
        return True
    except urllib.error.HTTPError as e:
        print(f"    REST err: {e.read().decode()[:150]}")
        return False

ok_auth = 0
ok_hash = 0
ok_prof = 0
ok_role = 0

print(f"Migrating {len(USERS)} users...\n")

for u in USERS:
    uid   = u["id"]
    email = u["email"]
    hsh   = u["hash"]
    name  = u["name"]

    # ── Step 1: create via Admin API (preserves original UUID via `id`) ──
    existing = admin_api("GET", f"users/{uid}")
    if "__error__" not in existing:
        print(f"  SKIP (exists) | {email}")
        ok_auth += 1
        created_uid = uid
    else:
        result = admin_api("POST", "users", {
            "id": uid,
            "email": email,
            "email_confirm": True,
            "password": "TemporaryPass!2026",
            "user_metadata": {"full_name": name}
        })
        if "__error__" in result:
            print(f"  [AUTH FAIL] {email}: {result['body'][:120]}")
            continue
        created_uid = result.get("id", uid)
        ok_auth += 1

    # ── Step 2: patch encrypted_password via SQL UPDATE ──
    safe_hash  = hsh.replace("'", "''")
    safe_email = email.replace("'", "''")
    q = f"UPDATE auth.users SET encrypted_password = '{safe_hash}' WHERE email = '{safe_email}';"
    r = mgmt_sql(q)
    if "__error__" in r:
        print(f"    [HASH FAIL] {r['body'][:120]}")
    else:
        ok_hash += 1

    # ── Step 3: profile ──
    if upsert_rest("profiles", [{"id": str(uuid.uuid4()), "user_id": created_uid,
                                  "email": email, "full_name": name}]):
        ok_prof += 1

    # ── Step 4: user role ──
    if upsert_rest("user_roles", [{"user_id": created_uid, "role": "user"}]):
        ok_role += 1

    print(f"  OK | {email}")

print(f"\n=== Done ===")
print(f"auth.users created : {ok_auth}/{len(USERS)}")
print(f"password hash set  : {ok_hash}/{len(USERS)}")
print(f"profiles           : {ok_prof}/{len(USERS)}")
print(f"user_roles         : {ok_role}/{len(USERS)}")
