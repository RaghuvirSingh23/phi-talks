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
      // Add user message
      setMessages((prev) => [...prev, { content, isAi: false }]);

      // Call Ollama API
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "phi",
          prompt: content,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from Ollama");
      }

      const data = await response.json();
      
      // Add AI response
      setMessages((prev) => [...prev, { content: data.response, isAi: true }]);
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get response from Ollama. Make sure the service is running.",
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