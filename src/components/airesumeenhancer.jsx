import styles from "../styles/airesumeenhancer.module.css";
import { RiShiningFill } from "react-icons/ri";
import { GrScorecard } from "react-icons/gr";
import { FaPencilAlt } from "react-icons/fa";
import { FaLightbulb } from "react-icons/fa6";
import { FaUpload } from "react-icons/fa";
import { FileUploader } from "react-drag-drop-files";
import { useEffect, useState } from "react";
import pdfToText from "react-pdftotext";
import { GoogleGenAI } from "@google/genai";
import { BiLoaderAlt } from "react-icons/bi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Markdown from "react-markdown";
import favicon from "../assets/favicon.png";
import { ImCancelCircle } from "react-icons/im";

const fileTypes = ["PDF"];

export default function AIResumeEnhancer() {
  const [file, setFile] = useState(null);
  const [jobdesc, setjobdesc] = useState(null);
  const [airesponse, setairesponse] = useState("");
  const [emptyjderror, setemptyjderror] = useState(false);
  const [loader, setloader] = useState(false);
  const [resumeurl, setresumeurl] = useState("");
  const [jobdescurl, setjobdescurl] = useState("");
  const [jobdesctext, setjobdesctext] = useState("");
  const [skeletonloader, setskeletonloader] = useState(false);
  const [interviewloader, setintreviewloader] = useState(false);
  const [interviewquestions, setinterviewquesitons] = useState("");
  const [tabindex, settabindex] = useState(0);
  const [interviewbar, setinterviewbar] = useState(true);
  const [showtoast, setshowtoast] = useState(false);
  const [message, setmessage] = useState("");

  const apikey = import.meta.env.VITE_API;

  useEffect(() => {
    setskeletonloader(true);
    const retrieveresponse = localStorage.getItem("Saveresponse");
    const retrieveresumeurl = localStorage.getItem("Saveresumeurl");
    const retrievejobdesc = localStorage.getItem("Savejobdesc");
    const retrievejoburl = localStorage.getItem("Savejoburl");
    const retrieveinterviewquestions = localStorage.getItem(
      "Saveinterviewquestions"
    );
    const converttoobject = JSON.parse(retrieveresponse);
    const convertinterviewtoobject = JSON.parse(retrieveinterviewquestions);
    setshowtoast(true);
    setmessage(`No file uploadoad, ${file}`);
    if (converttoobject) {
      setresumeurl(retrieveresumeurl);
      setjobdesctext(retrievejobdesc);
      setjobdescurl(retrievejoburl);
      setairesponse(converttoobject);
    }
    if (convertinterviewtoobject) {
      setinterviewquesitons(convertinterviewtoobject);
      setinterviewbar(false);
    }
    setTimeout(() => {
      setskeletonloader(false);
    }, 3500);
  }, []);

  const handleChange = (file) => {
    setFile(file);
    setmessage(`file uploaded ${file.name}`)
    const urlreader = new FileReader();
    urlreader.onloadend = () => {
      const base64string = urlreader.result;
      setresumeurl(base64string);
      localStorage.setItem("Saveresumeurl", base64string);
    };
    if (file) {
      urlreader.readAsDataURL(file);
    }
  };
  const handlejobChange = (jobdesc) => {
    setjobdesc(jobdesc);
    if (jobdesctext === "") {
      console.log("joburl is proceed");
      const urlreader = new FileReader();
      urlreader.onloadend = () => {
        const base64string = urlreader.result;
        setjobdescurl(base64string);
        localStorage.setItem("Savejoburl", base64string);
      };
      if (jobdesc) {
        urlreader.readAsDataURL(jobdesc);
      }
    }
  };
  const handlefileupload = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    setjobdesctext(data.jobdesc);
    localStorage.setItem("Savejobdesc", data.jobdesc);
    if (file === null) {
      return;
    } else if (jobdesc === null && data.jobdesc === "") {
      setemptyjderror(true);
      return;
    }
    handleapiresponse(data);
  };
  const handleapiresponse = async (data) => {
    console.log("api called");
    const ai = new GoogleGenAI({
      apiKey: apikey,
    });
    const resumeSchema = {
      type: "OBJECT",
      properties: {
        candidatedetails: {
          type: "OBJECT",
          description:
            "Provide candidate name, email, phoneno, city, country if available. If not then judge from city name, and other social links if available.",
          properties: {
            name: { type: "STRING" },
            email: { type: "STRING" },
            phoneno: { type: "STRING" },
            city: { type: "STRING" },
            country: { type: "STRING" },
            linkedin: { type: "STRING" },
            github: { type: "STRING" },
            website: { type: "STRING" },
          },
        },
        summary: {
          type: "STRING",
          description:
            "A detailed professional summary of the candidate's resume, limited to the provided text. Do not include any match scores or analysis points here. Just the summary.",
        },
        matchScore: {
          type: "OBJECT",
          properties: {
            overall: {
              type: "NUMBER",
              description:
                "An overall match score of candidate resume according to job description/title provided and avg subscores %, out of 100%.",
            },
            subscores: {
              type: "OBJECT",
              description:
                "Individual sub-scores out of 100% for specific resume qualities. Also Give small descriptions for each",
              properties: {
                clarity: {
                  type: "OBJECT",
                  description:
                    "Provide short description of how much clarity is in resume according to ats format, job description, and overall structure in resume.",
                  properties: {
                    clarityscore: { type: "NUMBER" },
                    claritydescription: { type: "STRING" },
                  },
                },
                grammar: {
                  type: "OBJECT",
                  description:
                    "Provide short description of grammar. Highlight how good grammar is used and highlight mistakes.",
                  properties: {
                    grammarscore: { type: "NUMBER" },
                    grammardescription: { type: "STRING" },
                  },
                },
                sections: {
                  type: "OBJECT",
                  description:
                    "Provide short description of sections. Highlight how good sections is used and highlight mistakes.",
                  properties: {
                    sectionsscore: { type: "NUMBER" },
                    sectionsdescription: { type: "STRING" },
                  },
                },
                impact: {
                  type: "OBJECT",
                  description:
                    "Provide short description of impact. Highlight how resume impact according to job description. Highlight mistakes if any.",
                  properties: {
                    impactscore: { type: "NUMBER" },
                    impactdescription: { type: "STRING" },
                  },
                },
              },
            },
          },
        },
        atsFormat: {
          type: "OBJECT",
          properties: {
            isAtsFriendly: {
              type: "STRING",
              description:
                "Yes, if the resume is ATS friendly then show All good, just keep learning, otherwise No, and give suggestion to make resume more ATS friendly by highlighting specific place where changes should be done.",
            },
            suggestions: {
              type: "ARRAY",
              description:
                "If resume is not ATS friendly then highlight a list of actionable suggestions to make the resume more ATS friendly. If resume is ATS friendly then show, No suggestions, keep learning in suggestions.",
              items: { type: "STRING" },
            },
          },
        },
        technicalSkills: {
          type: "OBJECT",
          properties: {
            listedSkills: { type: "ARRAY", items: { type: "STRING" } },
            suggestedSkills: {
              type: "ARRAY",
              items: { type: "STRING" },
              description:
                "If candidate resume has all recommended skills then show You have showcased all required skills. If not, then highlight missing recommended skills.",
            },
          },
        },
        detailedAnalysis: {
          type: "OBJECT",
          properties: {
            strengths: { type: "ARRAY", items: { type: "STRING" } },
            areasForImprovement: {
              type: "ARRAY",
              items: { type: "STRING" },
              description:
                "Strictly Point out where changes should be made according to Job role or description given like Grammar mistakes, Incorrect words, Action Verbs, etc. If all good then show Nothing to improve, just keep learning.",
            },
          },
        },
        enhancedresume: {
          type: "OBJECT",
          description:
            "Rewrite candidate resume with the changes and suggestion you suggest either for atsformat, skills, weaknesses. Your respose should be in JSON and every details should be in different Arrays and with proper name like (Section, Item, Original, Correction).",
          properties: {
            corrections: {
              type: "ARRAY",
              description:
                "Show all corrections in each array with proper name like Section, Item, Original, and Correction. And place where the correction has to be made.",
            },
          },
        },
      },
    };

    try {
      console.log("In try");
      setloader(true);
      const resume = localStorage.getItem("Saveresumeurl");
      const jobdescriptionpdf = localStorage.getItem("Savejoburl");
    const retrievejobdesc = localStorage.getItem("Savejobdesc");
      if (!resume) {
        setmessage("No resume file found in localStorage.");
        setshowtoast(true);
        setTimeout(() => {
          setshowtoast(false);
        }, 3000);
        setloader(false);
        return;
      }
      if (!jobdescriptionpdf && retrievejobdesc === "") {
        setmessage("No job description file or text found in localStorage.");
        setshowtoast(true);
        setTimeout(() => {
          setshowtoast(false);
        }, 3000);
        setloader(false);
        return;
      }
      const prompt = `You are a senior technical recruiter for a leading tech company. Your task is to analyze the resume ${resume} and evaluate its suitability for the job role/job description provided. Here is job description/job role text or pdf "${data.jobdesc} ${jobdescriptionpdf}". Provide a professional, structured JSON object in following way:
     type: "OBJECT",
      properties: {
        candidatedetails: {
        type: "OBJECT",
        description: "Provide candidate name, email, phoneno, city, country if available. If not then judge from city name, and other social links if available.",
        properties:{
        name: {type: STRING},
        email: {type: STRING},
        phoneno: {type: STRING},
        city: {type: STRING},
        country: {type: STRING},
        linkedin: {type: STRING},
        github: {type: STRING},
        website: {type: STRING},
        }
        },
        summary: {
          type: "STRING",
          description:
            "A detailed professional summary of the candidate's resume, limited to the provided text. Do not include any match scores or analysis points here. Just the summary.",
        },
        matchScore: {
          type: "OBJECT",
          properties: {
            overall: {
              type: "NUMBER",
              description:
                "An overall match score of candidate resume according to job description/title provided and avg subscores %, out of 100%.",
            },
            subscores: {
              type: "OBJECT",
              description:
                "Individual sub-scores out of 100% for specific resume qualities. Also Give small descriptions for each",
              properties: {
                clarity: { 
                type: "OBJECT", 
                description: 
                "Provide short description of how much clarity is in resume according to ats format, job description, and overall structure in resume.",
                properties:{
                clarityscore: {type: NUMBER},
                claritydescription: {type: STRING},
                }, 
                },
                grammar: { 
                type: "OBJECT",
                description: "Provide short description of grammar. Highlight how good grammar is used and highlight mistakes.",
                properties:{
                grammarscore: {type: NUMBER},
                grammardescription: {type: STRING},
                }, 
                },
                sections: { type: "OBJECT",
                description: "Provide short description of sections. Highlight how good sections is used and highlight mistakes.",
                properties:{
                sectionsscore: {type: NUMBER},
                sectionsdescription: {type: STRING},
                }, 
                },
                impact: { type: "OBJECT",
                description: "Provide short description of impact. Highlight how resume impact according to job description. Highlight mistakes if any.",
                properties:{
                impactscore: {type: NUMBER},
                impactdescription: {type: STRING},
                }, 
                },
              },
            },
          },
        },
        atsFormat: {
          type: "OBJECT",
          properties: {
            isAtsFriendly: {
              type: "STRING",
              description:
                "Yes, if the resume is ATS friendly then show All good, just keep learning, otherwise No, and give suggestion to make resume more ATS friendly by highlighting specific place where changes should be done.",
            },
            suggestions: {
              type: "ARRAY",
              description:
                "If resume is not ATS friendly then highlight a list of actionable suggestions to make the resume more ATS friendly. If resume is ATS friendly then show, No suggestions, keep learning in suggestions.",
              items: { type: "STRING" },
            },
          },
        },
        technicalSkills: {
          type: "OBJECT",
          properties: {
            listedSkills: { type: "ARRAY", items: { type: "STRING" } },
            suggestedSkills: { type: "ARRAY", items: { type: "STRING" }, description: "If candidate resume has all recommended skills then show You have showcased all required skills. If not, then highlight missing recommended skills." },
          },
        },
        detailedAnalysis: {
          type: "OBJECT",
          properties: {
            strengths: { type: "ARRAY", items: { type: "STRING" } },
            areasForImprovement: { type: "ARRAY", items: { type: "STRING" }, description: "Strictly Point out where changes should be made according to Job role or description given like Grammar mistakes, Incorrect words, Action Verbs, etc. If all good then show Nothing to improve, just keep learning." },
          },
        },
        enhancedresume: {
          type: "OBJECT",
          description:
            "Rewrite candidate resume with the changes and suggestion you suggest either for atsformat, skills, weaknesses. Your respose should be in JSON and every details should be in different Arrays and with proper name like (Section, Item, Original, Correction).",
          properties: {
            corrections: {
              type: "ARRAY",
              description: "Show all corrections in each array with proper name and place where the correction has to be made."
            },
          },
        },
      },
    `;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: {
          parts: [
            { text: `${prompt}\n\nResume:\n${resume}` },
            {
              inlineData: {
                mimeType: "application/pdf",
                data: resume.split(",")[1],
              },
            },
            {
              inlineData: {
                mimeType: "application/pdf",
                data: jobdescriptionpdf.split(",")[1],
              },
            },
          ],
        },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: resumeSchema,
        },
      });
      if (response) {
        const parseddata = response.candidates[0].content.parts[0].text;
        try {
          const extracttext = parseddata.match(/({[\s\S]*})/);
          if (extracttext && extracttext[1]) {
            const parsedanalysis = JSON.parse(extracttext[1]);
            if (parsedanalysis) {
              setairesponse(parsedanalysis);
              const converttostring = JSON.stringify(parsedanalysis);
              localStorage.setItem("Saveresponse", converttostring);
            } else {
              setmessage("failed to generate response.");
              setshowtoast(true);
              setTimeout(() => {
                setshowtoast(false);
              }, 3000);
            }
          }
        } catch (e) {
          console.log(e);
        }
      } else {
        setmessage("No text found in the API response.");
        setshowtoast(true);
        setTimeout(() => {
          setshowtoast(false);
        }, 3000);
      }
    } catch (e) {
      setmessage(`No API response. ${e}`);
      setshowtoast(true);
      setTimeout(() => {
        setshowtoast(false);
      }, 3000);
    } finally {
      setloader(false);
    }
  };
  const handleinterview = async (index) => {
    const retrieveinterviewquestions = localStorage.getItem(
      "Saveinterviewquestions"
    );
    if (index === 3 && !retrieveinterviewquestions) {
      settabindex(3);
      setinterviewbar(false);
      const ai = new GoogleGenAI({
        apiKey: apikey,
      });
      try {
        setintreviewloader(true);
        const resumepdf = localStorage.getItem("Saveresumeurl");
        const jobdescriptionpdf = localStorage.getItem("Savejoburl");
        const jobtext = localStorage.getItem("Savejobdesc");
        if (!jobdescriptionpdf) {
          setmessage("No job description file found in localStorage.");
          setshowtoast(true);
          setTimeout(() => {
            setshowtoast(false);
          }, 3000);
          setloader(false);
          return;
        }
        const interviewSchema = {
          type: "OBJECT",
          properties: {
            interviewquestions: {
              type: "ARRAY",
              items: { type: "STRING" },
            },
          },
        };
        const interviewprompt = `You are a senior technical recruiter for a leading tech company. Your task is to ask interview questions. Ask questions about candidate resume ${resumepdf} and job description text/pdf he provided ${jobdescriptionpdf} OR ${jobtext} Provide a professional, structured interview questions in JSON object with all questions in a single array and in following way:
     type: "OBJECT",
      properties: {
        interviewquestions: {
        type: "ARRAY",
        items: {type: "STRING"},
        },
      },`;
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash-lite",
          contents: {
            parts: [
              {
                text: `${interviewprompt}\n\nResume:\n${resumepdf}`,
              },
              {
                inlineData: {
                  mimeType: "application/pdf",
                  data: resumepdf.split(",")[1],
                },
              },
              {
                inlineData: {
                  mimeType: "application/pdf",
                  data: jobdescriptionpdf.split(",")[1],
                },
              },
            ],
          },
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: interviewSchema,
          },
        });
        if (response) {
          const parseddata = response.candidates[0].content.parts[0].text;
          try {
            const extracttext = parseddata.match(/({[\s\S]*})/);
            if (extracttext && extracttext[1]) {
              const parsedanalysis = JSON.parse(extracttext[1]);
              if (parsedanalysis) {
                setinterviewquesitons(parsedanalysis);
                const converttostring = JSON.stringify(parsedanalysis);
                localStorage.setItem("Saveinterviewquestions", converttostring);
              } else {
                setmessage("Failed to generate response.");
                setshowtoast(true);
                setTimeout(() => {
                  setshowtoast(false);
                }, 3000);
              }
            }
          } catch (e) {
            setmessage(`API Error ${e}`);
            setshowtoast(true);
            setTimeout(() => {
              setshowtoast(false);
            }, 3000);
          }
        } else {
          setmessage("No text found in the API response.");
          setshowtoast(true);
          setTimeout(() => {
            setshowtoast(false);
          }, 3000);
        }
      } catch (e) {
        setmessage(`API Error ${e}`);
        setshowtoast(true);
        setTimeout(() => {
          setshowtoast(false);
        }, 3000);
      } finally {
        setintreviewloader(false);
      }
    } else {
      settabindex(index);
      setskeletonloader(false);
    }
  };

  return (
    <section id="airesumeenhancer">
      <div className={`${styles.enhancercontainer}`}>
        {airesponse ? (
          <>
            {skeletonloader === true ? (
              <Skeleton style={{ marginTop: "20px" }} count={1} height={30} />
            ) : (
              <>
                {interviewbar === false ? (
                  ""
                ) : (
                  <div className={`${styles.interviewprepcontainer}`}>
                    <div className={`${styles.interview}`}>
                      <div className="">
                        <h1>Preparing for interview?</h1>

                        <p>
                          Are you preparing for interview? Click here to
                          generate real interview questions according to your
                          job role.
                        </p>
                      </div>
                      <div className="">
                        <button
                          className={`${styles.jobinterviewbtn}`}
                          onClick={() => handleinterview(3)}
                        >
                          Generate Questions
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className={`${styles.responserow}`}>
              {skeletonloader || !airesponse ? (
                <Skeleton style={{ marginTop: "20px" }} count={50.5} />
              ) : (
                <div className={`${styles.responsecolleft}`}>
                  <h1>{airesponse.candidatedetails.name} Resume Summary</h1>

                  <div className={`${styles.matchscore}`}>
                    <div className={`${styles.mainscore}`}>
                      <div className={`${styles.mainscorecols}`}>
                        <h1>Overall Score</h1>
                        <p>
                          An overall match score for the job description
                          provided, out of 100%.
                        </p>
                      </div>
                      <div
                        className={`${styles.mainscorecols}`}
                        style={{ width: 90, height: 90 }}
                      >
                        <CircularProgressbar
                          className={`${styles.CircularProgressbar}`}
                          styles={
                            airesponse.matchScore.overall >= 75
                              ? buildStyles({
                                  pathColor: `#61ce70`,
                                  textColor: `#61ce70`,
                                })
                              : airesponse.matchScore.overall >= 60
                              ? buildStyles({
                                  pathColor: `#ef8354ff`,
                                  textColor: `#ef8354ff`,
                                })
                              : airesponse.matchScore.overall < 60
                              ? buildStyles({
                                  pathColor: `#ff0000`,
                                  textColor: `#ff0000`,
                                })
                              : ""
                          }
                          value={airesponse.matchScore.overall}
                          text={`${airesponse.matchScore.overall}%`}
                        />
                      </div>
                    </div>
                    <div className={`${styles.otherscores}`}>
                      <div
                        className={`accordion accordion-flush ${styles.accordion}`}
                        id="accordionFlushExample"
                      >
                        <div className="accordion-item">
                          <h2 className="accordion-header">
                            Clarity
                            <p
                              className={`${
                                airesponse.matchScore.subscores.clarity
                                  .clarityscore >= 75
                                  ? styles.otherscoregreen
                                  : airesponse.matchScore.subscores.clarity
                                      .clarityscore >= 60
                                  ? styles.otherscoreorange
                                  : airesponse.matchScore.subscores.clarity
                                      .clarityscore < 60
                                  ? styles.otherscorered
                                  : ""
                              }`}
                            >
                              {
                                airesponse.matchScore.subscores.clarity
                                  .clarityscore
                              }
                              %
                            </p>
                            <button
                              className="accordion-button collapsed"
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target="#flush-collapseOne"
                              aria-expanded="false"
                              aria-controls="flush-collapseOne"
                            ></button>
                          </h2>
                          <div
                            id="flush-collapseOne"
                            className="accordion-collapse collapse"
                            data-bs-parent="#accordionFlushExample"
                          >
                            <div className="accordion-body">
                              <p>
                                {
                                  airesponse.matchScore.subscores.clarity
                                    .claritydescription
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="accordion-item">
                          <h2 className="accordion-header">
                            Grammar
                            <p
                              className={`${
                                airesponse.matchScore.subscores.grammar
                                  .grammarscore >= 75
                                  ? styles.otherscoregreen
                                  : airesponse.matchScore.subscores.grammar
                                      .grammarscore >= 60
                                  ? styles.otherscoreorange
                                  : airesponse.matchScore.subscores.grammar
                                      .grammarscore < 60
                                  ? styles.otherscorered
                                  : ""
                              }`}
                            >
                              {
                                airesponse.matchScore.subscores.grammar
                                  .grammarscore
                              }
                              %
                            </p>
                            <button
                              className="accordion-button collapsed"
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target="#flush-collapseTwo"
                              aria-expanded="false"
                              aria-controls="flush-collapseTwo"
                            ></button>
                          </h2>
                          <div
                            id="flush-collapseTwo"
                            className="accordion-collapse collapse"
                            data-bs-parent="#accordionFlushExample"
                          >
                            <div className="accordion-body">
                              <p>
                                {
                                  airesponse.matchScore.subscores.grammar
                                    .grammardescription
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="accordion-item">
                          <h2 className="accordion-header">
                            Impact
                            <p
                              className={`${
                                airesponse.matchScore.subscores.impact
                                  .impactscore >= 75
                                  ? styles.otherscoregreen
                                  : airesponse.matchScore.subscores.impact
                                      .impactscore >= 60
                                  ? styles.otherscoreorange
                                  : airesponse.matchScore.subscores.impact
                                      .impactscore < 60
                                  ? styles.otherscorered
                                  : ""
                              }`}
                            >
                              {
                                airesponse.matchScore.subscores.impact
                                  .impactscore
                              }
                              %
                            </p>
                            <button
                              className="accordion-button collapsed"
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target="#flush-collapseThree"
                              aria-expanded="false"
                              aria-controls="flush-collapseThree"
                            ></button>
                          </h2>
                          <div
                            id="flush-collapseThree"
                            className="accordion-collapse collapse"
                            data-bs-parent="#accordionFlushExample"
                          >
                            <div className="accordion-body">
                              <p>
                                {
                                  airesponse.matchScore.subscores.impact
                                    .impactdescription
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="accordion-item">
                          <h2 className="accordion-header">
                            Sections
                            <p
                              className={`${
                                airesponse.matchScore.subscores.sections
                                  .sectionsscore >= 75
                                  ? styles.otherscoregreen
                                  : airesponse.matchScore.subscores.sections
                                      .sectionsscore >= 60
                                  ? styles.otherscoreorange
                                  : airesponse.matchScore.subscores.sections
                                      .sectionsscore < 60
                                  ? styles.otherscorered
                                  : ""
                              }`}
                            >
                              {
                                airesponse.matchScore.subscores.sections
                                  .sectionsscore
                              }
                              %
                            </p>
                            <button
                              className="accordion-button collapsed"
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target="#flush-collapseFour"
                              aria-expanded="false"
                              aria-controls="flush-collapseFour"
                            ></button>
                          </h2>
                          <div
                            id="flush-collapseFour"
                            className="accordion-collapse collapse"
                            data-bs-parent="#accordionFlushExample"
                          >
                            <div className="accordion-body">
                              <p>
                                {
                                  airesponse.matchScore.subscores.sections
                                    .sectionsdescription
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`${styles.resumesummary}`}>
                    <h1>Summary: </h1>
                    <p>{airesponse.summary}</p>
                  </div>

                  <div className={`${styles.atsfimiliarity}`}>
                    <h1>ATS Friendliness: </h1>
                    <p>
                      <span>Is ATS Friendly: </span>
                      {airesponse.atsFormat.isAtsFriendly}
                    </p>
                    <span>Suggestions:</span>
                    <ol>
                      <li>{airesponse.atsFormat.suggestions[0]}</li>
                    </ol>
                  </div>
                  <div className={`${styles.skills}`}>
                    <h1>Skills: </h1>
                    <ol>
                      {airesponse.technicalSkills.listedSkills.map(
                        (skills, index) => {
                          return <li key={index}>{skills}</li>;
                        }
                      )}
                    </ol>
                  </div>
                  <div className={`${styles.recommendedskills}`}>
                    <h1>Recommeded Skills: </h1>
                    <ol>
                      {airesponse.technicalSkills.suggestedSkills.map(
                        (recommendedskills, index) => {
                          return (
                            <li
                              className={`${
                                recommendedskills ===
                                "You have showcased all required skills."
                                  ? styles.emptylist
                                  : styles.recommendlist
                              }`}
                              key={index}
                            >
                              {recommendedskills}
                            </li>
                          );
                        }
                      )}
                    </ol>
                  </div>
                  <div className={`${styles.strengths}`}>
                    <h1>Strengths: </h1>
                    <ol>
                      {airesponse.detailedAnalysis.strengths.map(
                        (strengths, index) => {
                          return <li key={index}>{strengths}</li>;
                        }
                      )}
                    </ol>
                  </div>
                  <div className={`${styles.weaknesses}`}>
                    <h1>Weaknesses: </h1>
                    <ol>
                      {airesponse.detailedAnalysis.areasForImprovement.map(
                        (weakness, index) => {
                          return (
                            <div key={index}>
                              <li>{weakness}</li>
                            </div>
                          );
                        }
                      )}
                    </ol>
                  </div>
                </div>
              )}
              {skeletonloader ? (
                <Skeleton style={{ marginTop: "20px" }} count={50.5} />
              ) : (
                <div className={`${styles.responsecolright}`}>
                  <Tabs
                    selectedIndex={tabindex}
                    onSelect={(tabIndex) => handleinterview(tabIndex)}
                  >
                    <TabList
                      style={{
                        borderBottom: "1px solid #d8d8d8",
                        textAlign: "center",
                        width: "100% !important",
                      }}
                    >
                      <Tab
                        style={{ borderBottom: "1px solid #d8d8d8" }}
                        selectedClassName={`${styles.tab}`}
                      >
                        Resume
                      </Tab>
                      <Tab
                        style={{ borderBottom: "1px solid #d8d8d8" }}
                        selectedClassName={`${styles.tab}`}
                      >
                        Job Description
                      </Tab>
                      <Tab
                        style={{ borderBottom: "1px solid #d8d8d8" }}
                        selectedClassName={`${styles.tab}`}
                      >
                        Enhanced Resume
                      </Tab>
                      {tabindex === 3 || interviewquestions ? (
                        <Tab
                          tabIndex={tabindex}
                          style={{ borderBottom: "1px solid #d8d8d8" }}
                          selectedClassName={`${styles.tab}`}
                        >
                          Interview Questions
                        </Tab>
                      ) : (
                        ""
                      )}
                    </TabList>
                    <TabPanel>
                      <iframe
                        src={resumeurl}
                        height={"900px"}
                        width={"100%"}
                      ></iframe>
                    </TabPanel>
                    <TabPanel style={{ marginTop: "30px", marginLeft: "30px" }}>
                      {jobdesc === null ? (
                        <>
                          <h1 className={`${styles.jobheading}`}>
                            Job Description:{" "}
                          </h1>
                          <Markdown className={`${styles.jobdescription}`}>
                            {jobdesctext}
                          </Markdown>
                        </>
                      ) : (
                        <iframe
                          src={jobdescurl}
                          height={"900px"}
                          width={"100%"}
                        ></iframe>
                      )}
                    </TabPanel>
                    <TabPanel className={`${styles.resumeenhancement}`}>
                      <h1>Resume Enhancements</h1>
                      <p>
                        Your resume has scored {airesponse.matchScore.overall}%,
                        but making these corrections will make your resume more
                        bold and appealing.
                      </p>
                      {airesponse.enhancedresume.corrections.map(
                        (corrections, index) => (
                          <div key={index}>
                            <p className={`${styles.correctioncontent}`}>
                              <span>
                                {corrections.Section
                                  ? corrections.Section
                                  : corrections.section}{" "}
                                Section:
                              </span>{" "}
                              {corrections.Item
                                ? corrections.Item
                                : corrections.item}
                            </p>
                            <p className={`${styles.correctioncontent}`}>
                              <span>What to replace:</span>{" "}
                              {corrections.Original
                                ? corrections.Original
                                : corrections.original
                                ? corrections.original
                                : "null"}
                            </p>
                            <p className={`${styles.correctioncontent}`}>
                              <span>Replace with(Suggestion):</span>{" "}
                              {corrections.Correction
                                ? corrections.Correction
                                : corrections.correction
                                ? corrections.correction
                                : "No suggestion. Keep the original one."}
                            </p>
                          </div>
                        )
                      )}
                    </TabPanel>
                    {tabindex === 3 || interviewquestions ? (
                      <TabPanel className={`${styles.interviewprep}`}>
                        <h1>Interview Questions</h1>
                        {interviewloader === true ? (
                          <Skeleton
                            style={{ marginTop: "20px" }}
                            count={10.5}
                          />
                        ) : (
                          <>
                            {interviewquestions.properties.interviewquestions.map(
                              (question, index) => {
                                return (
                                  <div key={index}>
                                    <span>Q: </span>
                                    <Markdown>{question}</Markdown>
                                  </div>
                                );
                              }
                            )}
                          </>
                        )}
                      </TabPanel>
                    ) : (
                      ""
                    )}
                  </Tabs>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className={`${styles.enhancerow}`}>
            {airesponse === "" && (
              <>
                <div className={`${styles.enhancecolleft}`}>
                  {skeletonloader ? (
                    <Skeleton height={30} count={0.4} />
                  ) : (
                    <h1> AI Resume Enhancer</h1>
                  )}
                  {skeletonloader ? (
                    <Skeleton count={3.5} />
                  ) : (
                    <p>
                      Transform your resume with our{" "}
                      <span className={`${styles.paraspan}`}>FREE</span> AI
                      Resume Enhancer. Our intelligent tool analyzes your resume
                      against any job description, providing a matching score,
                      identifying weak points, correcting grammar, and offering
                      strategic ideas to make your application stand out.
                    </p>
                  )}

                  <div className={`${styles.enhanceboxrow}`}>
                    {skeletonloader ? (
                      <Skeleton count={1} height={200} direction="ltr" />
                    ) : (
                      <div className={`${styles.enhancebox}`}>
                        <div className={`${styles.enhanceboxiconcard}`}>
                          <RiShiningFill
                            className={`${styles.enhanceboxicon}`}
                          />
                        </div>
                        <div className={`${styles.enhanceboxcontent}`}>
                          <h1>Instant Resume Analysis</h1>
                          <p>
                            Upload your resume and the job description, and our
                            AI will provide a deep, instant analysis.
                          </p>
                        </div>
                      </div>
                    )}
                    {skeletonloader ? (
                      <Skeleton count={1} height={200} direction="ltr" />
                    ) : (
                      <div className={`${styles.enhancebox}`}>
                        <div className={`${styles.enhanceboxiconcard}`}>
                          <GrScorecard className={`${styles.enhanceboxicon}`} />
                        </div>
                        <div className={`${styles.enhanceboxcontent}`}>
                          <h1>Personalized Matching Score</h1>
                          <p>
                            Stop guessing if your resume is a good fit. Our tool
                            gives you a precise matching score.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className={`${styles.enhanceboxrow}`}>
                    {skeletonloader ? (
                      <Skeleton count={1} height={150} direction="ltr" />
                    ) : (
                      <div className={`${styles.enhancebox}`}>
                        <div className={`${styles.enhanceboxiconcard}`}>
                          <FaPencilAlt className={`${styles.enhanceboxicon}`} />
                        </div>
                        <div className={`${styles.enhanceboxcontent}`}>
                          <h1>Grammar Corrections</h1>
                          <p>
                            Eliminate typos and grammatical errors that could
                            cost you an interview.
                          </p>
                        </div>
                      </div>
                    )}
                    {skeletonloader ? (
                      <Skeleton count={1} height={150} direction="ltr" />
                    ) : (
                      <div className={`${styles.enhancebox}`}>
                        <div className={`${styles.enhanceboxiconcard}`}>
                          <FaLightbulb className={`${styles.enhanceboxicon}`} />
                        </div>
                        <div className={`${styles.enhanceboxcontent}`}>
                          <h1>Strategic Enhancement Ideas</h1>
                          <p>
                            Go beyond simple corrections with actionable advice.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className={`${styles.enhancecolright}`}>
                  <div className={`${styles.uploadarea}`}>
                    <form onSubmit={(e) => handlefileupload(e)}>
                      {file === null ? (
                        <>
                          {skeletonloader ? (
                            <Skeleton count={0.2} />
                          ) : (
                            <FaUpload className={`${styles.uploadicon}`} />
                          )}

                          {skeletonloader ? (
                            <Skeleton style={{ marginTop: "20px" }} count={1} />
                          ) : (
                            <h1>Upload Your Resume</h1>
                          )}
                          {skeletonloader ? (
                            <Skeleton count={1} />
                          ) : (
                            <p>
                              Drag and Drop your resume, or click below to
                              select your resume.
                            </p>
                          )}
                          {skeletonloader ? (
                            <Skeleton style={{ marginTop: "20px" }} count={1} />
                          ) : (
                            <>
                              <div className={`${styles.uploadbox}`}>
                                <FileUploader
                                  multiple={false}
                                  handleChange={handleChange}
                                  required
                                  name="file"
                                  types={fileTypes}
                                />
                              </div>
                              <p>{file ? `File name: ${file.name}` : ""}</p>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <FaUpload className={`${styles.uploadicon}`} />
                          <h1>Upload Job Description</h1>
                          <p>
                            Drag and Drop Job Description PDF OR Enter Job
                            Description.
                          </p>
                          <div className={`${styles.uploadbox}`}>
                            <FileUploader
                              multiple={false}
                              handleChange={handlejobChange}
                              name="jobfile"
                              types={fileTypes}
                              classes={`${
                                emptyjderror === true
                                  ? styles.jobdescuploadererror
                                  : ""
                              }`}
                            />
                            <p>OR</p>
                            <textarea
                              name="jobdesc"
                              id="jobdesc"
                              placeholder="Enter Job Description"
                              className={`${
                                emptyjderror === true
                                  ? styles.jobdescerror
                                  : styles.jobdescinput
                              }`}
                            ></textarea>
                          </div>
                          <p style={{ color: "red" }}>
                            {emptyjderror === true
                              ? `Job Description is required`
                              : ""}
                          </p>
                        </>
                      )}
                      {skeletonloader ? (
                        <Skeleton style={{ marginTop: "20px" }} count={1} />
                      ) : (
                        <>
                          {loader === false ? (
                            <button className={`${styles.uploadbtn}`}>
                              Upload
                            </button>
                          ) : (
                            <button className={`${styles.uploadbtn}`}>
                              Uploading...
                              <BiLoaderAlt className={`${styles.loader}`} />
                            </button>
                          )}
                        </>
                      )}
                    </form>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {showtoast === true ? (
          <div className={`${styles.toast}`}>
            <div className={`${styles.toastheader}`}>
              <h4>AIResumeEnhancer</h4>
              <ImCancelCircle
                onClick={() => setshowtoast(false)}
                className={`${styles.toastcancelicon}`}
              />
            </div>
            <div className={`${styles.messagecontent}`}>
              <p>{message}</p>
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    </section>
  );
}
