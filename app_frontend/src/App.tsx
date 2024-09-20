import { useState } from 'react';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './index.css';
import binService from './services/bins';
import { RequestBinView } from './components/request-bin-view';

const Home = (props: any) => {
  const navigate = useNavigate();
  const newBinHandler = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      const endpoint = await binService.createNewEndpoint();
      props.setBin(endpoint);
      navigate(`/bins/${endpoint}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="intro">
        <p>Inspect webhooks and HTTP requests</p>
        <p>Get a URL to collect HTTP or webhook requests and inspect them in a human-friendly way.</p>
        <button id="new-bin-btn" onClick={newBinHandler}>Create New Public Endpoint</button>
      </div>
    </>
  )
}

export const App = () => {
  const [bin, setBin] = useState<string>('');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home bin={bin} setBin={setBin}/>} />
        <Route path="/bins/:bin" element= {<RequestBinView bin={bin}/>} />
      </Routes>
    </Router>
  )
}
