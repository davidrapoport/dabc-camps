import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from "./components/Register";
import { app } from "./firebase";

function App() {
  return (
    <div className="App">
      <p>TODO Nick was here</p>
      <Router>
        <Routes>
          <Route exact path="/register" element={<Register />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
