import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Messages() {
  const { token, currentUser, loading } = useAuth();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (location.state?.initialMessage) {
      setDraft(location.state.initialMessage);
      try {
        window.history.replaceState({}, document.title);
      } catch (e) {
        // ignore
      }
    }
  }, [location]);
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef(null);

  const quickPrompts = useMemo(
    () => [
      "How can I improve my resume for ATS?",
      "Help me prepare for a placement interview.",
      "What should I do next in my job search?",
    ],
    [],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (loading || !token) return;

    let cancelled = false;
    const loadMessages = async () => {
      setIsLoading(true);
      setStatusMessage("");
      try {
        const res = await fetch("/api/v1/guidance/messages", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          if (!cancelled) setStatusMessage("Could not load guidance messages.");
          return;
        }
        const data = await res.json().catch(() => []);
        if (!cancelled) setMessages(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled)
          setStatusMessage("Network error while loading messages.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadMessages();
    return () => {
      cancelled = true;
    };
  }, [loading, token]);

  const sendMessage = async (messageText = draft) => {
    const content = messageText.trim();
    if (!content || !token || isSending) return;

    const optimisticUserMessage = {
      id: `local-${Date.now()}`,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMessage]);
    setDraft("");
    setStatusMessage("");
    setIsSending(true);

    try {
      const res = await fetch("/api/v1/guidance/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: content }),
      });

      if (!res.ok) {
        let message = "Could not send your message.";
        try {
          const data = await res.json();
          message = data?.message || message;
        } catch {
          // ignore
        }
        setStatusMessage(message);
        return;
      }

      const assistantMessage = await res.json();
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setStatusMessage("Network error. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  if (!loading && !currentUser) {
    return (
      <div className="min-h-screen bg-white py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Career Guidance
          </h1>
          <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
            <p className="text-gray-700 mb-4">
              Log in to chat with CareerX-AI and save your guidance history.
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Career Guidance</h1>
          <p className="text-gray-600 mt-2">
            Ask for resume, ATS, interview, or job search help.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="h-[560px] overflow-y-auto p-5 space-y-4">
            {isLoading && (
              <div className="text-sm text-gray-500">
                Loading your messages...
              </div>
            )}

            {!isLoading && messages.length === 0 && (
              <div className="h-full flex flex-col justify-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  What should we work on?
                </h2>
                <div className="grid md:grid-cols-3 gap-3">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="text-left border border-gray-200 rounded-lg p-4 hover:border-green-500 hover:bg-green-50 transition"
                    >
                      <span className="text-sm font-medium text-gray-900">
                        {prompt}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[78%] rounded-lg px-4 py-3 ${
                      isUser
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-6">
                      {message.content}
                    </p>
                    {!isUser &&
                      Array.isArray(message.suggestedActions) &&
                      message.suggestedActions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.suggestedActions.map((action) => (
                            <button
                              key={action}
                              onClick={() => setDraft(action)}
                              className="text-xs rounded-full border border-gray-300 px-3 py-1 text-gray-700 hover:bg-white"
                            >
                              {action}
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-gray-200 p-4">
            {statusMessage && (
              <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {statusMessage}
              </div>
            )}
            <div className="flex gap-3">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                rows={2}
                maxLength={2000}
                placeholder="Ask CareerX-AI for personalized guidance..."
                className="flex-1 resize-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!draft.trim() || isSending}
                className="self-end rounded-md bg-green-600 px-5 py-2 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? "Sending" : "Send"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Messages;
