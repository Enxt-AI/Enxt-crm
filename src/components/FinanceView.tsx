import { useEffect, useState } from "react";
import type { ZohoInvoice, ZohoSubscription } from "../lib/types";
// Removed direct Zoho lib calls; using local API routes

// --------------------------- MOCK IMPLEMENTATIONS ---------------------------
// The Finance tab will now work with in‑memory mock data. This keeps the UI alive
// without any external Zoho dependencies.

/** Return an empty list of pending invoices (mock). */
async function getPendingInvoices(): Promise<ZohoInvoice[]> {
  // You can replace the empty array with static sample data if you wish.
  return [];
}

/** Return an empty list of active subscriptions (mock). */
async function getActiveSubscriptions(): Promise<ZohoSubscription[]> {
  return [];
}

/** Simulate invoice creation – returns a fabricated invoice object. */
async function postCreateInvoice(payload: any): Promise<ZohoInvoice> {
  return {
    invoice_id: `MOCK-${Date.now()}`,
    customer_name: payload.customer_name ?? '',
    total: payload.total ?? 0,
    due_date: payload.due_date ?? '',
    status: 'draft',
  };
}
import { CreditCard, Check, X } from "lucide-react";

export default function FinanceView() {
  const [pendingInvoices, setPendingInvoices] = useState<ZohoInvoice[]>([]);
  const [subscriptions, setSubscriptions] = useState<ZohoSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ customer_name: "", total: 0, due_date: "", status: "draft" });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [inv, sub] = await Promise.all([getPendingInvoices(), getActiveSubscriptions()]);
      setPendingInvoices(inv);
      setSubscriptions(sub);
    } catch (e) {
      console.error(e);
      setMessage("Failed to load finance data.");
    }
    setLoading(false);
  }

  async function handleCreateInvoice(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const created = await postCreateInvoice({
        customer_name: newInvoice.customer_name,
        total: newInvoice.total,
        due_date: newInvoice.due_date,
      });
      setMessage(`Invoice ${created.invoice_id} created successfully.`);
      // Refresh list
      const refreshed = await getPendingInvoices();
      setPendingInvoices(refreshed);
      setNewInvoice({ customer_name: "", total: 0, due_date: "", status: "draft" });
    } catch (e) {
      console.error(e);
      setMessage("Failed to create invoice.");
    }
    setLoading(false);
  }

  return (
    <section className="finance-section">
      <h2 className="section-title"><CreditCard size={20} /> Finance</h2>
      {message && <p className="status-msg">{message}</p>}
      <div className="finance-grid">
        {/* Pending Invoices */}
        <div className="finance-block">
          <h3>Pending Invoices</h3>
          {loading ? (
            <p>Loading…</p>
          ) : (
            <table className="finance-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Due</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingInvoices.map((inv) => (
                  <tr key={inv.invoice_id}>
                    <td>{inv.invoice_id}</td>
                    <td>{inv.customer_name}</td>
                    <td>{inv.total}</td>
                    <td>{inv.due_date}</td>
                    <td>{inv.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* Raise New Invoice */}
        <div className="finance-block">
          <h3>Raise New Invoice</h3>
          <form className="finance-form" onSubmit={handleCreateInvoice}>
            <input
              type="text"
              placeholder="Customer name"
              value={newInvoice.customer_name}
              onChange={(e) => setNewInvoice({ ...newInvoice, customer_name: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Total amount"
              value={newInvoice.total}
              onChange={(e) => setNewInvoice({ ...newInvoice, total: Number(e.target.value) })}
              required
            />
            <input
              type="date"
              placeholder="Due date"
              value={newInvoice.due_date}
              onChange={(e) => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
              required
            />
            <button type="submit" disabled={loading} className="primary-button">
              Create Invoice
            </button>
          </form>
        </div>
        {/* Active Subscriptions */}
        <div className="finance-block">
          <h3>Active Subscriptions</h3>
          <ul className="subscription-list">
            {subscriptions.map((sub) => (
              <li key={sub.subscription_id} className="subscription-card">
                <strong>{sub.name}</strong>
                <span>{sub.start_date} – {sub.end_date}</span>
                <span>Status: {sub.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
