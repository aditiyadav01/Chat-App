import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const Login = () => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => setShow(!show);

  const submitHandler = async (e) => {
    e.preventDefault();

    setLoading(true);

    if (!email || !password) {
      toast.error("Please fill all the fields");
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: { "Content-type": "application/json" },
      };

      const { data } = await axiosInstance.post(
        `/api/user/login`,
        { email, password },
        config
      );

      toast.success("Login successful!");
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);

      setTimeout(() => {
        navigate("/chat");
      }, 500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed!");
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("userInfo", JSON.stringify({ token }));
      navigate("/chat");
    }
  }, []);

  return (
    <>
      <Toaster position="bottom-center" reverseOrder={false} />
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md px-8 py-10 rounded-xl shadow-lg space-y-6">
        {/* Login Form */}
        <form onSubmit={submitHandler} className="flex flex-col gap-2 w-full">
          {/* Email */}
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="font-medium">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="Enter Your Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#46211A]"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1 relative">
            <label htmlFor="password" className="font-medium">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              type={show ? "text" : "password"}
              required
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#46211A]"
            />
            <button
              type="button"
              onClick={handleClick}
              className="absolute right-3 top-9 text-xs bg-gray-200 px-2 py-1 rounded-md hover:bg-gray-300"
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#46211A] text-white px-4 py-3 rounded-lg text-base shadow-md transition hover:bg-[#6E3A29] ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Logging In..." : "Login"}
          </button>

          {/* Guest Credentials Button */}
          <button
            type="button"
            onClick={() => {
              setEmail("guest@example.com");
              setPassword("123456");
            }}
            className="w-full bg-red-700 text-white py-3 rounded-lg text-base shadow-md transition hover:bg-red-800"
          >
            Get Guest User Credentials
          </button>
        </form>
      </div>
    </>
  );
};

export default Login;
