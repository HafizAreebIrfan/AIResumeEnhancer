import styles from "../styles/header.module.css";
import Logo from '../assets/logo.png';

export default function Header() {
  return (
    <>
      <div className={`${styles.header}`}>
        <nav>
            <a href="/" className={`${styles.logo}`}><img src={Logo} alt="Logo" /></a>
          <ul>
            <li>
              <a className={`${styles.active}`} href="#home">Home</a>
            </li>
            <li>
              <a href="./airesumeenhancer">AI Resume Enhancer</a>
            </li>
            <li>
              <a href="#contact">Contact</a>
            </li>
          </ul>
          <button className={`${styles.headerbtn}`}>Enhance</button>
        </nav>
      </div>
    </>
  );
}
