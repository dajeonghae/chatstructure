import { configureStore } from "@reduxjs/toolkit";
import nodeReducer from "./slices/nodeSlice";
import modeReducer from "./slices/modeSlice";

const loadNodeState = () => {
  try {
    const saved = localStorage.getItem('experiment_node_state');
    return saved ? { node: JSON.parse(saved) } : undefined;
  } catch {
    return undefined;
  }
};

export const store = configureStore({
  reducer: {
    node: nodeReducer,
    mode: modeReducer,
  },
  preloadedState: loadNodeState(),
});

store.subscribe(() => {
  try {
    localStorage.setItem('experiment_node_state', JSON.stringify(store.getState().node));
  } catch {}
});
