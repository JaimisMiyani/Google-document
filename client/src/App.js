import { useEffect, useCallback } from 'react';
import './App.css';
import TextEditer from './components/TextEditer';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { BrowserRouter as Router, Switch, Route, Redirect} from 'react-router-dom';
import {v4 as uuidV4 } from 'uuid';

function App() {
  return (
    <Router>
      <Switch>
        <Route path='/' exact>
          <Redirect to={`/document/${uuidV4()}`} />
        </Route>

        <Route path='/document/:id' >
          <TextEditer />
        </Route>
      </Switch>
    </Router>
  )
}

export default App;
