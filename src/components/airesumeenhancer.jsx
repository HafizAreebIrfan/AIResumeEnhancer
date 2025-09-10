import styles from "../styles/airesumeenhancer.module.css";
import { RiShiningFill } from "react-icons/ri";
import { GrScorecard } from "react-icons/gr";
import { FaPencilAlt } from "react-icons/fa";
import { FaLightbulb } from "react-icons/fa6";
import { FaUpload } from "react-icons/fa";
import { useEffect, useState } from "react";
import { BiLoaderAlt } from "react-icons/bi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Markdown from "react-markdown";
import { ImCancelCircle } from "react-icons/im";
import { FileUploaderMinimal } from "@uploadcare/react-uploader";
import "@uploadcare/react-uploader/core.css";
import { Link } from "react-scroll";

export default function AIResumeEnhancer() {
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

  const fileuploaderapikey = import.meta.env.VITE_UPLOADER;

  useEffect(() => {
    setskeletonloader(true);
    if (airesponse) {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = "";
      };
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
    setTimeout(() => {
      setskeletonloader(false);
    }, 3500);
  }, [airesponse]);
  const handleresumeuploader = (e) => {
    if (e.fileInfo.mimeType !== "application/pdf") {
      setshowtoast(true);
      setmessage("Only PDF are allowed");
      setTimeout(() => {
        setshowtoast(false);
      }, 3000);
      return;
    } else {
      setresumeurl(e.fileInfo.cdnUrl);
    }
  };
  const handlejobuploader = (e) => {
    if (e.fileInfo.mimeType !== "application/pdf") {
      setshowtoast(true);
      setmessage("Only PDF are allowed");
      setTimeout(() => {
        setshowtoast(false);
      }, 3000);
      return;
    } else {
      setjobdescurl(e.fileInfo.cdnUrl);
    }
  };
  const handlejobdesc = (e) => {
    e.preventDefault();
    const jobtextdesc = e.target.value;
    setjobdesctext(jobtextdesc);
  };

  const handleuploads = (e) => {
    e.preventDefault();
    if (resumeurl === null) {
      setshowtoast(true);
      setmessage("Upload resume please...");
      setjobdesctext("");
      setTimeout(() => {
        setshowtoast(false);
      }, 3000);
      return;
    } else if (jobdescurl === null && jobdesctext === "") {
      setemptyjderror(true);
      setshowtoast(true);
      setmessage("Upload or write job description please...");
      setjobdescurl("");
      setjobdesctext("");
      setTimeout(() => {
        setshowtoast(false);
      }, 3000);
      return;
    }
    if (jobdescurl && jobdesctext) {
      setshowtoast(true);
      setmessage("You cannot upload two job descriptions at same time.");
      setjobdesctext("");
      setTimeout(() => {
        setshowtoast(false);
      }, 3000);
      return;
    } else {
      handleapiresponse(resumeurl, jobdescurl, jobdesctext);
    }
  };
  const handleapiresponse = async (resumeurl, jobdescurl, jobdesctext) => {
    try {
      setloader(true);
      if (!resumeurl) {
        setmessage("No resume found.");
        setshowtoast(true);
        setTimeout(() => {
          setshowtoast(false);
        }, 3000);
        setloader(false);
        return;
      }
      if (!jobdescurl && jobdesctext === "") {
        setmessage("No job description found.");
        setshowtoast(true);
        setTimeout(() => {
          setshowtoast(false);
        }, 3000);
        setloader(false);
        return;
      }
      const callapidata = await fetch("http://localhost:4001/api/analysisapi", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          resumeurl,
          jobdescurl,
          jobdesctext,
        }),
      });
      const callapi = await callapidata.json();
      setairesponse(callapi);
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
    if (index === 3) {
      settabindex(3);
      setinterviewbar(false);
      try {
        setintreviewloader(true);
        if (jobdescurl === null && jobdesctext === "") {
          setmessage("No job description text found.");
          setshowtoast(true);
          setTimeout(() => {
            setshowtoast(false);
          }, 3000);
          setloader(false);
          return;
        }
        const callinterviewapidata = await fetch(
          "http://localhost:4001/api/interviewapi",
          {
            method: "POST",
            credentials: "include",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              resumeurl,
              jobdescurl,
              jobdesctext,
            }),
          }
        );
        const callinterviewapi = await callinterviewapidata.json();
        setinterviewquesitons(callinterviewapi);
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
                        <Link
                          to="interviewquestions"
                          spy={true}
                          smooth={true}
                          offset={-70}
                          duration={500}
                        >
                          <button
                            className={`${styles.jobinterviewbtn}`}
                            onClick={() => handleinterview(3)}
                          >
                            Generate Questions
                          </button>
                        </Link>
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
                                airesponse.matchScore.subscores.clarity.score >=
                                75
                                  ? styles.otherscoregreen
                                  : airesponse.matchScore.subscores.clarity
                                      .score >= 60
                                  ? styles.otherscoreorange
                                  : airesponse.matchScore.subscores.clarity
                                      .score < 60
                                  ? styles.otherscorered
                                  : ""
                              }`}
                            >
                              {airesponse.matchScore.subscores.clarity.score}%
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
                                    .description
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
                                airesponse.matchScore.subscores.grammar.score >=
                                75
                                  ? styles.otherscoregreen
                                  : airesponse.matchScore.subscores.grammar
                                      .score >= 60
                                  ? styles.otherscoreorange
                                  : airesponse.matchScore.subscores.grammar
                                      .score < 60
                                  ? styles.otherscorered
                                  : ""
                              }`}
                            >
                              {airesponse.matchScore.subscores.grammar.score}%
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
                                    .description
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
                                airesponse.matchScore.subscores.impact.score >=
                                75
                                  ? styles.otherscoregreen
                                  : airesponse.matchScore.subscores.impact
                                      .score >= 60
                                  ? styles.otherscoreorange
                                  : airesponse.matchScore.subscores.impact
                                      .score < 60
                                  ? styles.otherscorered
                                  : ""
                              }`}
                            >
                              {airesponse.matchScore.subscores.impact.score}%
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
                                    .description
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
                                  .score >= 75
                                  ? styles.otherscoregreen
                                  : airesponse.matchScore.subscores.sections
                                      .score >= 60
                                  ? styles.otherscoreorange
                                  : airesponse.matchScore.subscores.sections
                                      .score < 60
                                  ? styles.otherscorered
                                  : ""
                              }`}
                            >
                              {airesponse.matchScore.subscores.sections.score}%
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
                                    .description
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
                      {!jobdescurl ? (
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
                        <section id="interviewquestions">
                          <h1 style={{ marginBottom: "30px" }}>
                            Interview Questions
                          </h1>
                          {interviewloader === true ? (
                            <Skeleton
                              style={{ marginTop: "20px" }}
                              count={10.5}
                            />
                          ) : (
                            <>
                              {interviewquestions.interviewquestions.questions.map(
                                (question, index) => {
                                  return (
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "start",
                                      }}
                                      key={index}
                                    >
                                      <span style={{ marginRight: "10px" }}>
                                        Q{(index = index + 1)}
                                      </span>
                                      <Markdown>{question}</Markdown>
                                    </div>
                                  );
                                }
                              )}
                            </>
                          )}
                        </section>
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
                    <form onSubmit={(e) => handleuploads(e)}>
                      {resumeurl === "" ? (
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
                                <FileUploaderMinimal
                                  useCloudImageEditor={false}
                                  sourceList="local, gdrive"
                                  classNameUploader="uc-light"
                                  pubkey={fileuploaderapikey}
                                  multiple={false}
                                  fileTypes={["application/pdf"]}
                                  onFileUploadSuccess={(e) =>
                                    handleresumeuploader(e)
                                  }
                                />
                              </div>
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
                            <FileUploaderMinimal
                              useCloudImageEditor={false}
                              sourceList="local, gdrive"
                              classNameUploader="uc-light"
                              pubkey={fileuploaderapikey}
                              multiple={false}
                              fileTypes={["application/pdf"]}
                              onFileUploadSuccess={(e) => handlejobuploader(e)}
                              onFileRemoved={() => {
                                localStorage.removeItem("Savejoburl");
                                setjobdescurl("");
                              }}
                            />
                            <p>OR</p>
                            <textarea
                              name="jobdesc"
                              id="jobdesc"
                              placeholder="Enter Job Description"
                              onChange={(e) => handlejobdesc(e)}
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
                            <button
                              style={
                                jobdesctext === ""
                                  ? { opacity: 0.4, pointerEvents: "none" }
                                  : { opacity: 1, pointerEvents: 'all' }
                              }
                              className={`${styles.uploadbtn}`}
                            >
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
