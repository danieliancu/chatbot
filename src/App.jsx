import { useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react'

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;


function App() {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Bună, sunt medicul de serviciu, cu ce te pot ajuta?",
      sender: "ChatGPT",
      position: "right"  // Alinierea ChatGPT la dreapta
    }
  ]);

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing",
      position: "left"  // Alinierea mesajului utilizatorului la stânga
    }

    const newMessages = [...messages, newMessage];

    setMessages(newMessages);
    setTyping(true);
    await processMessageToChatGPT(newMessages);
  }

  async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((messageObject) => {
      let role = messageObject.sender === "ChatGPT" ? "assistant" : "user";
      return { role: role, content: messageObject.message }
    });

    const systemMessage = {
      role: "system",
      content: "Vorbește în limba română ca un veterinar cu experiență. Răspunde cât mai scurt posibil, aproape monosilabic, daca e nevoie.La orice referire generală, pune întrebări și cere detalii specifice și mergi pas cu pas către un diagnostic. Evită formulările inutile, stai pe subiect. Nu mai sfătui să apeleze in general la un medic veterinar, ci sa sune la numărul 08797876776. Dacă consideri că situația e gravă, sfătuiește să sune de urgență la numărul 08797876776."
    }

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,
        ...apiMessages
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => data.json()).then((data) => {
      setMessages([...chatMessages, {
        message: data.choices[0].message.content,
        sender: "ChatGPT",
        position: "right"  // Aliniere la dreapta pentru răspunsul ChatGPT
      }]);
      setTyping(false);
    });
  }

  return (
    <div className="App">
      <div>
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior="auto"  // Setăm scroll-ul să fie automat
              autoScrollToBottom={true}  // Asigură-te că se vede ultimul mesaj
              typingIndicator={typing ? <TypingIndicator content="Typing..." /> : null}
            >
              {messages.map((message, i) => {
                return (
                  <Message
                    key={i}
                    model={{
                      message: message.message,
                      sentTime: "just now",
                      sender: message.sender,
                      direction: message.position === "right" ? "incoming" : "outgoing",
                      position: message.position
                    }}
                    style={{
                      borderRadius: "10px",
                      padding: "10px",
                      maxWidth: "80%",
                      textAlign: message.sender === "ChatGPT" ? "left" : "right",  // Aliniere text pentru ChatGPT
                    }}
                  />
                );
              })}
            </MessageList>
            <MessageInput placeholder='Scrie aici mesajul tău' onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
}

export default App;
