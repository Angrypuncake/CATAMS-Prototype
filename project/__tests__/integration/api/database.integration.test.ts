import { Pool } from "pg";
import {
  setupTestDatabase,
  teardownTestDatabase,
  seedTestRoles,
  seedTestUsers,
  seedTestCourseUnits,
  seedTestUnitOfferings,
  seedTestPaycodes,
  seedTestActivities,
  seedTestSessionOccurrences,
  seedTestAllocations,
} from "../setup/test-db";

describe("Database Connection Integration Test", () => {
  let pool: Pool;

  beforeAll(async () => {
    const setup = await setupTestDatabase();
    pool = setup.pool;
  }, 60000);

  afterAll(async () => {
    await teardownTestDatabase(pool);
  });

  beforeEach(async () => {
    await pool.query(`
      TRUNCATE TABLE
        test_allocation,
        test_session_occurrence,
        test_teaching_activity,
        test_paycode,
        test_unit_offering,
        test_course_unit,
        test_users,
        test_role
      CASCADE;
    `);
    await seedTestRoles(pool);
    await seedTestUsers(pool);
    await seedTestCourseUnits(pool);
    await seedTestUnitOfferings(pool);
    await seedTestPaycodes(pool);
    await seedTestActivities(pool);
    await seedTestSessionOccurrences(pool);
    await seedTestAllocations(pool);
  });

  describe("Database Connection", () => {
    it("should connect to database successfully", async () => {
      const result = await pool.query("SELECT NOW()");
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].now).toBeDefined();
    });

    it("should create and query test tables", async () => {
      const result = await pool.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name LIKE 'test_%'
        ORDER BY table_name
      `);

      expect(result.rows.length).toBeGreaterThan(0);
      const tableNames = result.rows.map((r) => r.table_name);
      expect(tableNames).toContain("test_users");
      expect(tableNames).toContain("test_allocation");
      expect(tableNames).toContain("test_role");
    });
  });

  describe("Basic CRUD Operations", () => {
    it("should insert and retrieve data", async () => {
      const result = await pool.query("SELECT * FROM test_users WHERE email = $1", [
        "testtutor@demo.edu",
      ]);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].email).toBe("testtutor@demo.edu");
      expect(result.rows[0].first_name).toBe("Test");
    });

    it("should count total users", async () => {
      const result = await pool.query("SELECT COUNT(*) FROM test_users");

      expect(result.rows[0].count).toBe("4");
    });

    it("should handle transactions", async () => {
      await pool.query("BEGIN");

      await pool.query(`
        INSERT INTO test_users (first_name, last_name, email)
        VALUES ('Transaction', 'Test', 'transaction@test.edu')
      `);

      await pool.query("ROLLBACK");

      const result = await pool.query("SELECT * FROM test_users WHERE email = $1", [
        "transaction@test.edu",
      ]);

      expect(result.rows).toHaveLength(0);
    });
  });

  describe("Foreign Key Constraints", () => {
    it("should enforce foreign key constraint on allocation", async () => {
      await expect(
        pool.query(`
          INSERT INTO test_allocation (user_id, paycode_id, status, mode)
          VALUES (99999, 'TUT01', 'pending', 'scheduled')
        `)
      ).rejects.toThrow();
    });

    it("should cascade delete when parent is deleted", async () => {
      const user = await pool.query(`
        INSERT INTO test_users (first_name, last_name, email)
        VALUES ('Delete', 'Test', 'delete@test.edu')
        RETURNING user_id
      `);

      const activity = await pool.query("SELECT activity_id FROM test_teaching_activity LIMIT 1");

      await pool.query(
        `
        INSERT INTO test_allocation (user_id, activity_id, paycode_id, status, mode, allocated_hours)
        VALUES ($1, $2, 'TUT01', 'pending', 'unscheduled', 5.0)
      `,
        [user.rows[0].user_id, activity.rows[0].activity_id]
      );

      await pool.query("DELETE FROM test_users WHERE user_id = $1", [user.rows[0].user_id]);

      const allocations = await pool.query("SELECT * FROM test_allocation WHERE user_id = $1", [
        user.rows[0].user_id,
      ]);

      expect(allocations.rows).toHaveLength(0);
    });
  });
});
