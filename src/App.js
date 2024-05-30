import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SignIn } from "./components/signIn";
import { auth } from "./config/firebase-config";
import { Messenger } from "./components/messenger";
import Cookies from "universal-cookie";
import { useState } from "react";

const cookie = new Cookies();

function App() {
  const [isUserFromGoogle, setIsUserFromGoogle] = useState(false);
  return (
    <BrowserRouter>
      <Routes>
        <Route
          exact
          path="/"
          element={
            <SignIn cookie={cookie} setIsUserFromGoogle={setIsUserFromGoogle} />
          }
        />
        <Route
          exact
          path={`/messenger`}
          element={
            <Messenger cookie={cookie} isUserFromGoogle={isUserFromGoogle} />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
