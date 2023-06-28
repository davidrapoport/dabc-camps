import { useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const auth = getAuth();
  const navigate = useNavigate();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      setIsLoggedIn(true);
    } else {
      navigate("/login");
    }
  });

  const logOut = () => {
    signOut(auth)
      .then(() => {
        navigate("/login");
      })
      .catch((err) => {

      });
  };

  return isLoggedIn ? (
    <div>
      <p>This is the home page</p>
      <button onClick={logOut}>Log Out</button>
    </div>
  ) : (
    <></>
  );
};

export default Home;
