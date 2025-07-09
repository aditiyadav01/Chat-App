import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDateLabel } from "./utils/formDateLabel";
import { FaCheck, FaCheckDouble, FaFileAlt } from "react-icons/fa";
import { ChatState } from "@/context/ChatProvider";

const ScrollableChat = ({ messages }) => {
  const { user, selectedChat } = ChatState();
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const dateRefs = useRef({});
  const [floatingDate, setFloatingDate] = useState("");
  const [previewFile, setPreviewFile] = useState(null); // holds { type, url }

  let lastDate = null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
    handleScroll();
  }, [messages]);

  const handleScroll = () => {
    const containerTop = containerRef.current.getBoundingClientRect().top;
    const visibleDates = Object.entries(dateRefs.current)
      .map(([label, ref]) => ({
        label,
        top: ref?.getBoundingClientRect().top - containerTop,
      }))
      .filter(({ top }) => top <= 30);

    if (visibleDates.length > 0) {
      setFloatingDate(visibleDates[visibleDates.length - 1].label);
    }
  };

  return (
    <TooltipProvider>
      <div
        className="relative flex flex-col space-y-1 flex-1 overflow-y-auto scroll-smooth h-full pr-2"
        onScroll={handleScroll}
        ref={containerRef}
      >
        {/* Floating sticky date label */}
        {floatingDate && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-[#E0E0E0] text-xs text-gray-600 px-3 py-1 rounded-full shadow">
            {floatingDate}
          </div>
        )}

        {messages &&
          messages.map((m, i) => {
            const currentDate = new Date(m.createdAt).toDateString();
            const showDateLabel = currentDate !== lastDate;
            lastDate = currentDate;

            const isSender = m.sender._id === user._id;
            const isGroupChat = selectedChat?.isGroupChat;
            const isFirstInSequence =
              i === 0 || messages[i - 1].sender._id !== m.sender._id;

            const time = new Date(m.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div key={m._id}>
                {/* Date label (conditionally rendered) */}
                {showDateLabel && (
                  <div
                    ref={(el) => {
                      const label = formatDateLabel(m.createdAt);
                      if (!dateRefs.current[label]) {
                        dateRefs.current[label] = el;
                      }
                    }}
                    className="text-center text-xs text-gray-500 mb-2 mt-3"
                  >
                    {formatDateLabel(m.createdAt)}
                  </div>
                )}

                {/* Your original message bubble rendering */}
                {!isSender && isGroupChat && isFirstInSequence && (
                  <div className="pl-10 text-[11px] text-gray-500 font-medium mb-1">
                    {m.sender.name}
                  </div>
                )}

                {/* Message + Avatar Row */}

                <div
                  className={`flex mb-2 ${
                    isSender ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Avatar logic */}
                  {!isSender && (
                    <div className="w-8 mr-2">
                      {!isGroupChat || isFirstInSequence ? (
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={m.sender.pic} alt={m.sender.name} />
                          <AvatarFallback>{m.sender.name[0]}</AvatarFallback>
                        </Avatar>
                      ) : (
                        // invisible placeholder to preserve spacing
                        <div className="w-6 h-6" />
                      )}
                    </div>
                  )}

                  {/* Message bubble */}
                  <div
                    className={`relative rounded-xl px-4 py-2 max-w-[75%] text-sm whitespace-pre-wrap ${
                      isSender
                        ? "bg-[#A43820] text-white rounded-br-none"
                        : "bg-[#D4A46E] text-white rounded-bl-none"
                    }`}
                  >
                    {/* Message Content */}
                    <div className="break-words pr-14">
                      {m.content.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                        <img
                          src={m.content}
                          alt="sent"
                          className="max-w-[200px] rounded-lg cursor-pointer"
                          onClick={() => window.open(m.content, "_blank")}
                        />
                      ) : m.content.match(/\.(pdf|doc|docx)$/i) ? (
                        <div className="flex items-center gap-2 bg-white text-black px-3 py-2 rounded-lg shadow">
                          <FaFileAlt size={18} className="text-[#46211A]" />
                          <a
                            href={m.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="underline text-sm text-blue-900 hover:text-[#46211A] truncate max-w-[150px]"
                          >
                            📄 {decodeURIComponent(m.content.split("/").pop())}
                          </a>
                        </div>
                      ) : m.content.match(/\.(mp4)$/i) ? (
                        <video controls className="max-w-[200px] rounded-lg">
                          <source src={m.content} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        m.content
                      )}
                    </div>

                    {/* ✅ Time + Tick aligned side by side in bottom-right */}
                    <div
                      className="absolute bottom-1 right-2 flex items-center gap-[2px]"
                      style={{ fontSize: "0.6rem", opacity: 0.7 }}
                    >
                      <span className="text-gray-200">{time}</span>

                      {isSender && (
                        <>
                          {m.status === "sent" && (
                            <FaCheck size={10} className="text-white" />
                          )}
                          {m.status === "delivered" && (
                            <FaCheckDouble size={10} className="text-white" />
                          )}
                          {m.status === "seen" && (
                            <FaCheckDouble
                              size={10}
                              className="text-[#D4A46E]"
                            />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

        {/* ✅ Scroll Anchor at the End */}
        <div ref={bottomRef} />
      </div>
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <button
            onClick={() => setPreviewFile(null)}
            className="absolute top-4 right-4 text-white text-xl font-bold bg-black bg-opacity-30 px-3 py-1 rounded-full hover:bg-opacity-60"
          >
            ❌
          </button>
          {previewFile.type === "doc" && (
            <iframe
              src={previewFile.url}
              className="w-[90vw] h-[90vh] rounded-lg bg-white"
              title="Document Preview"
            />
          )}

          {previewFile.type === "image" && (
            <img
              src={previewFile.url}
              alt="preview"
              className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-xl"
            />
          )}

          {previewFile.type === "video" && (
            <video
              controls
              autoPlay
              className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-xl"
            >
              <source src={previewFile.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      )}
    </TooltipProvider>
  );
};

export default ScrollableChat;
