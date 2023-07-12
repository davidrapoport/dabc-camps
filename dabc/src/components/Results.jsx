import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const Results = () => {
  // TODO(nick): add isLoading and a spinner.
  // TODO(nick): Sort forms by most recent. Only show top 3 most recent.
  // TODO(nick): Add in meta data to make the output look nicer. Examples:
  // A map of storeId -> Address so that we can display the address alongside
  // the data.
  // A list of the storeId -> Inventory at the relevant stores
  // relevant stores === the stores in the top 3
  // TODO(nick): Add a back to home button.
  // TODO(nick): Make the input section look nicer.
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
  }, [navigate]);

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
        });
      });
      setForms(updatedForms);
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);

  if (!forms.length) {
    return <p>No Results yet</p>;
  }
  return (
    <div>
      <h2>Forms</h2>
      {forms.map((form) => (
        <div key={form.id}>
          <h3>Upload time: {form.date}</h3>
          <div>
            <h4>Input:</h4>
            <ul>
              {form.input.map((item) => (
                <li key={item.SKU}>
                  SKU: {item.SKU}, Name: {item.name}, Quantity: {item.quantity}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Output:</h4>
            <ul>
              <li>
                <span>{form.output.topStores.join(", ")} </span>
              </li>
              <li>
                <span>{form.output.stores2.join(", ")} </span>
              </li>
              <li>
                <span>{form.output.stores3.join(", ")} </span>
              </li>
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Results;
