import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

const Login = () => {
  const auth = getAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  onAuthStateChanged(auth, (user) => {
    if(user) {
      navigate('/home')
    }
  })

  const login = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        navigate("/home");
      })
      .catch((err) => {
        const errorCode = err.code;
        const errorMessage = err.message;
        switch (errorCode) {
          case "auth/network-request-failed":
            alert(
              "Network error, please check your internet connection and try again."
            );
            break;
          case "auth/wrong-password":
            alert("Incorrect password, please try again.");
            setPassword("");
            break;
          case "auth/invalid-email":
            alert("Invalid email, please try again.");
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
        <button onClick={login}>Login</button>
      </form>
    </div>
  );
};

export default Login;
