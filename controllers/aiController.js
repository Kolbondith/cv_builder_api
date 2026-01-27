// Controller for enhancing a resume's professional summary
// POST: /api/ai/enhance-pro-sum

import ai from "../config/ai.js";
import Resume from "../models/ResumeModel.js";

// Optional: basic cleanup to avoid empty/whitespace-only inputs
const normalizeText = (text) => String(text || "").trim();

export const enhanceProfessionalSummary = async (req, res) => {
    try {
        const userContent = normalizeText(req.body?.userContent);

        if (!userContent) {
            return res.status(400).json({ message: "Missing required field: userContent" });
        }

        // Prompt: strong + safe + recruiter-friendly
        const prompt = `
                    You are an expert resume writer.
                    Rewrite and enhance the professional summary below.

                    Goals:
                    - Keep it concise and professional (3–6 lines)
                    - Clear value proposition + role focus
                    - Quantify impact if possible (only if implied by the text; do not invent numbers)
                    - Remove fluff, fix grammar, improve clarity
                    - Use strong action language
                    - Keep it truthful to the user's input

                    Return ONLY the improved professional summary text (no bullets, no headings).

                    User professional summary:
                    """${userContent}"""
                    `.trim();

        // --- Call your AI SDK ---
        // Assumption: ai.models.generateContent returns an object that contains text output.
        // Adjust the "extractText" logic below if your SDK returns a different structure.
        const result = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
        });

        const enhanced = extractText(result);

        if (!enhanced) {
            return res.status(502).json({
                message: "AI did not return a valid summary. Please try again.",
            });
        }

        return res.status(200).json({
            original: userContent,
            enhancedContent: enhanced,
        });
    } catch (error) {
        console.error("enhanceProfessionalSummary error:", error);
        return res.status(400).json({
            message: "Server error while enhancing professional summary.",
        });
    }
};

export const enhanceJobDescription = async (req, res) => {
    try {
        const userContent = normalizeText(req.body?.userContent);

        if (!userContent) {
            return res.status(400).json({ message: "Missing required field: userContent" });
        }

        // Prompt: strong + safe + recruiter-friendly
        const prompt = `
                   You are an expert resume writer and hiring manager.
                    Rewrite and enhance the JOB DESCRIPTION below.

                    Goals:
                    - Keep the meaning the same (do NOT invent requirements, tools, or numbers)
                    - Fix grammar and improve clarity
                    - Make it professional, modern, and easy to read
                    - Use strong action verbs
                    - Keep it concise
                    - Produce bullet points using "•" only (no stars, no emojis, no dashes)

                    Structure to follow:

                    1) Role Overview (2–3 lines)

                    2) Key Responsibilities
                    • 5–10 bullet points

                    3) Requirements
                    • 5–10 bullet points

                    4) Nice-to-Have (Optional)
                    • 3–6 bullet points

                    Return ONLY the improved job description text.

                    Original Job Description:
                    """${userContent}"""
                    `.trim();

        // --- Call your AI SDK ---
        // Assumption: ai.models.generateContent returns an object that contains text output.
        // Adjust the "extractText" logic below if your SDK returns a different structure.
        const result = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
        });

        const enhanced = extractText(result);

        if (!enhanced) {
            return res.status(502).json({
                message: "AI did not return a valid summary. Please try again.",
            });
        }

        return res.status(200).json({
            original: userContent,
            enhancedContent: enhanced,
        });
    } catch (error) {
        console.error("enhanceProfessionalSummary error:", error);
        return res.status(400).json({
            message: "Server error while enhancing professional summary.",
        });
    }
};

function safeParseJSON(text) {
    try {
        return JSON.parse(text);
    } catch {
        const cleaned = text.replace(/```json|```/g, "").trim();
        return JSON.parse(cleaned);
    }
}

export const uploadResume = async (req, res) => {
    try {
        const { resumeText, title } = req.body;
        const userId = req.userId;

        if (!resumeText) {
            return res.status(400).json({ message: "Missing resumeText" });
        }

        // --- AI PROMPT (MATCHES ResumeSchema) ---
        const prompt = `
                SYSTEM:
                You are an expert AI agent for resume parsing.
                Return ONLY valid JSON.
                No markdown. No explanations.

                JSON schema:
                {
                "personal_info": {
                    "full_name": string,
                    "profession": string | null,
                    "email": string | null,
                    "phone": string | null,
                    "location": string | null,
                    "linkedin": string | null,
                    "website": string | null,
                    "professional_summary": string | null
                },
                "skills": string[],
                "experience": {
                    "company": string,
                    "position": string,
                    "start_date": string | null,
                    "end_date": string | null,
                    "description": string | null,
                    "is_current": boolean
                }[],
                "education": {
                    "institution": string,
                    "degree": string | null,
                    "field": string | null,
                    "graduation_date": string | null,
                    "gpa": string | null
                }[]
                }

                USER:
                Extract data from this resume:
                """
                ${resumeText}
                """
                `;

        // --- CALL GEMINI ---
        const result = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
        });

        const rawText = result.text;

        // --- PARSE AI OUTPUT ---
        let resumeData;
        try {
            resumeData = safeParseJSON(rawText);
        } catch (err) {
            console.error("Gemini JSON error:", rawText);
            return res.status(502).json({
                message: "AI returned invalid JSON. Please retry.",
            });
        }

        // --- MINIMUM VALIDATION ---
        if (
            !resumeData.personal_info?.full_name ||
            !Array.isArray(resumeData.skills)
        ) {
            return res.status(502).json({
                message: "AI response missing required fields.",
            });
        }

        // --- SAVE TO DATABASE ---
        const newResume = await Resume.create({
            userId,
            title: title || "Untitled Resume",
            skills: resumeData.skills,
            personal_info: resumeData.personal_info,
            experience: resumeData.experience || [],
            education: resumeData.education || [],
        });

        return res.status(200).json({
            resume_id: newResume._id,
        });

    } catch (error) {
        console.error("uploadResume error:", error);
        return res.status(500).json({
            message: "Server error while uploading resume.",
        });
    }
};

// -------- Helpers --------
// Tries to extract plain text from different possible SDK response shapes.
function extractText(result) {
    if (!result) return "";

    // Common patterns:
    // 1) result.text
    if (typeof result.text === "string") return result.text.trim();

    // 2) result.response.text()
    if (result.response && typeof result.response.text === "function") {
        const t = result.response.text;
        if (typeof t === "string") return t.trim();
    }

    // 3) result.candidates?.[0]?.content?.parts?.[0]?.text
    const t =
        result?.candidates?.[0]?.content?.parts
            ?.map((p) => p?.text)
            ?.filter(Boolean)
            ?.join("\n") || "";

    return String(t).trim();
}
