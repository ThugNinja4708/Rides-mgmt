import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import {SignUp} from "./pages/signUp/SignUp.jsx";
import { Login } from "./pages/login/Login.jsx";
import { UserProvider } from "./context/userContext/userContextProvider.js";
import ProtectedRoute from "./common-components/ProtectedRoute/ProtectedRoute.jsx";
import Layout from "./common-components/pageLayout/Layout.jsx"
import NotAuthorized from "./common-components/NotAuthorized/NotAuthorized.jsx";
import "./global.css"
function App() {
  return (
    <UserProvider>
        <div className="App">
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signUp" element={<SignUp />} />
                    <Route path="*" element={<div>404 Not Found</div>} />
                    <Route exact path="/notAuthorized" element={<NotAuthorized />} />

                    {/* Protected routes */}
                    <Route element={<Layout />}>
                        <Route path="/" element={<ProtectedRoute requiredRole="driver" />} >
                            <Route path="/" element={<div>Dashboard</div>} />
                        </Route>
                        <Route path="/createRide" element={<ProtectedRoute requiredRole="driver" />} >
                            <Route path="/createRide" element={<div>Create Ride page!!</div>} />
                        </Route>
                        <Route path="/bookRide" element={<ProtectedRoute />} >
                            <Route path="/bookRide" element={<div>Book Ride page!!</div>} />
                        </Route>
                        <Route path="/profile" element={<ProtectedRoute />} >
                            <Route path="/profile" element={<div>Profile page!!</div>} />
                        </Route>
                        <Route path="/updateRide" element={<ProtectedRoute />} >
                            <Route path="/updateRide" element={<div>Update Ride page!!</div>} />
                        </Route>
                    </Route>
                </Routes>
            </Router>
        </div>
    </UserProvider>
);
}

export default App;