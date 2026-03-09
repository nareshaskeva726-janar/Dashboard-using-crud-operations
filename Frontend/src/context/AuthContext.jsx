// import { createContext, useContext, useEffect, useState } from "react";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {

//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Get cookie function
//   const getCookie = (name) => {
//     const value = `; ${document.cookie}`;
//     const parts = value.split(`; ${name}=`);
//     if (parts.length === 2) return parts.pop().split(";").shift();
//   };

//   // Set cookie function
//   const setCookie = (name, value, days) => {
//     const expires = new Date();
//     expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
//     document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
//   };

//   // Delete cookie
//   const deleteCookie = (name) => {
//     document.cookie = `${name}=; Max-Age=0; path=/`;
//   };

//   useEffect(() => {

//     const storedUser = localStorage.getItem("user");
//     const storedToken = getCookie("token");

//     if (storedUser && storedToken) {
//       setUser(JSON.parse(storedUser));
//       setToken(storedToken);
//     }

//     setLoading(false);

//   }, []);

//   // LOGIN
//   const login = (userData, tokenData) => {

//     setUser(userData);
//     setToken(tokenData);

//     // Store user in localStorage
//     localStorage.setItem("user", JSON.stringify(userData));

//     // Store token in cookies
//     setCookie("token", tokenData, 7); // expires in 7 days
//   };
    

//   // LOGOUT
//   const logout = () => {

//     setUser(null);
//     setToken(null);

//     localStorage.removeItem("user");

//     deleteCookie("token");

//   };

//   const value = {
//     user,
//     token,
//     loading,
//     login,
//     logout
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // CUSTOM HOOK
// export const useAuth = () => {
//   return useContext(AuthContext);
// };