import './App.css';
import { HashRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from 'axios';

import { SocketProvider } from './socket/SocketContext';
import Augustiner from "./pages/Augustiner";
import Franziskaner from './pages/Franziskaner';
import Mackmyra from './pages/Mackmyra';
import SearchPage from './pages/SearchPage';

//.env
const environment = process.env.REACT_APP_SERVER;
axios.defaults.baseURL = environment;

export default function App() {
  return (
    <SocketProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Augustiner/>} />
          <Route path="/franziskaner" element={<Franziskaner/>} />
          <Route path="/mackmyra" element={<Mackmyra/>} />
          <Route path="/search" element={<SearchPage/>} />
        </Routes>
      </HashRouter>
    </SocketProvider>
  );
}
