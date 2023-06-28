import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { inviteCode } from "../secret";

const Register = () => {
  const auth = getAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const navigate = useNavigate();

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
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your email"
        ></input>
        <label htmlFor="pass">Password:</label>
        <input
          type="password"
          id="pass"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="your password"
        ></input>
        <label htmlFor="secret">Invite Code:</label>
        <input
          type="password"
          id="secret"
          name="secret"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
          placeholder="your invite code"
        ></input>
        <button onClick={register}>Register</button>
      </form>
    </div>
  );
};

export default Register;
