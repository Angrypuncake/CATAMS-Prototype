// app/claim-request/[id]/page.tsx
export default function ClaimRequestPage() {
  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Claim Request #123</h1>
          <p className="text-sm text-gray-500">
            Submitted by Elvis Nguyen • 13/09/2025
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
          Pending Review
        </span>
      </header>

      <section className="grid grid-cols-2 gap-6">
        {/* System Record */}
        <div className="rounded-lg border p-4 bg-gray-50">
          <h2 className="font-semibold mb-3">System Record</h2>
          <div className="space-y-2 text-sm">
            <p>
              Unit: <span className="font-medium">INFO1110</span>
            </p>
            <p>
              Session: <span className="font-medium">TUT01</span>
            </p>
            <p>Hours: 2</p>
            <p>Pay Code: TUT01</p>
          </div>
        </div>

        {/* Tutor Claim */}
        <div className="rounded-lg border p-4 bg-white">
          <h2 className="font-semibold mb-3">Tutor Claim (Requested)</h2>
          <div className="space-y-3">
            <label className="block text-sm">
              Claimed Hours
              <input type="number" defaultValue={2} className="input" />
            </label>
            <label className="block text-sm">
              Claimed Pay Code
              <select className="input">
                <option>TUT01</option>
                <option>TU4</option>
              </select>
            </label>
            <label className="block text-sm">
              Comment
              <textarea className="input" placeholder="Explain changes..." />
            </label>
          </div>
        </div>
      </section>

      <section className="border-t pt-4">
        <h2 className="font-semibold mb-2">History</h2>
        <ul className="text-sm space-y-1 text-gray-600">
          <li>5:40 PM – Request edited (changed paycode to TU4)</li>
          <li>5:12 PM – Request created by Elvis</li>
        </ul>
      </section>

      <footer className="flex justify-between pt-4 border-t">
        <button className="btn-secondary">Back</button>
        <div className="space-x-2">
          <button className="btn-outline">Withdraw</button>
          <button className="btn-primary">Submit Request</button>
        </div>
      </footer>
    </div>
  );
}
