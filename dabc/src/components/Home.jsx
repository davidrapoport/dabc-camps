import { useRef, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const auth = getAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errorCode, setErrorCode] = useState("no err");
  const [testText, setTestText] = useState("");
  const navigate = useNavigate();

  const inputRef = useRef();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      setIsLoggedIn(true);
      setErrorCode("this shit is crazy");
    } else {
      navigate("/login");
    }
  });

  const addToDb = (e) => {
    e.preventDefault();
    setErrorCode("very Error");
    return;
  };

  const logOut = () => {
    signOut(auth)
      .then(() => {
        navigate("/login");
      })
      .catch((err) => {});
  };

  return isLoggedIn ? (
    <div>
      <p className="error-message">{errorCode}</p>
      <div className="home-page">
        <form onSubmit={addToDb}>
          <label>
            Upload file:
            <input type="file" ref={inputRef}></input>
          </label>
          <input
            type="text"
            value={testText}
            onChange={(e) => {
              console.log("typing");
              //setTestText(e.target.value);
            }}
          ></input>
          <button>Submit</button>
        </form>
        <button onClick={logOut} className="logout-button">
          Log Out
        </button>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default Home;
