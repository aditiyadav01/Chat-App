import { useState } from "react";
import { Eye } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserBadgeItem from "../User Avatar/UserBadgeItem";
import UserListItem from "../User Avatar/UserListItem";
import { ChatState } from "@/context/ChatProvider";
import axiosInstance from "../utils/axiosInstance";

const UpdateGroupChatModal = ({ fetchMessages, fetchAgain, setFetchAgain }) => {
  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameloading, setRenameLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const { selectedChat, setSelectedChat, user } = ChatState();

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) return;

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axiosInstance.get(
        `/api/user?search=${query}`,
        config
      );
      setSearchResult(data);
    } catch (error) {
      toast.error("Failed to load the search results.");
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!groupChatName) return;

    try {
      setRenameLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axiosInstance.put(
        `/api/chat/rename`,
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setGroupChatName("");
      toast.success("Group renamed successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Rename failed");
    } finally {
      setRenameLoading(false);
    }
  };

  const handleAddUser = async (user1) => {
    if (selectedChat.users.find((u) => u._id === user1._id)) {
      toast.error("User already in group!");
      return;
    }

    if (selectedChat.groupAdmin._id !== user._id) {
      toast.error("Only admins can add someone!");
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axiosInstance.put(
        `/api/chat/groupadd`,
        { chatId: selectedChat._id, userId: user1._id },
        config
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      toast.success("User added.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Add user failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (user1) => {
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      toast.error("Only admins can remove someone!");
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axiosInstance.put(
        `/api/chat/groupremove`,
        { chatId: selectedChat._id, userId: user1._id },
        config
      );
      user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessages();
      toast.success(
        user1._id === user._id ? "You left the group" : "User removed."
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Remove user failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="w-5 h-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            {selectedChat.chatName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {selectedChat.users.map((u) => (
            <UserBadgeItem
              key={u._id}
              user={u}
              admin={selectedChat.groupAdmin}
              handleFunction={() => handleRemove(u)}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Input
            placeholder="Chat Name"
            value={groupChatName}
            onChange={(e) => setGroupChatName(e.target.value)}
          />
          <Button onClick={handleRename} disabled={renameloading}>
            {renameloading ? "Updating..." : "Update"}
          </Button>
        </div>

        <Input
          placeholder="Add user to group"
          onChange={(e) => handleSearch(e.target.value)}
          className="mt-4"
        />

        <div className="mt-2 max-h-56 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-6">
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent animate-spin rounded-full" />
            </div>
          ) : (
            searchResult?.map((user) => (
              <UserListItem
                key={user._id}
                user={user}
                handleFunction={() => handleAddUser(user)}
              />
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="destructive" onClick={() => handleRemove(user)}>
            Leave Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateGroupChatModal;
