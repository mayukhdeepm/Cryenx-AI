import { NextResponse } from 'next/server';
import { marked } from 'marked';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/tunedModels/cryenx-llm-data-mvr2lz0di6h6:generateContent';

export async function POST(req: Request) {
    console.log('API route called');

    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) {
        console.error('Gemini API key is missing');
        return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    try {
        const { messages } = await req.json();

        // Define the chat history array INSIDE the POST function (session-specific)
        const chatHistory: { role: string; text: string }[] = [];


        // Function to remove training prompts (defined within the scope of POST)
        const removeTrainingPrompts = (text: string): string => {
            // Remove training example prefixes
            let cleanedText = text.replace(/(\[User]:|\[Chatbot]:)\s*/gi, '');
            return cleanedText;
        };

        // Function to check if the query is related to chat history
        const isHistoryQuery = (query: string): boolean => {
            const keywords = ["last message", "previous message", "earlier message", "what did you say", "what did i ask"];
            const lowerCaseQuery = query.toLowerCase();
            return keywords.some(keyword => lowerCaseQuery.includes(keyword));
        };

        // Function to generate response from chat history
        const generateHistoryResponse = (query: string): string => {
            let response = "";
            if (query.toLowerCase().includes("last message")) {
                if (chatHistory.length > 1) {
                    response = `Your last message was: ${chatHistory[chatHistory.length - 1].text}`;
                } else {
                    response = "There is no previous conversation history.";
                }
            }
             else if (query.toLowerCase().includes("previous message")) {
              if (chatHistory.length > 1) {
                  response = `Your previous message was: ${chatHistory[chatHistory.length - 1].text}`;
              } else {
                  response = "There is no previous conversation history.";
              }
          }
             else if (query.toLowerCase().includes("what did i ask")) {
              if (chatHistory.length > 1) {
                  response = `You asked me about: ${chatHistory[chatHistory.length - 1].text}`;
              } else {
                  response = "There is no previous conversation history.";
              }
          }
            // Add more conditions to handle other types of history queries
            else {
                response = "I'm sorry, I can only answer specific questions about our immediate conversation history."; // Or "I'm not equipped to answer that question about history"
            }
            return response;
        };
       // Get the last message from user
        const lastUserMessage = messages[messages.length - 1];
        // Check if the last message is a history query
        if (lastUserMessage && isHistoryQuery(lastUserMessage.text)) {
            const historyResponse = generateHistoryResponse(lastUserMessage.text);
            return NextResponse.json({ result: marked(historyResponse) });  // Return directly from chat history
        }

        // Create the 'contents' array as expected by Gemini
        const geminiContents = [];

        // **REMOVED:** No longer adding system prompt/examples

        // Now, build the conversation history. Correctly alternate roles.
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            const role = message.sender === "user" ? "user" : "model"; // "model" for bot responses
            let text = message.text;

            // Clean the text ONLY for model responses (to remove training prompts)
            if (role === "model") {
                text = removeTrainingPrompts(text);
            }

            geminiContents.push({
                role: role,
                parts: [{ text: text }]
            });
        }

        // Append a final turn with the *current* user query.
        geminiContents.push({
            role: "user",
            parts: [{ text: "" }] // Request the model's output , remove output:
        });

        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: geminiContents  // Use the correctly structured content
            }),
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Gemini API response:', data);

        let generatedText = data.candidates[0].content.parts[0].text;
        console.log('Raw Generated Text:', generatedText);

        //Trim and Clean before passing to markdown
        generatedText = generatedText.replace(/^(input:|output:)\s*/i, '').trim(); // Remove from the start
        generatedText = generatedText.replace(/\s*(input:|output:).*$/i, '').trim(); //Remove from the end

        generatedText = removeTrainingPrompts(generatedText);

        if (!generatedText || generatedText.trim() === "") {
            generatedText = "We're out of charge, we're charging it."; //Custom message
        }

        //Improved link formatting
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        generatedText = generatedText.replace(urlRegex, (url: string) => `[${url}](${url})`);

        // Convert to Markdown
        const markdownResponse = marked(generatedText);

        return NextResponse.json({ result: markdownResponse });
    } catch (error: any) {
        console.error('Error in API route:', error);

        // Custom error handling for 500 errors or rate-limiting issues
        if (error.message.includes('rate limit') || error.message.includes('500')) {
            return NextResponse.json({
                error: "Oops, I think the message hasn't reached us. Please try again.",
            }, { status: 500 });
        }

        // Generic error handling for other cases
        return NextResponse.json({
            error: `Error in API route: ${error.message || 'Unknown error'}`,
        }, { status: 500 });
    }
}