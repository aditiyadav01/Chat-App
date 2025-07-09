import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./Pages/Home";
import Chat from "./Pages/Chat";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <div
      className="h-screen w-screen flex flex-col overflow-hidden bg-cover bg-center  bg-no-repeat bg-fixed  text-black"
      // style={{ backgroundImage: "url('/Images/bgdImage.png')" }}
      style={{
        backgroundImage:
          "url('https://tse4.mm.bing.net/th/id/OIP.4LckPfSTxG93JH_ursXlJQHaDt?r=0&rs=1&pid=ImgDetMain&o=7&rm=3')",
      }}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chats" element={<Chat />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster position="bottom-center" reverseOrder={false} />
    </div>
  );
};

export default App;
