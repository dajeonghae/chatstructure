import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { resetToInitial } from "./redux/slices/nodeSlice";
import { initTracking, clearTracking, submitExperimentData } from "./services/trackingService";
import Main from "./pages/main";
import ChatOnly from "./pages/ChatOnly";
import Login from "./pages/Login";

function isEvenP(user) {
  const match = user.match(/^P(\d+)$/);
  if (!match) return false;
  return Number(match[1]) % 2 === 0;
}

function App() {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('experiment_user');
    if (u) initTracking(u);
    return u;
  });

  const handleLogin = (u) => {
    localStorage.setItem('experiment_user', u);
    initTracking(u);
    setUser(u);
  };

  const handleLogout = async () => {
    await submitExperimentData();
    store.dispatch(resetToInitial());
    clearTracking();
    localStorage.removeItem('experiment_user');
    localStorage.removeItem('experiment_messages_chatonly');
    localStorage.removeItem('experiment_messages_main');
    localStorage.removeItem('experiment_node_state');
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const Page = isEvenP(user) ? ChatOnly : Main;

  return (
    <Provider store={store}>
      <BrowserRouter basename="/chatstructure">
        <Routes>
          <Route path="/" element={<Page onLogout={handleLogout} />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
