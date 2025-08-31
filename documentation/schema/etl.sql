-- Create staging table
CREATE TEMPORARY TABLE IF NOT EXISTS staging_semester_data (
    unit_code              VARCHAR(20),     
    unit_name              VARCHAR(100),    
    session_code           VARCHAR(20),   
    anticipated_enrolments INT,      
    actual_enrolments      INT,      
    allocation_status      VARCHAR(50),  
    activity_type          VARCHAR(50),   
    activity_description   TEXT,      
    activity_name          VARCHAR(100),   
    activity_date          DATE,          
    activity_start         TIME,        
    activity_end           TIME,         
    paycode                VARCHAR(20),   
    teaching_role          VARCHAR(50),   
    staff_id               VARCHAR(50),  
    staff_name             VARCHAR(100),  
    faculty                VARCHAR(100),  
    school                 VARCHAR(100), 
    department             VARCHAR(100),
    units_hrs              DECIMAL(5,2) 
);

-- Cleanse data
UPDATE staging_semester_data 
SET anticipated_enrolments = NULL 
WHERE anticipated_enrolments = 0 OR anticipated_enrolments IS NULL;

UPDATE staging_semester_data 
SET actual_enrolments = NULL 
WHERE actual_enrolments = 0 OR actual_enrolments IS NULL;

-- Validate required fields
DELETE FROM staging_semester_data 
WHERE unit_code IS NULL OR unit_code = ''
   OR session_code IS NULL OR session_code = ''
   OR activity_date IS NULL
   OR staff_id IS NULL OR staff_id = '';



-- POPULATE STABLE REFERENCE TABLES (One-time seeding)



-- Insert/Update course units
INSERT INTO course_unit (unit_code, unit_name, unit_description, faculty, school, department)
SELECT DISTINCT
    unit_code,
    unit_name,
    NULL,
    faculty,
    school,
    department
FROM staging_semester_data s
WHERE unit_code IS NOT NULL 
  AND unit_code != ''
ON CONFLICT (unit_code) 
DO UPDATE SET
    unit_name = EXCLUDED.unit_name,
    faculty = EXCLUDED.faculty,
    school = EXCLUDED.school,
    department = EXCLUDED.department;

-- Insert/Update paycodes
INSERT INTO paycode (code, paycode_description, activity_type)
SELECT DISTINCT
    paycode,
    COALESCE(activity_description, 'No description'),
    activity_type
FROM staging_semester_data s
WHERE paycode IS NOT NULL 
  AND paycode != ''
ON CONFLICT (code) 
DO UPDATE SET
    paycode_description = EXCLUDED.paycode_description,
    activity_type = EXCLUDED.activity_type;

-- Insert/Update roles
INSERT INTO role (role_name, role_description)
VALUES 
    ('Tutor', 'Tutorial leader'),
    ('Lecturer', 'Primary lecturer'),
    ('Demonstrator', 'Lab demonstrator'),
    ('Marker', 'Assignment marker')
ON CONFLICT (role_name) DO NOTHING;



-- POPULATE SEMESTER-SPECIFIC TABLES



-- Insert unit offerings for the specific semester
INSERT INTO unit_offering (course_unit_id, session_code, year, semester, anticipated_enrolments, actual_enrolments, budget)
SELECT DISTINCT
    cu.course_unit_id,
    s.session_code,
    EXTRACT(YEAR FROM s.activity_date) AS year,
    CASE 
        WHEN s.session_code LIKE 'S1%' THEN 'Semester 1'
        WHEN s.session_code LIKE 'S2%' THEN 'Semester 2'
        WHEN s.session_code LIKE 'S3%' THEN 'Summer'
        ELSE 'Other'
    END AS semester,
    s.anticipated_enrolments,
    s.actual_enrolments,
    NULL::DECIMAL(12,2) 
FROM staging_semester_data s
JOIN course_unit cu ON cu.unit_code = s.unit_code
WHERE s.session_code IS NOT NULL 
  AND s.session_code != ''
ON CONFLICT (course_unit_id, session_code, year) 
DO UPDATE SET
    anticipated_enrolments = EXCLUDED.anticipated_enrolments,
    actual_enrolments = EXCLUDED.actual_enrolments;

-- Insert users for the semester 
INSERT INTO users (first_name, last_name, email, password_hash, status, staff_id)
SELECT DISTINCT
    split_part(staff_name, ' ', 1) AS first_name,
    COALESCE(split_part(staff_name, ' ', 2), '') AS last_name,
    LOWER(staff_id || '@example.edu') AS email,
    md5(staff_id || 'default') AS password_hash,
    'active',
    staff_id
FROM staging_semester_data s
WHERE staff_id IS NOT NULL 
  AND staff_name IS NOT NULL 
  AND staff_name != ''
ON CONFLICT (staff_id) 
DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email;

-- Insert teaching activities for the semester
INSERT INTO teaching_activity (
    unit_offering_id, paycode_id, activity_type, activity_description,
    day_of_week, start_time, end_time, location, capacity, units_hours
)
SELECT DISTINCT
    uo.offering_id,
    pc.paycode_id,
    s.activity_type,
    s.activity_description,
    TO_CHAR(s.activity_date, 'Day') AS day_of_week,
    s.activity_start,
    s.activity_end,
    s.activity_name,
    s.actual_enrolments,
    s.units_hrs
FROM staging_semester_data s
JOIN unit_offering uo ON uo.course_unit_id = (
    SELECT course_unit_id FROM course_unit WHERE unit_code = s.unit_code
) AND uo.session_code = s.session_code
JOIN paycode pc ON pc.code = s.paycode
WHERE s.activity_type IS NOT NULL 
  AND s.activity_date IS NOT NULL
  AND s.activity_start IS NOT NULL
  AND s.activity_end IS NOT NULL
ON CONFLICT (unit_offering_id, start_time, end_time, activity_type) 
DO UPDATE SET
    paycode_id = EXCLUDED.paycode_id,
    activity_description = EXCLUDED.activity_description,
    location = EXCLUDED.location,
    capacity = EXCLUDED.capacity,
    units_hours = EXCLUDED.units_hours;

-- Insert session occurrences for the semester
INSERT INTO session_occurrence (activity_id, start_at, end_at, is_cancelled, location_override)
SELECT DISTINCT
    ta.activity_id,
    (s.activity_date + s.activity_start)::TIMESTAMP AS start_at,
    (s.activity_date + s.activity_end)::TIMESTAMP AS end_at,
    FALSE AS is_cancelled,
    s.activity_name AS location_override
FROM staging_semester_data s
JOIN teaching_activity ta ON ta.unit_offering_id = (
    SELECT offering_id FROM unit_offering uo 
    JOIN course_unit cu ON cu.course_unit_id = uo.course_unit_id 
    WHERE cu.unit_code = s.unit_code AND uo.session_code = s.session_code
) AND ta.start_time = s.activity_start
  AND ta.end_time = s.activity_end
WHERE s.activity_date IS NOT NULL
  AND s.activity_start IS NOT NULL
  AND s.activity_end IS NOT NULL
ON CONFLICT DO NOTHING;

-- Insert allocations for the semester
INSERT INTO allocation (
    user_id, activity_id, allocation_start_date, allocation_end_date, 
    teaching_role, allocation_status
)
SELECT DISTINCT
    u.user_id,
    ta.activity_id,
    s.activity_date AS allocation_start_date,
    NULL::TIMESTAMP AS allocation_end_date,
    s.teaching_role,
    s.allocation_status
FROM staging_semester_data s
JOIN users u ON u.staff_id = s.staff_id
JOIN teaching_activity ta ON ta.unit_offering_id = (
    SELECT offering_id FROM unit_offering uo 
    JOIN course_unit cu ON cu.course_unit_id = uo.course_unit_id 
    WHERE cu.unit_code = s.unit_code AND uo.session_code = s.session_code
) AND ta.start_time = s.activity_start
  AND ta.end_time = s.activity_end
WHERE s.staff_id IS NOT NULL
  AND s.activity_date IS NOT NULL
ON CONFLICT (user_id, activity_id) 
DO UPDATE SET
    teaching_role = EXCLUDED.teaching_role,
    allocation_status = EXCLUDED.allocation_status;

-- Create user-role-offering mappings for the semester
INSERT INTO user_role (user_id, role_id, unit_offering_id)
SELECT DISTINCT
    u.user_id,
    COALESCE(r.role_id, (SELECT role_id FROM role WHERE role_name = 'Tutor' LIMIT 1)) AS role_id,
    uo.offering_id
FROM staging_semester_data s
JOIN users u ON u.staff_id = s.staff_id
JOIN unit_offering uo ON uo.course_unit_id = (
    SELECT course_unit_id FROM course_unit WHERE unit_code = s.unit_code
) AND uo.session_code = s.session_code
LEFT JOIN role r ON r.role_name = s.teaching_role
WHERE s.staff_id IS NOT NULL
ON CONFLICT DO NOTHING;



-- DATA VALIDATION AND CLEANUP



-- Validation queries to check data integrity
SELECT 'Users without allocations' as issue, COUNT(*) as count
FROM users u 
LEFT JOIN allocation a ON u.user_id = a.user_id 
WHERE a.user_id IS NULL AND u.staff_id IS NOT NULL;

SELECT 'Activities without allocations' as issue, COUNT(*) as count
FROM teaching_activity ta 
LEFT JOIN allocation a ON ta.activity_id = a.activity_id 
WHERE a.activity_id IS NULL;

SELECT 'Offerings without activities' as issue, COUNT(*) as count
FROM unit_offering uo 
LEFT JOIN teaching_activity ta ON uo.offering_id = ta.unit_offering_id 
WHERE ta.unit_offering_id IS NULL;

-- Clean up staging table
DROP TABLE IF EXISTS staging_semester_data;

