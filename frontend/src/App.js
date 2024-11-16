import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import {SignUp} from "./pages/signUp/SignUp.jsx";
import { Login } from "./pages/login/Login.jsx";
import { UserProvider } from "./context/userContext/userContextProvider.js";
function App() {
  return (
    <UserProvider>
    <div className="App">
      <Router>
        <Routes>
          <Route exact path='/login' element={<Login/>}/>
          <Route exact path="/signUp" element={<SignUp/>}/>
          <Route path="*" element={<div>404 Not Found</div>}/>

          {/* protected routes */}
          <Route exact path='/' element={<div>Dashboard</div>}/>
          <Route exact path="/createRide" element={<div>Create Ride page!!</div>}/>
          <Route exact path="/bookRide" element={<div>Book Ride page!!</div>}/>
          <Route excat path="/profile" element={<div>Profile page!!</div>}/>
          <Route exact path="/updateRide" element={<div>Update Ride page!!</div>}/>
        </Routes>
      </Router>
    </div>
    </UserProvider>
  );
}

export default App;