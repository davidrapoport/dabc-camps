import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const Register = () => {
  const auth = getAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const onChangeEmail = (e) => {
    let text = e.target.value;
    setEmail(text);
  };

  const onChangePassword = (e) => {
    let text = e.target.value;
    setPassword(text);
  };

  const onChangeSecret = (e) => {
    let text = e.target.value;
    setSecretKey(text);
  };

  const register = (e) => {
    e.preventDefault();
    if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)) {
      alert(
        "Password must be at least 8 characters long and contain at least one letter and one number"
      );
      setPassword("");
      return;
    }
    //TODO: implement secret key validation
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("user variable: ", user);
      })
      .catch((err) => {
        const errorCode = err.code;
        const errorMessage = err.message;
        console.log("error code: ", errorCode);
        console.log("error message: ", errorMessage);
        switch (errorCode) {
          case "auth/email-already-in-use":
            alert("user already exists with that email, please log in");
            navigate("/login");
            break;
          case "auth/invalid-email":
            alert("invalide email, please try again");
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
          onChange={onChangeEmail}
          placeholder="your email"
        ></input>
        <label htmlFor="pass">Password:</label>
        <input
          type="password"
          id="pass"
          name="password"
          value={password}
          onChange={onChangePassword}
          placeholder="your password"
        ></input>
        <label htmlFor="secret">Secret Key:</label>
        <input
          type="password"
          id="secret"
          name="secret"
          value={secretKey}
          onChange={onChangeSecret}
          placeholder="the secret key"
        ></input>
        <button onClick={register}>Register</button>
      </form>
    </div>
  );
};

export default Register;
