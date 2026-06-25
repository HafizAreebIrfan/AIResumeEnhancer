require("dotenv").config();
const OpenAI = require("openai");
const client = new OpenAI({
  apiKey: process.env.VITE_API,
  dangerouslyAllowBrowser: true,
});

const CallAPI = async (req, res) => {
  try {
    const { resumeurl, jobdescurl, jobdesctext } = req.body;
    const prompt = `
    You are a senior technical recruiter for a leading tech company.
    Your task is to analyze the resume and job description, then return ONLY a valid JSON object.
    Output JSON structure (strictly follow this shape, fill with actual values):
    {
      "candidatedetails": {
        "name": "string",
        "email": "string",
        "phoneno": "string",
        "city": "string",
        "country": "string",
        "linkedin": "string",
        "github": "string",
        "website": "string"
      },
      "summary": "string",
      "matchScore": {
        "overall": number,
        "subscores": {
          "clarity": { "score": number, "description": "string" },
          "grammar": { "score": number, "description": "string" },
          "sections": { "score": number, "description": "string" },
          "impact": { "score": number, "description": "string" }
        }
      },
      "atsFormat": {
        "isAtsFriendly": "Yes/No",
        "suggestions": ["string"]
      },
      "technicalSkills": {
        "listedSkills": ["string"],
        "suggestedSkills": ["string"]
      },
      "detailedAnalysis": {
        "strengths": ["string"],
        "areasForImprovement": ["string"]
      },
      "enhancedresume": {
        "corrections": [
          {
            "section": "string",
            "item": "string",
            "original": "string",
            "correction": "string"
          }
        ]
      }
    }
    Rules:
    - Don't be strict in ATS friendly yes/no. If its very much necessary for job application then give NO, otherwise yes, with necessary suggestions.
    - Scores should be from out of 100.
    - Focus mainly on **relevance to the job description** when giving scores and feedback.
    - Highlight only **important strengths and weaknesses** that affect job fit; ignore trivial grammar/formatting issues unless they seriously harm clarity.
    - ATS suggestions should be **practical and minimal**, not overly strict.
    - Suggested skills should only include **key missing skills from the job description**, not every possible tech skill.
    - Keep tone professional, concise, and recruiter-like.
    - Do NOT include explanations, markdown, or text outside of the JSON.
    - Output must be strictly valid JSON.
    `;
    const jobdescription = jobdescurl ? jobdescurl : jobdesctext;
    const inputtype = jobdescurl ? "input_file" : "input_text";
    const jobcontent =
      inputtype === "input_file"
        ? {
            type: "input_file",
            file_url: jobdescription,
          }
        : {
            type: "input_text",
            text: jobdescription,
          };
    const callapi = await client.responses.create({
      model: "gpt-5-2025-08-07",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: prompt,
            },
            {
              type: "input_file",
              file_url: resumeurl,
            },
            jobcontent,
          ],
        },
      ],
      reasoning: { effort: "medium" },
    });
    const parseresponse = callapi.output[1].content[0]?.text || "{}";
    const parsed = JSON.parse(parseresponse);
    res.status(200).json(parsed);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};
const CallInterviewAPI = async (req, res) => {
  try {
    const { resumeurl, jobdescurl, jobdesctext } = req.body;
    const interviewprompt = `You are a senior technical recruiter for a leading tech company.
        Your task is to ask interview questions according to job description and candidate resume.
        Questions must be legit, scenario based, skill based according to resume and job description requirement.
        Return only valid JSON object
        Output JSON structure (strictly follow this shape, fill with actual values):
            {
              interviewquestions: {
                questions: "Array",
              },
            },
            Rules:
            - Give questions in array.
            - Keep tone professional, concise, and recruiter-like.
            - Do NOT include explanations, markdown, or text outside of the JSON.
            - Output must be strictly valid JSON.
            - Give 20 questions.
            `;
    const jobdescription = jobdescurl ? jobdescurl : jobdesctext;
    const inputtype = jobdescurl ? "input_file" : "input_text";
    const jobcontent =
      inputtype === "input_file"
        ? {
            type: "input_file",
            file_url: jobdescription,
          }
        : {
            type: "input_text",
            text: jobdescription,
          };
    const response = await client.responses.create({
      model: "gpt-5-2025-08-07",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: interviewprompt,
            },
            {
              type: "input_file",
              file_url: resumeurl,
            },
            jobcontent,
          ],
        },
      ],
      reasoning: { effort: "high" },
    });
    const parseresponse = JSON.parse(response.output[1].content[0].text);
    res.status(200).json(parseresponse);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};
module.exports = { CallAPI, CallInterviewAPI };
