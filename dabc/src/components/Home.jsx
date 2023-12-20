import React, { useEffect, useRef, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { read, utils } from "xlsx";
import { collection, doc, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import ClipLoader from "react-spinners/ClipLoader";
import "./Home.css";

const Home = () => {
  const auth = getAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errorCode, setErrorCode] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
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

  const addToDb = async (e) => {
    e.preventDefault();
    setErrorCode("");
    setUploadSuccess(false);
    setIsUploading(true);

    if (inputRef.current.files.length !== 1) {
      setIsUploading(false);
      setErrorCode("No file chosen for upload");
      return;
    }

    const file = await inputRef.current.files[0].arrayBuffer();
    const wb = read(file);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = utils.sheet_to_json(ws);
    const date = new Date().toISOString();
    const input = data
      .filter((item) => {
        if (item["Order Qty"] > 0) {
          return true;
        }
        return false;
      })
      .map((item) => {
        return item;
      })
      .map((item) => {
        // Change the field names to make them more consistent
        // with best practices.
        const newItem = {};
        newItem.sku = item.SKU.toString().padStart(6, "0");
        newItem.quantity = item["Order Qty"];
        newItem.name = item["AL Name"];
        return newItem;
      });

    const formattedDoc = {
      user: auth.currentUser.uid,
      date,
      scrapingCompleted: false,
      input,
      output: {},
    };

    try {
      await addDoc(collection(db, "forms"), formattedDoc);
      setIsUploading(false);
      setUploadSuccess(true);
      navigate("/results");
    } catch (error) {
      setIsUploading(false);
      setErrorCode(error.message);
    }
  };

  const logOut = () => {
    signOut(auth)
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        setErrorCode(error.message);
      });
  };

  if (!isLoggedIn) {
    return <></>;
  }

  let content = <></>;
  if (uploadSuccess) {
    content = (
      <p className="success-message">
        Please check back in a few minutes to see the results of your run.
      </p>
    );
  } else {
    content = (
      <div>
        <p className="error-message">{errorCode}</p>
        <div className="home-page">
          <form onSubmit={addToDb}>
            <p>
              Please upload a file with the following structure: <br />
              SKU, AL Name, Order Qty
            </p>
            <label>
              Upload file:
              <input type="file" ref={inputRef} accept=".xlsx,.xls" />
            </label>
            {isUploading ? (
              <div className="spinner-container">
                <ClipLoader />
                <p className="upload-message">Uploading...</p>
              </div>
            ) : (
              <button type="submit">Submit</button>
            )}
          </form>
        </div>
      </div>
    );
  }
  // TODO(nick): Add css for the footer so that the
  // two buttons are side by side (and make the
  // results link a button too)
  return (
    <div className="body">
      <h2>DABC Route Finding Tool</h2>
      {content}
      <div className="footer">
        <Link to="/results">See Results from past runs</Link>
        <button onClick={logOut} className="logout-button">
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Home;
