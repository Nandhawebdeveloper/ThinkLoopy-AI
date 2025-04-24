import React, { useState, useRef, useEffect } from "react";
import "../ChatBot/ChatBot.css";
import { FiSend } from "react-icons/fi";
import { marked } from "marked";

const ChatBot = () => {
  const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
  const MODEL_ID = process.env.REACT_APP_MODEL_ID;

  const chatEndRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I'm your AI assistant. How can I help you today?",
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [fixInputFooter, setFixedInputFooter] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  // Function to handle Send User Input Request
  const handleSend = async () => {
    if (userInput.trim() === "" || isTyping || isLoading) return;
    setIsLoading(true);

    const newMessage = { sender: "user", text: userInput?.trim() };
    setMessages((prev) => [...prev, newMessage]);
    setUserInput("");

    try {
      const botReply = await getBotReply(userInput);
      if (!botReply) {
        setIsLoading(false);
        return;
      }
      setMessages((prev) => [...prev, { sender: "bot", text: marked(botReply) }]);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: "bot", text: "Sorry, I couldn't process your request." }]);
    } finally {
      setIsLoading(false);
      setUserInput("");
      if (messages.length > 1) setFixedInputFooter(true);
      else setFixedInputFooter(false);
    }
  };
  // Function to handle Gemini API Request
  const getBotReply = async (msg) => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:streamGenerateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: msg?.trim() }],
              },
            ],
            generationConfig: { responseMimeType: "text/plain" },
          }),
        }
      );

      const data = await response.json();

      let botReply = "";

      data?.forEach((result) => {
        if (result?.candidates[0]?.content?.parts[0]?.text) {
          botReply += result.candidates[0].content.parts[0].text + "\n";
        }
      });

      // Start typing animation
      setTypingText(botReply[0]); // Initialize with the first character
      setIsTyping(true);

      let index = 0; // Start from the second character
      const typeInterval = setInterval(() => {
        if (index < botReply.length) {
          setTypingText((prev) => prev + botReply[index]);
          index++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);
          setMessages((prev) => [...prev, { sender: "bot", text: marked(botReply) }]);
          setTypingText("");
        }
      }, 10);

      return;
    } catch (error) {
      console.error("Error getting bot reply:", error);
      return "Sorry, I couldn't process your request.";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent default behavior of adding a new line
      handleSend();
    }
  };

  useEffect(() => {
    console.log("Messages updated:", messages);
    chatEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages, isTyping, typingText]);

  return (
    <div className={fixInputFooter && "mt-4 pt-3"}>
      <div className="section">
        <div className="chat-container">
          <div className="chat-header">What can I help with ?</div>
          <div className="chat-box mb-5 pb-5">
            {messages.map((msg, index) => (
              <div key={index} className={msg.sender === "user" ? "user-message" : "bot-message"}>
                {msg.sender === "bot" ? <div dangerouslySetInnerHTML={{ __html: msg.text }} /> : msg.text}
              </div>
            ))}
            {isTyping && typingText && (
              <div className="bot-message">
                <div>{typingText}</div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
          <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
            <div className={!fixInputFooter ? "input-wrapper" : "input-footer"}>
              <textarea
                type="text"
                id="user-input"
                value={userInput}
                placeholder=" Ask anything..."
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={2}
              />
              <button onClick={handleSend} className="send-button">
                <FiSend size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
