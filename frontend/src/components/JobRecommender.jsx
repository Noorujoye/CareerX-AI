import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const roleTemplates = [
  {
    title: "Frontend Developer",
    skills: ["react", "javascript", "css", "html", "vite"],
  },
  {
    title: "Backend Developer",
    skills: ["java", "spring", "sql", "api", "mysql"],
  },
  {
    title: "Full Stack Developer",
    skills: ["react", "java", "spring", "api", "sql"],
  },
  {
    title: "Data Analyst",
    skills: ["python", "sql", "excel", "tableau", "analytics"],
  },
  {
    title: "AI/ML Engineer",
    skills: ["python", "machine learning", "tensorflow", "pytorch", "nlp"],
  },
];

function JobRecommender() {
  const { token, currentUser, loading } = useAuth();
  const [mode, setMode] = useState("candidate");
  const [preferences, setPreferences] = useState({
    skills: "",
    location: "",
    jobType: "full-time",
  });
  const [role, setRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumes, setResumes] = useState([]);
  const [matches, setMatches] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [isMatching, setIsMatching] = useState(false);

  const recommendations = useMemo(() => {
    const skillText = preferences.skills.toLowerCase();
    if (!skillText.trim()) return [];

    return roleTemplates
      .map((roleTemplate) => {
        const hits = roleTemplate.skills.filter((skill) =>
          skillText.includes(skill),
        );
        return {
          ...roleTemplate,
          score: Math.round((hits.length / roleTemplate.skills.length) * 100),
          hits,
          missing: roleTemplate.skills.filter(
            (skill) => !skillText.includes(skill),
          ),
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [preferences.skills]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setPreferences((prev) => ({ ...prev, [name]: value }));
  };

  const runRecruiterMatch = async () => {
    if (!token) return;
    if (!jobDescription.trim()) {
      setStatusMessage("Paste the job description first.");
      return;
    }
    if (resumes.length === 0) {
      setStatusMessage("Upload at least one resume.");
      return;
    }

    setIsMatching(true);
    setStatusMessage("");
    setMatches([]);

    try {
      const form = new FormData();
      form.append("jobDescriptionText", jobDescription.trim());
      if (role.trim()) form.append("role", role.trim());
      resumes.forEach((resume) => form.append("resumes", resume));

      const res = await fetch("/api/v1/recruiter/matches", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) {
        let message = "Could not rank candidates.";
        try {
          const data = await res.json();
          message = data?.message || message;
        } catch {
          // ignore
        }
        setStatusMessage(message);
        return;
      }

      const data = await res.json();
      setMatches(Array.isArray(data.candidates) ? data.candidates : []);
    } catch {
      setStatusMessage("Network error. Please try again.");
    } finally {
      setIsMatching(false);
    }
  };

  if (!loading && !currentUser) {
    return (
      <div className="min-h-screen bg-white py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <h3 className="text-3xl font-bold text-gray-900 mb-3">
            Job & Recruiter Tools
          </h3>
          <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
            <p className="text-gray-700 mb-4">
              Log in to use candidate recommendations and recruiter matching.
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
          <h3 className="text-3xl font-bold text-gray-900">
            Job & Recruiter Tools
          </h3>
          <p className="text-gray-600 mt-2">
            Match skills to roles or rank multiple resumes against a job
            description.
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 mb-6">
          <button
            onClick={() => setMode("candidate")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${mode === "candidate" ? "bg-green-600 text-white" : "text-gray-700"}`}
          >
            Candidate
          </button>
          <button
            onClick={() => setMode("recruiter")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${mode === "recruiter" ? "bg-green-600 text-white" : "text-gray-700"}`}
          >
            Recruiter
          </button>
        </div>

        {mode === "candidate" ? (
          <div className="grid lg:grid-cols-[360px_1fr] gap-6">
            <section className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm h-fit">
              <h4 className="font-semibold text-gray-900 mb-4">
                Your Preferences
              </h4>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills
              </label>
              <textarea
                name="skills"
                value={preferences.skills}
                onChange={handleInputChange}
                rows={6}
                placeholder="React, JavaScript, Java, Spring, SQL..."
                className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 mb-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                name="location"
                value={preferences.location}
                onChange={handleInputChange}
                placeholder="Remote, Bengaluru, New York..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 mb-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job type
              </label>
              <select
                name="jobType"
                value={preferences.jobType}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="full-time">Full-time</option>
                <option value="internship">Internship</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
              </select>
            </section>

            <section className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-4">
                Recommended Role Tracks
              </h4>
              {recommendations.length === 0 ? (
                <p className="text-gray-600">
                  Enter your skills to see matched role tracks.
                </p>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((item) => (
                    <div
                      key={item.title}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h5 className="font-semibold text-gray-900">
                            {item.title}
                          </h5>
                          <p className="text-sm text-gray-600">
                            {preferences.location || "Any location"} ·{" "}
                            {preferences.jobType}
                          </p>
                        </div>
                        <div className="text-green-700 font-bold">
                          {item.score}%
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mt-3">
                        Matched: {item.hits.join(", ")}
                      </p>
                      {item.missing.length > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          Build next: {item.missing.slice(0, 3).join(", ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="space-y-6">
            <section className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <div className="grid lg:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role title
                  </label>
                  <input
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    placeholder="Software Engineer Intern"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 mb-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resume batch
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={(event) =>
                      setResumes(Array.from(event.target.files || []))
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Upload up to 25 PDF/DOC/DOCX files, 3MB each.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job description
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(event) => setJobDescription(event.target.value)}
                    rows={9}
                    placeholder="Paste the JD to rank candidates by match score."
                    className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <button
                onClick={runRecruiterMatch}
                disabled={isMatching}
                className="mt-5 rounded-md bg-green-600 px-4 py-2 text-white font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {isMatching ? "Ranking..." : "Rank Candidates"}
              </button>
              {statusMessage && (
                <p className="mt-3 text-sm text-red-700">{statusMessage}</p>
              )}
            </section>

            {matches.length > 0 && (
              <section className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-700">
                      <tr>
                        <th className="text-left px-4 py-3">Rank</th>
                        <th className="text-left px-4 py-3">Candidate</th>
                        <th className="text-left px-4 py-3">ATS</th>
                        <th className="text-left px-4 py-3">Match</th>
                        <th className="text-left px-4 py-3">
                          Matched Keywords
                        </th>
                        <th className="text-left px-4 py-3">Top Gaps</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {matches.map((candidate, index) => (
                        <tr key={`${candidate.resumeFilename}-${index}`}>
                          <td className="px-4 py-3 font-semibold">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">
                              {candidate.candidateName}
                            </div>
                            <div className="text-gray-500">
                              {candidate.resumeFilename}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {candidate.overallScore}
                          </td>
                          <td className="px-4 py-3 font-semibold text-green-700">
                            {candidate.matchScore ?? "-"}
                          </td>
                          <td className="px-4 py-3">
                            {(candidate.matchedKeywords || [])
                              .slice(0, 5)
                              .join(", ") || "-"}
                          </td>
                          <td className="px-4 py-3">
                            {(candidate.missingKeywords || [])
                              .slice(0, 5)
                              .join(", ") || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default JobRecommender;
