import { Pool } from "pg";

let testPool: Pool | null = null;

export async function setupTestDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined in environment");
  }

  testPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await createTestSchema(testPool);

  return { pool: testPool };
}

export async function teardownTestDatabase(pool: Pool) {
  await cleanTestSchema(pool);
  await pool?.end();
  testPool = null;
}

export async function cleanDatabase(pool: Pool) {
  await pool.query(`
    TRUNCATE TABLE
      test_budget_transaction,
      test_claimrequest,
      test_request,
      test_allocation,
      test_session_occurrence,
      test_teaching_activity,
      test_user_role,
      test_unit_offering,
      test_course_unit,
      test_paycode,
      test_users,
      test_role
    CASCADE;
  `);
}

async function createTestSchema(pool: Pool) {
  await pool.query(`
    -- Role table
    CREATE TABLE IF NOT EXISTS test_role (
      role_id SERIAL PRIMARY KEY,
      role_name TEXT NOT NULL UNIQUE,
      role_description TEXT
    );

    -- Users table
    CREATE TABLE IF NOT EXISTS test_users (
      user_id SERIAL PRIMARY KEY,
      auth_uid UUID UNIQUE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    );

    -- Course unit table
    CREATE TABLE IF NOT EXISTS test_course_unit (
      unit_code TEXT PRIMARY KEY,
      unit_name TEXT NOT NULL,
      unit_description TEXT
    );

    -- Unit offering table
    CREATE TABLE IF NOT EXISTS test_unit_offering (
      offering_id SERIAL PRIMARY KEY,
      course_unit_id TEXT NOT NULL REFERENCES test_course_unit(unit_code),
      session_code TEXT NOT NULL,
      year INTEGER NOT NULL,
      budget NUMERIC NOT NULL,
      anticipated_enrolments INTEGER,
      actual_enrolments INTEGER
    );

    -- User role table
    CREATE TABLE IF NOT EXISTS test_user_role (
      user_id INTEGER NOT NULL REFERENCES test_users(user_id),
      role_id INTEGER NOT NULL REFERENCES test_role(role_id),
      unit_offering_id INTEGER NOT NULL REFERENCES test_unit_offering(offering_id),
      PRIMARY KEY (user_id, role_id, unit_offering_id)
    );

    -- Paycode table
    CREATE TABLE IF NOT EXISTS test_paycode (
      code TEXT PRIMARY KEY,
      paycode_description TEXT,
      amount NUMERIC NOT NULL DEFAULT 0
    );

    -- Teaching activity table
    CREATE TABLE IF NOT EXISTS test_teaching_activity (
      activity_id SERIAL PRIMARY KEY,
      unit_offering_id INTEGER NOT NULL REFERENCES test_unit_offering(offering_id),
      activity_type TEXT NOT NULL,
      capacity INTEGER,
      activity_name TEXT,
      activity_description TEXT,
      created_by_run_id INTEGER
    );

    -- Session occurrence table
    CREATE TABLE IF NOT EXISTS test_session_occurrence (
      occurrence_id SERIAL PRIMARY KEY,
      activity_id INTEGER NOT NULL REFERENCES test_teaching_activity(activity_id),
      is_cancelled BOOLEAN DEFAULT FALSE,
      location TEXT,
      notes TEXT,
      start_at TIME,
      end_at TIME,
      created_by_run_id INTEGER,
      session_date DATE,
      hours INTEGER
    );

    -- Allocation table
    CREATE TABLE IF NOT EXISTS test_allocation (
      allocation_id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES test_users(user_id) ON DELETE CASCADE,
      session_id INTEGER REFERENCES test_session_occurrence(occurrence_id),
      status TEXT,
      paycode_id TEXT NOT NULL REFERENCES test_paycode(code),
      teaching_role TEXT,
      created_by_run_id INTEGER,
      note TEXT,
      mode TEXT NOT NULL DEFAULT 'scheduled',
      activity_id INTEGER REFERENCES test_teaching_activity(activity_id),
      allocated_hours NUMERIC
    );

    -- Request table
    CREATE TABLE IF NOT EXISTS test_request (
      request_id SERIAL PRIMARY KEY,
      requester_id INTEGER NOT NULL REFERENCES test_users(user_id),
      offering_id INTEGER NOT NULL REFERENCES test_unit_offering(offering_id),
      request_type TEXT NOT NULL,
      request_date TIMESTAMP DEFAULT NOW(),
      request_status TEXT DEFAULT 'pending',
      flags TEXT[] DEFAULT '{}',
      route TEXT DEFAULT 'TA→Admin→UC',
      current_stage TEXT DEFAULT 'Admin Review'
    );

    -- Claim request table
    CREATE TABLE IF NOT EXISTS test_claimrequest (
      request_id INTEGER PRIMARY KEY REFERENCES test_request(request_id),
      allocation_id INTEGER REFERENCES test_allocation(allocation_id),
      occurrence_id INTEGER REFERENCES test_session_occurrence(occurrence_id),
      claimed_hours NUMERIC NOT NULL CHECK (claimed_hours > 0),
      claimed_paycode TEXT REFERENCES test_paycode(code),
      comment TEXT
    );

    -- Budget transaction table
    CREATE TABLE IF NOT EXISTS test_budget_transaction (
      transaction_id SERIAL PRIMARY KEY,
      offering_id INTEGER NOT NULL REFERENCES test_unit_offering(offering_id),
      source TEXT NOT NULL,
      reference_id INTEGER,
      delta_amount NUMERIC NOT NULL
    );
  `);
}

async function cleanTestSchema(pool: Pool) {
  await pool.query(`
    DROP TABLE IF EXISTS test_budget_transaction CASCADE;
    DROP TABLE IF EXISTS test_claimrequest CASCADE;
    DROP TABLE IF EXISTS test_request CASCADE;
    DROP TABLE IF EXISTS test_allocation CASCADE;
    DROP TABLE IF EXISTS test_session_occurrence CASCADE;
    DROP TABLE IF EXISTS test_teaching_activity CASCADE;
    DROP TABLE IF EXISTS test_user_role CASCADE;
    DROP TABLE IF EXISTS test_unit_offering CASCADE;
    DROP TABLE IF EXISTS test_course_unit CASCADE;
    DROP TABLE IF EXISTS test_paycode CASCADE;
    DROP TABLE IF EXISTS test_users CASCADE;
    DROP TABLE IF EXISTS test_role CASCADE;
  `);
}

export async function seedTestRoles(pool: Pool) {
  await pool.query(`
    INSERT INTO test_role (role_name, role_description) VALUES
    ('tutor', 'Tutor role'),
    ('ta', 'Teaching Assistant role'),
    ('uc', 'Unit Coordinator role'),
    ('admin', 'Administrator role')
    ON CONFLICT (role_name) DO NOTHING;
  `);
}

export async function seedTestUsers(pool: Pool) {
  const result = await pool.query(`
    INSERT INTO test_users (first_name, last_name, email) VALUES
    ('Test', 'Tutor', 'testtutor@demo.edu'),
    ('Test', 'Admin', 'testadmin@demo.edu'),
    ('Test', 'UC', 'testuc@demo.edu'),
    ('Test', 'TA', 'testta@demo.edu')
    ON CONFLICT (email) DO NOTHING
    RETURNING user_id;
  `);
  return result.rows.map((row) => row.user_id);
}

export async function seedTestCourseUnits(pool: Pool) {
  await pool.query(`
    INSERT INTO test_course_unit (unit_code, unit_name, unit_description) VALUES
    ('SOFT3888', 'Software Engineering Project', 'Software development project unit'),
    ('COMP2123', 'Data Structures and Algorithms', 'Core CS unit on data structures'),
    ('INFO1111', 'Introduction to IT', 'First year introduction to IT')
    ON CONFLICT (unit_code) DO NOTHING;
  `);
}

export async function seedTestUnitOfferings(pool: Pool) {
  const result = await pool.query(`
    INSERT INTO test_unit_offering (course_unit_id, session_code, year, budget, anticipated_enrolments, actual_enrolments) VALUES
    ('SOFT3888', 'S1', 2025, 50000.00, 100, 95),
    ('COMP2123', 'S2', 2025, 75000.00, 200, 190),
    ('INFO1111', 'S1', 2025, 30000.00, 300, 285)
    RETURNING offering_id;
  `);
  return result.rows.map((row) => row.offering_id);
}

export async function seedTestUserRoles(pool: Pool) {
  const users = await pool.query("SELECT user_id, email FROM test_users ORDER BY user_id");
  const roles = await pool.query("SELECT role_id, role_name FROM test_role ORDER BY role_id");
  const offerings = await pool.query(
    "SELECT offering_id FROM test_unit_offering ORDER BY offering_id"
  );

  const tutorId = users.rows.find((u) => u.email === "testtutor@demo.edu")?.user_id;
  const adminId = users.rows.find((u) => u.email === "testadmin@demo.edu")?.user_id;
  const ucId = users.rows.find((u) => u.email === "testuc@demo.edu")?.user_id;
  const taId = users.rows.find((u) => u.email === "testta@demo.edu")?.user_id;

  const tutorRoleId = roles.rows.find((r) => r.role_name === "tutor")?.role_id;
  const adminRoleId = roles.rows.find((r) => r.role_name === "admin")?.role_id;
  const ucRoleId = roles.rows.find((r) => r.role_name === "uc")?.role_id;
  const taRoleId = roles.rows.find((r) => r.role_name === "ta")?.role_id;

  const offering1 = offerings.rows[0]?.offering_id;
  const offering2 = offerings.rows[1]?.offering_id;

  await pool.query(
    `
    INSERT INTO test_user_role (user_id, role_id, unit_offering_id) VALUES
    ($1, $2, $3),
    ($4, $5, $6),
    ($7, $8, $9),
    ($10, $11, $12)
    ON CONFLICT DO NOTHING;
  `,
    [
      tutorId,
      tutorRoleId,
      offering1,
      adminId,
      adminRoleId,
      offering1,
      ucId,
      ucRoleId,
      offering2,
      taId,
      taRoleId,
      offering1,
    ]
  );
}

export async function seedTestPaycodes(pool: Pool) {
  await pool.query(`
    INSERT INTO test_paycode (code, paycode_description, amount) VALUES
    ('TUT01', 'Tutorial Teaching', 75.50),
    ('LAB01', 'Laboratory Teaching', 80.00),
    ('MARK', 'Marking', 60.00),
    ('CONS', 'Consultation', 70.00)
    ON CONFLICT (code) DO NOTHING;
  `);
}

export async function seedTestActivities(pool: Pool) {
  const offerings = await pool.query(
    "SELECT offering_id FROM test_unit_offering ORDER BY offering_id"
  );
  const offering1 = offerings.rows[0]?.offering_id;
  const offering2 = offerings.rows[1]?.offering_id;

  const result = await pool.query(
    `
    INSERT INTO test_teaching_activity (unit_offering_id, activity_type, activity_name, capacity) VALUES
    ($1, 'Tutorial', 'Tutorial 1', 25),
    ($2, 'Laboratory', 'Lab 1', 30),
    ($3, 'Tutorial', 'Tutorial 1', 25)
    RETURNING activity_id;
  `,
    [offering1, offering1, offering2]
  );
  return result.rows.map((row) => row.activity_id);
}

export async function seedTestSessionOccurrences(pool: Pool) {
  const activities = await pool.query(
    "SELECT activity_id FROM test_teaching_activity ORDER BY activity_id"
  );
  const activity1 = activities.rows[0]?.activity_id;
  const activity2 = activities.rows[1]?.activity_id;

  const result = await pool.query(
    `
    INSERT INTO test_session_occurrence (activity_id, session_date, start_at, end_at, location, hours) VALUES
    ($1, '2025-11-01', '09:00:00', '11:00:00', 'Room 123', 2),
    ($2, '2025-11-08', '09:00:00', '11:00:00', 'Room 123', 2),
    ($3, '2025-11-02', '14:00:00', '16:00:00', 'Lab 456', 2)
    RETURNING occurrence_id;
  `,
    [activity1, activity1, activity2]
  );
  return result.rows.map((row) => row.occurrence_id);
}

export async function seedTestAllocations(pool: Pool) {
  const users = await pool.query("SELECT user_id, email FROM test_users ORDER BY user_id");
  const occurrences = await pool.query(
    "SELECT occurrence_id FROM test_session_occurrence ORDER BY occurrence_id"
  );
  const activities = await pool.query(
    "SELECT activity_id FROM test_teaching_activity ORDER BY activity_id"
  );

  const tutorId = users.rows.find((u) => u.email === "testtutor@demo.edu")?.user_id;
  const occurrence1 = occurrences.rows[0]?.occurrence_id;
  const occurrence2 = occurrences.rows[1]?.occurrence_id;
  const activity1 = activities.rows[0]?.activity_id;

  await pool.query(
    `
    INSERT INTO test_allocation (user_id, session_id, activity_id, status, paycode_id, teaching_role, mode, allocated_hours) VALUES
    ($1, $2, $3, 'confirmed', 'TUT01', 'Tutor', 'scheduled', 2.0),
    ($4, $5, $6, 'pending', 'TUT01', 'Tutor', 'scheduled', 2.0),
    ($7, NULL, $8, 'confirmed', 'MARK', 'Tutor', 'unscheduled', 10.0);
  `,
    [tutorId, occurrence1, activity1, tutorId, occurrence2, activity1, tutorId, activity1]
  );
}
