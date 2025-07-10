import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [password, setPassword] = useState("");
  const [pic, setPic] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => setShow(!show);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!name || !email || !password || !confirmpassword) {
      toast.error("Please fill all the fields");
      setLoading(false);
      return;
    }

    if (password !== confirmpassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(
        `api/user`,
        { name, email, password, pic },
        config
      );

      toast.success("Register successful!");
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);

      // Wait to let the toast show
      setTimeout(() => {
        navigate("/chats");
      }, 1500);
    } catch (error) {
      console.error("Register Error:", error.response?.data);
      toast.error(error.response?.data?.message || "An error occurred!");
      setLoading(false);
    }
  };

  const postDetails = (pics) => {
    setLoading(true);

    if (!pics) {
      toast.error("Please select an image");
      setLoading(false);
      return;
    }

    if (!pics.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append("file", pics);
    data.append("upload_preset", "Chat-App");
    data.append("cloud_name", "dxkcoe957");

    fetch("https://api.cloudinary.com/v1_1/dxkcoe957/image/upload", {
      method: "POST",
      body: data,
    })
      .then((res) => res.json())
      .then((data) => {
        const imageUrl = data.url.toString();
        console.log("Image uploaded to Cloudinary:", imageUrl);
        setPic(imageUrl);
        setLoading(false);
        toast.success("Image uploaded");
      })
      .catch((err) => {
        console.error(err);
        toast.error("Image upload failed");
        setLoading(false);
      });
  };

  return (
    <>
      <Toaster position="bottom-center" reverseOrder={false} />{" "}
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-lg">
        {/* form here */}
        <form onSubmit={submitHandler} className="flex flex-col gap-2 w-full">
          {/* Name */}
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="font-medium">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              placeholder="Enter Your Name"
              onChange={(e) => setName(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#46211A]"
            />
          </div>

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
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#46211A]"
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
              onChange={(e) => setPassword(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#46211A]"
            />
            <button
              type="button"
              onClick={handleClick}
              className="absolute right-3 top-9 text-xs bg-gray-200 px-2 py-1 rounded-md hover:bg-gray-300"
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1 relative">
            <label htmlFor="confirm-password" className="font-medium">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              id="confirm-password"
              type={show ? "text" : "password"}
              required
              placeholder="Confirm password"
              onChange={(e) => setConfirmpassword(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#46211A]"
            />
          </div>

          {/* Upload Picture */}
          <div className="flex flex-col gap-1">
            <label htmlFor="pic" className="font-medium">
              Upload your Picture
            </label>
            <input
              id="pic"
              type="file"
              accept="image/*"
              onChange={(e) => postDetails(e.target.files[0])}
              className="border rounded-lg px-3 py-1 bg-white"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#46211A] text-white py-2 rounded-lg mt-4 text-base shadow-md transition hover:6E3A29 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
      </div>
    </>
  );
};

export default SignUp;
