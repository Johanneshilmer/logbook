import './App.css';
import { HashRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import Augustiner from "./pages/augustiner";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Augustiner/>} />
      </Routes>
    </HashRouter>
  );
}

export default App;
