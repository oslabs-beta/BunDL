import React from 'react';
import { Provider } from 'react-redux';
import Demo from "./demoPage/Demo";
import Home from './homePage/home';
import { store } from "./app/store"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


const App = () => {

  return (
    <Provider store = {store}>
      <Router>
        <Routes>
          <Route path = '/' element = {<Home/>} />
          <Route path = '/demo' element = {<Demo/>} />
        </Routes>
      </Router>
    </Provider>
  )

}

export default App;