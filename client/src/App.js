import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import Main from "./pages/main";
import ChatOnly from "./pages/ChatOnly";
import Login from "./pages/Login";

function isEvenP(user) {
  const match = user.match(/^P(\d+)$/);
  if (!match) return false;
  return Number(match[1]) % 2 === 0;
}

function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const Page = isEvenP(user) ? ChatOnly : Main;

  return (
    <Provider store={store}>
      <BrowserRouter basename="/chatstructure">
        <Routes>
          <Route path="/" element={<Page />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
