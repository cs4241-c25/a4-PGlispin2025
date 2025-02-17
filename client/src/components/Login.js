import React from "react";
import API_BASE_URL from "../api";

function Login() {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 text-center mt-6">
      <h2 className="text-2xl font-semibold mb-4">Login</h2>
      <a href={`${API_BASE_URL}/auth/github`} className="bg-blue-500 text-white px-4 py-2 rounded w-full block hover:bg-blue-600 transition">
        Login with GitHub
      </a>
    </div>
  );
}

export default Login;