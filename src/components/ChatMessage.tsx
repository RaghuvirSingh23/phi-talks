import { cn } from "@/lib/utils";

interface ChatMessageProps {
  content: string;
  isAi: boolean;
}

export const ChatMessage = ({ content, isAi }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "px-4 py-3 rounded-lg max-w-[85%] message-appear",
        isAi ? "bg-secondary ml-2" : "bg-primary mr-2 ml-auto"
      )}
    >
      <p className="text-sm md:text-base whitespace-pre-wrap">{content}</p>
    </div>
  );
};