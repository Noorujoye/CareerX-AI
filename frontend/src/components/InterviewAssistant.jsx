import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function InterviewAssistant() {
  const { token, currentUser, loading } = useAuth();
  const [role, setRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [focusAreas, setFocusAreas] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const generateQuestions = async () => {
    if (!token) return;
    setIsGenerating(true);
    setStatusMessage("");
    setFeedback(null);

    try {
      const res = await fetch("/api/v1/interview/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: role.trim() || undefined,
          jobDescriptionText: jobDescription.trim() || undefined,
        }),
      });

      if (!res.ok) {
        setStatusMessage("Could not generate interview questions.");
        return;
      }

      const data = await res.json();
      const nextQuestions = Array.isArray(data.questions) ? data.questions : [];
      setQuestions(nextQuestions);
      setFocusAreas(Array.isArray(data.focusAreas) ? data.focusAreas : []);
      setSelectedQuestion(nextQuestions[0] || "");
      setAnswer("");
    } catch {
      setStatusMessage("Network error. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const checkAnswer = async () => {
    if (!selectedQuestion || !answer.trim() || !token) return;
    setIsChecking(true);
    setStatusMessage("");
    setFeedback(null);

    try {
      const res = await fetch("/api/v1/interview/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: role.trim() || undefined,
          question: selectedQuestion,
          answer: answer.trim(),
        }),
      });

      if (!res.ok) {
        setStatusMessage("Could not review your answer.");
        return;
      }

      setFeedback(await res.json());
    } catch {
      setStatusMessage("Network error. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  if (!loading && !currentUser) {
    return (
      <div className="min-h-screen bg-white py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <h3 className="text-3xl font-bold text-gray-900 mb-3">
            Interview Assistant
          </h3>
          <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
            <p className="text-gray-700 mb-4">
              Log in to generate practice questions and get feedback on your
              answers.
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
            Interview Assistant
          </h3>
          <p className="text-gray-600 mt-2">
            Generate role-specific questions and get feedback on your practice
            answers.
          </p>
        </div>

        <div className="grid lg:grid-cols-[360px_1fr] gap-6">
          <section className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm h-fit">
            <h4 className="font-semibold text-gray-900 mb-4">Practice Setup</h4>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target role
            </label>
            <input
              value={role}
              onChange={(event) => setRole(event.target.value)}
              placeholder="Frontend Developer, Data Analyst..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 mb-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job description
            </label>
            <textarea
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              rows={7}
              maxLength={2000}
              placeholder="Paste a JD for sharper questions."
              className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 mb-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <button
              onClick={generateQuestions}
              disabled={isGenerating || !token}
              className="w-full rounded-md bg-green-600 px-4 py-2 text-white font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {isGenerating ? "Generating..." : "Generate Questions"}
            </button>

            {focusAreas.length > 0 && (
              <div className="mt-5">
                <h5 className="text-sm font-semibold text-gray-900 mb-2">
                  Focus Areas
                </h5>
                <div className="flex flex-wrap gap-2">
                  {focusAreas.map((area) => (
                    <span
                      key={area}
                      className="text-xs rounded-full bg-green-50 text-green-800 border border-green-200 px-3 py-1"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-4">Questions</h4>
              {questions.length === 0 ? (
                <p className="text-gray-600">
                  Generate questions to begin a practice round.
                </p>
              ) : (
                <div className="space-y-3">
                  {questions.map((question) => (
                    <button
                      key={question}
                      onClick={() => {
                        setSelectedQuestion(question);
                        setFeedback(null);
                      }}
                      className={`w-full text-left rounded-md border px-4 py-3 transition ${
                        selectedQuestion === question
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedQuestion && (
              <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Your Answer
                </h4>
                <p className="text-sm text-gray-600 mb-3">{selectedQuestion}</p>
                <textarea
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  rows={8}
                  maxLength={4000}
                  placeholder="Practice your answer here. Try using situation, task, action, result."
                  className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={checkAnswer}
                  disabled={isChecking || !answer.trim()}
                  className="mt-4 rounded-md bg-green-600 px-4 py-2 text-white font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {isChecking ? "Reviewing..." : "Review Answer"}
                </button>
              </div>
            )}

            {statusMessage && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {statusMessage}
              </div>
            )}

            {feedback && (
              <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold text-xl">
                    {feedback.score}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Feedback</h4>
                    <p className="text-gray-600">{feedback.summary}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">
                      Strengths
                    </h5>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {(feedback.strengths || []).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">
                      Improvements
                    </h5>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {(feedback.improvements || []).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {feedback.improvedAnswer && (
                  <div className="mt-5 rounded-md bg-gray-50 border border-gray-200 p-4">
                    <h5 className="font-semibold text-gray-900 mb-2">
                      Improved Direction
                    </h5>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {feedback.improvedAnswer}
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default InterviewAssistant;
