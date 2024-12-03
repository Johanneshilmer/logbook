import './App.css';
import { HashRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from 'axios';

import { SocketProvider } from './socket/SocketContext';
import Home from './pages/Home';
// SMT
import Augustiner from "./pages/smt/Augustiner";
import Franziskaner from './pages/smt/Franziskaner';
import Mackmyra from './pages/smt/Mackmyra';
import SearchPage from './pages/smt/SearchPage';
// Selektiv
import BlyadVaglodning from './pages/selektiv/BlyadVaglodning';
import BlyfriVaglodning from './pages/selektiv/BlyfriVaglodning';
import Selektiv2 from './pages/selektiv/Selektiv2';
import Selektiv3 from './pages/selektiv/Selektiv3';
import SelektivSearchPage from './pages/selektiv/SelektivSearchPage';

//.env
const environment = process.env.REACT_APP_SERVER;
axios.defaults.baseURL = environment;

export default function App() {
  return (
    <SocketProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home/>} />
          {/* SMT */}
          <Route path="/augustiner" element={<Augustiner/>} />
          <Route path="/franziskaner" element={<Franziskaner/>} />
          <Route path="/mackmyra" element={<Mackmyra/>} />
          <Route path="/smt-search" element={<SearchPage/>} />
          {/* Selektiv */}
          <Route path="/blyad-vaglodning" element={<BlyadVaglodning/>} />
          <Route path="/blyfri-vaglodning" element={<BlyfriVaglodning/>} />
          <Route path="/selektiv2" element={<Selektiv2/>} />
          <Route path="/selektiv3" element={<Selektiv3/>} />
          <Route path="/selektiv-search" element={<SelektivSearchPage/>} />
        </Routes>
      </HashRouter>
    </SocketProvider>
  );
}
