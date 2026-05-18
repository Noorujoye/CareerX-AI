import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const roadmapBlueprints = {
  frontend: {
    title: 'Frontend Developer',
    description: 'Master the art of building beautiful, interactive, and responsive user interfaces.',
    stages: [
      {
        name: 'Stage 1: Web Fundamentals',
        duration: '3-4 weeks',
        skills: [
          { id: 'fe-s1-1', name: 'Semantic HTML5', desc: 'Structure web pages with meaning and accessibility.' },
          { id: 'fe-s1-2', name: 'CSS3 & Responsive Design', desc: 'Style web layouts using Flexbox, CSS Grid, and Media Queries.' },
          { id: 'fe-s1-3', name: 'Modern JavaScript (ES6+)', desc: 'Learn variables, functions, DOM manipulation, promises, and fetch API.' }
        ]
      },
      {
        name: 'Stage 2: Tooling & Workflows',
        duration: '2-3 weeks',
        skills: [
          { id: 'fe-s2-1', name: 'Git & GitHub', desc: 'Learn version control, branches, pull requests, and commit workflows.' },
          { id: 'fe-s2-2', name: 'Package Managers & Bundlers', desc: 'Use npm/pnpm to install packages and learn Vite build configuration.' },
          { id: 'fe-s2-3', name: 'Linter & Formatter', desc: 'Adopt ESLint and Prettier for clean, standard team coding practices.' }
        ]
      },
      {
        name: 'Stage 3: Component Frameworks',
        duration: '4-5 weeks',
        skills: [
          { id: 'fe-s3-1', name: 'React Core Concepts', desc: 'Understand JSX, Components, Props, State, and Lifecycle hooks.' },
          { id: 'fe-s3-2', name: 'Tailwind CSS Utility Design', desc: 'Design stunning interfaces quickly using modern styling classes.' },
          { id: 'fe-s3-3', name: 'Global State Management', desc: 'Manage application state using Context API, Redux Toolkit, or Zustand.' }
        ]
      },
      {
        name: 'Stage 4: Advanced Integration & Testing',
        duration: '2-3 weeks',
        skills: [
          { id: 'fe-s4-1', name: 'Routing & Navigation', desc: 'Implement multi-page app architecture using React Router.' },
          { id: 'fe-s4-2', name: 'API Client & Data Fetching', desc: 'Fetch data cleanly with error boundaries and React Query/Axios.' },
          { id: 'fe-s4-3', name: 'Testing UI Components', desc: 'Write unit and integration tests with Vitest, Jest, and React Testing Library.' }
        ]
      },
      {
        name: 'Stage 5: Framework Mastery & Deploy',
        duration: '4 weeks',
        skills: [
          { id: 'fe-s5-1', name: 'Next.js & SSR/SSG', desc: 'Render pages server-side for maximum performance and premium SEO.' },
          { id: 'fe-s5-2', name: 'Web Performance Tuning', desc: 'Implement code splitting, lazy loading, and image optimization.' },
          { id: 'fe-s5-3', name: 'Production Cloud Deploy', desc: 'Host production applications seamlessly using Vercel, Netlify, or AWS.' }
        ]
      }
    ]
  },
  backend: {
    title: 'Backend Developer',
    description: 'Design, build, and optimize scalable servers, APIs, databases, and microservices.',
    stages: [
      {
        name: 'Stage 1: Language & Algorithms',
        duration: '4 weeks',
        skills: [
          { id: 'be-s1-1', name: 'Core Language Fundamentals', desc: 'Master object-oriented programming in Java, Python, Go, or Node.js.' },
          { id: 'be-s1-2', name: 'Data Structures & Algorithms', desc: 'Learn lists, maps, sorting, searching, and time-complexity analysis.' },
          { id: 'be-s1-3', name: 'Concurrent Programming', desc: 'Implement asynchronous processing, multi-threading, and event loops.' }
        ]
      },
      {
        name: 'Stage 2: Database Layer',
        duration: '3 weeks',
        skills: [
          { id: 'be-s2-1', name: 'Relational SQL Databases', desc: 'Learn PostgreSQL/MySQL table schemas, joins, indexes, and transactions.' },
          { id: 'be-s2-2', name: 'NoSQL Databases', desc: 'Understand document storage and key-value paradigms (MongoDB, Redis).' },
          { id: 'be-s2-3', name: 'ORMs & Query Optimizers', desc: 'Use JPA/Hibernate or Prisma to coordinate database calls securely.' }
        ]
      },
      {
        name: 'Stage 3: REST & Web Frameworks',
        duration: '4-5 weeks',
        skills: [
          { id: 'be-s3-1', name: 'Backend Frameworks', desc: 'Build scalable APIs using Spring Boot, Express, Django, or FastAPI.' },
          { id: 'be-s3-2', name: 'API Design Standards', desc: 'Implement RESTful endpoints, status codes, query filtering, and documentation.' },
          { id: 'be-s3-3', name: 'Input Validation & Security', desc: 'Validate inputs, prevent SQL injections, and handle exceptions cleanly.' }
        ]
      },
      {
        name: 'Stage 4: Security & Integrations',
        duration: '4 weeks',
        skills: [
          { id: 'be-s4-1', name: 'Authentication & Session Handling', desc: 'Secure routes using JWT tokens, cookies, and OAuth2 standard protocols.' },
          { id: 'be-s4-2', name: 'Message Brokers & Queues', desc: 'Implement event-driven asynchronous processing via RabbitMQ, Kafka, or Redis.' },
          { id: 'be-s4-3', name: 'Third-party API Services', desc: 'Integrate external gateways securely (Stripe, Twilio, SendGrid).' }
        ]
      },
      {
        name: 'Stage 5: Devops & System Design',
        duration: '4 weeks',
        skills: [
          { id: 'be-s5-1', name: 'System Design Patterns', desc: 'Master caching, load balancing, API gateways, and microservices architecture.' },
          { id: 'be-s5-2', name: 'Containers & Orchestration', desc: 'Package and deploy server instances smoothly with Docker and Kubernetes.' },
          { id: 'be-s5-3', name: 'CI/CD Pipelines & Cloud Hosting', desc: 'Automate deployments to AWS, Google Cloud, or Azure with GitHub Actions.' }
        ]
      }
    ]
  },
  fullstack: {
    title: 'Full Stack Developer',
    description: 'Become a highly versatile engineer capable of coding front-to-back systems.',
    stages: [
      {
        name: 'Stage 1: Web Interface Basics',
        duration: '3 weeks',
        skills: [
          { id: 'fs-s1-1', name: 'Semantic HTML & CSS Layouts', desc: 'Master responsive UI development with grid systems and Flexbox.' },
          { id: 'fs-s1-2', name: 'JavaScript & Client-side DOM', desc: 'Make web layouts interactive, manage events, and utilize fetch requests.' },
          { id: 'fs-s1-3', name: 'Git Workflow & Collaboration', desc: 'Track files, resolve conflicts, and contribute to repositories.' }
        ]
      },
      {
        name: 'Stage 2: Frontend Engineering',
        duration: '4 weeks',
        skills: [
          { id: 'fs-s2-1', name: 'React Development & Tailwind', desc: 'Develop responsive, premium components with modern hooks.' },
          { id: 'fs-s2-2', name: 'Routing, Nav, & Forms', desc: 'Coordinate multi-page views and validate front-end form inputs.' },
          { id: 'fs-s2-3', name: 'Global State & API Integration', desc: 'Coordinate state and fetch data efficiently from backend REST endpoints.' }
        ]
      },
      {
        name: 'Stage 3: Server & Databases',
        duration: '4 weeks',
        skills: [
          { id: 'fs-s3-1', name: 'Node.js/Express or Spring Boot', desc: 'Build backend servers that run business logic and listen for requests.' },
          { id: 'fs-s3-2', name: 'Database Integrations (SQL/NoSQL)', desc: 'Integrate PostgreSQL or MongoDB into the server backend.' },
          { id: 'fs-s3-3', name: 'Secure API Middleware', desc: 'Add middleware for request validations, logging, and error mapping.' }
        ]
      },
      {
        name: 'Stage 4: Security & Deploy',
        duration: '3 weeks',
        skills: [
          { id: 'fs-s4-1', name: 'Auth & Route Guards', desc: 'Build private routes secured by JSON Web Tokens (JWT) or sessions.' },
          { id: 'fs-s4-2', name: 'Production Build Bundling', desc: 'Build high-performance client assets and serve static bundles securely.' },
          { id: 'fs-s4-3', name: 'Cloud Deployment Hosting', desc: 'Deploy web apps to platforms like Render, AWS, or Docker registries.' }
        ]
      },
      {
        name: 'Stage 5: Premium Systems',
        duration: '5 weeks',
        skills: [
          { id: 'fs-s5-1', name: 'Server-side Frameworks', desc: 'Leverage Next.js for universal rendering and optimal loading speeds.' },
          { id: 'fs-s5-2', name: 'Caching & Web Sockets', desc: 'Implement instant real-time data features using Socket.io and Redis.' },
          { id: 'fs-s5-3', name: 'Monitoring & Scaling', desc: 'Utilize APM tools, logging aggregations, and server load balancing.' }
        ]
      }
    ]
  },
  data: {
    title: 'Data Analyst',
    description: 'Transform raw data into meaningful and actionable business insights.',
    stages: [
      {
        name: 'Stage 1: Excel & Preparation',
        duration: '2-3 weeks',
        skills: [
          { id: 'da-s1-1', name: 'Advanced Spreadsheet Analytics', desc: 'Build complex formulas, pivot tables, VLOOKUPs, and chart systems.' },
          { id: 'da-s1-2', name: 'Data Formatting & Cleaning', desc: 'Parse messy files, clean empty cells, and format columns.' },
          { id: 'da-s1-3', name: 'Report Generation basics', desc: 'Assemble simple summaries and PDFs presenting key metrics.' }
        ]
      },
      {
        name: 'Stage 2: Database Querying',
        duration: '3-4 weeks',
        skills: [
          { id: 'da-s2-1', name: 'SQL Query Foundations', desc: 'Write SELECT, WHERE, and ORDER BY filters on database tables.' },
          { id: 'da-s2-2', name: 'Data Aggregations & Joins', desc: 'Combine multiple files or tables via INNER, LEFT, and RIGHT joins.' },
          { id: 'da-s2-3', name: 'Subqueries & Windows', desc: 'Implement advanced metrics with CTEs and windowing partitions.' }
        ]
      },
      {
        name: 'Stage 3: Visual Intelligence',
        duration: '3 weeks',
        skills: [
          { id: 'da-s3-1', name: 'Tableau or Power BI Desktop', desc: 'Establish live database connections and load files.' },
          { id: 'da-s3-2', name: 'Premium Dashboard Design', desc: 'Configure beautiful, dynamic cross-filters and user views.' },
          { id: 'da-s3-3', name: 'Storytelling & Presentations', desc: 'Build logical slide transitions showcasing key analytical takeaways.' }
        ]
      },
      {
        name: 'Stage 4: Programmatic Analysis',
        duration: '4 weeks',
        skills: [
          { id: 'da-s4-1', name: 'Python Basics for Data', desc: 'Learn variables, loops, arrays, and standard libraries.' },
          { id: 'da-s4-2', name: 'Pandas & NumPy Foundations', desc: 'Read CSVs, clean datasets, and calculate aggregations dynamically.' },
          { id: 'da-s4-3', name: 'Data Visualizations (Matplotlib)', desc: 'Plot premium line graphs, bar charts, and heatmaps programmatically.' }
        ]
      },
      {
        name: 'Stage 5: Statistics & Insights',
        duration: '3 weeks',
        skills: [
          { id: 'da-s5-1', name: 'Hypothesis Testing & Metrics', desc: 'Master distributions, significance values, and statistical errors.' },
          { id: 'da-s5-2', name: 'A/B Testing & Analysis', desc: 'Synthesize experimental changes to support business decisions.' },
          { id: 'da-s5-3', name: 'Executive Deliverables', desc: 'Write clean data briefs translating technical findings into plain English.' }
        ]
      }
    ]
  },
  aiml: {
    title: 'AI / ML Engineer',
    description: 'Architect advanced intelligent models, neural networks, and deploy systems.',
    stages: [
      {
        name: 'Stage 1: Mathematical Pillars',
        duration: '4 weeks',
        skills: [
          { id: 'ml-s1-1', name: 'Linear Algebra & Calculus', desc: 'Understand vector spaces, dot products, derivatives, and gradients.' },
          { id: 'ml-s1-2', name: 'Probability & Statistics', desc: 'Master Bayes theorem, distributions, expectations, and estimations.' },
          { id: 'ml-s1-3', name: 'Scientific Computing', desc: 'Optimize matrices efficiently using high-performance NumPy arrays.' }
        ]
      },
      {
        name: 'Stage 2: Python & Data Ops',
        duration: '3 weeks',
        skills: [
          { id: 'ml-s2-1', name: 'Python OOP & Packages', desc: 'Adopt scripting standards, clean error handling, and class designs.' },
          { id: 'ml-s2-2', name: 'Feature Engineering & Prep', desc: 'Normalize columns, encode categories, and handle missing entries.' },
          { id: 'ml-s2-3', name: 'Data Mining & Exploration', desc: 'Detect anomalies and correlation trends using Seaborn plots.' }
        ]
      },
      {
        name: 'Stage 3: Core Machine Learning',
        duration: '5 weeks',
        skills: [
          { id: 'ml-s3-1', name: 'Supervised Learning Algorithms', desc: 'Build linear regressions, decision trees, and ensemble boosting models.' },
          { id: 'ml-s3-2', name: 'Unsupervised & Clusters', desc: 'Group datasets via K-Means and simplify dimensions with PCA.' },
          { id: 'ml-s3-3', name: 'Scikit-Learn Mastery', desc: 'Build robust pipelines, score models, and run grid searches.' }
        ]
      },
      {
        name: 'Stage 4: Deep Learning Networks',
        duration: '5 weeks',
        skills: [
          { id: 'ml-s4-1', name: 'Neural Networks Basics', desc: 'Master backpropagation, activation curves, and loss optimizations.' },
          { id: 'ml-s4-2', name: 'TensorFlow or PyTorch Design', desc: 'Construct sequential layers, input dimensions, and tensor nodes.' },
          { id: 'ml-s4-3', name: 'Convolutions & Recurrence', desc: 'Train CNNs for vision modeling and RNN/LSTMs for sequence tracking.' }
        ]
      },
      {
        name: 'Stage 5: Production MLOps',
        duration: '4 weeks',
        skills: [
          { id: 'ml-s5-1', name: 'NLP & Transformers', desc: 'Master tokenizations, embeddings, and fine-tuning large language models.' },
          { id: 'ml-s5-2', name: 'Model Export & API Deploy', desc: 'Wrap trained pipelines inside high-speed FastAPI backend servers.' },
          { id: 'ml-s5-3', name: 'MLOps & Pipeline Scaling', desc: 'Track models with MLflow, containerize via Docker, and host on AWS.' }
        ]
      }
    ]
  }
}

function CareerRoadmap() {
  const { token, currentUser, loading } = useAuth()
  const navigate = useNavigate()

  const [activeTrack, setActiveTrack] = useState('frontend')
  const [customInput, setCustomInput] = useState('')
  const [customRoadmap, setCustomRoadmap] = useState(null)
  const [completedSkills, setCompletedSkills] = useState({})
  const [errorText, setErrorText] = useState('')
  const [successText, setSuccessText] = useState('')

  // Load user progress from localStorage on mount
  useEffect(() => {
    if (currentUser) {
      try {
        const savedProgress = localStorage.getItem(`roadmap-progress-${currentUser.email || currentUser.id}`)
        if (savedProgress) {
          setCompletedSkills(JSON.parse(savedProgress))
        }
      } catch (e) {
        console.warn('Failed to load roadmap progress:', e)
      }
    }
  }, [currentUser])

  // Save progress changes
  const saveProgress = (newProgress) => {
    setCompletedSkills(newProgress)
    if (currentUser) {
      try {
        localStorage.setItem(`roadmap-progress-${currentUser.email || currentUser.id}`, JSON.stringify(newProgress))
      } catch (e) {
        console.warn('Failed to save roadmap progress:', e)
      }
    }
  }

  const toggleSkill = (skillId) => {
    const nextProgress = {
      ...completedSkills,
      [skillId]: !completedSkills[skillId]
    }
    saveProgress(nextProgress)
  }

  // Sanitize and validate custom roadmap inputs
  const generateCustomRoadmap = (e) => {
    e.preventDefault()
    setErrorText('')
    setSuccessText('')

    const cleanInput = customInput.replace(/[<>'"&;]/g, '').trim()
    if (!cleanInput) {
      setErrorText('Please enter a target career role.')
      return
    }
    if (cleanInput.length < 3 || cleanInput.length > 50) {
      setErrorText('Role title must be between 3 and 50 characters.')
      return
    }
    if (!/^[a-zA-Z0-9\s\-\/\#\+\.]+$/.test(cleanInput)) {
      setErrorText('Role title contains invalid characters.')
      return
    }

    // Generate a premium dynamic custom 5-stage blueprint securely
    const customBlueprint = {
      title: cleanInput,
      description: `Tailored pathway engineered specifically to accelerate your transition to becoming a qualified ${cleanInput}.`,
      stages: [
        {
          name: 'Stage 1: Core Fundamentals',
          duration: '3-4 weeks',
          skills: [
            { id: `custom-s1-1`, name: `${cleanInput} Foundations`, desc: `Acquire the elementary prerequisites and concepts for ${cleanInput}.` },
            { id: `custom-s1-2`, name: 'Terminal Scripting & OS Tools', desc: 'Master environment configurations, paths, files, and core tools.' },
            { id: `custom-s1-3`, name: 'System Design Logic', desc: 'Establish computational and architectural principles.' }
          ]
        },
        {
          name: 'Stage 2: Core Engineering',
          duration: '4 weeks',
          skills: [
            { id: `custom-s2-1`, name: 'Core Language Syntax', desc: 'Select the primary tool stack programming language and master its libraries.' },
            { id: `custom-s2-2`, name: 'Workflow Controls (Git)', desc: 'Adopt collaborative pull requests, branches, and code controls.' },
            { id: `custom-s2-3`, name: 'Data Flow Orchestration', desc: 'Implement structured databases and query methods securely.' }
          ]
        },
        {
          name: 'Stage 3: Advanced Architectures',
          duration: '4-5 weeks',
          skills: [
            { id: `custom-s3-1`, name: 'Framework Configurations', desc: `Incorporate the leading standard frameworks for ${cleanInput} setups.` },
            { id: `custom-s3-2`, name: 'Security Paradigms', desc: 'Ensure data protections, access validations, and credential safety.' },
            { id: `custom-s3-3`, name: 'Client-Server API Integration', desc: 'Develop data APIs with modern endpoints and payload handling.' }
          ]
        },
        {
          name: 'Stage 4: Real-world Applications',
          duration: '3 weeks',
          skills: [
            { id: `custom-s4-1`, name: 'Full Prototype Capstone', desc: 'Build an end-to-end production-grade project showcasing all tools.' },
            { id: `custom-s4-2`, name: 'Reliability & Exception Maps', desc: 'Implement clean error boundaries, unit tests, and validation layers.' },
            { id: `custom-s4-3`, name: 'Optimization & Caching', desc: 'Tune operations, monitor lag, and apply high-speed caching indexes.' }
          ]
        },
        {
          name: 'Stage 5: Deployment & Job Readiness',
          duration: '4 weeks',
          skills: [
            { id: `custom-s5-1`, name: 'Cloud Infrastructure hosting', desc: 'Host containerized instances securely on target AWS, Google, or GCP layers.' },
            { id: `custom-s5-2`, name: 'ATS Optimized Profile', desc: 'Refine technical terms and experience summaries in your resume.' },
            { id: `custom-s5-3`, name: 'Mock Technical Rounds', desc: 'Practice star storytelling structures and coordinate live feedback sessions.' }
          ]
        }
      ]
    }

    setCustomRoadmap(customBlueprint)
    setActiveTrack('custom')
    setSuccessText(`Custom roadmap for "${cleanInput}" generated successfully!`)
  }

  // Calculate progress stats
  const currentBlueprint = activeTrack === 'custom' && customRoadmap ? customRoadmap : roadmapBlueprints[activeTrack] || roadmapBlueprints.frontend
  const allSkills = currentBlueprint.stages.flatMap(s => s.skills)
  const totalSkillsCount = allSkills.length
  const completedCount = allSkills.filter(s => completedSkills[s.id]).length
  const progressPercent = totalSkillsCount > 0 ? Math.round((completedCount / totalSkillsCount) * 100) : 0

  const handleConsultAI = (stageName, skillName) => {
    const prompt = `I am using the Career Roadmap for "${currentBlueprint.title}". Can you explain the milestones under "${stageName}", specifically focusing on how to master "${skillName}" and recommending some practical steps?`
    navigate('/messages', { state: { initialMessage: prompt } })
  }

  if (!loading && !currentUser) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">Career Roadmap</h3>
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm bg-gray-50 dark:bg-gray-900">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Unlock personalized step-by-step career path planners, progression tracking metrics, and professional AI-assisted learning resources.
            </p>
            <Link to="/login" className="inline-flex items-center px-5 py-2.5 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 transition">
              Log in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 text-gray-800 dark:text-gray-200">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <h3 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">AI Career Roadmap Planner</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Establish tailored learning milestones, track visual progress, and consult AI on core career skills.
          </p>
        </div>

        {/* Dynamic Controls Grid */}
        <div className="grid lg:grid-cols-[320px_1fr] gap-8 items-start">
          
          {/* Sidebar Planner selection */}
          <aside className="space-y-6">
            
            {/* Standard tracks */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-xs">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Standard Tracks</h4>
              <div className="space-y-2">
                {Object.keys(roadmapBlueprints).map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveTrack(key)
                      setErrorText('')
                      setSuccessText('')
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                      activeTrack === key
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {roadmapBlueprints[key].title}
                  </button>
                ))}
                
                {customRoadmap && (
                  <button
                    onClick={() => {
                      setActiveTrack('custom')
                      setErrorText('')
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                      activeTrack === 'custom'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    ⭐ Custom: {customRoadmap.title}
                  </button>
                )}
              </div>
            </div>

            {/* Custom Roadmap Generator */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-xs">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Build Custom Roadmap</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Enter any specialized role to generate a personalized timeline.</p>
              
              <form onSubmit={generateCustomRoadmap} className="space-y-3">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="e.g. Cloud Security Engineer"
                  maxLength={50}
                  className="w-full text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-green-500"
                />
                
                <button
                  type="submit"
                  className="w-full rounded-md bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 transition"
                >
                  Generate Plan
                </button>
              </form>

              {errorText && <p className="text-xs text-red-600 mt-2 font-medium">{errorText}</p>}
              {successText && <p className="text-xs text-green-600 mt-2 font-medium">{successText}</p>}
            </div>

            {/* Status overview cards */}
            <div className="bg-linear-to-br from-green-50 to-green-100/50 dark:from-gray-900 dark:to-gray-900/50 border border-green-200/50 dark:border-gray-800 rounded-xl p-5 shadow-xs">
              <h4 className="font-semibold text-green-800 dark:text-green-400 text-sm mb-3">Progression Stats</h4>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600 dark:text-gray-400">Total Milestones</span>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{totalSkillsCount}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-gray-600 dark:text-gray-400">Completed Skills</span>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{completedCount}</span>
              </div>
              
              {/* Progress bar */}
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200 dark:bg-green-900/50 dark:text-green-300">
                      Progress
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-green-700 dark:text-green-400">
                      {progressPercent}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2.5 text-xs flex rounded-full bg-gray-200 dark:bg-gray-800">
                  <div
                    style={{ width: `${progressPercent}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-600 transition-all duration-500"
                  />
                </div>
              </div>
            </div>

          </aside>

          {/* Central Timelines */}
          <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-xs">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-5 mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{currentBlueprint.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm leading-relaxed">{currentBlueprint.description}</p>
            </div>

            {/* Stages Stack */}
            <div className="relative border-l-2 border-green-200 dark:border-gray-800 ml-3 pl-6 space-y-8">
              {currentBlueprint.stages.map((stage, sIdx) => (
                <div key={stage.name} className="relative">
                  
                  {/* Timeline dot */}
                  <span className="absolute -left-[31px] top-1.5 flex h-4 h-4 rounded-full bg-green-600 ring-4 ring-white dark:ring-gray-900" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">{stage.name}</h4>
                    <span className="inline-flex text-xs px-2.5 py-1 rounded-full font-semibold bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border border-green-200/40 dark:border-green-800/45 self-start">
                      ⏱️ {stage.duration}
                    </span>
                  </div>

                  {/* Skills Grid */}
                  <div className="grid gap-4 mt-2">
                    {stage.skills.map((skill) => {
                      const isDone = completedSkills[skill.id] || false
                      return (
                        <div
                          key={skill.id}
                          className={`flex items-start gap-4 p-4 rounded-lg border transition ${
                            isDone
                              ? 'border-green-200 bg-green-50/20 dark:border-green-900/30 dark:bg-green-950/10'
                              : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 bg-white dark:bg-gray-900'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isDone}
                            id={`check-${skill.id}`}
                            onChange={() => toggleSkill(skill.id)}
                            className="mt-1 h-4 w-4 rounded-sm border-gray-300 dark:border-gray-700 text-green-600 focus:ring-green-500 cursor-pointer"
                          />
                          
                          <div className="flex-1 min-w-0">
                            <label
                              htmlFor={`check-${skill.id}`}
                              className={`font-semibold text-sm cursor-pointer select-none transition ${
                                isDone ? 'text-green-800 dark:text-green-400 line-through' : 'text-gray-900 dark:text-gray-100'
                              }`}
                            >
                              {skill.name}
                            </label>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                              {skill.desc}
                            </p>
                          </div>

                          <button
                            onClick={() => handleConsultAI(stage.name, skill.name)}
                            className="shrink-0 text-xs px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold text-gray-700 dark:text-gray-300 transition"
                            title="Consult AI about this skill"
                          >
                            🤖 Ask AI
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

          </section>

        </div>

      </div>
    </div>
  )
}

export default CareerRoadmap
