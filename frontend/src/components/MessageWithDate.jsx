import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { ChatState } from "@/context/ChatProvider";

dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(advancedFormat);

const formatDateLabel = (dateStr) => {
  const date = dayjs(dateStr);
  if (date.isToday()) return "Today";
  if (date.isYesterday()) return "Yesterday";
  if (dayjs().diff(date, "day") < 7) return date.format("dddd");
  return date.format("DD MMM YYYY");
};

const MessageWithDate = ({ message, isSender, showDateLabel }) => {
  const { user } = ChatState();

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      {showDateLabel && (
        <div className="text-center text-xs text-gray-500 my-2">
          {formatDateLabel(message.createdAt)}
        </div>
      )}

      <div
        className={`flex mb-2 ${isSender ? "justify-end" : "justify-start"}`}
      >
        {!isSender && (
          <Avatar className="w-6 h-6 mt-1 mr-2">
            <AvatarImage src={message.sender.pic} alt={message.sender.name} />
            <AvatarFallback>{message.sender.name[0]}</AvatarFallback>
          </Avatar>
        )}

        <div
          className={`relative rounded-xl px-4 py-2 max-w-[75%] text-sm whitespace-pre-wrap ${
            isSender
              ? "bg-[#DCF8C6] text-black rounded-br-none"
              : "bg-white text-black rounded-bl-none"
          }`}
        >
          <div className="break-words pr-10">{message.content}</div>
          <span
            className="absolute bottom-1 right-2 text-[10px] text-gray-500 translate-y-1"
            style={{ fontSize: "0.6rem", opacity: 0.7 }}
          >
            {time}
          </span>
        </div>
      </div>
    </>
  );
};

export default MessageWithDate;
