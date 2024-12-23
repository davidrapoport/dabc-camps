import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "./Results.css";

const WarehouseResults = () => {
  const auth = getAuth();
  const [scrapeResult, setScrapeResult] = useState();
  const [scrapingComplete, setScrapingComplete] = useState(false);
  const [userId, setUserId] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(auth.currentUser.uid);
      } else {
        navigate("/login");
      }
    });
  }, [auth, navigate]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const formsCollection = collection(db, "warehouse");
    const q = query(
      formsCollection,
      where("user", "==", userId),
      orderBy("date", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedForms = [];
      snapshot.forEach((doc) => {
        const form = doc.data();
        if (form.scrapingCompleted) {
          setScrapingComplete(true);
        }
        updatedForms.push({
          id: doc.id,
          input: form.input,
          output: form.output,
          date: new Date(form.date).toLocaleString(),
        });
      });
      setScrapeResult(updatedForms[0]);
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);

  if (!scrapeResult) {
    return <p className="no-results">Results still loading, please wait</p>;
  } else if (!scrapingComplete) {
    return (
      <p className="no-results">
        Results are not ready yet for the document uploaded at:{" "}
        {scrapeResult.date}. Give it a minute and refresh the page.
      </p>
    );
  }

  return (
    <div className="results-container">
      <h2 className="results-title">Results</h2>
      <div>
        <h4 className="form-section-title">Output:</h4>
        <h5>Uploaded at {scrapeResult.date}</h5>
        <div className="data-header">
          <span>Name </span>
          <span>SKU </span>
          <span>Warehouse Qty </span>
          <span>Store Qty </span>
          <span>On Order Qty </span>
          <span>Current Price </span>
          <span>OnSPA</span>
        </div>
        <div>
          {scrapeResult.output.map((row) => (
            <div>
              {row.name}, {row.sku}, {row.warehouseQty}, {row.storeQty},{" "}
              {row.onOrderQty}, {row.currentPrice}, {row.onSPA ? 1 : 0} <br />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WarehouseResults;
