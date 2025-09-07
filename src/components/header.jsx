import styles from "../styles/header.module.css";
import Logo from "../assets/logo.png";
import { RiMenu3Line } from "react-icons/ri";
import { useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { Link } from "react-scroll";

export default function Header() {
  const [showmenu, setshowmenu] = useState(false);
  const handlemenu = () => {
    setshowmenu((prev) => !prev);
  };
  return (
    <>
      <div
        className={`${showmenu === true ? styles.headermobile : styles.header}`}
      >
        <nav>
          <a href="/" className={`${styles.logo}`}>
            <img src={Logo} alt="Logo" />
          </a>
          <ul>
            <li>
              <Link
                activeClass={`${styles.active}`}
                className={`${styles.linkitem}`}
                to="home"
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                activeClass={`${styles.active}`}
                className={`${styles.linkitem}`}
                to="airesumeenhancer"
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
              >
                AI Resume Enhancer
              </Link>
            </li>
          </ul>
          <Link
            to="airesumeenhancer"
            spy={true}
            smooth={true}
            offset={-70}
            duration={500}
          >
            <button className={`${styles.headerbtn}`}>Enhance</button>
          </Link>
          {showmenu === true ? (
            <RxCross2
              className={`${styles.headermenu}`}
              onClick={() => handlemenu()}
            />
          ) : (
            <RiMenu3Line
              className={`${styles.headermenu}`}
              onClick={() => handlemenu()}
            />
          )}
        </nav>
      </div>
    </>
  );
}
