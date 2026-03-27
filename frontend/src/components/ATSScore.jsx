import React, { useMemo, useState } from 'react'

function ATSScore() {
  const [resumeFile, setResumeFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [aiSuggestions, setAiSuggestions] = useState(null)
  const [isLoadingAi, setIsLoadingAi] = useState(false)

  const clearResumeFile = () => {
    setResumeFile(null)
    setStatusMessage('')
    setResult(null)
    setAiSuggestions(null)

    const input = document.getElementById('ats-resume-upload')
    if (input) input.value = ''
  }

  const canCheck = useMemo(() => {
    return Boolean(resumeFile)
  }, [resumeFile])

  const handleResumeSelect = (event) => {
    const file = event.target.files && event.target.files[0]
    if (!file) return

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]

    if (!allowedTypes.includes(file.type)) {
      setResumeFile(null)
      setResult(null)
      setStatusMessage('Please select a PDF or Word document (.doc, .docx).')
      return
    }

    if (file.size > 3 * 1024 * 1024) {
      setResumeFile(null)
      setResult(null)
      setStatusMessage('File too large. Max upload size is 3MB.')
      return
    }

    setResumeFile(file)
    setResult(null)
    setAiSuggestions(null)
    setStatusMessage('')
  }

  const handleCheckScore = async () => {
    if (!resumeFile) {
      setStatusMessage('Please select a resume file first.')
      return
    }

    setIsSubmitting(true)
    setStatusMessage('')
    setResult(null)
    setAiSuggestions(null)

    try {
      const form = new FormData()
      form.append('resume', resumeFile)
      if (jobDescription.trim()) {
        form.append('jobDescriptionText', jobDescription.trim())
      }

      const response = await fetch('/api/v1/ats/score', {
        method: 'POST',
        body: form,
      })

      if (!response.ok) {
        let message = 'Failed to score resume.'
        try {
          const data = await response.json()
          message = data?.message || message
        } catch {
          // ignore
        }
        setStatusMessage(message)
        return
      }

      const data = await response.json()
      setResult(data)
      if (data?.metadata?.jobDescriptionProvided === false) {
        setStatusMessage('Tip: Paste the job description to get keyword match + missing keywords for a more accurate score.')
      }

      // Fetch AI suggestions only when JD is provided
      if (jobDescription.trim()) {
        setIsLoadingAi(true)
        try {
          const aiForm = new FormData()
          aiForm.append('resume', resumeFile)
          aiForm.append('jobDescriptionText', jobDescription.trim())

          const aiRes = await fetch('/api/v1/ats/suggestions', {
            method: 'POST',
            body: aiForm,
          })

          if (aiRes.ok) {
            const aiData = await aiRes.json()
            setAiSuggestions(aiData)
          }
        } catch {
          // ignore AI failures; deterministic report is enough
        } finally {
          setIsLoadingAi(false)
        }
      }
    } catch {
      setStatusMessage('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <div className="min-h-screen bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl font-bold text-center text-green-800 mb-6">ATS Score Checker</h3>
          <p className="text-xl text-center text-gray-600 mb-12">
            Upload your resume to check ATS readiness. Optionally paste a job description for more accurate scoring.
          </p>

          <div className="bg-linear-to-br from-green-50 to-green-100 p-8 rounded-2xl shadow-xl backdrop-blur-sm border border-green-200/50 mb-8">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <h4 className="text-2xl font-semibold text-green-800 mb-4">Resume</h4>

                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeSelect}
                  className="hidden"
                  id="ats-resume-upload"
                />
                <label
                  htmlFor="ats-resume-upload"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer inline-block"
                >
                  Choose Resume File
                </label>

                {resumeFile && (
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-sm text-gray-700 truncate">Selected: {resumeFile.name}</p>
                    <button
                      type="button"
                      onClick={clearResumeFile}
                      className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      aria-label="Remove selected resume"
                      title="Remove"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                        <path d="M18 6 6 18" />
                        <path d="M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                <div className="mt-6">
                  <button
                    onClick={handleCheckScore}
                    disabled={!canCheck || isSubmitting}
                    className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-700 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Checking…' : 'Check ATS Score'}
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-2xl font-semibold text-green-800 mb-4">Job Description (optional)</h4>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={10}
                  placeholder="Paste the job description here to score keyword match and relevance."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
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
                    <div className="text-5xl font-bold text-green-800">{result.overallScore}</div>
                    <div className="mt-2 text-gray-700">{result.summary}</div>

                    {typeof result.matchScore === 'number' && (
                      <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-green-900">
                        <span className="font-semibold">JD Match Score:</span>
                        <span className="font-bold">{result.matchScore}</span>
                        <span className="text-sm text-green-800">/100</span>
                      </div>
                    )}
                  </div>

                  {result.categoryScores && (
                    <div className="mt-6 grid sm:grid-cols-2 gap-4">
                      {Object.entries(result.categoryScores).map(([key, value]) => (
                        <div key={key} className="bg-white rounded-lg border border-gray-200 p-4">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-gray-800 capitalize">{key}</div>
                            <div className="font-semibold text-gray-900">{value}/100</div>
                          </div>
                          <div className="mt-2 h-2 rounded bg-gray-200 overflow-hidden">
                            <div className="h-full bg-green-600" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {Array.isArray(result.warnings) && result.warnings.length > 0 && (
                    <div className="mt-6">
                      <h5 className="text-lg font-semibold text-gray-900">Warnings</h5>
                      <ul className="mt-2 space-y-2 text-gray-700">
                        {result.warnings.map((w, idx) => (
                          <li key={idx} className="bg-white rounded-lg border border-gray-200 p-3">{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {Array.isArray(result.priorityFixes) && result.priorityFixes.length > 0 && (
                    <div className="mt-6">
                      <h5 className="text-lg font-semibold text-gray-900">Priority Fixes</h5>
                      <ul className="mt-2 space-y-2 text-gray-700">
                        {result.priorityFixes.map((r, idx) => (
                          <li key={idx} className="bg-white rounded-lg border border-gray-200 p-3">{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {Array.isArray(result.missingKeywords) && result.missingKeywords.length > 0 && (
                    <div className="mt-6">
                      <h5 className="text-lg font-semibold text-gray-900">Missing Keywords</h5>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {result.missingKeywords.map((kw) => (
                          <span key={kw} className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-800 text-sm">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.isArray(result.matchedKeywords) && result.matchedKeywords.length > 0 && (
                    <div className="mt-6">
                      <h5 className="text-lg font-semibold text-gray-900">Matched Keywords</h5>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {result.matchedKeywords.map((kw) => (
                          <span key={kw} className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-800 text-sm">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.isArray(result.topJobKeywords) && result.topJobKeywords.length > 0 && (
                    <div className="mt-6">
                      <h5 className="text-lg font-semibold text-gray-900">Top Job Keywords</h5>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {result.topJobKeywords.map((kw) => (
                          <span key={kw} className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-800 text-sm">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.isArray(result.recommendations) && result.recommendations.length > 0 && (
                    <div className="mt-6">
                      <h5 className="text-lg font-semibold text-gray-900">Recommendations</h5>
                      <ul className="mt-2 space-y-2 text-gray-700">
                        {result.recommendations.map((r, idx) => (
                          <li key={idx} className="bg-white rounded-lg border border-gray-200 p-3">{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(isLoadingAi || aiSuggestions) && (
                    <div className="mt-6">
                      <h5 className="text-lg font-semibold text-gray-900">AI Suggestions</h5>
                      {isLoadingAi && (
                        <p className="mt-2 text-gray-700">Generating suggestions…</p>
                      )}

                      {aiSuggestions && (
                        <div className="mt-3 space-y-6">
                          {Array.isArray(aiSuggestions.mustHaves) && aiSuggestions.mustHaves.length > 0 && (
                            <div>
                              <div className="font-medium text-gray-900">Must-have skills</div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {aiSuggestions.mustHaves.map((s) => (
                                  <span key={s} className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-800 text-sm">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {Array.isArray(aiSuggestions.missingMustHaves) && aiSuggestions.missingMustHaves.length > 0 && (
                            <div>
                              <div className="font-medium text-gray-900">Missing must-haves</div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {aiSuggestions.missingMustHaves.map((s) => (
                                  <span key={s} className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-800 text-sm">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {Array.isArray(aiSuggestions.niceToHaves) && aiSuggestions.niceToHaves.length > 0 && (
                            <div>
                              <div className="font-medium text-gray-900">Nice-to-have skills</div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {aiSuggestions.niceToHaves.map((s) => (
                                  <span key={s} className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-800 text-sm">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {Array.isArray(aiSuggestions.resumeEdits) && aiSuggestions.resumeEdits.length > 0 && (
                            <div>
                              <div className="font-medium text-gray-900">Suggested edits</div>
                              <ul className="mt-2 space-y-2 text-gray-700">
                                {aiSuggestions.resumeEdits.map((r, idx) => (
                                  <li key={idx} className="bg-white rounded-lg border border-gray-200 p-3">{r}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {Array.isArray(aiSuggestions.bulletRewrites) && aiSuggestions.bulletRewrites.length > 0 && (
                            <div>
                              <div className="font-medium text-gray-900">Bullet rewrites</div>
                              <ul className="mt-2 space-y-2 text-gray-700">
                                {aiSuggestions.bulletRewrites.map((r, idx) => (
                                  <li key={idx} className="bg-white rounded-lg border border-gray-200 p-3">{r}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ATSScore
