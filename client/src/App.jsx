import './App.css';
import { HashRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from 'axios';

import Augustiner from "./pages/augustiner";
import Franziskaner from './pages/franziskaner';
import Mackmyra from './pages/mackmyra';
import SearchPage from './pages/SearchPage';

axios.defaults.baseURL = 'http://localhost:3001'; // Replace with your server URL

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Augustiner/>} />
        <Route path="/franziskaner" element={<Franziskaner/>} />
        <Route path="/mackmyra" element={<Mackmyra/>} />
        <Route path="/search" element={<SearchPage/>} />
      </Routes>
    </HashRouter>
  );
}

export default App;
