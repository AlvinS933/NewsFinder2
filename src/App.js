
import Navbar from './Navbar';
import Home from './Home';
import Create from './Create'
import BlogDetails from './NewsDetails';
import { BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import NotFound from './NotFound';
import SearchNews from './SearchNews';
import Simulator from './Simulator';
function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className = "content">
          <Switch>
            <Route exact path = "/">
              <Home />
            </Route>
            <Route path = "/simulator">
              <Simulator />
            </Route>
            <Route path = "/create">
              <Create />
            </Route>
            <Route path = "/blogs/:id">
              <BlogDetails />
            </Route>
            <Route path = "/search">
              <SearchNews />
            </Route>
            <Route path ="*">
              <NotFound />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default App;
