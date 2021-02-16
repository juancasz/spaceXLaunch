import React from 'react'
import Countdown from './Components/Countdown'
import NextLaunches from './Components/NextLaunches'
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

const App = () => {
  return (
    <Router >
      <Switch>
        <Route path="/nextLaunches">
          <NextLaunches/>
        </Route>
        <Route path="/">
          <Countdown/>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
