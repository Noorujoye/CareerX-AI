import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const emptyForm = {
  company: "",
  roleTitle: "",
  location: "",
  sourceUrl: "",
  notes: "",
};

function Bookmarks() {
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
      const res = await fetch("/api/v1/bookmarks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setStatusMessage("Could not load bookmarks.");
        return;
      }
      const data = await res.json().catch(() => []);
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setStatusMessage("Network error while loading bookmarks.");
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
      sourceUrl: form.sourceUrl.trim() || null,
      notes: form.notes.trim() || null,
    };

    try {
      const url = editingId
        ? `/api/v1/bookmarks/${editingId}`
        : "/api/v1/bookmarks";
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
        setStatusMessage(data?.message || "Could not save bookmark.");
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
      setStatusMessage("Network error while saving bookmark.");
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
      sourceUrl: item.sourceUrl || "",
      notes: item.notes || "",
    });
  };

  const remove = async (id) => {
    if (!token) return;
    const confirmed = window.confirm("Remove this bookmark?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/v1/bookmarks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setStatusMessage("Could not delete bookmark.");
        return;
      }
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setStatusMessage("Network error while deleting bookmark.");
    }
  };

  if (!loading && !currentUser) {
    return (
      <div className="min-h-screen bg-white py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <h3 className="text-3xl font-bold text-gray-900 mb-3">
            My Bookmarks
          </h3>
          <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
            <p className="text-gray-700 mb-4">
              Log in to save roles you want to revisit.
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
          <h3 className="text-3xl font-bold text-gray-900">My Bookmarks</h3>
          <p className="text-gray-600 mt-2">
            Save interesting roles and keep notes in one list.
          </p>
        </div>

        <div className="grid lg:grid-cols-[360px_1fr] gap-6">
          <section className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm h-fit">
            <h4 className="font-semibold text-gray-900 mb-4">
              {editingId ? "Edit Bookmark" : "Add Bookmark"}
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
                  placeholder="Why this role matters, key requirements"
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
                      : "Add Bookmark"}
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
              <h4 className="font-semibold text-gray-900">Saved Bookmarks</h4>
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
              <p className="text-gray-600">No bookmarks saved yet.</p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div>
                      <h5 className="text-lg font-semibold text-gray-900">
                        {item.roleTitle}
                      </h5>
                      <p className="text-sm text-gray-600">
                        {item.company}
                        {item.location ? ` · ${item.location}` : ""}
                      </p>
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

export default Bookmarks;
