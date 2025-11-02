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

describe("Budget and Request Integration Tests (trimmed)", () => {
  let pool: Pool;

  const q1 = (text: string, params?: unknown[]) => pool.query(text, params);
  const getUserId = async (email: string) =>
    (await q1("SELECT user_id FROM test_users WHERE email=$1", [email])).rows[0].user_id;
  const getOffering = async (unit = "SOFT3888") =>
    (
      await q1(
        "SELECT offering_id, budget, anticipated_enrolments, actual_enrolments FROM test_unit_offering WHERE course_unit_id=$1",
        [unit]
      )
    ).rows[0];
  const getOfferingId = async (unit = "SOFT3888") => (await getOffering(unit)).offering_id;
  const getAnyAllocationId = async () =>
    (await q1("SELECT allocation_id FROM test_allocation LIMIT 1")).rows[0].allocation_id;
  const insertRequest = async (
    requesterId: number,
    offeringId: number,
    type: string,
    status: string
  ) =>
    (
      await q1(
        "INSERT INTO test_request (requester_id, offering_id, request_type, request_status) VALUES ($1,$2,$3,$4) RETURNING request_id",
        [requesterId, offeringId, type, status]
      )
    ).rows[0].request_id;

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

  describe("Unit Offering Budget Operations", () => {
    it("retrieves unit offering with budget", async () => {
      const row = await getOffering("SOFT3888");
      expect(row).toBeDefined();
      expect(parseFloat(row.budget)).toBe(50000.0);
      expect(row.anticipated_enrolments).toBe(100);
    });

    it("calculates total allocated and variance", async () => {
      const offering = await getOffering("SOFT3888");
      const res = await q1(
        `
        SELECT
          COALESCE(SUM(a.allocated_hours * p.amount), 0) AS total_allocated,
          $2::numeric - COALESCE(SUM(a.allocated_hours * p.amount), 0) AS variance
        FROM test_teaching_activity ta
        LEFT JOIN test_allocation a ON ta.activity_id = a.activity_id
        LEFT JOIN test_paycode p ON a.paycode_id = p.code
        WHERE ta.unit_offering_id = $1
        `,
        [offering.offering_id, offering.budget]
      );
      const totalAllocated = parseFloat(res.rows[0].total_allocated);
      const variance = parseFloat(res.rows[0].variance);
      expect(totalAllocated).toBeGreaterThan(0);
      expect(variance).toBeLessThanOrEqual(parseFloat(offering.budget));
      expect(variance).toBeGreaterThan(0);
    });
  });

  describe("Budget Transaction Operations", () => {
    it("creates budget transaction for allocation", async () => {
      const offeringId = await getOfferingId();
      const result = await q1(
        `
        INSERT INTO test_budget_transaction (offering_id, source, reference_id, delta_amount)
        VALUES ($1,'allocation',1,-150.00)
        RETURNING transaction_id, source, delta_amount
        `,
        [offeringId]
      );
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].source).toBe("allocation");
      expect(parseFloat(result.rows[0].delta_amount)).toBe(-150.0);
    });

    it("accumulates budget transactions for offering", async () => {
      const offeringId = await getOfferingId();
      await q1(
        `
        INSERT INTO test_budget_transaction (offering_id, source, reference_id, delta_amount) VALUES
        ($1,'allocation',1,-100.00),
        ($1,'claim',1,-50.00),
        ($1,'adjustment',NULL,200.00)
        `,
        [offeringId]
      );
      const sum = await q1(
        "SELECT SUM(delta_amount) AS total_delta FROM test_budget_transaction WHERE offering_id=$1",
        [offeringId]
      );
      expect(parseFloat(sum.rows[0].total_delta)).toBe(50.0);
    });
  });

  describe("Request Operations", () => {
    it("creates a new request", async () => {
      const requesterId = await getUserId("testtutor@demo.edu");
      const offeringId = await getOfferingId();
      const res = await q1(
        `
        INSERT INTO test_request (requester_id, offering_id, request_type, request_status)
        VALUES ($1,$2,'claim','pending')
        RETURNING request_id, request_type, request_status
        `,
        [requesterId, offeringId]
      );
      expect(res.rows).toHaveLength(1);
      expect(res.rows[0].request_type).toBe("claim");
      expect(res.rows[0].request_status).toBe("pending");
    });

    it("retrieves all requests for a user", async () => {
      const requesterId = await getUserId("testtutor@demo.edu");
      const offeringId = await getOfferingId();
      await q1(
        `
        INSERT INTO test_request (requester_id, offering_id, request_type, request_status) VALUES
        ($1,$2,'claim','pending'),
        ($1,$2,'correction','approved')
        `,
        [requesterId, offeringId]
      );
      const res = await q1("SELECT * FROM test_request WHERE requester_id=$1", [requesterId]);
      expect(res.rows.length).toBeGreaterThanOrEqual(2);
    });

    it("updates request status", async () => {
      const requesterId = (await q1("SELECT user_id FROM test_users LIMIT 1")).rows[0].user_id;
      const offeringId = await getOfferingId();
      const requestId = await insertRequest(requesterId, offeringId, "query", "pending");
      await q1("UPDATE test_request SET request_status='approved' WHERE request_id=$1", [
        requestId,
      ]);
      const res = await q1("SELECT request_status FROM test_request WHERE request_id=$1", [
        requestId,
      ]);
      expect(res.rows[0].request_status).toBe("approved");
    });

    it("filters requests by status", async () => {
      const requesterId = (await q1("SELECT user_id FROM test_users LIMIT 1")).rows[0].user_id;
      const offeringId = await getOfferingId();
      await q1(
        `
        INSERT INTO test_request (requester_id, offering_id, request_type, request_status) VALUES
        ($1,$2,'claim','pending'),
        ($1,$2,'claim','approved'),
        ($1,$2,'claim','pending')
        `,
        [requesterId, offeringId]
      );
      const res = await q1("SELECT COUNT(*) FROM test_request WHERE request_status='pending'");
      expect(parseInt(res.rows[0].count)).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Claim Request Operations", () => {
    it("creates claim request linked to allocation", async () => {
      const requesterId = await getUserId("testtutor@demo.edu");
      const offeringId = await getOfferingId();
      const allocationId = await getAnyAllocationId();
      const requestId = await insertRequest(requesterId, offeringId, "claim", "pending");
      const res = await q1(
        `
        INSERT INTO test_claimrequest (request_id, allocation_id, claimed_hours, claimed_paycode, comment)
        VALUES ($1,$2,3.5,'TUT01','Claim for additional hours')
        RETURNING request_id, claimed_hours, claimed_paycode
        `,
        [requestId, allocationId]
      );
      expect(res.rows).toHaveLength(1);
      expect(parseFloat(res.rows[0].claimed_hours)).toBe(3.5);
      expect(res.rows[0].claimed_paycode).toBe("TUT01");
    });

    it("retrieves claim request with request details", async () => {
      const requesterId = await getUserId("testtutor@demo.edu");
      const offeringId = await getOfferingId();
      const allocationId = await getAnyAllocationId();
      const requestId = await insertRequest(requesterId, offeringId, "claim", "pending");
      await q1(
        "INSERT INTO test_claimrequest (request_id, allocation_id, claimed_hours, claimed_paycode) VALUES ($1,$2,2.0,'MARK')",
        [requestId, allocationId]
      );
      const res = await q1(
        `
        SELECT
          r.request_id,
          r.request_status,
          cr.claimed_hours,
          cr.claimed_paycode,
          p.amount,
          (cr.claimed_hours * p.amount) AS claimed_amount
        FROM test_request r
        JOIN test_claimrequest cr ON r.request_id = cr.request_id
        JOIN test_paycode p ON cr.claimed_paycode = p.code
        WHERE r.request_id=$1
        `,
        [requestId]
      );
      expect(res.rows).toHaveLength(1);
      expect(parseFloat(res.rows[0].claimed_amount)).toBeGreaterThan(0);
    });

    it("enforces positive claimed hours", async () => {
      const requesterId = (await q1("SELECT user_id FROM test_users LIMIT 1")).rows[0].user_id;
      const offeringId = await getOfferingId();
      const allocationId = await getAnyAllocationId();
      const requestId = await insertRequest(requesterId, offeringId, "claim", "pending");
      await expect(
        q1(
          "INSERT INTO test_claimrequest (request_id, allocation_id, claimed_hours, claimed_paycode) VALUES ($1,$2,-1.0,'TUT01')",
          [requestId, allocationId]
        )
      ).rejects.toThrow();
    });
  });

  describe("Complex Budget Queries", () => {
    it("calculates budget summary for unit coordinator", async () => {
      const offering = await getOffering("SOFT3888");
      const res = await q1(
        `
        SELECT
          uo.offering_id,
          uo.budget AS total_budget,
          COALESCE(SUM(a.allocated_hours * p.amount), 0) AS allocated_amount,
          (uo.budget - COALESCE(SUM(a.allocated_hours * p.amount), 0)) AS remaining_budget
        FROM test_unit_offering uo
        LEFT JOIN test_teaching_activity ta ON uo.offering_id = ta.unit_offering_id
        LEFT JOIN test_allocation a ON ta.activity_id = a.activity_id
        LEFT JOIN test_paycode p ON a.paycode_id = p.code
        WHERE uo.offering_id=$1
        GROUP BY uo.offering_id, uo.budget
        `,
        [offering.offering_id]
      );
      expect(res.rows).toHaveLength(1);
      expect(res.rows[0].total_budget).toBeDefined();
      expect(res.rows[0].allocated_amount).toBeDefined();
      expect(res.rows[0].remaining_budget).toBeDefined();
    });

    it("groups allocations by activity type with costs", async () => {
      const offeringId = await getOfferingId("SOFT3888");
      const res = await q1(
        `
        SELECT
          ta.activity_type,
          COUNT(a.allocation_id) AS allocation_count,
          SUM(a.allocated_hours) AS total_hours,
          SUM(a.allocated_hours * p.amount) AS total_cost
        FROM test_teaching_activity ta
        LEFT JOIN test_allocation a ON ta.activity_id = a.activity_id
        LEFT JOIN test_paycode p ON a.paycode_id = p.code
        WHERE ta.unit_offering_id=$1
        GROUP BY ta.activity_type
        ORDER BY total_cost DESC NULLS LAST
        `,
        [offeringId]
      );
      expect(res.rows.length).toBeGreaterThan(0);
      expect(res.rows[0].activity_type).toBeDefined();
    });
  });
});
