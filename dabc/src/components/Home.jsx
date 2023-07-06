import { useEffect, useRef, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { read, utils } from "xlsx";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import "./Home.css";

const Home = () => {
  const auth = getAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errorCode, setErrorCode] = useState("");
  const [user, setUser] = useState({});
  const navigate = useNavigate();
  const inputRef = useRef();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user.toJSON().email);
        setIsLoggedIn(true);
      } else {
        navigate("/login");
      }
    });
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
    const date = new Date().toLocaleString();
    const input = data.filter((item) => {
      if (item["Order Qty"] > 0) {
        return true;
      }
      return false;
    });
    const formattedDoc = {
      user,
      date,
      scrapingCompleted: false,
      input,
      output: {},
    };
    try {
      const name = date.replaceAll("/", "-");
      await setDoc(doc(db, "forms", name), formattedDoc);
    } catch (e) {
      console.log(e);
    }
    return;
  };

  const logOut = () => {
    signOut(auth)
      .then(() => {
        navigate("/login");
      })
      .catch((err) => {
        setErrorCode(err.message);
      });
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
