import json
import os
import psycopg2
from psycopg2.extras import execute_values
from uuid import uuid4
from datetime import datetime

# Database connection - you'll need to set these environment variables
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'postgres')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')

def load_course_data():
    """Load course data from JSON file"""
    with open('harvard_python_course.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def get_db_connection():
    """Create database connection"""
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )

def insert_course(conn, course_data):
    """Insert course into video_courses table"""
    course_id = str(uuid4())
    now = datetime.now()
    
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO public.video_courses 
            (id, title, slug, description, short_description, cover_url, category, difficulty, price_gel, is_active, sort_order, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (slug) DO UPDATE SET
                title = EXCLUDED.title,
                description = EXCLUDED.description,
                short_description = EXCLUDED.short_description,
                category = EXCLUDED.category,
                difficulty = EXCLUDED.difficulty,
                price_gel = EXCLUDED.price_gel,
                is_active = EXCLUDED.is_active,
                sort_order = EXCLUDED.sort_order,
                updated_at = EXCLUDED.updated_at
            RETURNING id
        """, (
            course_id,
            course_data['title'],
            course_data['slug'],
            course_data['description'],
            course_data['short_description'],
            course_data.get('cover_url'),
            course_data['category'],
            course_data['difficulty'],
            course_data['price_gel'],
            course_data['is_active'],
            course_data['sort_order'],
            now,
            now
        ))
        
        # If course already exists, get its ID
        result = cur.fetchone()
        course_id = result[0] if result else course_id
        
    conn.commit()
    return course_id

def insert_sections(conn, course_id, sections):
    """Insert sections into video_course_sections table"""
    section_ids = {}
    
    for section in sections:
        section_id = str(uuid4())
        now = datetime.now()
        
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO public.video_course_sections 
                (id, course_id, title, sort_order, created_at)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT DO NOTHING
                RETURNING id
            """, (
                section_id,
                course_id,
                section['title'],
                section['sort_order'],
                now
            ))
            
            result = cur.fetchone()
            section_id = result[0] if result else section_id
            
        section_ids[section['title']] = section_id
        
    conn.commit()
    return section_ids

def insert_lectures_and_assignments(conn, course_id, section_ids, sections):
    """Insert lectures and assignments into video_lectures and video_assignments tables"""
    for section in sections:
        section_id = section_ids[section['title']]
        
        for lecture in section['lectures']:
            lecture_id = str(uuid4())
            now = datetime.now()
            
            # Insert lecture
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO public.video_lectures 
                    (id, section_id, course_id, title, description, video_url, video_storage_path, duration_seconds, sort_order, is_free_preview, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT DO NOTHING
                    RETURNING id
                """, (
                    lecture_id,
                    section_id,
                    course_id,
                    lecture['title'],
                    lecture['description'],
                    lecture.get('video_url'),
                    lecture.get('video_storage_path'),
                    lecture.get('duration_seconds', 0),
                    0,  # sort_order - will be updated based on position
                    lecture.get('is_free_preview', False),
                    now
                ))
                
                result = cur.fetchone()
                lecture_id = result[0] if result else lecture_id
            
            # Insert assignments for this lecture
            if 'assignments' in lecture:
                for assignment in lecture['assignments']:
                    assignment_id = str(uuid4())
                    
                    with conn.cursor() as cur:
                        cur.execute("""
                            INSERT INTO public.video_assignments 
                            (id, lecture_id, course_id, title, description, sort_order, created_at)
                            VALUES (%s, %s, %s, %s, %s, %s, %s)
                            ON CONFLICT DO NOTHING
                        """, (
                            assignment_id,
                            lecture_id,
                            course_id,
                            assignment['title'],
                            assignment['description'],
                            0,  # sort_order
                            now
                        ))
    
    conn.commit()

def main():
    """Main function to add course to database"""
    print("Loading course data...")
    course_data = load_course_data()
    
    print("Connecting to database...")
    conn = get_db_connection()
    
    try:
        print("Inserting course...")
        course_id = insert_course(conn, course_data['course'])
        print(f"Course ID: {course_id}")
        
        print("Inserting sections...")
        section_ids = insert_sections(conn, course_id, course_data['sections'])
        print(f"Inserted {len(section_ids)} sections")
        
        print("Inserting lectures and assignments...")
        insert_lectures_and_assignments(conn, course_id, section_ids, course_data['sections'])
        
        print("Course successfully added to database!")
        print(f"Course: {course_data['course']['title']}")
        print(f"Slug: {course_data['course']['slug']}")
        print(f"Total sections: {len(course_data['sections'])}")
        
        total_lectures = sum(len(section['lectures']) for section in course_data['sections'])
        total_assignments = sum(len(lecture.get('assignments', [])) for section in course_data['sections'] for lecture in section['lectures'])
        print(f"Total lectures: {total_lectures}")
        print(f"Total assignments: {total_assignments}")
        
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    main()
