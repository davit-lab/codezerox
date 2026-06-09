-- ============================================================================
-- INSERT USER BOOK ACCESS (PURCHASES)
-- ============================================================================
-- Run this in Supabase SQL Editor to grant book access to users
-- Note: purchases table only has: id, user_id, book_id, purchased_at

-- Helper: Get book_id by title (approximate match) and insert purchase
DO $$
DECLARE
    book_record RECORD;
BEGIN
    -- Beso Beso (besokibernetika@gmail.com) - user_id: 53fa9388-64c6-4be5-9342-fad7c7417ce9
    FOR book_record IN 
        SELECT id FROM books WHERE title ILIKE '%C++%' LIMIT 1
    LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('53fa9388-64c6-4be5-9342-fad7c7417ce9', book_record.id, '2026-03-24 06:17:58.93124+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;

    FOR book_record IN 
        SELECT id FROM books WHERE title ILIKE '%React%' OR title ILIKE '%React.js%' LIMIT 1
    LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('53fa9388-64c6-4be5-9342-fad7c7417ce9', book_record.id, '2026-03-10 00:47:15.488097+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;

    FOR book_record IN 
        SELECT id FROM books WHERE title ILIKE '%PHP%' LIMIT 1
    LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('53fa9388-64c6-4be5-9342-fad7c7417ce9', book_record.id, '2026-03-09 19:48:03.968014+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;

    FOR book_record IN 
        SELECT id FROM books WHERE title ILIKE '%MySQL%' OR title ILIKE '%SQL%' LIMIT 1
    LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('53fa9388-64c6-4be5-9342-fad7c7417ce9', book_record.id, '2026-03-08 10:43:44.570298+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;

    FOR book_record IN 
        SELECT id FROM books WHERE title ILIKE '%HTML%' LIMIT 1
    LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('53fa9388-64c6-4be5-9342-fad7c7417ce9', book_record.id, '2026-03-02 17:56:16.005463+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;

    FOR book_record IN 
        SELECT id FROM books WHERE title ILIKE '%Figma%' LIMIT 1
    LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('53fa9388-64c6-4be5-9342-fad7c7417ce9', book_record.id, '2026-03-02 17:56:12.502456+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;

    FOR book_record IN 
        SELECT id FROM books WHERE title ILIKE '%Python%' LIMIT 1
    LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('53fa9388-64c6-4be5-9342-fad7c7417ce9', book_record.id, '2026-03-02 17:56:02.695809+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;

    FOR book_record IN 
        SELECT id FROM books WHERE title ILIKE '%Acronis%' LIMIT 1
    LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('53fa9388-64c6-4be5-9342-fad7c7417ce9', book_record.id, '2026-03-02 17:55:59.185411+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;

    FOR book_record IN 
        SELECT id FROM books WHERE title ILIKE '%CSS%' LIMIT 1
    LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('53fa9388-64c6-4be5-9342-fad7c7417ce9', book_record.id, '2026-03-02 17:55:53.033402+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;

    FOR book_record IN 
        SELECT id FROM books WHERE title ILIKE '%C#%' OR title ILIKE '%CSharp%' LIMIT 1
    LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('53fa9388-64c6-4be5-9342-fad7c7417ce9', book_record.id, '2026-03-02 17:55:48.713151+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;

    FOR book_record IN 
        SELECT id FROM books WHERE title ILIKE '%JavaScript%' LIMIT 1
    LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('53fa9388-64c6-4be5-9342-fad7c7417ce9', book_record.id, '2026-03-02 17:55:43.885653+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;

    FOR book_record IN 
        SELECT id FROM books WHERE title ILIKE '%Kali%' OR title ILIKE '%Linux%' LIMIT 1
    LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('53fa9388-64c6-4be5-9342-fad7c7417ce9', book_record.id, '2026-03-02 17:55:40.888661+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;
END $$;

-- Admin (datosandro951@gmail.com) - user_id: 47b87cc3-2fb3-42c3-937b-67073cfa60f5
DO $$
DECLARE
    book_record RECORD;
BEGIN
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%PHP%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('47b87cc3-2fb3-42c3-937b-67073cfa60f5', book_record.id, '2026-03-22 18:59:24.971634+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;

    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%Figma%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('47b87cc3-2fb3-42c3-937b-67073cfa60f5', book_record.id, '2026-03-22 18:59:20.887892+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;

    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%Python%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('47b87cc3-2fb3-42c3-937b-67073cfa60f5', book_record.id, '2026-03-22 18:59:18.216173+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;

    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%Acronis%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('47b87cc3-2fb3-42c3-937b-67073cfa60f5', book_record.id, '2026-03-22 18:59:15.755745+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;

    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%React%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('47b87cc3-2fb3-42c3-937b-67073cfa60f5', book_record.id, '2026-03-22 18:59:13.210713+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;

    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%C#%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('47b87cc3-2fb3-42c3-937b-67073cfa60f5', book_record.id, '2026-03-08 20:46:12.436206+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;

    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%HTML%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('47b87cc3-2fb3-42c3-937b-67073cfa60f5', book_record.id, '2026-03-08 07:14:53.552487+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;

    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%MySQL%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('47b87cc3-2fb3-42c3-937b-67073cfa60f5', book_record.id, '2026-03-03 08:05:56.347766+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;

    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%JavaScript%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('47b87cc3-2fb3-42c3-937b-67073cfa60f5', book_record.id, '2026-03-02 17:20:54.974241+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;

    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%CSS%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('47b87cc3-2fb3-42c3-937b-67073cfa60f5', book_record.id, '2026-03-01 16:07:11.638798+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;

    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%Kali%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('47b87cc3-2fb3-42c3-937b-67073cfa60f5', book_record.id, '2026-03-01 16:07:08.709966+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;
END $$;

-- Add other users (Gocha, Ilia, Zaza, Torrike, Nevan, Malkhaz, Marine, Nana, Salome)
-- Using the same pattern for all remaining users

DO $$
DECLARE
    book_record RECORD;
BEGIN
    -- Gocha Sandukhadze (gochasand@gmail.com) - user_id: a932c85a-80a0-4f33-82f1-0ac2dd78f44f
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%C++%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('a932c85a-80a0-4f33-82f1-0ac2dd78f44f', book_record.id, '2026-03-24 06:18:18.486748+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%PHP%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('a932c85a-80a0-4f33-82f1-0ac2dd78f44f', book_record.id, '2026-03-09 19:48:38.960524+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%JavaScript%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('a932c85a-80a0-4f33-82f1-0ac2dd78f44f', book_record.id, '2026-03-03 19:19:39.178175+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%C#%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('a932c85a-80a0-4f33-82f1-0ac2dd78f44f', book_record.id, '2026-03-03 19:19:26.699276+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%CSS%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('a932c85a-80a0-4f33-82f1-0ac2dd78f44f', book_record.id, '2026-03-03 19:19:11.937672+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%HTML%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('a932c85a-80a0-4f33-82f1-0ac2dd78f44f', book_record.id, '2026-03-03 19:18:59.448599+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%Python%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('a932c85a-80a0-4f33-82f1-0ac2dd78f44f', book_record.id, '2026-03-03 19:18:45.046764+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;

    -- Ilia Barnabishvili (iliabarn@gmail.com) - user_id: 8c88427c-655d-4f72-8cbd-8ab7e080099f
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%C++%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('8c88427c-655d-4f72-8cbd-8ab7e080099f', book_record.id, '2026-03-24 06:17:47.281991+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%JavaScript%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('8c88427c-655d-4f72-8cbd-8ab7e080099f', book_record.id, '2026-03-18 18:46:41.376923+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%CSS%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('8c88427c-655d-4f72-8cbd-8ab7e080099f', book_record.id, '2026-03-18 18:46:37.594471+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%HTML%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('8c88427c-655d-4f72-8cbd-8ab7e080099f', book_record.id, '2026-03-18 18:46:33.378693+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%C#%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('8c88427c-655d-4f72-8cbd-8ab7e080099f', book_record.id, '2026-03-18 18:46:20.628086+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;

    -- Zaza Jincharadze (jincharadzezaza78@gmail.com) - user_id: 77f6aadc-2838-40f4-b5f2-9afbebf4815c
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%JavaScript%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('77f6aadc-2838-40f4-b5f2-9afbebf4815c', book_record.id, '2026-03-02 17:23:04.053981+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%Python%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('77f6aadc-2838-40f4-b5f2-9afbebf4815c', book_record.id, '2026-03-02 17:10:04.387808+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%HTML%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('77f6aadc-2838-40f4-b5f2-9afbebf4815c', book_record.id, '2026-03-02 17:09:58.19118+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;

    -- Torrike Kashiashvili (kashiashvili555@gmail.com) - user_id: 7d238f3c-e08a-4148-8bf5-d1cb45ade7d0
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%CSS%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('7d238f3c-e08a-4148-8bf5-d1cb45ade7d0', book_record.id, '2026-03-18 18:37:26.756131+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%Figma%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('7d238f3c-e08a-4148-8bf5-d1cb45ade7d0', book_record.id, '2026-03-18 18:37:22.556836+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%HTML%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('7d238f3c-e08a-4148-8bf5-d1cb45ade7d0', book_record.id, '2026-03-18 18:37:18.565674+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;

    -- Nevan Chitanava (levanichitanava.2022@gmail.com) - user_id: 11033449-40c1-4427-8b9c-18c2983d39b6
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%JavaScript%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('11033449-40c1-4427-8b9c-18c2983d39b6', book_record.id, '2026-03-18 18:14:37.911787+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%Python%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('11033449-40c1-4427-8b9c-18c2983d39b6', book_record.id, '2026-03-18 18:14:15.024994+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%HTML%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('11033449-40c1-4427-8b9c-18c2983d39b6', book_record.id, '2026-03-18 18:14:02.145523+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;

    -- Malkhaz Paksashvili (malkhazpaksashvili@gmail.com) - user_id: 7dd008a3-ffc5-4188-b8de-335b9bf3814c
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%JavaScript%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('7dd008a3-ffc5-4188-b8de-335b9bf3814c', book_record.id, '2026-03-16 21:05:46.7534+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%Python%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('7dd008a3-ffc5-4188-b8de-335b9bf3814c', book_record.id, '2026-03-16 21:05:35.657149+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%HTML%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('7dd008a3-ffc5-4188-b8de-335b9bf3814c', book_record.id, '2026-03-16 21:05:23.686823+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;

    -- Marine Mosulishvili (marina.mosulishvili01@gmail.com) - user_id: 574e1c28-26ac-4814-b5db-8cf9ce02b29d
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%Python%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('574e1c28-26ac-4814-b5db-8cf9ce02b29d', book_record.id, '2026-03-24 06:33:21.877499+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;

    -- Nana Qarchia (nana.qarcxia8282@gmail.com) - user_id: ce74ca99-535b-426f-91f8-906638659b6e
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%CSS%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('ce74ca99-535b-426f-91f8-906638659b6e', book_record.id, '2026-03-02 17:57:22.845522+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%HTML%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('ce74ca99-535b-426f-91f8-906638659b6e', book_record.id, '2026-03-02 17:57:18.865793+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;

    -- Salome Chkhitunidze (salome.chkhitunidze@gmail.com) - user_id: f3dda953-c30d-4926-80af-d4602167f90e
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%C++%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('f3dda953-c30d-4926-80af-d4602167f90e', book_record.id, '2026-03-24 06:18:37.532029+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%PHP%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('f3dda953-c30d-4926-80af-d4602167f90e', book_record.id, '2026-03-09 19:47:46.830771+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%Python%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('f3dda953-c30d-4926-80af-d4602167f90e', book_record.id, '2026-03-02 17:55:25.629875+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%JavaScript%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('f3dda953-c30d-4926-80af-d4602167f90e', book_record.id, '2026-03-02 17:55:19.075324+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%C#%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('f3dda953-c30d-4926-80af-d4602167f90e', book_record.id, '2026-03-02 17:54:55.721491+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%CSS%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('f3dda953-c30d-4926-80af-d4602167f90e', book_record.id, '2026-03-02 17:54:40.440453+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;
    FOR book_record IN SELECT id FROM books WHERE title ILIKE '%HTML%' LIMIT 1 LOOP
        INSERT INTO purchases (user_id, book_id, purchased_at)
        VALUES ('f3dda953-c30d-4926-80af-d4602167f90e', book_record.id, '2026-03-02 17:54:29.183302+00')
        ON CONFLICT (user_id, book_id) DO NOTHING;
    END LOOP;
END $$;

-- Verify the inserts
SELECT 
    p.user_id,
    pr.full_name,
    pr.email,
    b.title as book_title,
    p.purchased_at
FROM purchases p
JOIN books b ON p.book_id = b.id
JOIN profiles pr ON p.user_id = pr.user_id
ORDER BY pr.full_name, p.purchased_at DESC;
