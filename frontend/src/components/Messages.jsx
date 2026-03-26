import React, { useState } from 'react'

function IconInbox(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M4 4h16v12H4z" />
      <path d="M4 16h5l2 3h2l2-3h5" />
    </svg>
  )
}

function IconUnread(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M4 4h16v16H4z" />
      <path d="m4 6 8 7 8-7" />
      <circle cx="18" cy="6" r="2" />
    </svg>
  )
}

function IconBriefcase(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M10 6V4h4v2" />
      <rect x="4" y="6" width="16" height="14" rx="2" />
      <path d="M4 12h16" />
    </svg>
  )
}

function IconMail(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M4 6h16v12H4z" />
      <path d="m4 8 8 6 8-6" />
    </svg>
  )
}

function IconEmptyChat(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
    </svg>
  )
}

function Messages() {
  const [activeTab, setActiveTab] = useState('all')

  const tabs = [
    { id: 'all', label: 'All Messages', Icon: IconInbox },
    { id: 'unread', label: 'Unread', Icon: IconUnread },
    { id: 'job', label: 'Job Messages', Icon: IconBriefcase },
    { id: 'inmail', label: 'InMail', Icon: IconMail },
  ]

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Messages</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar */}
          <div className="w-full lg:w-64 bg-white rounded-lg shadow-md p-4">
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
              {tabs.map((tab) => (
                <div key={tab.id} className="shrink-0">
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-green-100 text-green-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <tab.Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-white rounded-lg shadow-md p-6">
            <div className="text-center text-gray-500">
              <div className="flex justify-center mb-4 text-gray-400">
                <IconEmptyChat className="w-16 h-16" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No messages yet</h2>
              <p>When you receive messages, they'll appear here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Messages
