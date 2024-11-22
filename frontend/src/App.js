import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { SignUp } from "./pages/signUp/SignUp.jsx";
import { Login } from "./pages/login/Login.jsx";
import { UserProvider } from "./context/userContext/userContextProvider.js";
import ProtectedRoute from "./common-components/ProtectedRoute/ProtectedRoute.jsx";
import Layout from "./common-components/pageLayout/Layout.jsx";
import NotAuthorized from "./common-components/NotAuthorized/NotAuthorized.jsx";
import { AvailableRides } from "./pages/AvilableRides/AvailableRides";
import "./global.css";
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
                            <Route path="/" element={<ProtectedRoute requiredRole="driver" />}>
                                <Route path="/" element={<AvailableRides />} />
                            </Route>
                            <Route path="/bookings" element={<ProtectedRoute requiredRole="driver" />}>
                                <Route path="/bookings" element={<div>Bookings page!!</div>} />
                            </Route>
                            <Route path="/history" element={<ProtectedRoute />}>
                                <Route path="/history" element={<div>Book Ride page!!</div>} />
                            </Route>
                            <Route path="/settings" element={<ProtectedRoute />}>
                                <Route path="/settings" element={<div>Settings page!!</div>} />
                            </Route>
                        </Route>
                    </Routes>
                </Router>
            </div>
        </UserProvider>
    );
}

export default App;
