import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const statusOptions = [
  { value: "APPLIED", label: "Applied" },
  { value: "INTERVIEWING", label: "Interviewing" },
  { value: "OFFER", label: "Offer" },
  { value: "REJECTED", label: "Rejected" },
  { value: "WISHLIST", label: "Wishlist" },
];

const statusStyles = {
  APPLIED: "bg-blue-50 text-blue-700 border-blue-200",
  INTERVIEWING: "bg-amber-50 text-amber-700 border-amber-200",
  OFFER: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  WISHLIST: "bg-gray-50 text-gray-700 border-gray-200",
};

const emptyForm = {
  company: "",
  roleTitle: "",
  location: "",
  status: "APPLIED",
  appliedDate: "",
  sourceUrl: "",
  notes: "",
};

function Applications() {
  const { token, currentUser, loading } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const canSave = useMemo(
    () => form.company.trim() && form.roleTitle.trim(),
    [form],
  );

  const loadItems = async () => {
    if (!token) return;
    setIsLoading(true);
    setStatusMessage("");
    try {
      const res = await fetch("/api/v1/applications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setStatusMessage("Could not load applications.");
        return;
      }
      const data = await res.json().catch(() => []);
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setStatusMessage("Network error while loading applications.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && token) loadItems();
  }, [loading, token]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!token || !canSave) return;

    setIsSaving(true);
    setStatusMessage("");
    const payload = {
      company: form.company.trim(),
      roleTitle: form.roleTitle.trim(),
      location: form.location.trim() || null,
      status: form.status,
      appliedDate: form.appliedDate || null,
      sourceUrl: form.sourceUrl.trim() || null,
      notes: form.notes.trim() || null,
    };

    try {
      const url = editingId
        ? `/api/v1/applications/${editingId}`
        : "/api/v1/applications";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setStatusMessage(data?.message || "Could not save application.");
        return;
      }

      const saved = await res.json();
      if (editingId) {
        setItems((prev) =>
          prev.map((item) => (item.id === saved.id ? saved : item)),
        );
      } else {
        setItems((prev) => [saved, ...prev]);
      }
      resetForm();
    } catch {
      setStatusMessage("Network error while saving application.");
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({
      company: item.company || "",
      roleTitle: item.roleTitle || "",
      location: item.location || "",
      status: item.status || "APPLIED",
      appliedDate: item.appliedDate || "",
      sourceUrl: item.sourceUrl || "",
      notes: item.notes || "",
    });
  };

  const remove = async (id) => {
    if (!token) return;
    const confirmed = window.confirm("Remove this application?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/v1/applications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setStatusMessage("Could not delete application.");
        return;
      }
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setStatusMessage("Network error while deleting application.");
    }
  };

  if (!loading && !currentUser) {
    return (
      <div className="min-h-screen bg-white py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <h3 className="text-3xl font-bold text-gray-900 mb-3">
            My Applications
          </h3>
          <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
            <p className="text-gray-700 mb-4">
              Log in to track your job applications.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6">
          <h3 className="text-3xl font-bold text-gray-900">My Applications</h3>
          <p className="text-gray-600 mt-2">
            Track roles, stages, and notes in one place.
          </p>
        </div>

        <div className="grid lg:grid-cols-[360px_1fr] gap-6">
          <section className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm h-fit">
            <h4 className="font-semibold text-gray-900 mb-4">
              {editingId ? "Edit Application" : "Add Application"}
            </h4>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <input
                  name="company"
                  value={form.company}
                  onChange={updateField}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Company name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role title
                </label>
                <input
                  name="roleTitle"
                  value={form.roleTitle}
                  onChange={updateField}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Role title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  name="location"
                  value={form.location}
                  onChange={updateField}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Remote, Bengaluru, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={updateField}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Applied date
                </label>
                <input
                  name="appliedDate"
                  type="date"
                  value={form.appliedDate}
                  onChange={updateField}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source URL
                </label>
                <input
                  name="sourceUrl"
                  value={form.sourceUrl}
                  onChange={updateField}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={updateField}
                  rows={4}
                  className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Key details, next steps, follow-ups"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={!canSave || isSaving}
                  className="flex-1 rounded-md bg-green-600 px-4 py-2 text-white font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {isSaving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Add Application"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
            {statusMessage && (
              <p className="mt-3 text-sm text-red-700">{statusMessage}</p>
            )}
          </section>

          <section className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h4 className="font-semibold text-gray-900">
                Saved Applications
              </h4>
              <button
                type="button"
                onClick={loadItems}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={isLoading}
              >
                {isLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {items.length === 0 ? (
              <p className="text-gray-600">No applications saved yet.</p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h5 className="text-lg font-semibold text-gray-900">
                          {item.roleTitle}
                        </h5>
                        <p className="text-sm text-gray-600">
                          {item.company}
                          {item.location ? ` · ${item.location}` : ""}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${statusStyles[item.status] || statusStyles.APPLIED}`}
                      >
                        {item.status || "APPLIED"}
                      </span>
                    </div>

                    <div className="mt-3 grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>Applied: {item.appliedDate || "—"}</div>
                      <div>
                        Updated:{" "}
                        {item.updatedAt
                          ? new Date(item.updatedAt).toLocaleDateString()
                          : "—"}
                      </div>
                    </div>

                    {item.notes && (
                      <p className="mt-3 text-sm text-gray-700 whitespace-pre-line">
                        {item.notes}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.sourceUrl && (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-green-700 hover:text-green-800"
                        >
                          Open Source
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="text-sm font-medium text-gray-700 hover:text-gray-900"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        className="text-sm font-medium text-red-700 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default Applications;
