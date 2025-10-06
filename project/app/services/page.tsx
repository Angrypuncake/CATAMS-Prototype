// TESTING PLAYGROUND FOR LEARNING

"use client";

//  React imports
import { useEffect, useState } from "react";

// Import all your service functions here
import {
  getTutorAllocations,
  getAllocationsByUnit,
  Allocation,
  // example: createSwapRequest, updateAllocationStatus, etc.
} from "@/app/services/allocationService";

// This is a simple “sandbox page” where you can test any service calls.
export default function ServicesTestPage() {
  // --- 1️⃣ Local React state variables ---
  // These hold data from your API calls or any errors/loading info.
  const [tutorData, setTutorData] = useState<Allocation[]>([]);
  const [unitData, setUnitData] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- 2 Optional input states for interactive testing ---
  const [userId, setUserId] = useState("1234");
  const [unitCode, setUnitCode] = useState("INFO1111");

  // --- 3 Example function: test getTutorAllocations() ---
  const handleFetchTutorAllocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTutorAllocations(userId);
      setTutorData(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch tutor allocations");
    } finally {
      setLoading(false);
    }
  };

  // --- 4 Example function: test getAllocationsByUnit() ---
  const handleFetchAllocationsByUnit = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllocationsByUnit(unitCode);
      setUnitData(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch allocations by unit");
    } finally {
      setLoading(false);
    }
  };

  // --- 5 Template for adding new service tests ---
  // Steps to test a new service function:
  // 1. Import it at the top.
  // 2. Create a new handler like `handleCreateSomething()`.
  // 3. Call it inside a button onClick or inside useEffect().
  //
  // Example:
  // const handleCreateSwapRequest = async () => {
  //   try {
  //     const res = await createSwapRequest({ fromId: 1, toId: 2 });
  //     console.log("Created:", res);
  //   } catch (e) {
  //     console.error(e);
  //   }
  // };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">🧪 Service Layer Test Page</h1>

      {/* --- Interactive Input Fields --- */}
      <div className="flex gap-4">
        <div>
          <label className="block font-medium">User ID:</label>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium">Unit Code:</label>
          <input
            value={unitCode}
            onChange={(e) => setUnitCode(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
      </div>

      {/* --- Action Buttons --- */}
      <div className="flex gap-4">
        <button
          onClick={handleFetchTutorAllocations}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Fetch Tutor Allocations
        </button>

        <button
          onClick={handleFetchAllocationsByUnit}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Fetch Allocations by Unit
        </button>

        {/* Example: Add your own button for new function */}
        {/* <button onClick={handleCreateSwapRequest}>Create Swap Request</button> */}
      </div>

      {/* --- Status Display --- */}
      {loading && <p>⏳ Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* --- Result Output --- */}
      <section>
        <h2 className="text-lg font-semibold">Tutor Allocations</h2>
        <pre className="bg-gray-100 p-3 rounded overflow-x-auto text-sm">
          {JSON.stringify(tutorData, null, 2)}
        </pre>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Allocations by Unit</h2>
        <pre className="bg-gray-100 p-3 rounded overflow-x-auto text-sm">
          {JSON.stringify(unitData, null, 2)}
        </pre>
      </section>
    </div>
  );
}
