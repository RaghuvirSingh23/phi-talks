import { useState } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  content: string;
  isAi: boolean;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (content: string) => {
    try {
      setIsLoading(true);
      setMessages((prev) => [...prev, { content, isAi: false }]);
  
      const response = await fetch("http://127.0.0.1:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "phi4",
          prompt: content,
        }),
      });
  
      console.log("Response status:", response.status); // Log status for debugging
  
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
  
      const reader = response.body?.getReader();
      if (!reader) throw new Error("Failed to read response body");
  
      const decoder = new TextDecoder();
      let accumulatedResponse = ""; // Accumulates partial chunks
      let finalResponse = ""; // Complete response to display
  
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          console.log("Stream reading completed");
          break;
        }
  
        // Decode the chunk and append to accumulatedResponse
        accumulatedResponse += decoder.decode(value, { stream: true });
        console.log("Accumulated response:", accumulatedResponse); // Log accumulated chunks
  
        // Extract complete JSON objects
        const parts = accumulatedResponse.split("\n").filter(Boolean); // Split by newlines
        accumulatedResponse = parts.pop() || ""; // Keep the last incomplete part
  
        for (const part of parts) {
          try {
            const data = JSON.parse(part);
            console.log("Streaming JSON part:", data); // Log each JSON part
  
            if (data.response) {
              finalResponse += data.response; // Accumulate the response
              setMessages((prev) => [
                ...prev.slice(0, -1), // Replace the last message
                { content: finalResponse, isAi: true },
              ]);
            }
          } catch (err) {
            console.warn("Failed to parse JSON part:", part); // Log failed parts
          }
        }
      }
    } catch (error) {
      console.error("Error:", error.message || error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to get a valid response from the server.",
      });
    } finally {
      setIsLoading(false);
    }
  };  
  
  return (
    <div className="flex flex-col h-screen max-h-screen">
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            content={message.content}
            isAi={message.isAi}
          />
        ))}
        {isLoading && (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
      </main>
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
};

export default Index;