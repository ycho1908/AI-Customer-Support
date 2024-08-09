'use client'
import { Box, Button, CircularProgress, Stack, TextField } from '@mui/material'
import Image from "next/image"
import { useState, useEffect } from 'react'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

export default function Home() {
  // const [history, setHistory] = useState([{
  //   role: 'bot',
  //   text: `Hi I'm the Headstarter Support Agent, how can I assist you today?`,
  //   timestamp: new Date(),
  // }]);
  const [history, setHistory] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [chat, setChat] = useState(null);
  const [theme, setTheme] = useState("light");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_KEY= process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY;
  const MODEL_NAME = "gemini-1.5-flash";

  const genAI = new GoogleGenerativeAI(API_KEY);

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  useEffect(() => {
    const initChat = async () => {
      try {
        const newChat = await genAI
          .getGenerativeModel({ model: MODEL_NAME })
          .startChat({
            generationConfig,
            safetySettings,
            history: [],
        });
        
        setChat(newChat);
        
        const initialMessage = {
          role: 'bot',
          text: "Hi, I'm the Headstarter Support Agent. How can I assist you today?",
          timestamp: new Date(),
        };
        setHistory([initialMessage]);

        // // ONLY WORKS IN THE CASE WHERE YOU FIRST TYPE A MESSAGE TO THE BOT
        // const newChat = await genAI
        //   .getGenerativeModel({ model: MODEL_NAME })
        //   .startChat({
        //     generationConfig,
        //     safetySettings,
        //     history: history.map((msg) => ({
        //       text: msg.text,
        //       role: msg.role, 
        //     })),
        //   });
        // setChat(newChat);

      } catch (error) {
        setError("Failed to initialize chat. Please try again.");
      }
    };

    initChat();
  }, []);

  const handleSendMessage = async () => {
    try {
      const userMessage = {
        text: userInput,
        role: 'user',
        timestamp: new Date(),
      };

      setHistory((prevMessages) => [...prevMessages, userMessage]);
      setUserInput("");

      if (chat) {
        setLoading(true);
        const result = await chat.sendMessage(userInput);
        const botMessage = {
          text: result.response.text(),
          role: 'bot',
          timestamp: new Date(),
        };

        setHistory((prevMessages) => [...prevMessages, botMessage]);
      }
    } catch (error) {
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // handle theme change
  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  // get the theme colors based on the theme state 
  const getThemeColors = () => {
    switch (theme) {
      case 'light':
        return {
          primary: 'bg-white',
          secondary: 'bg-gray-100',
          accent: 'bg-blue-500',
          text:'text-gray-800',
        };
      case 'dark':
        return {
          primary: 'bg-gray-900',
          secondary: 'bg-gray-800',
          accent: 'bg-yellow-500',
          text: 'text-gray-100',
        };
      default:
        return {
          primary: 'bg-white',
          secondary: 'bg-gray-100',
          accent: 'bg-blue-500',
          text: 'text-gray-800',
        };
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // prevents adding a new line in the input field
      handleSendMessage();
    }
  };

  // get the theme colors for the current theme
  const { primary, secondary, accent, text } = getThemeColors();

  return (
    <Box
      width='100vw'
      height='100vh'
      display='flex'
      flexDirection='column'
      justifyContent='center'
      alignItems='center'
    >
      <Stack
        direction='column'
        width='600px'
        height='700px'
        border='1px solid black'
        p={2}
        spacing={2}
      >
        <Stack
          direction='column'
          spacing={2}
          flexGrow={1}
          overflow='auto'
          maxHeight='100%'
        >
        {
          history.map((msg, index) => (
            <Box
              key={index}
              display={'flex'}
              justifyContent={msg.role === 'bot' ? 'flex-start' : 'flex-end'}
            >
              <Box
                bgcolor={msg.role === 'bot' ? 'primary.main' : 'secondary.main'}
                color={'white'}
                borderRadius={10}
                p={2}
              >
                <div>{msg.text}</div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  marginTop: '0.5rem', 
                  textAlign:msg.role === 'bot' ? 'left' : 'right'
                }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </Box>
            </Box>
          ))}
          {loading && (
            <Box
              // display={'flex'} justifyContent={'flex-start'} mt={2}
            >
              <CircularProgress size={20} />
            </Box>
          )}
        </Stack>
        <Stack direction='row' spacing={2}>
          <TextField
            label='message'
            fullWidth
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
          <Button variant='contained' onClick={handleSendMessage}>Send</Button>
        </Stack>
      </Stack>
    </Box>
  );
}

// return (
  //   <div className={`flex flex-col h-screen p-4 ${primary}`}>
  //     <div className='flex justify-between items-center mb-4'>
  //       <h1 className={`text-2xl font-bold ${text}`}>Gemini Chat</h1>
  //       <div className='flex space-x-2'>
  //         <label htmlFor='theme' className={`text-sm ${text}`}>
  //           Theme:
  //         </label>
  //         <select
  //           id='theme'
  //           value={theme}
  //           onChange={handleThemeChange}
  //           className={`p-1 rounded-md border ${text}`}
  //         >
  //           <option value='light'>Light</option>
  //           <option value='dark'>Dark</option>
  //         </select>
  //       </div>
  //     </div>
  //     <div className={`flex-1 overflow-y-auto ${secondary} rounded-md- p-2`}>
  //       {messages.map((msg, index) => (
  //         <div
  //           key={index}
  //           className={`mb-4 ${
  //             msg.role === 'user' ? 'text-right' : 'text-left'
  //           }`}
  //         >
  //           <span 
  //             className={`p-2 rounded-lg ${
  //               msg.role === 'user'
  //                 ? `${accent} text-white`
  //                 : `${primary} ${text}`
  //             }`}
  //           >
  //             {msg.text}
  //           </span>
  //           <p className={`text-xs ${text} mt-1`}>
  //             {msg.role === 'bot' ? 'Bot' : 'You'} -{' '}
  //             {msg.timestamp.toLocaleTimeString()}
  //           </p>
  //         </div>
  //       ))}
  //     </div>
  //     {error && <div className='text-red-500 text-sm mb-4'>{error}</div>}
  //     <div className='flex items-center mt-4'>
  //       <input 
  //         type='text'
  //         placeholder='Type your message...'
  //         value={userInput}
  //         onChange={(e) => setUserInput(e.target.value)}
  //         onKeyDown={handleKeyPress}
  //         className={`flex-1 p-2 rounded-1-md border-t border-b border-1 focus:outline-none focus:border-${accent}`}
  //       />
  //       <button 
  //         onClick={handleSendMessage}
  //         className={`p-2 ${accent} text-white rounded-r-md hover:bg-opacity-80 focus:outline-none`}
  //       >
  //         Send
  //       </button>
  //     </div>
  //   </div>
  // );


// export default function Home() {
//   const [history, setHistory] = useState([{
//     role: 'assistant',
//     content: `Hi I'm the Headstarter Support Agent, how can I assist you today?`,
//   }])

//   const [message, setMessage] = useState('')

//   const sendMessage = async () => {
//     setMessage('')
//     setHistory((history) => [
//       ...history,
//       {role: 'user', content: message},
//       {role: 'assistant', content: ''},
//     ])
//     const response = fetch('/api/chat', {
//       method: 'POST',
//       headers:{
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify([...message, {role: 'user', content: message}]),
//     }).then(async (res) => {
//       const reader = res.body.getReader()
//       const decoder = new TextDecoder()

//       let result = ''
//       return reader.read().then(function processText({done, value}) {
//         if (done) {
//           return result
//         }
//         const text = decoder.decode(value || new Int8Array(), {stream: true})
//         setHistory((history) => {
//           let lastMessage = history[history.length-1]
//           let otherMessages = history.slice(0,history.length-1)
//           return[
//             ...otherMessages,
//             {
//               ...lastMessage,
//               content: lastMessage.content + text,
//             },
//           ]
//         })
//         return reader.read().then(processText)
//       })
//     })
//   }

//   return (
//     <Box
//       width='100vw'
//       height='100vh'
//       display='flex'
//       flexDirection='column'
//       justifyContent='center'
//       alignItems='center'
//     >
//       <Stack
//         direction='column'
//         width='600px'
//         height='700px'
//         border='1px solid black'
//         p={2}
//         spacing={2}
//       >
//         <Stack
//           direction='column'
//           spacing={2}
//           flexGrow={1}
//           overflow='auto'
//           maxHeight='100%'
//         >
//         {
//           history.map((message, index) => (
//             <Box
//               key={index}
//               display={'flex'}
//               justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
//             >
//               <Box
//                 bgcolor={message.role === 'assistant' ? 'primary.main' : 'secondary.main'}
//                 color={'white'}
//                 borderRadius={10}
//                 p={2}
//               >
//                 {message.content}
//               </Box>
//             </Box>
//           ))}
//         </Stack>
//         <Stack direction='row' spacing={2}>
//           <TextField
//             label='message'
//             fullWidth
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//           />
//           <Button variant='contained' onClick={sendMessage}>Send</Button>
//         </Stack>
//       </Stack>
//     </Box>
//   );
// }
