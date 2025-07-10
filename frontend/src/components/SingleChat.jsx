import { ArrowLeft } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { getSender, getSenderFull } from "./config/ChatLogics";
import ProfileModal from "./Miscelleneous/ProfileModel";
import UpdateGroupChatModal from "./Miscelleneous/UpdateGroupChatModal";
import axios from "axios";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import ScrollableChat from "./ScrollableChat";
import "./style.css";
import { io } from "socket.io-client";
import animationData from "../animations/typing.json";
import Lottie from "lottie-react";
import { SendHorizonal } from "lucide-react";
import { Paperclip, Image as ImageIcon } from "lucide-react";
import { ChatState } from "@/context/ChatProvider";
import axiosInstance from "./utils/axiosInstance";

const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const {
    user,
    selectedChat,
    setSelectedChat,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef(null);

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axiosInstance.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "auto" });
      }, 100);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast.error("Failed to Load the Messages");
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axiosInstance.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );
        socket.emit("new message", data);
        setMessages((prev) => [...prev, data]);

        setChats((prevChats) => {
          const updatedChat = {
            ...selectedChat,
            latestMessage: data,
          };
          const otherChats = prevChats.filter((c) => c._id !== updatedChat._id);
          return [updatedChat, ...otherChats];
        });
      } catch (error) {
        toast.error("Failed to send the Message");
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setUploading(true); //  Show spinner now

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Chat-App"); // For Cloudinary

    try {
      const { data } = await axios.post(
        "https://api.cloudinary.com/v1_1/dxkcoe957/auto/upload",
        formData
      );

      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const res = await axiosInstance.post(
        "/api/message",
        {
          content: data.url,
          chatId: selectedChat._id,
        },
        config
      );

      socket.emit("new message", res.data);
      setMessages((prev) => [...prev, res.data]);
      setSelectedFile(null);
      setUploading(false); // Hide spinner now
    } catch (error) {
      toast.error("File upload failed");
      setUploading(false); // Hide spinner on error
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  useEffect(() => {
    if (selectedChat) {
      socket.emit("message-seen", {
        chatId: selectedChat._id,
        userId: user._id,
      });
    }
  }, [selectedChat, messages]);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    const messageHandler = (newMessageRecieved) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.some((msg) => msg._id === newMessageRecieved._id)) {
          setNotification((prev) => [newMessageRecieved, ...prev]);
          setFetchAgain((prev) => !prev);
        }
      } else {
        setMessages((prev) => [...prev, newMessageRecieved]);
      }

      // Move updated chat to top
      setChats((prevChats) => {
        const updatedChat = {
          ...newMessageRecieved.chat,
          latestMessage: newMessageRecieved,
        };

        const otherChats = prevChats.filter((c) => c._id !== updatedChat._id);
        return [updatedChat, ...otherChats];
      });
      setSelectedFile(null);
    };

    const seenHandler = ({ chatId, userId }) => {
      if (selectedChat && selectedChat._id === chatId) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.readBy?.includes(userId)
              ? msg
              : {
                  ...msg,
                  status: "seen",
                  readBy: [...(msg.readBy || []), userId],
                }
          )
        );
      }
    };

    const deliveredHandler = ({ messageId, status }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, status } : msg
        )
      );
    };

    socket.on("message recieved", messageHandler);
    socket.on("message-seen", seenHandler);
    socket.on("message-delivered", deliveredHandler);

    return () => {
      socket.off("message recieved", messageHandler);
      socket.off("message-seen", seenHandler);
      socket.off("message-delivered", deliveredHandler);
    };
  }, [selectedChat, notification, fetchAgain, setChats, setNotification]);

  const typingHandler = async (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <div className="flex items-center justify-between w-full px-2 pb-3 text-[28px] md:text-[30px] font-sans bg-[#46211A] text-white font-bold">
            <button
              className="flex p-2 rounded hover:bg-white hover:text-black"
              onClick={() => setSelectedChat("")}
            >
              <ArrowLeft className="w-5 h-5 " />
            </button>
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchMessages={fetchMessages}
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                />
              </>
            )}
          </div>
          {/* Main Chat Body */}
          <div className="flex flex-col h-full bg-[#D4D4D4] w-full rounded-lg overflow-hidden px-3 py-2">
            <div className="flex-1 overflow-y-auto pr-2">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <LoaderCircle className="w-20 h-20 animate-spin text-gray-600" />
                </div>
              ) : (
                <div className="messages">
                  <ScrollableChat messages={messages} />
                </div>
              )}
            </div>

            {istyping && (
              <div className="pl-1 pb-1">
                <Lottie
                  animationData={animationData}
                  loop
                  autoplay
                  className="w-[70px]"
                />
              </div>
            )}

            <div className="relative flex items-center mt-2 px-3">
              {/* Input container with glass-like effect */}
              <div className="flex items-center bg-[#E0E0E0]/30 backdrop-blur-md px-3 py-2 rounded-full w-full">
                {/* 📎 File Upload Button */}
                <label className="cursor-pointer text-[#46211A]  px-3 py-1 rounded hover:text-[#75463d] flex items-center gap-2">
                  <ImageIcon size={16} />
                  <span>/</span>
                  <Paperclip size={16} />
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                </label>
                {uploading && (
                  <div className="flex justify-center items-center py-2">
                    <LoaderCircle className="w-6 h-6 animate-spin text-gray-600" />
                    <span className="text-sm text-gray-600 ml-2">
                      Uploading...
                    </span>
                  </div>
                )}

                {/* ✏️ Message Input */}
                <input
                  type="text"
                  value={newMessage}
                  onChange={typingHandler}
                  onKeyDown={sendMessage}
                  placeholder="Send a message"
                  className="flex-1 bg-transparent text-black placeholder:text-gray-400 focus:outline-none"
                />
              </div>

              {/* 📨 Send Button */}
              <button
                onClick={() => sendMessage({ key: "Enter" })}
                className="absolute right-2 bg-[#46211A] hover:bg-[#6d4239] text-white p-2 rounded-full ml-2"
              >
                <SendHorizonal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center bg-[#D4D4D4] justify-center h-full">
          <p className="text-3xl pb-3 font-sans">
            Click on a user to start chatting
          </p>
        </div>
      )}
    </>
  );
};

export default SingleChat;
