"use client";

import { useState } from "react";
import {
  getUsers,
  getUserById,
  getUserRoles,
  getUserUnits,
} from "@/app/services/userService";

type User = {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
};

type UserRole = {
  role_name: string;
  role_description?: string;
  unit_code?: string;
  unit_name?: string;
};

type UserUnit = {
  unit_code: string;
  unit_name: string;
  session_code?: string;
  year?: number;
};

// Result can be a single user, an array of users, roles, units, or null
type FetchResult =
  | User
  | User[]
  | UserRole[]
  | UserUnit[]
  | { error: string }
  | null;

export default function UserServiceTester() {
  const [userId, setUserId] = useState("");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [result, setResult] = useState<FetchResult>(null);
  const [loading, setLoading] = useState(false);

  async function handleFetchUsers() {
    setLoading(true);
    try {
      const data = await getUsers({
        ...(query && { q: query }),
        ...(role && { role }),
      });
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ error: String(err) });
    } finally {
      setLoading(false);
    }
  }

  async function handleFetchUserById() {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getUserById(Number(userId));
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ error: String(err) });
    } finally {
      setLoading(false);
    }
  }

  async function handleFetchRoles() {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getUserRoles(Number(userId));
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ error: String(err) });
    } finally {
      setLoading(false);
    }
  }

  async function handleFetchUnits() {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getUserUnits(Number(userId));
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ error: String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">🧪 User Service Tester</h2>

      {/* Global Search */}
      <div className="border p-4 rounded-md space-y-2 bg-gray-50">
        <h3 className="font-semibold">Search / Filter Users</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search (q)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border px-2 py-1 rounded w-40"
          />
          <input
            type="text"
            placeholder="Role (tutor, admin)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border px-2 py-1 rounded w-40"
          />
          <button
            onClick={handleFetchUsers}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Get Users"}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          🔍 You can search by <b>first name</b>, <b>last name</b>, or{" "}
          <b>email substring</b>.
        </p>
      </div>

      {/* Single User */}
      <div className="border p-4 rounded-md space-y-2 bg-gray-50">
        <h3 className="font-semibold">Fetch by User ID</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="border px-2 py-1 rounded w-32"
          />
          <button
            onClick={handleFetchUserById}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Get Info"}
          </button>
          <button
            onClick={handleFetchRoles}
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-1 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            Roles
          </button>
          <button
            onClick={handleFetchUnits}
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            Units
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="border p-4 rounded-md bg-gray-100 max-h-[600px] overflow-auto">
        <h3 className="font-semibold mb-2">Response</h3>
        {result ? (
          <pre className="text-sm whitespace-pre-wrap bg-white p-3 rounded border overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        ) : (
          <p className="text-gray-500">No data yet — use buttons above.</p>
        )}
      </div>
    </div>
  );
}
