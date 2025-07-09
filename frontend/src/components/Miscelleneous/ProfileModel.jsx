import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { User2 } from "lucide-react";

const ProfileModal = ({ user, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {children ? (
        <span
          onClick={(e) => {
            e.preventDefault();
            setOpen(true);
          }}
        >
          {children}
        </span>
      ) : (
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
          <User2 className="w-5 h-5" />
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[320px] sm:w-[360px] p-6 text-center">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {" "}
              {user.name}{" "}
            </DialogTitle>
            <DialogClose />
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 mt-4">
            <img
              src={user.pic}
              alt={user.name}
              className="w-24 h-24 rounded-full border border-gray-300 shadow-sm object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <DialogDescription className="text-gray-700 text-sm">
              Email: {user.email}
            </DialogDescription>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={() => setOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileModal;
