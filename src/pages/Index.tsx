import { useState } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

      console.log("Sending request to Ollama...");
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "phi4",
          prompt: content,
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Failed to read response body");

      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          console.log("Stream completed");
          break;
        }

        const chunk = decoder.decode(value);
        console.log("Received chunk:", chunk);

        const lines = chunk.split("\n").filter(Boolean);
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            console.log("Parsed JSON data:", data);
            if (data.response) {
              fullResponse += data.response;
              // Update the message in real-time as we receive chunks
              setMessages((prev) => [
                ...prev.slice(0, -1),
                { content: fullResponse, isAi: true },
              ]);
            }
          } catch (err) {
            console.warn("Failed to parse JSON:", err);
          }
        }
      }

    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get response from Ollama. Make sure the service is running and the phi4 model is installed.",
      });
      // Remove the loading message if there was an error
      setMessages((prev) => prev.slice(0, -1));
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