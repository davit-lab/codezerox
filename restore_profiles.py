"""
Restore profiles from CSV export to current Supabase project.

USAGE:
  python3 restore_profiles.py /path/to/profiles-export.csv
"""
import sys, csv, json, urllib.request, urllib.error

NEW_URL = "https://cnkhdwcqfxkdmluvikzv.supabase.co"
NEW_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNua2hkd2NxZnhrZG1sdXZpa3p2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDYxNzU0OCwiZXhwIjoyMDkwMTkzNTQ4fQ.lUA7LxZCP2MVCIEq0-Pn-C-OlGAiKIq4vC4qXSDziMs"

def rest_get(path):
    req = urllib.request.Request(
        f"{NEW_URL}/rest/v1/{path}",
        headers={"apikey": NEW_SERVICE_KEY, "Authorization": f"Bearer {NEW_SERVICE_KEY}"}
    )
    try:
        return json.loads(urllib.request.urlopen(req).read())
    except urllib.error.HTTPError as e:
        return {"__error__": e.code, "body": e.read().decode()[:200]}

def rest_post(table, rows):
    data = json.dumps(rows).encode()
    req = urllib.request.Request(
        f"{NEW_URL}/rest/v1/{table}",
        data=data,
        method="POST",
        headers={
            "apikey": NEW_SERVICE_KEY,
            "Authorization": f"Bearer {NEW_SERVICE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=minimal"
        }
    )
    try:
        urllib.request.urlopen(req)
        return True
    except urllib.error.HTTPError as e:
        body = e.read().decode()[:200]
        # 409 conflict = already exists, which is fine
        if e.code == 409:
            return True
        print(f"    POST error {e.code}: {body}")
        return False

def user_exists(user_id):
    r = rest_get(f"auth.users?id=eq.{user_id}&select=id")
    return bool(r and isinstance(r, list) and len(r) > 0)

def main():
    csv_path = sys.argv[1] if len(sys.argv) > 1 else "/home/davit/Downloads/profiles-export-2026-06-10_22-23-00.csv"
    print(f"Reading profiles from: {csv_path}\n")

    profiles = []
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter=";")
        for row in reader:
            profiles.append(row)

    print(f"Found {len(profiles)} profiles in CSV")

    # Check which user_ids exist in auth.users
    existing_users = set()
    missing_users = []

    print("\n=== Checking auth.users existence ===")
    for p in profiles:
        uid = p.get("user_id", "").strip()
        if not uid:
            continue
        # Try REST endpoint first; if that fails due to auth schema restrictions,
        # we'll fall back to SQL
        r = rest_get(f"profiles?user_id=eq.{uid}&select=id")
        has_profile = bool(r and isinstance(r, list) and len(r) > 0)
        if has_profile:
            existing_users.add(uid)
            print(f"  [SKIP - has profile] {p.get('email','?')[:40]}")
        else:
            missing_users.append(p)
            print(f"  [NEEDS PROFILE] {p.get('email','?')[:40]}")

    print(f"\nProfiles already exist: {len(existing_users)}")
    print(f"Profiles to restore: {len(missing_users)}")

    if not missing_users:
        print("Nothing to do — all profiles exist.")
        return

    # For missing profiles, we need to check if user_id exists in auth.users.
    # The REST API for auth.users may be restricted. We'll try upserting profiles
    # and let the DB FK constraint tell us which ones fail.

    ok_profiles = 0
    ok_roles = 0
    fail_profiles = 0
    fail_missing_user = []

    print("\n=== Restoring profiles ===")
    for p in missing_users:
        uid = p.get("user_id", "").strip()
        email = p.get("email", "").strip()
        full_name = p.get("full_name", "").strip()
        avatar_url = p.get("avatar_url", "").strip() or None
        bio = p.get("bio", "").strip() or None
        experience = p.get("experience", "").strip() or None
        github_url = p.get("github_url", "").strip() or None
        website_url = p.get("website_url", "").strip() or None
        location = p.get("location", "").strip() or None
        skills_raw = p.get("skills", "").strip()
        skills = None
        if skills_raw and skills_raw != "[]":
            try:
                skills = json.loads(skills_raw)
            except:
                skills = None

        # Skip avatars pointing to old storage (broken URLs)
        if avatar_url and "rcralnajyjodfdbnuvdq" in avatar_url:
            avatar_url = None

        profile_row = {
            "id": p.get("id") or uid,  # use CSV id or fallback to user_id
            "user_id": uid,
            "email": email,
            "full_name": full_name or email,
            "avatar_url": avatar_url,
            "bio": bio,
            "experience": experience,
            "github_url": github_url,
            "website_url": website_url,
            "location": location,
            "skills": skills,
        }
        # Remove None values to avoid type issues
        profile_row = {k: v for k, v in profile_row.items() if v is not None}

        if rest_post("profiles", [profile_row]):
            print(f"  OK profile | {email}")
            ok_profiles += 1

            # Also ensure user_roles has 'user' role
            if rest_post("user_roles", [{"user_id": uid, "role": "user"}]):
                ok_roles += 1
        else:
            print(f"  FAIL profile | {email} (user may not exist in auth.users)")
            fail_profiles += 1
            fail_missing_user.append({"email": email, "user_id": uid})

    print(f"\n=== Done ===")
    print(f"Profiles restored: {ok_profiles}/{len(missing_users)}")
    print(f"Roles restored: {ok_roles}/{len(missing_users)}")
    print(f"Failed (missing auth user): {fail_profiles}/{len(missing_users)}")

    if fail_missing_user:
        print(f"\nThese users are MISSING from auth.users — cannot create profiles:")
        for u in fail_missing_user:
            print(f"  - {u['email']} ({u['user_id']})")
        print(f"\nTo fix: either re-create them in auth.users (via Admin API) or ignore.")

if __name__ == "__main__":
    main()
