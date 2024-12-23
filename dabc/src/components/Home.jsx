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
  const warehouseInputRef = useRef(); // Reference for the new warehouse form file input

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        navigate("/login");
      }
    });
  }, [navigate]);

  const uploadDataToDoc = async (data, collectionName) => {
    const date = new Date().toISOString();
    const formattedDoc = {
      user: auth.currentUser.uid,
      date,
      scrapingCompleted: false,
      input: data,
      output: {},
    };

    try {
      await addDoc(collection(db, collectionName), formattedDoc);
      setIsUploading(false);
      setUploadSuccess(true);
      return true;
    } catch (error) {
      setIsUploading(false);
      setErrorCode(error.message);
      return false;
    }
  };

  const addStoreLookupDataToDb = async (e) => {
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
    const input = data
      .filter((item) => item["Order Qty"] > 0)
      .map((item) => ({
        sku: item.SKU.toString().padStart(6, "0"),
        quantity: item["Order Qty"],
        name: item["AL Name"],
      }));

    if (await uploadDataToDoc(input, "forms")) {
      navigate("/results");
    }
  };

  const addWarehouseDataToDB = async (e) => {
    e.preventDefault();
    setErrorCode("");
    setIsUploading(true);

    if (warehouseInputRef.current.files.length !== 1) {
      setIsUploading(false);
      setErrorCode("No file chosen for upload");
      return;
    }

    const file = await warehouseInputRef.current.files[0].arrayBuffer();
    const wb = read(file);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = utils.sheet_to_json(ws);

    // Extract SKU and AL Name columns
    const parsedData = data
      .filter((item) => item.SKU && item["AL Name"]) // Ensure we have both SKU and AL Name
      .map((item) => ({
        sku: item.SKU.toString().padStart(6, "0"),
        name: item["AL Name"],
      }));

    if (await uploadDataToDoc(parsedData, "warehouse")) {
      navigate("/warehouseResults");
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
          <form onSubmit={addStoreLookupDataToDb}>
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

        {/* New Form for "Get Warehouse and Price Info" */}
        <br />
        <br />
        <div className="home-page">
          <h3>Get Warehouse and Price Info</h3>
          <form onSubmit={addWarehouseDataToDB}>
            <p>
              Please upload a file with the following structure: SKU, AL Name
            </p>
            <label>
              Upload file:
              <input type="file" ref={warehouseInputRef} accept=".xlsx,.xls" />
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
