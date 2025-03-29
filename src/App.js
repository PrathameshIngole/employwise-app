import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UsersProvider } from './context/UsersContext';
import Login from './components/Auth/Login';
import UserList from './components/Users/UserList';
import EditUser from './components/Users/EditUser';
import PrivateRoute from './components/Layout/PrivateRoute';
import React, { useState, useEffect } from "react";

function App() {
    const [page, setPage] = useState(1);
  
  return (
    <AuthProvider>
      <UsersProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/users" element={<PrivateRoute><UserList page={page} setPage={setPage}/></PrivateRoute>} />
            <Route path="/edit-user/:id" element={<PrivateRoute><EditUser /></PrivateRoute>} />
            <Route path="/" element={<PrivateRoute><UserList /></PrivateRoute>} />
          </Routes>
        </Router>
      </UsersProvider>
    </AuthProvider>
  );
}

export default App;