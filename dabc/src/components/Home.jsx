import { useEffect, useRef, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { read, utils } from "xlsx";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const addToDb = async (e) => {
    e.preventDefault();
    setErrorCode("");
    if (inputRef.current.files.length !== 1) {
      setErrorCode("no file chosen for upload");
      return;
    }
    const file = await inputRef.current.files[0].arrayBuffer();
    const wb = read(file);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = utils.sheet_to_json(ws);
    console.log(data);
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
