import React from "react";
import styles from "../styles/home.module.css";
import Header from "./header";
import { Link } from "react-scroll";

export default function Home() {
  return (
    <section id="home">
      <Header />
      <div className={`${styles.homecontainer}`}>
        <div className={`${styles.homeoverlay}`}></div>
        <div className={`${styles.textoverlay}`}>
          <h1>
            Transform your{" "}
            <span className={`${styles.headingspan}`}>RESUME</span> with the
            power of <span className={`${styles.headingspan}`}>AI</span>
          </h1>
          <p>
            Transform your resume with our{" "}
            <span className={`${styles.paraspan}`}>FREE</span> AI Resume
            Enhancer. Our intelligent tool analyzes your resume against any job
            description, providing a matching score, identifying weak points,
            correcting grammar, and offering strategic ideas to make your
            application stand out.
          </p>
          <Link
            to="airesumeenhancer"
            spy={true}
            smooth={true}
            offset={-70}
            duration={500}
          >
            <button className={`${styles.homebtn}`}>Get Started</button>
          </Link>
        </div>
      </div>
    </section>
  );
}
