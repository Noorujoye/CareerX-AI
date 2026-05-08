package com.noorain.login_system.ats.scoring;

import com.noorain.login_system.ats.dto.AtsScoreResponse;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class AtsScoringEngine {

    private static final Pattern BULLET_PATTERN = Pattern.compile("(^|\\n)\\s*(?:[-*]|\\u2022)\\s+", Pattern.MULTILINE);
    private static final Pattern METRIC_PATTERN = Pattern.compile("\\b(\\d{1,3}(?:[.,]\\d{1,2})?%|\\$\\s?\\d+|\\d+\\s?(?:x|X)|\\d{4}|\\d+(?:[.,]\\d+)?)\\b");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}", Pattern.CASE_INSENSITIVE);
    private static final Pattern PHONE_PATTERN = Pattern.compile("\\b(?:\\+?\\d{1,3}[-. ]?)?(?:\\(?\\d{3}\\)?[-. ]?)\\d{3}[-. ]?\\d{4}\\b");
    private static final Pattern URL_PATTERN = Pattern.compile("\\bhttps?://\\S+|\\bwww\\.\\S+", Pattern.CASE_INSENSITIVE);
    private static final Pattern SECTION_HEADING_PATTERN = Pattern.compile("(^|\\n)\\s*(experience|work experience|education|skills|technical skills|projects|certifications|summary|objective|achievements)\\s*(:)?\\s*(\\n|$)", Pattern.CASE_INSENSITIVE);

    private static final Set<String> ACTION_VERBS = Set.of(
            "built", "implemented", "developed", "designed", "created", "led", "managed", "owned", "delivered",
            "improved", "optimized", "reduced", "increased", "scaled", "automated", "integrated", "deployed",
            "refactored", "migrated", "collaborated", "analyzed", "tested", "maintained"
    );

    public AtsScoreResponse score(String resumeText, String jobDescriptionText) {
        String resume = resumeText == null ? "" : resumeText;
        String jd = jobDescriptionText == null ? "" : jobDescriptionText;

        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("resumeCharCount", resume.length());
        metadata.put("jobDescriptionProvided", !jd.isBlank());

        List<String> warnings = new ArrayList<>();
        if (resume.isBlank()) {
            warnings.add(
                    "We couldn't extract readable text from your resume. If it is a scanned PDF, try exporting it with selectable text.");
        }

        int parsing = scoreParsing(resume, warnings, metadata);
        int structure = scoreStructure(resume, warnings, metadata);
        int readability = scoreReadability(resume, warnings, metadata);
        int experienceQuality = scoreExperienceQuality(resume, warnings, metadata);

        KeywordReport keywordReport = buildKeywordReport(resume, jd);
        metadata.put("jdKeywordCount", keywordReport.topJobKeywords.size());
        metadata.put("keywordHits", keywordReport.matchedKeywords.size());

        int keywordsGeneral = keywordReport.jobDescriptionProvided ? keywordReport.keywordScore : 70;
        int keywordMatch = keywordReport.jobDescriptionProvided ? keywordReport.matchScore : 0;

        Map<String, Integer> categoryScores = new LinkedHashMap<>();
        categoryScores.put("parsing", parsing);
        categoryScores.put("structure", structure);
        categoryScores.put("keywords", keywordsGeneral);
        categoryScores.put("experience", experienceQuality);
        categoryScores.put("readability", readability);

        int overall = (int) Math.round(
            parsing * 0.20 +
                structure * 0.22 +
                keywordsGeneral * 0.28 +
                experienceQuality * 0.20 +
                readability * 0.10);
        overall = clamp(overall);

        Integer matchScore = null;
        if (keywordReport.jobDescriptionProvided) {
            matchScore = clamp((int) Math.round(
                parsing * 0.15 +
                    structure * 0.15 +
                    keywordMatch * 0.45 +
                    experienceQuality * 0.15 +
                    readability * 0.10));
        }

        List<String> recommendations = buildRecommendations(categoryScores, keywordReport.missingKeywords, jd);
        List<String> priorityFixes = buildPriorityFixes(categoryScores, keywordReport, resume);

        String summary = buildSummary(overall, matchScore, keywordReport.jobDescriptionProvided);

        return AtsScoreResponse.builder()
                .overallScore(overall)
                .matchScore(matchScore)
                .summary(summary)
                .categoryScores(categoryScores)
                .warnings(warnings)
                .missingKeywords(keywordReport.missingKeywords)
                .matchedKeywords(keywordReport.matchedKeywords)
                .topJobKeywords(keywordReport.topJobKeywords)
                .recommendations(recommendations)
                .priorityFixes(priorityFixes)
                .metadata(metadata)
                .build();
    }

    private static String buildSummary(int overall, Integer matchScore, boolean jdProvided) {
        if (jdProvided && matchScore != null) {
            if (matchScore >= 80) return "Strong job match. Small tweaks can improve ranking.";
            if (matchScore >= 60) return "Moderate job match. Add missing keywords and sharpen impact bullets.";
            return "Weak job match. Align your resume to the job description and improve structure.";
        }

        if (overall >= 80) return "Strong ATS profile. Minor improvements can make it even better.";
        if (overall >= 60) return "Decent ATS profile. A few targeted changes can improve ranking.";
        return "Low ATS profile. Focus on structure, keywords, and readable formatting.";
    }

    private static int scoreExperienceQuality(String resume, List<String> warnings, Map<String, Object> metadata) {
        if (resume == null || resume.isBlank()) return 0;

        int score = 100;

        int metricCount = countMetrics(resume);
        metadata.put("metricCount", metricCount);
        if (metricCount == 0) {
            score -= 25;
            warnings.add("Add measurable impact (numbers, %, $, scale) to your bullet points.");
        } else if (metricCount < 3) {
            score -= 10;
        }

        int actionVerbCount = countActionVerbs(resume);
        metadata.put("actionVerbCount", actionVerbCount);
        if (actionVerbCount < 3) {
            score -= 15;
            warnings.add("Use strong action verbs (built, led, improved, optimized) in bullets.");
        }

        boolean hasProjects = containsAny(resume.toLowerCase(Locale.ROOT), "projects");
        if (!hasProjects) {
            score -= 8;
        }

        return clamp(score);
    }

    private static List<String> buildPriorityFixes(Map<String, Integer> categoryScores, KeywordReport keywordReport, String resume) {
        List<String> fixes = new ArrayList<>();

        if (keywordReport.jobDescriptionProvided && !keywordReport.missingKeywords.isEmpty()) {
            fixes.add("Add the top missing keywords (truthfully): " + String.join(", ", keywordReport.missingKeywords.subList(0, Math.min(10, keywordReport.missingKeywords.size()))));
        }

        if (categoryScores.getOrDefault("experience", 0) < 75) {
            fixes.add("Rewrite 3-5 bullets to include metrics (%, $, time saved, scale, users). Aim for 40–60% bullets with numbers.");
        }

        if (categoryScores.getOrDefault("structure", 0) < 75) {
            fixes.add("Add clear headings and a dedicated Skills section with your core stack.");
        }

        if (resume != null && !resume.isBlank()) {
            boolean hasEmail = EMAIL_PATTERN.matcher(resume).find();
            boolean hasPhone = PHONE_PATTERN.matcher(resume).find();
            if (!hasEmail) fixes.add("Add a professional email in the header.");
            if (!hasPhone) fixes.add("Add a phone number in the header.");

            boolean hasLink = URL_PATTERN.matcher(resume).find();
            if (!hasLink) fixes.add("Add a LinkedIn/GitHub/portfolio link (if applicable). ");
        }

        if (categoryScores.getOrDefault("readability", 0) < 75) {
            fixes.add("Use short lines and consistent bullets; avoid dense paragraphs and heavy separators.");
        }

        return fixes.subList(0, Math.min(6, fixes.size()));
    }

    private static KeywordReport buildKeywordReport(String resume, String jd) {
        boolean jdProvided = jd != null && !jd.isBlank();

        if (!jdProvided) {
            return new KeywordReport(false, 70, 0, List.of(), List.of(), List.of());
        }

        String resumeLower = (resume == null ? "" : resume).toLowerCase(Locale.ROOT);
        Map<String, Integer> jdFreq = extractKeywordFrequencies(jd);

        List<String> ranked = jdFreq.entrySet().stream()
                .sorted((a, b) -> Integer.compare(b.getValue(), a.getValue()))
                .map(Map.Entry::getKey)
                .toList();

        List<String> topJobKeywords = ranked.subList(0, Math.min(25, ranked.size()));

        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();
        int possibleWeight = 0;
        int matchedWeight = 0;

        for (String kw : topJobKeywords) {
            int w = Math.min(5, Math.max(1, jdFreq.getOrDefault(kw, 1)));
            possibleWeight += w;

            if (containsKeyword(resumeLower, kw)) {
                matched.add(kw);
                matchedWeight += w;
            } else {
                missing.add(kw);
            }
        }

        int keywordScore = possibleWeight == 0 ? 70 : clamp((int) Math.round(20 + (matchedWeight * 80.0 / possibleWeight)));
        int matchScore = possibleWeight == 0 ? 0 : clamp((int) Math.round(matchedWeight * 100.0 / possibleWeight));

        return new KeywordReport(true, keywordScore, matchScore, missing, matched, topJobKeywords);
    }

    private static boolean containsKeyword(String haystackLower, String keyword) {
        if (keyword.contains(" ")) {
            return haystackLower.contains(keyword);
        }
        // word boundary-ish to reduce false positives
        return Pattern.compile("\\b" + Pattern.quote(keyword) + "\\b").matcher(haystackLower).find();
    }

    private static Map<String, Integer> extractKeywordFrequencies(String text) {
        String lower = text.toLowerCase(Locale.ROOT);
        String cleaned = lower.replaceAll("[^a-z0-9+.#\\s]", " ");
        String normalized = cleaned.replaceAll("\\s+", " ").trim();

        Map<String, Integer> freq = new HashMap<>();

        // multi-word tech phrases first
        for (String phrase : COMMON_PHRASES) {
            String p = phrase.toLowerCase(Locale.ROOT);
            int count = countOccurrences(normalized, p);
            if (count > 0) {
                freq.put(p, count);
            }
        }

        // single tokens
        for (String token : normalized.split(" ")) {
            if (token.length() < 3) continue;
            if (STOPWORDS.contains(token)) continue;
            freq.merge(token, 1, Integer::sum);
        }

        // de-emphasize overly generic tokens
        for (String generic : GENERIC_WORDS) {
            freq.remove(generic);
        }

        return freq;
    }

    private static int countOccurrences(String text, String needle) {
        int count = 0;
        int idx = 0;
        while ((idx = text.indexOf(needle, idx)) >= 0) {
            count++;
            idx += needle.length();
        }
        return count;
    }

    private static int countMetrics(String text) {
        if (text == null || text.isBlank()) return 0;
        int c = 0;
        Matcher m = METRIC_PATTERN.matcher(text);
        while (m.find()) c++;
        return c;
    }

    private static int countActionVerbs(String text) {
        if (text == null || text.isBlank()) return 0;
        String lower = text.toLowerCase(Locale.ROOT);
        int count = 0;
        for (String verb : ACTION_VERBS) {
            if (Pattern.compile("\\b" + Pattern.quote(verb) + "\\b").matcher(lower).find()) {
                count++;
            }
        }
        return count;
    }

    private static int scoreParsing(String resume, List<String> warnings, Map<String, Object> metadata) {
        int score = 100;
        int printable = countPrintable(resume);
        metadata.put("printableCharCount", printable);

        if (resume.isBlank()) {
            return 0;
        }
        if (printable < 200) {
            score -= 45;
            warnings.add("Very little text was extracted. ATS may not read this resume correctly.");
        }
        if (resume.length() > 0 && (double) printable / resume.length() < 0.65) {
            score -= 20;
            warnings.add("Resume text contains many non-standard characters; consider exporting to a cleaner PDF.");
        }
        return clamp(score);
    }

    private static int scoreStructure(String resume, List<String> warnings, Map<String, Object> metadata) {
        int score = 100;
        String lower = resume.toLowerCase(Locale.ROOT);

        int bulletCount = countBullets(resume);
        metadata.put("bulletCount", bulletCount);
        if (bulletCount < 3) {
            score -= 20;
            warnings.add("Add more bullet points to describe impact and responsibilities.");
        }

        int sectionHits = 0;
        sectionHits += containsAny(lower, "experience", "work experience") ? 1 : 0;
        sectionHits += containsAny(lower, "education") ? 1 : 0;
        sectionHits += containsAny(lower, "skills", "technical skills") ? 1 : 0;
        sectionHits += containsAny(lower, "projects") ? 1 : 0;
        metadata.put("sectionHits", sectionHits);

        int headingCount = countSectionHeadings(resume);
        metadata.put("sectionHeadingCount", headingCount);

        if (sectionHits <= 1 || headingCount < 2) {
            score -= 30;
            warnings.add("Add clear section headings like Experience, Skills, Projects, and Education.");
        } else if (sectionHits == 2) {
            score -= 12;
        }

        return clamp(score);
    }

    private static int scoreReadability(String resume, List<String> warnings, Map<String, Object> metadata) {
        int score = 100;
        int avgLineLen = averageLineLength(resume);
        metadata.put("avgLineLength", avgLineLen);

        if (avgLineLen > 140) {
            score -= 25;
            warnings.add("Long lines detected. Use bullets and shorter lines for ATS readability.");
        }

        if (resume.contains("|")) {
            score -= 5;
        }
        return clamp(score);
    }

    private static int scoreKeywords(
            String resume,
            String jd,
            List<String> missingKeywords,
            List<String> warnings,
            Map<String, Object> metadata) {
        if (resume.isBlank()) {
            return 0;
        }

        String resumeLower = resume.toLowerCase(Locale.ROOT);

        if (jd == null || jd.isBlank()) {
            warnings.add(
                    "Tip: Paste a job description for more accurate keyword scoring and missing keyword suggestions.");
            return 70;
        }

        Set<String> jdKeywords = extractKeywords(jd);
        metadata.put("jdKeywordCount", jdKeywords.size());

        if (jdKeywords.isEmpty()) {
            return 70;
        }

        int hit = 0;
        for (String kw : jdKeywords) {
            if (resumeLower.contains(kw)) {
                hit++;
            } else {
                missingKeywords.add(kw);
            }
        }

        metadata.put("keywordHits", hit);

        double ratio = (double) hit / jdKeywords.size();
        int score = (int) Math.round(25 + ratio * 75);
        return clamp(score);
    }

    private static List<String> buildRecommendations(Map<String, Integer> categoryScores, List<String> missingKeywords,
            String jd) {
        List<String> recs = new ArrayList<>();

        if (categoryScores.getOrDefault("structure", 0) < 75) {
            recs.add("Use clear section headings (Experience, Skills, Education) and bullet points.");
        }
        if (categoryScores.getOrDefault("readability", 0) < 75) {
            recs.add("Prefer simple formatting: consistent bullets, avoid dense paragraphs, keep lines short.");
        }
        if (categoryScores.getOrDefault("parsing", 0) < 75) {
            recs.add("Export your resume to a text-readable PDF (avoid scanned images).");
        }
        if (jd != null && !jd.isBlank()) {
            if (!missingKeywords.isEmpty()) {
                recs.add("Add relevant keywords from the job description (only if truthful). Start with: "
                        + String.join(", ", missingKeywords.subList(0, Math.min(8, missingKeywords.size()))));
            }
        } else {
            recs.add("Paste a job description to get missing keyword suggestions.");
        }

        if (recs.isEmpty()) {
            recs.add("Looks good. Tune bullet points to highlight measurable impact.");
        }

        return recs;
    }

    private static Set<String> extractKeywords(String text) {
        String lower = text.toLowerCase(Locale.ROOT);
        String cleaned = lower.replaceAll("[^a-z0-9+.#\\s]", " ");
        String[] parts = cleaned.split("\\s+");

        Set<String> keywords = new LinkedHashSet<>();
        for (String p : parts) {
            if (p.length() < 3)
                continue;
            if (STOPWORDS.contains(p))
                continue;
            keywords.add(p);
            if (keywords.size() >= 40)
                break;
        }
        return keywords;
    }

    private static boolean containsAny(String lower, String... needles) {
        for (String n : needles) {
            if (lower.contains(n))
                return true;
        }
        return false;
    }

    private static int countBullets(String text) {
        return (int) BULLET_PATTERN.matcher(text).results().count();
    }

    private static int averageLineLength(String text) {
        if (text == null || text.isBlank())
            return 0;
        String[] lines = text.split("\\R");
        int sum = 0;
        int count = 0;
        for (String l : lines) {
            if (l == null)
                continue;
            String t = l.trim();
            if (t.isEmpty())
                continue;
            sum += t.length();
            count++;
        }
        return count == 0 ? 0 : (sum / count);
    }

    private static int countPrintable(String text) {
        if (text == null)
            return 0;
        int c = 0;
        for (int i = 0; i < text.length(); i++) {
            char ch = text.charAt(i);
            if (!Character.isISOControl(ch) || ch == '\n' || ch == '\r' || ch == '\t') {
                c++;
            }
        }
        return c;
    }

    private static int clamp(int v) {
        return Math.max(0, Math.min(100, v));
    }

    private static int countSectionHeadings(String text) {
        if (text == null || text.isBlank()) return 0;
        return (int) SECTION_HEADING_PATTERN.matcher(text).results().count();
    }

    private record KeywordReport(
            boolean jobDescriptionProvided,
            int keywordScore,
            int matchScore,
            List<String> missingKeywords,
            List<String> matchedKeywords,
            List<String> topJobKeywords
    ) {
    }

    private static final Set<String> STOPWORDS = Set.of(
            "and", "or", "the", "a", "an", "to", "of", "in", "for", "with", "on", "at", "by", "from",
            "is", "are", "was", "were", "be", "been", "being", "as", "this", "that", "these", "those",
            "you", "your", "we", "our", "they", "their", "them", "it", "its", "i", "me", "my");

            private static final Set<String> GENERIC_WORDS = Set.of(
                "responsibilities", "requirements", "looking", "strong", "good", "excellent", "ability", "skills",
                "years", "year", "work", "experience", "team", "teams", "using", "knowledge"
            );

            private static final List<String> COMMON_PHRASES = List.of(
                "spring boot",
                "rest api",
                "microservices",
                "unit testing",
                "integration testing",
                "test automation",
                "docker",
                "kubernetes",
                "aws",
                "azure",
                "google cloud",
                "ci cd",
                "git",
                "github",
                "mysql",
                "postgresql",
                "mongodb",
                "react",
                "node js",
                "java",
                "javascript",
                "typescript",
                "html",
                "css",
                "tailwind",
                "jwt",
                "spring security",
                "hibernate",
                "jpa"
            );
}
