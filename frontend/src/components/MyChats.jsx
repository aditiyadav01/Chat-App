import { useEffect, useState } from "react";
import { getSender } from "../components/config/ChatLogics.jsx";
import { ChatState } from "../Context/ChatProvider";
import axios from "axios";
import ChatLoading from "./ChatLoading";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import GroupChatModal from "./Miscelleneous/GroupChatModel.jsx";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();

  const {
    selectedChat,
    setSelectedChat,
    user,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      toast.error("Failed to load the chats");
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  return (
    <div
      className={`${
        selectedChat ? "hidden md:flex" : "flex"
      } flex-col w-full md:w-[30%] bg-[#46211A] border rounded-lg overflow-hidden`}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-3 py-4 border-b shrink-0">
        <h2 className="text-xl font-bold font-sans text-white">My Chats</h2>
        <GroupChatModal>
          <Button variant="outline" className="flex items-center gap-2 text-sm">
            New Group Chat <Plus className="w-4 h-4" />
          </Button>
        </GroupChatModal>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto bg-[#D4D4D4] rounded-lg px-3 py-2 ">
        <div>
          <h3 className="text-sm text-gray-800 mb-1">Recent Chats</h3>
          <ScrollArea className="h-full pr-1">
            {chats ? (
              chats.map((chat) => {
                const unreadCount = notification.filter(
                  (n) => n.chat._id === chat._id
                ).length;
                const time = chat.latestMessage?.createdAt
                  ? new Date(chat.latestMessage.createdAt).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )
                  : "";

                return (
                  <div
                    key={chat._id}
                    onClick={() => {
                      setSelectedChat(chat);
                      setNotification((prev) =>
                        prev.filter((n) => n.chat._id !== chat._id)
                      );
                    }}
                    className={`cursor-pointer px-3 py-2 rounded-lg mb-2 ${
                      selectedChat === chat
                        ? "bg-[#46211A] text-white"
                        : "bg-gray-200 text-black"
                    }`}
                  >
                    {/* Top row: name + time */}
                    <div className="flex justify-between items-center font-medium mb-1">
                      <span>
                        {!chat.isGroupChat
                          ? getSender(loggedUser, chat.users)
                          : chat.chatName}
                      </span>

                      {time && (
                        <span className="text-xs text-gray-400">{time}</span>
                      )}
                    </div>

                    {/* Middle row: latest message + badge */}
                    <div className="flex justify-between items-center">
                      <div className="text-xs truncate w-full">
                        {chat.latestMessage?.content && (
                          <>
                            <strong className="mr-1">
                              {chat.latestMessage?.sender?.name || "Unknown"}:
                            </strong>
                            {chat.latestMessage.content.length > 40
                              ? chat.latestMessage.content.substring(0, 40) +
                                "..."
                              : chat.latestMessage.content}
                          </>
                        )}
                      </div>

                      {/* Badge */}
                      {unreadCount > 0 && (
                        <span className="ml-2 bg-[#46211A] text-white text-xs font-semibold rounded-full px-2 py-0.5">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <ChatLoading />
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default MyChats;
