"use client";
import React from "react";
import ReactDOM from "react-dom";

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
  "What We Do",
  "Contact Us",
  "What Projects We have done",
  "Discord Server",
  "What Industries We Serve",
];

const faqQuestions = [
  {
    question: "What does Cryenx Labs do?",
    answer:
      "Cryenx Labs is a cutting-edge technology company specializing in immersive experiences, social gaming, and artificial intelligence (AI). We create engaging solutions using AR, VR, generative AI, and XR to help brands connect with their audiences.",
  },
  {
    question: "What services does Cryenx Labs offer?",
    answer:
      "We offer a wide range of services, including Augmented Reality (AR) Solutions, Virtual Reality (VR) Solutions, Generative AI, 3D Design, XR Games, Computer Vision, MedTech, and Industry 5.0 Solutions.",
  },
  {
    question: "How can I contact Cryenx Labs?",
    answer:
      "You can reach us via email at support@cryenx.com or visit our contact page at https://www.cryenx.com/contact .",
  },
  {
    question: "Does Cryenx Labs work with small businesses?",
    answer:
      "Absolutely! Cryenx Labs works with businesses of all sizes. Whether you’re a small business or a large enterprise, we can create customized immersive solutions for you.",
  },
  {
    question: "How does the AI work?",
    answer:
      "Yes, we specialize in creating custom AR and VR solutions tailored to your brand’s needs. Contact us at support@cryenx.com to discuss your project!",
  },
  {
    question: "What industries does Cryenx Labs serve?",
    answer:
      "We serve industries like gaming, retail, healthcare, education, real estate, manufacturing, and more. Our solutions are tailored to meet the unique needs of each industry.",
  },
  {
    question: "What is extended reality (XR)?",
    answer:
      "Extended Reality (XR) is an umbrella term that includes Augmented Reality (AR), Virtual Reality (VR), and Mixed Reality (MR). At Cryenx Labs, we use XR to create immersive experiences that blend the physical and digital worlds.",
  },
  {
    question: "Can Cryenx Labs integrate AI into my existing app?",
    answer:
      "Yes, we can integrate AI features like generative content, computer vision, or predictive analytics into your existing app. Let us know your needs, and we’ll create a tailored solution.",
  },
  {
    question: "Can Cryenx Labs help with product prototyping?",
    answer:
      "Yes, we use 3D design and VR to create virtual prototypes for products. This helps businesses visualize and refine their designs before moving to production.",
  },
  {
    question: "What technologies does Cryenx Labs use?",
    answer:
      "We use a variety of technologies, including AR, VR, XR, generative AI, Unity, Unreal Engine, computer vision, and 3D design to create immersive experiences.",
  },

];

const newsItems = [
  {
    title: "Virsive - The world's largest spatial design library",
    summary:
      "Virsive is a comprehensive library of UI interfaces from the best extended reality apps across multiple platforms. Curated for XR Innovators, It helps you quickly find and save collections of app, design inspiration, and patterns, saving you time and effort.",
    date: "2024-02-04",
  },
  {
    title: "Launch of Immersive AR Experience for Global Fashion Brand",
    summary:
      "Cryenx Labs has recently developed an innovative AR experience for a leading global fashion brand, allowing users to virtually try on clothing using their smartphones.",
    date: "2024-02-03",
  },
  {
    title: "Development of AI-Powered Virtual Influencers",
    summary:
      "Cryenx Labs is at the forefront of creating AI-powered virtual influencers designed to engage audiences across various social media platforms. These lifelike avatars, created using generative AI, are becoming increasingly popular among brands looking to enhance their digital presence.",
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
  className="fixed top-0 left-0 right-0 h-[32vh] bg-cover bg-center z-0 responsive-gradient"
  style={{
    backgroundImage: `
      linear-gradient(to bottom, transparent 85%, rgba(255, 255, 255, 1) 100%),
      url('https://downloads.intercomcdn.com/i/o/509471/f2d56bacf1cb3ac35d9ab59c/deb9cd0325c64b1e1239b3c2ec8c1516.png')
    `,
    width: "calc(100% - 8px)", // Accounts for scrollbar width
  }}
></div>

{/* Custom CSS for Responsive Gradient */}
<style jsx>{`
  .responsive-gradient {
    /* Default gradient for mobile and smaller screens */
    background-image: linear-gradient(
      to bottom,
      transparent 80%,
      rgba(255, 255, 255, 1) 100%
    ), url('https://downloads.intercomcdn.com/i/o/509471/f2d56bacf1cb3ac35d9ab59c/deb9cd0325c64b1e1239b3c2ec8c1516.png');
  }

  /* Laptop (1024px - 1440px) */
  @media (min-width: 1024px) and (max-width: 1440px) {
    .responsive-gradient {
      background-image: linear-gradient(
        to bottom,
        transparent 70%,
        rgba(255, 255, 255, 1) 100%
      ), url('https://downloads.intercomcdn.com/i/o/509471/f2d56bacf1cb3ac35d9ab59c/deb9cd0325c64b1e1239b3c2ec8c1516.png');
    }
  }

  /* Desktop (1441px - 1920px) */
  @media (min-width: 1441px) and (max-width: 1920px) {
    .responsive-gradient {
      background-image: linear-gradient(
        to bottom,
        transparent 60%,
        rgba(255, 255, 255, 1) 100%
      ), url('https://downloads.intercomcdn.com/i/o/509471/f2d56bacf1cb3ac35d9ab59c/deb9cd0325c64b1e1239b3c2ec8c1516.png');
    }
  }

  /* 4K (1921px - 3840px) */
  @media (min-width: 1921px) and (max-width: 3840px) {
    .responsive-gradient {
      background-image: linear-gradient(
        to bottom,
        transparent 50%,
        rgba(255, 255, 255, 1) 100%
      ), url('https://downloads.intercomcdn.com/i/o/509471/f2d56bacf1cb3ac35d9ab59c/deb9cd0325c64b1e1239b3c2ec8c1516.png');
    }
  }

  /* 8K (3841px and above) */
  @media (min-width: 3841px) {
    .responsive-gradient {
      background-image: linear-gradient(
        to bottom,
        transparent 40%,
        rgba(255, 255, 255, 1) 100%
      ), url('https://downloads.intercomcdn.com/i/o/509471/f2d56bacf1cb3ac35d9ab59c/deb9cd0325c64b1e1239b3c2ec8c1516.png');
    }
  }
`}</style>

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
            title: "Augmented Reality Solutions",
            description:
              "Augmented reality (AR) overlays digital information onto your physical world, creating a powerful interactive experience. We cut through the noise by merging the real with the digital to deliver impactful solutions.",
          },
          {
            image:
              "https://cdn.glitch.global/986fc018-8516-42f5-af32-953ec30d55ab/create-a-generative-ai-modelling-3d.jpg?v=1738615897454",
            title:
              "Virtual Reality Solutions",
            description:
              "VR is your portal to endless possibilities. We use VR to put people in alternate realities for training, gaming, or virtual tours. Our VR creates unmatched engagement.",
          },
          {
            image:
              "https://cdn.glitch.global/986fc018-8516-42f5-af32-953ec30d55ab/create-a-concept-art.jpg?v=1738615900378",
            title: "MedTech Solutions",
            description: "MedTech signifies the intersection of medicine and technology. We create innovative medical applications leveraging XR to enhance surgical procedures, provide immersive patient education, and revolutionize medical training.",
          },
          {
            image:
              "https://cdn.glitch.global/986fc018-8516-42f5-af32-953ec30d55ab/create-a-architecture-visualization.jpg?v=1738615901650",
            title: "Computer Vision Solutions",
            description: "Computer vision equips machines with the ability to interpret and understand visual data from the real world. We utilize computer vision to bridge the physical and digital realms, creating seamless interactive experiences.",
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
              Start a conversation by typing a message below
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
        <p className="text-black text-sm text-left">10 collections</p>

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
            className="fixed bottom-24 right-6 z-50 bg-white/10 backdrop-blur-lg shadow-lg rounded-2xl overflow-hidden flex flex-col"
            style={{
              // Dynamic width and height based on viewport size
              width: `clamp(300px, 90vw, 380px)`, // Adjust max-width for 8K screens
              height: `clamp(500px, 80vh, 1200px)`, // Adjust max-height for 8K screens
            }}
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
            <div className="flex justify-center items-center mt-1 mb-3 text-xs text-gray-500">
  Powered by Cryenx Labs
</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
