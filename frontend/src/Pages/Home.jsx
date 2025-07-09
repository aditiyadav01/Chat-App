import React, { useEffect, useState } from "react";
import Login from "../components/Authentication/Login";
import SignUp from "../components/Authentication/SignUp";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [tab, setTab] = useState("login");
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user) navigate("/chats");
  }, [navigate]);

  return (
    <div className="min-h-screen w-full flex justify-center items-start px-4 pt-6">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Header */}
        <div className="flex justify-center p-4 bg-[#D4D4D4] w-full mb-4 border rounded-lg shadow-md">
          <h1 className="text-3xl sm:text-4xl font-['Work_Sans'] font-bold">
            Taptalk
          </h1>
        </div>

        {/* Tab Section */}
        <div className="bg-[#D4D4D4] w-full p-4 border rounded-lg shadow-md">
          <div className="flex mb-4 rounded-full overflow-hidden border">
            <button
              className={`flex-1 py-2 text-center text-md sm:text-base transition ${
                tab === "login"
                  ? "bg-[#46211A] text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => setTab("login")}
            >
              Login
            </button>
            <button
              className={`flex-1 py-2 text-center text-md sm:text-base transition ${
                tab === "signup"
                  ? "bg-[#46211A] text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => setTab("signup")}
            >
              Sign Up
            </button>
          </div>

          <div className="mt-4">{tab === "login" ? <Login /> : <SignUp />}</div>
        </div>
      </div>
    </div>
  );
};

export default Home;
