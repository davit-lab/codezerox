import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
import { config } from 'dotenv';
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface Course {
  title: string;
  slug: string;
  description: string;
  short_description: string;
  category: string;
  difficulty: string;
  price_gel: number;
  is_active: boolean;
  sort_order: number;
}

interface Section {
  title: string;
  sort_order: number;
  lectures: Lecture[];
}

interface Lecture {
  title: string;
  description: string;
  assignments?: Assignment[];
}

interface Assignment {
  title: string;
  description: string;
}

interface CourseData {
  course: Course;
  sections: Section[];
}

async function loadCourseData(): Promise<CourseData> {
  const data = readFileSync('./harvard_python_course.json', 'utf-8');
  return JSON.parse(data);
}

async function insertCourse(course: Course): Promise<string> {
  const now = new Date().toISOString();
  
  // Check if course already exists
  const { data: existing } = await supabase
    .from('video_courses')
    .select('id')
    .eq('slug', course.slug)
    .single();
  
  let courseId: string;
  
  if (existing) {
    courseId = existing.id;
    console.log(`Course already exists with ID: ${courseId}`);
    
    // Update existing course
    await supabase
      .from('video_courses')
      .update({
        title: course.title,
        description: course.description,
        short_description: course.short_description,
        category: course.category,
        difficulty: course.difficulty,
        price_gel: course.price_gel,
        is_active: course.is_active,
        sort_order: course.sort_order,
        updated_at: now
      })
      .eq('id', courseId);
  } else {
    courseId = uuidv4();
    
    const { error } = await supabase
      .from('video_courses')
      .insert({
        id: courseId,
        title: course.title,
        slug: course.slug,
        description: course.description,
        short_description: course.short_description,
        category: course.category,
        difficulty: course.difficulty,
        price_gel: course.price_gel,
        is_active: course.is_active,
        sort_order: course.sort_order,
        created_at: now,
        updated_at: now
      });
    
    if (error) {
      throw new Error(`Failed to insert course: ${error.message}`);
    }
  }
  
  return courseId;
}

async function insertSections(courseId: string, sections: Section[]): Promise<Map<string, string>> {
  const sectionIds = new Map<string, string>();
  
  for (const section of sections) {
    const sectionId = uuidv4();
    const now = new Date().toISOString();
    
    const { error } = await supabase
      .from('video_course_sections')
      .insert({
        id: sectionId,
        course_id: courseId,
        title: section.title,
        sort_order: section.sort_order,
        created_at: now
      });
    
    if (error) {
      console.error(`Failed to insert section "${section.title}": ${error.message}`);
    } else {
      sectionIds.set(section.title, sectionId);
    }
  }
  
  return sectionIds;
}

async function insertLecturesAndAssignments(
  courseId: string,
  sectionIds: Map<string, string>,
  sections: Section[]
): Promise<void> {
  let lectureCount = 0;
  let assignmentCount = 0;
  
  for (const section of sections) {
    const sectionId = sectionIds.get(section.title);
    if (!sectionId) {
      console.error(`Section ID not found for: ${section.title}`);
      continue;
    }
    
    for (const lecture of section.lectures) {
      const lectureId = uuidv4();
      const now = new Date().toISOString();
      
      // Insert lecture
      const { error: lectureError } = await supabase
        .from('video_lectures')
        .insert({
          id: lectureId,
          section_id: sectionId,
          course_id: courseId,
          title: lecture.title,
          description: lecture.description,
          video_url: null,
          video_storage_path: null,
          duration_seconds: 0,
          sort_order: lectureCount,
          is_free_preview: false,
          created_at: now
        });
      
      if (lectureError) {
        console.error(`Failed to insert lecture "${lecture.title}": ${lectureError.message}`);
      } else {
        lectureCount++;
        
        // Insert assignments
        if (lecture.assignments) {
          for (const assignment of lecture.assignments) {
            const assignmentId = uuidv4();
            
            const { error: assignmentError } = await supabase
              .from('video_assignments')
              .insert({
                id: assignmentId,
                lecture_id: lectureId,
                course_id: courseId,
                title: assignment.title,
                description: assignment.description,
                sort_order: assignmentCount,
                created_at: now
              });
            
            if (assignmentError) {
              console.error(`Failed to insert assignment "${assignment.title}": ${assignmentError.message}`);
            } else {
              assignmentCount++;
            }
          }
        }
      }
    }
  }
  
  console.log(`Inserted ${lectureCount} lectures and ${assignmentCount} assignments`);
}

async function main() {
  try {
    console.log('Loading course data...');
    const courseData = await loadCourseData();
    
    console.log('Inserting course...');
    const courseId = await insertCourse(courseData.course);
    console.log(`Course ID: ${courseId}`);
    
    console.log('Inserting sections...');
    const sectionIds = await insertSections(courseId, courseData.sections);
    console.log(`Inserted ${sectionIds.size} sections`);
    
    console.log('Inserting lectures and assignments...');
    await insertLecturesAndAssignments(courseId, sectionIds, courseData.sections);
    
    console.log('\n✅ Course successfully added to database!');
    console.log(`Course: ${courseData.course.title}`);
    console.log(`Slug: ${courseData.course.slug}`);
    console.log(`Total sections: ${courseData.sections.length}`);
    
    const totalLectures = courseData.sections.reduce((sum, s) => sum + s.lectures.length, 0);
    const totalAssignments = courseData.sections.reduce(
      (sum, s) => sum + s.lectures.reduce((aSum, l) => aSum + (l.assignments?.length || 0), 0),
      0
    );
    
    console.log(`Total lectures: ${totalLectures}`);
    console.log(`Total assignments: ${totalAssignments}`);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
