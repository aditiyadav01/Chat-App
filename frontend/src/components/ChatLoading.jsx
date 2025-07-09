import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const ChatLoading = () => {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} className="h-[45px] w-full rounded-md" />
      ))}
    </div>
  );
};

export default ChatLoading;
