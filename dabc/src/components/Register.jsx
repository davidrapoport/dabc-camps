import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { secret } from "../secret";

const Register = () => {
  const auth = getAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const navigate = useNavigate();

  const register = (e) => {
    e.preventDefault();
    if (secretKey !== secret) {
      alert("invalid invite code, please try again");
      setSecretKey("");
      return;
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("user variable: ", user);
        navigate("/home");
      })
      .catch((err) => {
        const errorCode = err.code;
        const errorMessage = err.message;
        console.log("error code: ", errorCode);
        console.log("error message: ", errorMessage);
        switch (errorCode) {
          case "auth/network-request-failed":
            alert(
              "Network error, please check your internet connection and try again."
            );
            break;
          case "auth/email-already-in-use":
            alert("user already exists with that email, please log in");
            navigate("/login");
            break;
          case "auth/invalid-email":
            alert("invalid email, please try again");
            break;
          default:
            break;
        }
      });
  };

  return (
    <div>
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
