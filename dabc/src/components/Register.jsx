import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getAuth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { inviteCode } from "../secret";

const Register = () => {
  const auth = getAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const navigate = useNavigate();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      navigate("/home");
    }
  });

  const register = (e) => {
    e.preventDefault();
    setErrorCode("");
    if (secretKey !== inviteCode) {
      setErrorCode("invalid invite code, please try again");
      setSecretKey("");
      return;
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        navigate("/home");
      })
      .catch((err) => {
        switch (err.code) {
          case "auth/network-request-failed":
            setErrorCode(
              "Network error, please check your internet connection and try again."
            );
            break;
          case "auth/email-already-in-use":
            setErrorCode("User already exists with that email, please log in");
            break;
          case "auth/invalid-email":
            setErrorCode("Invalid email, please try again");
            break;
          case "auth/weak-password":
          case "auth/missing-password":
            setErrorCode("Password must be at least 6 characters");
            break;
          default:
            break;
        }
      });
  };

  return (
    <div>
      <p>{errorCode}</p>
      <form>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        ></input>
        <label htmlFor="pass">Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        ></input>
        <label htmlFor="secret">Invite Code:</label>
        <input
          type="password"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
        ></input>
        <button onClick={register}>Register</button>
      </form>
      <p>
        Already a User? Login here: <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;
