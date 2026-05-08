import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function ResumeOptimizer() {
  const { token, currentUser, loading } = useAuth();

  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const clearResumeFile = () => {
    setResumeFile(null);
    setStatusMessage("");
    setResult(null);

    const input = document.getElementById("resume-upload");
    if (input) input.value = "";
  };

  const canOptimize = useMemo(() => {
    return (
      Boolean(resumeFile) && Boolean(token) && Boolean(jobDescription.trim())
    );
  }, [resumeFile, token, jobDescription]);

  const handleResumeSelect = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setResumeFile(null);
      setResult(null);
      setStatusMessage("Please select a PDF or Word document (.doc, .docx).");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setResumeFile(null);
      setResult(null);
      setStatusMessage("File too large. Max upload size is 3MB.");
      return;
    }

    setResumeFile(file);
    setResult(null);
    setStatusMessage("");
  };

  const loadHistory = async () => {
    if (!token) return;
    setIsLoadingHistory(true);
    try {
      const res = await fetch("/api/v1/resume-optimizer/history?limit=8", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return;
      const data = await res.json().catch(() => []);
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadHistoryItem = async (id) => {
    if (!token || !id) return;
    setStatusMessage("");
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/resume-optimizer/history/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setStatusMessage("Could not load that optimization.");
        return;
      }

      const data = await res.json();
      setResult(data);
    } catch {
      setStatusMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!loading && token) loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, token]);

  const handleOptimize = async () => {
    if (!token) {
      setStatusMessage("Please log in to optimize and save results.");
      return;
    }
    if (!resumeFile) {
      setStatusMessage("Please select a resume file first.");
      return;
    }
    if (!jobDescription.trim()) {
      setStatusMessage("Please paste the job description.");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("");
    setResult(null);

    try {
      const form = new FormData();
      form.append("resume", resumeFile);
      form.append("jobDescriptionText", jobDescription.trim());

      const response = await fetch("/api/v1/resume-optimizer/optimize", {
        method: "POST",
        body: form,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let message = "Failed to optimize resume.";
        if (response.status === 401)
          message = "Please log in to use this feature.";
        try {
          const data = await response.json();
          message = data?.message || message;
        } catch {
          // ignore
        }
        setStatusMessage(message);
        return;
      }

      const data = await response.json();
      setResult(data);
      loadHistory();
    } catch {
      setStatusMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyOptimized = async () => {
    const text = result?.optimizedResumeText;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setStatusMessage("Optimized resume copied to clipboard.");
    } catch {
      setStatusMessage("Copy failed. Please select and copy manually.");
    }
  };

  if (!loading && !currentUser) {
    return (
      <div className="min-h-screen bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-3xl font-bold text-center text-green-800 mb-4">
              Resume Optimizer
            </h3>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <p className="text-gray-700">
                Please log in to optimize your resume and save results to your
                account.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white hover:bg-green-700"
                >
                  Go to Login
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-semibold text-gray-800 hover:bg-gray-50"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl font-bold text-center text-green-800 mb-6">
            Resume Optimizer
          </h3>
          <p className="text-xl text-center text-gray-600 mb-12">
            Upload your resume and paste the job description to get keyword
            gaps, priority fixes, and a suggested skills addendum.
          </p>

          <div className="bg-linear-to-br from-green-50 to-green-100 p-8 rounded-2xl shadow-xl backdrop-blur-sm border border-green-200/50 mb-8">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <h4 className="text-2xl font-semibold text-green-800 mb-4">
                  Resume
                </h4>

                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeSelect}
                  className="hidden"
                  id="resume-upload"
                />
                <label
                  htmlFor="resume-upload"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer inline-block"
                >
                  Choose Resume File
                </label>

                {resumeFile && (
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-sm text-gray-700 truncate">
                      Selected: {resumeFile.name}
                    </p>
                    <button
                      type="button"
                      onClick={clearResumeFile}
                      className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      aria-label="Remove selected resume"
                      title="Remove"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4"
                        aria-hidden="true"
                      >
                        <path d="M18 6 6 18" />
                        <path d="M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                <div className="mt-6">
                  <button
                    onClick={handleOptimize}
                    disabled={!canOptimize || isSubmitting}
                    className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-700 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Optimizing…" : "Optimize Resume"}
                  </button>
                  <p className="mt-2 text-sm text-gray-700">
                    Tip: Add only skills/keywords you genuinely have experience
                    with.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-2xl font-semibold text-green-800 mb-4">
                  Job Description
                </h4>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={10}
                  placeholder="Paste the job description here."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-black"
                />
              </div>
            </div>
          </div>

          {(statusMessage || result) && (
            <div className="bg-white/70 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/50">
              {statusMessage && (
                <p className="text-gray-700 text-center">{statusMessage}</p>
              )}

              {result && (
                <div className="mt-4">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-green-800">
                      {result.overallScore}
                    </div>
                    <div className="mt-2 text-gray-700">{result.summary}</div>

                    {typeof result.matchScore === "number" && (
                      <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-green-900">
                        <span className="font-semibold">JD Match Score:</span>
                        <span className="font-bold">{result.matchScore}</span>
                        <span className="text-sm text-green-800">/100</span>
                      </div>
                    )}
                  </div>

                  {Array.isArray(result.priorityFixes) &&
                    result.priorityFixes.length > 0 && (
                      <div className="mt-6">
                        <h5 className="text-lg font-semibold text-gray-900">
                          Priority Fixes
                        </h5>
                        <ul className="mt-2 space-y-2 text-gray-700">
                          {result.priorityFixes.map((r, idx) => (
                            <li
                              key={idx}
                              className="bg-white rounded-lg border border-gray-200 p-3"
                            >
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {Array.isArray(result.missingKeywords) &&
                    result.missingKeywords.length > 0 && (
                      <div className="mt-6">
                        <h5 className="text-lg font-semibold text-gray-900">
                          Missing Keywords
                        </h5>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {result.missingKeywords.map((kw) => (
                            <span
                              key={kw}
                              className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-800 text-sm"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {Array.isArray(result.recommendations) &&
                    result.recommendations.length > 0 && (
                      <div className="mt-6">
                        <h5 className="text-lg font-semibold text-gray-900">
                          Recommendations
                        </h5>
                        <ul className="mt-2 space-y-2 text-gray-700">
                          {result.recommendations.map((r, idx) => (
                            <li
                              key={idx}
                              className="bg-white rounded-lg border border-gray-200 p-3"
                            >
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {result.optimizedResumeText && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between gap-3">
                        <h5 className="text-lg font-semibold text-gray-900">
                          Suggested Resume Text
                        </h5>
                        <button
                          type="button"
                          onClick={handleCopyOptimized}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                        >
                          Copy
                        </button>
                      </div>
                      <textarea
                        readOnly
                        value={result.optimizedResumeText}
                        rows={12}
                        className="mt-3 w-full p-3 border border-gray-300 rounded-lg bg-white text-black"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {currentUser && (
            <div className="mt-8">
              <div className="flex items-center justify-between gap-3">
                <h5 className="text-lg font-semibold text-gray-900">
                  Recent Optimizations
                </h5>
                <button
                  type="button"
                  onClick={loadHistory}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                  disabled={isLoadingHistory}
                >
                  {isLoadingHistory ? "Refreshing…" : "Refresh"}
                </button>
              </div>

              <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Resume</th>
                      <th className="px-4 py-3 font-semibold">Overall</th>
                      <th className="px-4 py-3 font-semibold">Match</th>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {history.length === 0 ? (
                      <tr>
                        <td className="px-4 py-4 text-gray-600" colSpan={5}>
                          No saved optimizations yet.
                        </td>
                      </tr>
                    ) : (
                      history.map((h) => (
                        <tr key={h.id} className="text-gray-800">
                          <td
                            className="px-4 py-3 max-w-60 truncate"
                            title={h.resumeFilename || ""}
                          >
                            {h.resumeFilename || "Resume"}
                          </td>
                          <td className="px-4 py-3 font-semibold">
                            {h.overallScore}
                          </td>
                          <td className="px-4 py-3">
                            {typeof h.matchScore === "number"
                              ? h.matchScore
                              : "—"}
                          </td>
                          <td className="px-4 py-3">
                            {h.createdAt
                              ? new Date(h.createdAt).toLocaleString()
                              : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => loadHistoryItem(h.id)}
                              className="rounded-md bg-green-600 px-3 py-1.5 font-semibold text-white hover:bg-green-700"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResumeOptimizer;
