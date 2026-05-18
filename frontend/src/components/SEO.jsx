import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const siteUrl = "http://localhost:5173";
const defaultDescription =
  "CareerX-AI helps job seekers improve resumes, check ATS readiness, practice interviews, and get personalized career guidance.";

const pages = {
  "/": {
    title: "CareerX-AI | AI Career Guidance and ATS Resume Tools",
    description: defaultDescription,
  },
  "/ats-score": {
    title: "ATS Resume Score | CareerX-AI",
    description:
      "Upload a resume, compare it with a job description, and get ATS scoring, keyword gaps, and priority fixes.",
  },
  "/resume-optimizer": {
    title: "Resume Optimizer | CareerX-AI",
    description:
      "Optimize your resume for a target job description with ATS-focused recommendations and rewrite guidance.",
  },
  "/job-recommender": {
    title: "Job and Recruiter Matching | CareerX-AI",
    description:
      "Match candidate skills to role tracks or rank multiple resumes against a recruiter job description.",
  },
  "/interview-assistant": {
    title: "Interview Assistant | CareerX-AI",
    description:
      "Generate role-specific interview questions and get structured feedback on practice answers.",
  },
  "/messages": {
    title: "Career Guidance Chat | CareerX-AI",
    description:
      "Chat with CareerX-AI for personalized resume, interview, and job-search guidance.",
  },
  "/profile": {
    title: "Profile | CareerX-AI",
    description:
      "Manage your CareerX-AI profile, skills, experience, and education.",
  },
  "/applications": {
    title: "My Applications | CareerX-AI",
    description:
      "Track job applications, statuses, and follow-up notes in one place.",
  },
  "/bookmarks": {
    title: "My Bookmarks | CareerX-AI",
    description: "Save roles you want to revisit and keep key details handy.",
  },
  "/edit-resume": {
    title: "Resume Builder | CareerX-AI",
    description:
      "Save your resume profile content so CareerX-AI can personalize guidance and interview preparation.",
  },
  "/about": {
    title: "About CareerX-AI",
    description:
      "Learn how CareerX-AI supports ATS resume optimization, interview preparation, and career guidance.",
  },
  "/login": {
    title: "Log In | CareerX-AI",
    description:
      "Log in to CareerX-AI to access saved reports, profile data, and personalized career guidance.",
  },
  "/signup": {
    title: "Create Account | CareerX-AI",
    description:
      "Create a CareerX-AI account to save ATS reports, optimize resumes, and practice interviews.",
  },
};

function setMeta(name, content, attribute = "name") {
  if (!content) return;

  let element = document.head.querySelector(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function setLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

function SEO() {
  const location = useLocation();

  useEffect(() => {
    const page = pages[location.pathname] || {
      title: "CareerX-AI",
      description: defaultDescription,
    };
    const canonicalUrl = `${siteUrl}${location.pathname === "/" ? "" : location.pathname}`;

    document.title = page.title;
    setMeta("description", page.description);
    setMeta("robots", "index, follow");
    setMeta("og:title", page.title, "property");
    setMeta("og:description", page.description, "property");
    setMeta("og:type", "website", "property");
    setMeta("og:url", canonicalUrl, "property");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", page.title);
    setMeta("twitter:description", page.description);
    setLink("canonical", canonicalUrl);
  }, [location.pathname]);

  return null;
}

export default SEO;
