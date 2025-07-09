import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChatState } from "../../Context/ChatProvider";

const UserListItem = ({ user, handleFunction }) => {
  const { onlineUsers } = ChatState();

  const isOnline = onlineUsers.includes(user._id);

  return (
    <div
      onClick={handleFunction}
      className="w-full flex items-center bg-gray-200 hover:bg-[#46211A] hover:text-white text-black px-3 py-2 mb-2 rounded-lg cursor-pointer border border-r-2 border-[#46211A] shadow-md shadow:[#46211A] "
    >
      <Avatar className="w-8 h-8 mr-2">
        <AvatarImage src={user.pic} alt={user.name} />
        <AvatarFallback>{user.name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{user.name}</span>
        <span
          className={`text-xs font-medium ${
            isOnline ? "text-green-500" : "text-gray-400"
          }`}
        >
          {isOnline ? "Online" : "Offline"}
        </span>
      </div>
    </div>
  );
};

export default UserListItem;
