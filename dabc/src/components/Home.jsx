import { useEffect, useRef, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const auth = getAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errorCode, setErrorCode] = useState("");
  const navigate = useNavigate();

  const inputRef = useRef();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        navigate("/login");
      }
    });
  }, [navigate]);

  const addToDb = (e) => {
    e.preventDefault();
    setErrorCode("");
    if (inputRef.current.files.length !== 1) {
      setErrorCode("no file chosen for upload");
      return;
    }
    //TODO:
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
            <input type="file" ref={inputRef} accept=".xlsx,.xls"></input>
          </label>
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
