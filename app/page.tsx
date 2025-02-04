"use client";

import { useState, useRef, useEffect } from "react";
import {
  IconHome,
  IconMessage,
  IconHelp,
  IconNews,
  IconChevronDown,
  IconMessageFilled,
  IconSearch,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: number;
  text: string;
  sender: "user" | "bot";
  file?: File;
};

const suggestionsData = [
  "What is AI?",
  "Help me brainstorm",
  "Write a short story",
  "Explain quantum computing",
  "Generate a poem",
  "Create a business plan",
];

const faqQuestions = [
  {
    question: "How does the AI work?",
    answer:
      "Our AI uses advanced machine learning algorithms to understand and respond to your queries.",
  },
  {
    question: "Is my data safe?",
    answer:
      "We prioritize your privacy and do not store personal conversations.",
  },
  {
    question: "What can I ask the AI?",
    answer:
      "You can ask about a wide range of topics, from general knowledge to creative tasks.",
  },
  {
    question: "How accurate are the responses?",
    answer:
      "While our AI strives for accuracy, it's always good to verify important information.",
  },
  {
    question: "How does the AI work?",
    answer:
      "Our AI uses advanced machine learning algorithms to understand and respond to your queries.",
  },
  {
    question: "Is my data safe?",
    answer:
      "We prioritize your privacy and do not store personal conversations.",
  },
  {
    question: "What can I ask the AI?",
    answer:
      "You can ask about a wide range of topics, from general knowledge to creative tasks.",
  },
  {
    question: "How accurate are the responses?",
    answer:
      "While our AI strives for accuracy, it's always good to verify important information.",
  },
  {
    question: "How does the AI work?",
    answer:
      "Our AI uses advanced machine learning algorithms to understand and respond to your queries.",
  },
  {
    question: "Is my data safe?",
    answer:
      "We prioritize your privacy and do not store personal conversations.",
  },
  {
    question: "What can I ask the AI?",
    answer:
      "You can ask about a wide range of topics, from general knowledge to creative tasks.",
  },
  {
    question: "How accurate are the responses?",
    answer:
      "While our AI strives for accuracy, it's always good to verify important information.",
  },
];

const newsItems = [
  {
    title: "AI Advances in Healthcare",
    summary:
      "New AI technologies are revolutionizing medical diagnostics and treatment planning.",
    date: "2024-02-04",
  },
  {
    title: "Breakthrough in Climate Modeling",
    summary:
      "Machine learning models provide more accurate climate change predictions.",
    date: "2024-02-03",
  },
  {
    title: "Ethical AI Development",
    summary:
      "Tech companies focus on responsible AI development and deployment.",
    date: "2024-02-02",
  },
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeView, setActiveView] = useState<
    "home" | "messages" | "help" | "news"
  >("home");
  const [suggestions, setSuggestions] = useState(suggestionsData);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedQuestionIndex, setExpandedQuestionIndex] = useState<
    number | null
  >(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const messagesContainerRef = useRef<null | HTMLDivElement>(null);
  const suggestionsContainerRef = useRef<null | HTMLDivElement>(null);

  // Automatically open the chatbot after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChatOpen(true);
    }, 5000); // 5 seconds delay

    return () => clearTimeout(timer); // Cleanup the timer on unmount
  }, []); // Empty dependency array ensures this runs only once on mount

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  // Add draggable scroll functionality to suggestions
  useEffect(() => {
    const suggestionsContainer = suggestionsContainerRef.current;
  
    const handleWheel = (e: WheelEvent) => {
      if (suggestionsContainer) {
        suggestionsContainer.scrollLeft += e.deltaY;
        e.preventDefault(); // Prevent default scrolling behavior
      }
    };
  
    if (suggestionsContainer) {
      suggestionsContainer.addEventListener("wheel", handleWheel, { passive: false });
    }
  
    return () => {
      if (suggestionsContainer) {
        suggestionsContainer.removeEventListener("wheel", handleWheel);
      }
    };
  }, []);

  useEffect(() => {
    if (isChatOpen && activeView === "messages") {
      scrollToBottom();
    }
  }, [messages, isChatOpen, activeView]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
  
    setIsLoading(true);
    setIsGenerating(true);
  
    // Create the user's message
    const userMessage: Message = {
      id: messages.length + 1,
      text: text.trim(),
      sender: "user",
    };
  
    // Add the user's message to the state
    setMessages((prevMessages) => [...prevMessages, userMessage]);
  
    // Add a "thinking" message for the bot
    const thinkingMessage: Message = {
      id: messages.length + 2,
      text: "thinking...", // Temporary placeholder
      sender: "bot",
    };
  
    setMessages((prevMessages) => [...prevMessages, thinkingMessage]);
    setError(null);
  
    try {
      // Call the API to get the AI response
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });
  
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
  
      const data = await response.json();
  
      // Simulate a delay for the fade-in effect
      await new Promise((resolve) => setTimeout(resolve, 500));
  
      // Create the actual bot message
      const botMessage: Message = {
        id: messages.length + 2,
        text: data.result,
        sender: "bot",
      };
  
      // Replace the "thinking" message with the actual bot message
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === thinkingMessage.id ? botMessage : msg
        )
      );
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
  
      // Remove the "thinking" message in case of an error
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== thinkingMessage.id)
      );
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const renderHomeView = () => (
    <div className="p-4 text-gray-300 overflow-y-auto h-full relative bg-white">
      {/* Top Left Logo */}
      <div className="absolute top-8 left-8 z-50">
        <img
          src="https://cdn.glitch.global/986fc018-8516-42f5-af32-953ec30d55ab/Cryenx_White_Logo_Mark_Labs.svg?v=1738615725104"
          alt="Logo"
          className="w-8 h-8"
        />
      </div>

      {/* Background Image (Top 30%) */}
      <div
        className="fixed top-0 left-0 right-0 h-[31vh] bg-cover bg-center z-0"
        style={{
          backgroundImage: `
          linear-gradient(to bottom, transparent 80%, rgba(255, 255, 255, 1) 100%),
          url('https://downloads.intercomcdn.com/i/o/509471/f2d56bacf1cb3ac35d9ab59c/deb9cd0325c64b1e1239b3c2ec8c1516.png')
        `,
          width: "calc(100% - 8px)", // Accounts for scrollbar width
        }}
      ></div>

      {/* Text Above Gradient */}
      <div className="relative z-10 text-[27px] font-bold mt-32 ml-4">
        <span className="text-grey">Hello there. </span>
        <br />
        <span className="text-white">How can we help?</span>
      </div>

      {/* Search Bar with Shadow */}
      <div
        className="relative z-10 bg-white rounded-xl p-3.5 mt-6 flex items-center justify-between cursor-pointer shadow-lg transition-shadow"
        onClick={() => setActiveView("messages")}
      >
        <div className="flex items-center space-x-2">
          <span className="text-black font-semibold">Ask a question</span>
        </div>
        <div className="flex items-center space-x-2">
          <img
            src="https://cdn.glitch.global/986fc018-8516-42f5-af32-953ec30d55ab/Cryenx_Logo_Mark_Labs.svg?v=1738650546537"
            alt="Arrow"
            className="w-6 h-6"
          />
          <img
            src="https://cdn.glitch.global/986fc018-8516-42f5-af32-953ec30d55ab/icons8-arrow-90%20(1).png?v=1738650622773"
            alt="Arrow"
            className="w-4 h-4"
          />
        </div>
      </div>

      {/* Grid Below Search Bar with Shadow */}
      <div className="relative z-10 grid grid-cols-1 gap-4 mt-3">
        {[
          {
            image:
              "https://cdn.glitch.global/986fc018-8516-42f5-af32-953ec30d55ab/create-a-generative-ai-texturing-3d.jpg?v=1738615867294",
            title: "The 2025 Customer Service Transformation Report is here",
            description:
              "Learn how AI has transformed customer service from the group up--rewriting its economics. reshaping customer expectations, and unlocking new levels of scalability.",
          },
          {
            image:
              "https://cdn.glitch.global/986fc018-8516-42f5-af32-953ec30d55ab/create-a-generative-ai-modelling-3d.jpg?v=1738615897454",
            title:
              "Meet Fin 2--the first AI Agent that delivers human-quality service",
            description:
              "Fin 2 can handle all of your frontline support. It uses knowledge behavior, actions and insights to deliver the highest quality customer support, 24/7. Hire Fin 2 today and free your team for higher impact work.",
          },
          {
            image:
              "https://cdn.glitch.global/986fc018-8516-42f5-af32-953ec30d55ab/create-a-concept-art.jpg?v=1738615900378",
            title: "Ethical AI",
            description: "Explore the ethics of AI development.",
          },
          {
            image:
              "https://cdn.glitch.global/986fc018-8516-42f5-af32-953ec30d55ab/create-a-architecture-visualization.jpg?v=1738615901650",
            title: "Creative AI",
            description: "See how AI is used in creative industries.",
          },
        ].map((item, index) => (
          <div
            key={index}
            className="bg-white backdrop-blur-lg rounded-xl p-4 transition-colors border border-solid border-gray-300 shadow-lg hover:shadow-xl transition-shadow"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-30 object-cover"
            />
            <h3 className="text-black text-sm font-semibold mt-2">
              {item.title}
            </h3>
            <p className="text-gray-500 text-sm">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMessagesView = () => (
    <div className="flex flex-col h-full bg-white">
      {" "}
      {/* White background for messages window */}
      {/* Centered Heading */}
      <h1 className="text-xl font-bold text-[#595959] text-center mb-4 mt-4">
        {" "}
        {/* Changed text color to black */}
        Messages
      </h1>
      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 scrollbar-hide relative"
        style={{
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {messages.length > 0 ? (
          <div className="space-y-2">
            {messages.map((message) => (
              <div key={message.id}>{renderMessage(message)}</div>
            ))}
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <IconMessage className="w-12 h-12 text-gray-400 mb-3" />
            <div className="text-gray-500">
              No messages yet. Start a conversation!
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Suggestions Container */}
      <div
  ref={suggestionsContainerRef}
  className="px-4 py-2 flex space-x-2 overflow-x-auto scrollbar-hide"
  style={{
    scrollBehavior: "smooth",
    WebkitOverflowScrolling: "touch",
  }}
>
  {suggestions.map((suggestion, index) => (
    <motion.button
      key={index}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => handleSuggestionClick(suggestion)}
      className="bg-zinc-700 text-white px-3 py-1 rounded-full text-sm whitespace-nowrap hover:bg-zinc-600 transition-colors"
    >
      {suggestion}
    </motion.button>
  ))}
</div>
      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        {" "}
        {/* Changed background to white */}
        <form onSubmit={onSubmit} className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 pl-4 rounded-3xl bg-gray-100 text-black border border-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="bg-black text-white p-3 rounded-3xl hover:bg-black disabled:opacity-50 transition-colors"
          >
            <img
              src="https://cdn.glitch.global/986fc018-8516-42f5-af32-953ec30d55ab/icons8-arrow-96%20(1).png?v=1738655658344"
              alt="Arrow"
              className="w-4 h-4"
            />
          </button>
        </form>
      </div>
    </div>
  );

  const renderHelpView = () => {
    const filteredQuestions = faqQuestions.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="p-4 space-y-4 overflow-y-auto h-full scrollbar-hide bg-white">
        {/* Centered Heading */}
        <h1 className="text-xl font-bold text-[#595959] text-center mb-4">
          Help
        </h1>

        {/* Search Bar */}
        <div className="bg-[#F2F2F2] backdrop-blur-lg rounded-lg p-2 flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for help"
            className="flex-1 bg-transparent text-black placeholder-[#939393] focus:outline-none"
          />
          <IconSearch className="w-4 h-4 text-[#000000]" />
        </div>

        {/* Left-Aligned Text */}
        <p className="text-black text-sm text-left">14 collections</p>

        {/* Issues Container */}
        <div className="space-y-2">
          {filteredQuestions.map((faq, index) => (
            <div
              key={index}
              className="bg-[#F2F2F2] rounded-lg p-4 cursor-pointer hover:bg-[#e0e0e0] transition-colors"
              onClick={() =>
                setExpandedQuestionIndex(
                  expandedQuestionIndex === index ? null : index
                )
              }
            >
              {/* Subheading */}
              <h3 className="text-lg font-semibold text-black mb-2">
                {faq.question}
              </h3>

              {/* Description (Collapsible) */}
              <AnimatePresence>
                {expandedQuestionIndex === index && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-black"
                  >
                    {faq.answer}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderNewsView = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 bg-white border-b">
        <h1 className="text-xl font-bold text-[#595959] text-center mb-4">News</h1>
        <h1 className="text-base font-bold text-[#595959]">Latest News</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {newsItems.map((news, index) => (
          <div 
            key={index} 
            className="bg-white rounded-lg flex flex-col border border-solid border-gray-300 shadow-md hover:shadow-xl transition-shadow duration-300"
          >
            <img 
              src={`https://cdn.glitch.global/986fc018-8516-42f5-af32-953ec30d55ab/create-a-architecture-visualization.jpg?v=1738615901650`} 
              alt={news.title} 
              className="w-full h-48 object-cover rounded-t-lg"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-black mb-2">
                {news.title}
              </h3>
              <p className="text-black mb-2">{news.summary}</p>
              <p className="text-sm text-gray-500">{news.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );;

  const renderMessage = (message: Message) => {
    if (message.sender === "user") {
      return (
        <div className="flex justify-end mb-2">
          <div className="max-w-[80%] rounded-2xl p-3 bg-black text-white">
            {message.text}
          </div>
        </div>
      );
    } else {
      // Check if this specific bot message is in a generating state
      const isGeneratingThisMessage = isGenerating && messages[messages.length - 1] === message;
  
      return (
        <div className="flex justify-start mb-4">
          <div className="max-w-[80%] rounded-2xl p-[1px] bg-gradient-to-r from-[#FEE1D4] to-[#DBBDDB]">
            <div className="bg-[#F5F5F5] rounded-2xl p-3 h-full">
              {/* Agent Icon and Name */}
              <div className="flex items-center space-x-2 mb-2">
                <img
                  src="https://cdn.glitch.global/986fc018-8516-42f5-af32-953ec30d55ab/Cryenx_Logo_Mark_Labs.svg?v=1738650546537"
                  alt="Agent Icon"
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm font-semibold text-black">
                  Cryenx • AI Agent
                </span>
              </div>
  
              {isGeneratingThisMessage ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1, 
                    repeatType: "reverse" 
                  }}
                  className="flex items-center space-x-2 text-gray-600"
                >
                  <div className="animate-pulse">Thinking</div>
                  <div className="flex space-x-1">
                    {[1, 2, 3].map((dot) => (
                      <motion.div 
                        key={dot}
                        animate={{ 
                          scale: [1, 1.2, 1],
                          transition: { 
                            repeat: Infinity, 
                            duration: 0.5, 
                            delay: dot * 0.2 
                          } 
                        }}
                        className="w-2 h-2 bg-gray-500 rounded-full"
                      />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <p className="text-gray-800">{message.text}</p>
              )}
            </div>
          </div>
        </div>
      );
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSendMessage(inputValue);
    setInputValue("");
  };

  const renderContent = () => {
    switch (activeView) {
      case "home":
        return renderHomeView();
      case "messages":
        return renderMessagesView();
      case "help":
        return renderHelpView();
      case "news":
        return renderNewsView();
    }
  };

  return (
    <>
      {/* Chat Widget Icon */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="fixed bottom-6 right-6 z-50 cursor-pointer"
        onClick={() => setIsChatOpen(!isChatOpen)}
      >
        <div className="bg-black rounded-full p-3 shadow-lg hover:bg-black transition-colors">
          {isChatOpen ? (
            <IconChevronDown className="w-6 h-6 text-white" />
          ) : (
            <IconMessageFilled className="w-6 h-6 text-white" />
          )}
        </div>
      </motion.div>

      {/* Chat Interface */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] h-[700px] bg-white/10 backdrop-blur-lg shadow-lg rounded-2xl overflow-hidden flex flex-col"
          >
            {/* Main Content */}
            <div className="flex-1 overflow-hidden">{renderContent()}</div>

            {/* Navigation Menu */}
            <div className="bg-white flex justify-around p-3 border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
              <button
                onClick={() => setActiveView("home")}
                className="flex flex-col items-center p-2 rounded-full hover:bg-gray-50 transition-colors"
              >
                <IconHome
                  className={`w-6 h-6 ${
                    activeView === "home" ? "text-black" : "text-gray-500"
                  }`}
                />
                <span
                  className={`text-xs mt-1 ${
                    activeView === "home"
                      ? "text-black font-medium"
                      : "text-gray-500"
                  }`}
                >
                  Home
                </span>
              </button>
              <button
                onClick={() => setActiveView("messages")}
                className="flex flex-col items-center p-2 rounded-full hover:bg-gray-50 transition-colors"
              >
                <IconMessage
                  className={`w-6 h-6 ${
                    activeView === "messages" ? "text-black" : "text-gray-500"
                  }`}
                />
                <span
                  className={`text-xs mt-1 ${
                    activeView === "messages"
                      ? "text-black font-medium"
                      : "text-gray-500"
                  }`}
                >
                  Messages
                </span>
              </button>
              <button
                onClick={() => setActiveView("help")}
                className="flex flex-col items-center p-2 rounded-full hover:bg-gray-50 transition-colors"
              >
                <IconHelp
                  className={`w-6 h-6 ${
                    activeView === "help" ? "text-black" : "text-gray-500"
                  }`}
                />
                <span
                  className={`text-xs mt-1 ${
                    activeView === "help"
                      ? "text-black font-medium"
                      : "text-gray-500"
                  }`}
                >
                  Help
                </span>
              </button>
              <button
                onClick={() => setActiveView("news")}
                className="flex flex-col items-center p-2 rounded-full hover:bg-gray-50 transition-colors"
              >
                <IconNews
                  className={`w-6 h-6 ${
                    activeView === "news" ? "text-black" : "text-gray-500"
                  }`}
                />
                <span
                  className={`text-xs mt-1 ${
                    activeView === "news"
                      ? "text-black font-medium"
                      : "text-gray-500"
                  }`}
                >
                  News
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
