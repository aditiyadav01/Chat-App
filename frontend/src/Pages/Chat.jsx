import React, { useState } from "react";
import SideDrawer from "../components/Miscelleneous/SideDrawer.jsx";
import MyChats from "../components/MyChats.jsx";
import ChatBox from "../components/ChatBox.jsx";
import { ChatState } from "../Context/ChatProvider.jsx";

const Chat = () => {
  const { user } = ChatState();
  const [fetchAgain, setFetchAgain] = useState(false);
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      {user && <SideDrawer />}
      <div className="flex flex-1 overflow-hidden p-2 gap-2">
        {user && <MyChats fetchAgain={fetchAgain} />}
        {user && (
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </div>
    </div>
  );
};

export default Chat;
