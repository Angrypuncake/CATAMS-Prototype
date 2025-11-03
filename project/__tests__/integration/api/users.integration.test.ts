import { Pool } from "pg";
import {
  setupTestDatabase,
  teardownTestDatabase,
  seedTestRoles,
  seedTestUsers,
  seedTestCourseUnits,
  seedTestUnitOfferings,
  seedTestUserRoles,
} from "../setup/test-db";

describe("User and Role Integration Tests", () => {
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
        test_user_role,
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
    await seedTestUserRoles(pool);
  });

  describe("User CRUD Operations", () => {
    it("should create and retrieve user by email", async () => {
      const result = await pool.query("SELECT * FROM test_users WHERE email = $1", [
        "testtutor@demo.edu",
      ]);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].first_name).toBe("Test");
      expect(result.rows[0].last_name).toBe("Tutor");
      expect(result.rows[0].email).toBe("testtutor@demo.edu");
    });

    it("should retrieve all users", async () => {
      const result = await pool.query("SELECT COUNT(*) FROM test_users");

      expect(result.rows[0].count).toBe("4");
    });

    it("should enforce unique email constraint", async () => {
      await expect(
        pool.query(`
          INSERT INTO test_users (first_name, last_name, email) VALUES
          ('Duplicate', 'User', 'testtutor@demo.edu')
        `)
      ).rejects.toThrow();
    });
  });

  describe("Role Management", () => {
    it("should retrieve all roles", async () => {
      const result = await pool.query("SELECT * FROM test_role ORDER BY role_name");

      expect(result.rows).toHaveLength(4);
      expect(result.rows.map((r) => r.role_name)).toEqual(["admin", "ta", "tutor", "uc"]);
    });

    it("should enforce unique role name constraint", async () => {
      await expect(
        pool.query(`
          INSERT INTO test_role (role_name, role_description) VALUES
          ('tutor', 'Duplicate tutor role')
        `)
      ).rejects.toThrow();
    });
  });

  describe("User Role Assignment", () => {
    it("should assign user to role for specific offering", async () => {
      const user = await pool.query("SELECT user_id FROM test_users WHERE email = $1", [
        "testtutor@demo.edu",
      ]);
      const userId = user.rows[0].user_id;

      const result = await pool.query(
        `
        SELECT r.role_name, cu.unit_code, uo.session_code, uo.year
        FROM test_user_role ur
        JOIN test_role r ON ur.role_id = r.role_id
        JOIN test_unit_offering uo ON ur.unit_offering_id = uo.offering_id
        JOIN test_course_unit cu ON uo.course_unit_id = cu.unit_code
        WHERE ur.user_id = $1
      `,
        [userId]
      );

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].role_name).toBe("tutor");
      expect(result.rows[0].unit_code).toBe("SOFT3888");
    });

    it("should retrieve user roles with unit context", async () => {
      const user = await pool.query("SELECT user_id FROM test_users WHERE email = $1", [
        "testuc@demo.edu",
      ]);
      const userId = user.rows[0].user_id;

      const result = await pool.query(
        `
        SELECT r.role_name
        FROM test_user_role ur
        JOIN test_role r ON ur.role_id = r.role_id
        WHERE ur.user_id = $1
      `,
        [userId]
      );

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].role_name).toBe("uc");
    });

    it("should prevent duplicate role assignments", async () => {
      const user = await pool.query("SELECT user_id FROM test_users WHERE email = $1", [
        "testtutor@demo.edu",
      ]);
      const role = await pool.query("SELECT role_id FROM test_role WHERE role_name = $1", [
        "tutor",
      ]);
      const offering = await pool.query("SELECT offering_id FROM test_unit_offering LIMIT 1");

      await expect(
        pool.query(
          `
          INSERT INTO test_user_role (user_id, role_id, unit_offering_id) VALUES
          ($1, $2, $3)
        `,
          [user.rows[0].user_id, role.rows[0].role_id, offering.rows[0].offering_id]
        )
      ).rejects.toThrow();
    });
  });

  describe("User Search and Filtering", () => {
    it("should search users by name", async () => {
      const result = await pool.query(
        `
        SELECT * FROM test_users
        WHERE first_name ILIKE $1 OR last_name ILIKE $1
      `,
        ["%Admin%"]
      );

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].email).toBe("testadmin@demo.edu");
    });

    it("should filter users by role", async () => {
      const result = await pool.query(
        `
        SELECT DISTINCT u.*
        FROM test_users u
        JOIN test_user_role ur ON u.user_id = ur.user_id
        JOIN test_role r ON ur.role_id = r.role_id
        WHERE r.role_name = $1
      `,
        ["tutor"]
      );

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].email).toBe("testtutor@demo.edu");
    });
  });
});
