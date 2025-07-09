import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getSender } from "../config/ChatLogics.jsx";
import ChatLoading from "../ChatLoading";
import ProfileModal from "./ProfileModel";
import UserListItem from "../User Avatar/UserListItem.jsx";

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Bell, BellIcon, ChevronDown, Loader2, Search } from "lucide-react";
import { ChatState } from "@/context/ChatProvider.jsx";

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  const {
    setSelectedChat,
    user,
    notification = [],
    setNotification,
    chats,
    setChats,
  } = ChatState();

  const navigate = useNavigate();

  useEffect(() => {
    if (isSheetOpen) {
      const fetchAllUsers = async () => {
        try {
          const config = {
            headers: { Authorization: `Bearer ${user.token}` },
          };
          const { data } = await axios.get(`/api/user`, config);
          setAllUsers(data.slice(0, 20)); // trim to first 20
        } catch (error) {
          toast.error("Failed to load users");
        }
      };

      fetchAllUsers();
    }
  }, [isSheetOpen, user.token]);

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleSearch = async () => {
    if (!search) {
      toast.warning("Please enter something in search");
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setSearchResult(data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load search results");
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`/api/chat`, { userId }, config);
      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }
      setSelectedChat(data);
      setLoadingChat(false);
      setSearch("");
      setIsSheetOpen(false); //  Close the sheet after selecting user
    } catch (error) {
      toast.error("Error fetching the chat");
    }
  };

  return (
    <>
      <div className="flex justify-between items-center bg-[#D4D4D4] w-full px-4 py-2 border-b-4 border-gray-200">
        {/* Search Sheet */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 bg-[#E8E8E8] border-r-2 border-[#46211A]"
            >
              <Search className="w-4 h-4 " />
              <span className="hidden md:inline">Search User</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[300px] sm:w-[400px] bg-[#D4D4D4] "
          >
            <SheetHeader>
              <SheetTitle>Search Users</SheetTitle>
            </SheetHeader>

            <div className="flex gap-2 mt-4">
              <Input
                placeholder="Search by name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button className="bg-[#46211A]" onClick={handleSearch}>
                Go
              </Button>
            </div>

            <div className="mt-4 max-h-[70vh] overflow-y-auto">
              {loading ? (
                <ChatLoading />
              ) : search ? (
                searchResult.map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => accessChat(user._id)}
                  />
                ))
              ) : (
                allUsers.map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => accessChat(user._id)}
                  />
                ))
              )}

              {loadingChat && (
                <div className="flex justify-center mt-3">
                  <Loader2 className="animate-spin w-6 h-6" />
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* App name */}
        <div className="text-2xl font-sans font-semibold">TapTalk</div>

        {/* Notification + Profile */}
        <div className="flex gap-4 items-center">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 rounded hover:bg-gray-100">
                <BellIcon className="w-6 h-6" />
                {notification.length > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full animate-bounce">
                    {notification.length}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-72">
              {notification.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No New Messages
                </div>
              ) : (
                notification.map((notif) => (
                  <DropdownMenuItem
                    key={notif._id}
                    onClick={() => {
                      setSelectedChat(notif.chat);
                      setNotification(notification.filter((n) => n !== notif));
                    }}
                  >
                    {notif.chat.isGroupChat
                      ? `New Message in ${notif.chat.chatName}`
                      : `New Message from ${getSender(user, notif.chat.users)}`}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={user.pic} alt={user.name} />
                  <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <ProfileModal user={user}>
                <span className="cursor-pointer">My Profile</span>
              </ProfileModal>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logoutHandler}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
};

export default SideDrawer;
