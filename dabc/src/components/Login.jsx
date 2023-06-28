import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import "./Login.css";

const Login = () => {
  const auth = getAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const navigate = useNavigate();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      navigate("/home");
    }
  });

  const login = (e) => {
    e.preventDefault();
    setErrorCode("");
    signInWithEmailAndPassword(auth, email, password)
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
          case "auth/missing-password":
          case "auth/wrong-password":
            setErrorCode("Incorrect password, please try again.");
            setPassword("");
            break;
          case "auth/invalid-email":
            setErrorCode("Invalid email, please try again.");
            break;
          default:
            break;
        }
      });
  };

  return (
    <div>
      <p className="error-message">{errorCode}</p>
      <form className="login-form">
        <label htmlFor="email" className="label">
          Email:
        </label>
        <input
          className="input"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        ></input>
        <label htmlFor="pass" className="label">
          Password:
        </label>
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        ></input>
        <button onClick={login} className="login-button">
          Login
        </button>
      </form>
      <p>
        New User? Register here:{" "}
        <Link to="/register" className="register-link">
          Register
        </Link>
      </p>
    </div>
  );
};

export default Login;
