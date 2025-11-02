import { Pool } from "pg";
import {
  setupTestDatabase,
  teardownTestDatabase,
  seedTestRoles,
  seedTestUsers,
  seedTestCourseUnits,
  seedTestUnitOfferings,
  seedTestUserRoles,
  seedTestPaycodes,
  seedTestActivities,
  seedTestSessionOccurrences,
  seedTestAllocations,
} from "../setup/test-db";

describe("Allocation Integration Tests (trimmed)", () => {
  let pool: Pool;

  const q1 = (text: string, params?: unknown[]) => pool.query(text, params);
  const getUserId = async (email: string) =>
    (await q1("SELECT user_id FROM test_users WHERE email=$1", [email])).rows[0].user_id;
  const getAny = async (sql: string) => (await q1(sql)).rows[0];
  const getAnyAllocationId = async () =>
    (await q1("SELECT allocation_id FROM test_allocation LIMIT 1")).rows[0].allocation_id;

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
        test_user_role,
        test_unit_offering,
        test_course_unit,
        test_paycode,
        test_users,
        test_role
      CASCADE;
    `);
    await seedTestRoles(pool);
    await seedTestUsers(pool);
    await seedTestCourseUnits(pool);
    await seedTestUnitOfferings(pool);
    await seedTestUserRoles(pool);
    await seedTestPaycodes(pool);
    await seedTestActivities(pool);
    await seedTestSessionOccurrences(pool);
    await seedTestAllocations(pool);
  });

  it.each([
    {
      label: "scheduled",
      buildValues: async () => {
        const userId = await getUserId("testtutor@demo.edu");
        const occ = await getAny("SELECT occurrence_id FROM test_session_occurrence LIMIT 1");
        const act = await getAny("SELECT activity_id FROM test_teaching_activity LIMIT 1");
        return [
          userId,
          occ.occurrence_id,
          act.activity_id,
          "pending",
          "LAB01",
          "Lab Assistant",
          "scheduled",
          2.0,
        ] as const;
      },
      expectRow: (row: { status: string; mode: string; session_id: number | null }) => {
        expect(row.status).toBe("pending");
        expect(row.mode).toBe("scheduled");
        expect(row.session_id).toBeTruthy();
      },
    },
    {
      label: "unscheduled",
      buildValues: async () => {
        const userId = await getUserId("testtutor@demo.edu");
        const act = await getAny("SELECT activity_id FROM test_teaching_activity LIMIT 1");
        return [
          userId,
          null,
          act.activity_id,
          "confirmed",
          "MARK",
          "Marker",
          "unscheduled",
          15.0,
        ] as const;
      },
      expectRow: (row: { mode: string; session_id: number | null }) => {
        expect(row.mode).toBe("unscheduled");
        expect(row.session_id).toBeNull();
      },
    },
  ])("creates %s allocation", async (_case) => {
    const [user_id, session_id, activity_id, status, paycode_id, teaching_role, mode, hours] =
      await _case.buildValues();

    const res = await q1(
      `
      INSERT INTO test_allocation (user_id, session_id, activity_id, status, paycode_id, teaching_role, mode, allocated_hours)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING allocation_id, status, mode, session_id
    `,
      [user_id, session_id, activity_id, status, paycode_id, teaching_role, mode, hours]
    );

    expect(res.rows).toHaveLength(1);
    _case.expectRow(res.rows[0]);
  });

  it("retrieves allocation with session, activity, unit, and paycode details", async () => {
    const res = await q1(`
      SELECT
        a.allocation_id,
        a.status,
        a.mode,
        a.allocated_hours,
        s.session_date,
        s.start_at,
        s.end_at,
        s.location,
        ta.activity_type,
        ta.activity_name,
        cu.unit_code,
        cu.unit_name,
        p.code AS paycode,
        p.paycode_description,
        p.amount
      FROM test_allocation a
      LEFT JOIN test_session_occurrence s ON a.session_id = s.occurrence_id
      JOIN test_teaching_activity ta ON a.activity_id = ta.activity_id
      JOIN test_unit_offering uo ON ta.unit_offering_id = uo.offering_id
      JOIN test_course_unit cu ON uo.course_unit_id = cu.unit_code
      JOIN test_paycode p ON a.paycode_id = p.code
    `);

    expect(res.rows.length).toBeGreaterThan(0);
    const r = res.rows[0];
    expect(r.activity_type).toBeDefined();
    expect(r.unit_code).toBeDefined();
    expect(r.paycode).toBeDefined();
    expect(Object.prototype.hasOwnProperty.call(r, "session_date")).toBe(true);
  });

  it("retrieves allocations for a tutor", async () => {
    const userId = await getUserId("testtutor@demo.edu");
    const res = await q1(`SELECT * FROM test_allocation WHERE user_id=$1`, [userId]);
    expect(res.rows.length).toBeGreaterThan(0);
    expect(res.rows.every((r) => r.user_id === userId)).toBe(true);
  });

  it.each([
    {
      label: "by status",
      sql: `SELECT * FROM test_allocation WHERE status = $1`,
      params: ["confirmed"],
      ok: (row: { status: string }) => row.status === "confirmed",
    },
    {
      label: "by mode",
      sql: `SELECT * FROM test_allocation WHERE mode = $1`,
      params: ["unscheduled"],
      ok: (row: { mode: string }) => row.mode === "unscheduled",
    },
    {
      label: "by unit code",
      sql: `
        SELECT a.*, cu.unit_code
        FROM test_allocation a
        JOIN test_teaching_activity ta ON a.activity_id = ta.activity_id
        JOIN test_unit_offering uo ON ta.unit_offering_id = uo.offering_id
        JOIN test_course_unit cu ON uo.course_unit_id = cu.unit_code
        WHERE cu.unit_code = $1
      `,
      params: ["SOFT3888"],
      ok: (row: { unit_code: string }) => row.unit_code === "SOFT3888",
    },
  ])("filters allocations $label", async ({ sql, params, ok }) => {
    const res = await q1(sql, params);
    expect(res.rows.length).toBeGreaterThan(0);
    expect(res.rows.every(ok)).toBe(true);
  });

  it("computes total cost (hours * paycode amount)", async () => {
    const res = await q1(`
      SELECT a.allocation_id, a.allocated_hours, p.amount,
             (a.allocated_hours * p.amount) AS total_cost
      FROM test_allocation a
      JOIN test_paycode p ON a.paycode_id = p.code
      WHERE a.allocated_hours IS NOT NULL
    `);
    expect(res.rows.length).toBeGreaterThan(0);
    expect(Number(res.rows[0].total_cost)).toBeGreaterThan(0);
  });

  it.each([
    {
      label: "status -> confirmed",
      run: async (id: number) =>
        q1(`UPDATE test_allocation SET status='confirmed' WHERE allocation_id=$1`, [id]),
      read: async (id: number) =>
        (await q1(`SELECT status FROM test_allocation WHERE allocation_id=$1`, [id])).rows[0]
          .status,
      expectVal: "confirmed",
    },
    {
      label: "status -> cancelled",
      run: async (id: number) =>
        q1(`UPDATE test_allocation SET status='cancelled' WHERE allocation_id=$1`, [id]),
      read: async (id: number) =>
        (await q1(`SELECT status FROM test_allocation WHERE allocation_id=$1`, [id])).rows[0]
          .status,
      expectVal: "cancelled",
    },
    {
      label: "paycode_id -> CONS",
      run: async (id: number) =>
        q1(`UPDATE test_allocation SET paycode_id='CONS' WHERE allocation_id=$1`, [id]),
      read: async (id: number) =>
        (await q1(`SELECT paycode_id FROM test_allocation WHERE allocation_id=$1`, [id])).rows[0]
          .paycode_id,
      expectVal: "CONS",
    },
    {
      label: "note -> Updated note for testing",
      run: async (id: number) =>
        q1(`UPDATE test_allocation SET note='Updated note for testing' WHERE allocation_id=$1`, [
          id,
        ]),
      read: async (id: number) =>
        (await q1(`SELECT note FROM test_allocation WHERE allocation_id=$1`, [id])).rows[0].note,
      expectVal: "Updated note for testing",
    },
    {
      label: "user_id -> testta@demo.edu",
      run: async (id: number) => {
        const newTutorId = await getUserId("testta@demo.edu");
        return q1(`UPDATE test_allocation SET user_id=$1 WHERE allocation_id=$2`, [newTutorId, id]);
      },
      read: async (id: number) =>
        (await q1(`SELECT user_id FROM test_allocation WHERE allocation_id=$1`, [id])).rows[0]
          .user_id,
      expectDynamic: async () => await getUserId("testta@demo.edu"),
    },
  ])("updates allocation: $label", async (caseDef) => {
    const id = await getAnyAllocationId();
    await caseDef.run(id);
    const got = await caseDef.read(id);
    if ("expectVal" in caseDef) {
      expect(got).toBe(caseDef.expectVal);
    } else if ("expectDynamic" in caseDef) {
      expect(got).toBe(await caseDef.expectDynamic());
    }
  });
});
