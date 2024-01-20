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
import ResultsTable from "./ResultsTable";

const Results = () => {
  // TODO(nick): add isLoading and a spinner.
  // TODO(nick): Add a back to home button..
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

    const formsCollection = collection(db, "forms");
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
        <h5>Recommended stores: </h5>
        <div className="recommended-stores-container">
          <ul>
            {scrapeResult.output.recommendedStores.map((storeList) => (
              <li key={storeList}>{storeList}</li>
            ))}
          </ul>
        </div>
        {scrapeResult.output.problemItems.length ? (
          <>
            <h3>
              The following items could not be found at more than three stores.
              They may be causing issues.
            </h3>
            <div className="recommended-stores-container">
              <ul>
                {scrapeResult.output.problemItems.map((item) => (
                  <li key={item.sku}>
                    {item.name} (available at {item.stores.length} stores)
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <></>
        )}

        {renderResults(scrapeResult.output)}
      </div>
    </div>
  );
};

const renderResults = function (output) {
  let results = <p>We were unable to find any stores that matched</p>;
  if (output.topStores) {
    results = <ResultsTable results={output} />;
  }
  return results;
};

export default Results;
