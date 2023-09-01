import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "./Results.css";

const Results = () => {
  // TODO(nick): add isLoading and a spinner.
  // TODO(nick): Add in meta data to make the output look nicer. Examples:
  // A list of the storeId -> Inventory missing at the relevant stores
  // relevant stores === the stores in the top 3
  // TODO(nick): Add a back to home button.
  // TODO(nick): Make the input section look nicer.
  // TODO(nick): Only output 1 run, no need to do many.
  // TODO: Make a table with columns as SKU, name, quantity needed,
  // quantity missing from best store, etc.
  // Make table sortable (sort by available at 15, etc).
  const auth = getAuth();
  const [forms, setForms] = useState([]);
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
      where("scrapingCompleted", "==", true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedForms = [];
      snapshot.forEach((doc) => {
        const form = doc.data();
        updatedForms.push({
          id: doc.id,
          input: form.input,
          output: form.output,
          date: new Date(form.date).toLocaleString(),
        });
      });
      setForms(updatedForms);
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);

  if (!forms.length) {
    return <p className="no-results">No Results yet</p>;
  }

  return (
    <div className="results-container">
      <h2 className="results-title">Results</h2>
      {forms.map((form) => (
        <div key={form.id} className="form-entry">
          <h3 className="form-date">Upload time: {form.date}</h3>
          <div>
            <h4 className="form-section-title">Input:</h4>
            <ul className="form-list">
              {form.input.map((item) => (
                <li key={item.sku} className="form-item">
                  SKU: {item.sku}, Name: {item.name}, Quantity: {item.quantity}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="form-section-title">Output:</h4>
            {renderResults(form.output)}
          </div>
        </div>
      ))}
    </div>
  );
};

const renderResults = function (output) {
  let results = <p>We were unable to find any stores that matched</p>;
  if (output.topStores) {
    results = (
      <ul className="form-list">
        {output.topStores.map((stores) => {
          return <li className="form-item">{stores}</li>;
        })}
      </ul>
    );
  }
  return results;
};

export default Results;
