import { useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react'
import '@fortawesome/fontawesome-free/css/all.min.css';


const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;


function App() {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Bună, sunt medicul de serviciu ACUM VET, cu ce te pot ajuta?",
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
      content: "Vorbește în limba română ca un veterinar cu experiență. Răspunde cât mai scurt posibil, aproape monosilabic, daca e nevoie.La orice referire generală, pune întrebări și cere detalii specifice și mergi pas cu pas către un diagnostic. Evită formulările inutile, stai pe subiect. Nu mai sfătui să apeleze in general la un medic veterinar, ci sa sune la numărul 0729672672. Dacă consideri că situația e gravă, sfătuiește să sune de urgență la numărul 0729672672, sau sa mearga la adresa cabinetului. Ia în calcul ora României, și fă așa: dacă timpul este Luni - Vineri: 09.00 - 21.00, sau Sambata: 09.00 - 17.00, sau Duminica: 09.00 - 14.00 atunci vei trimite userul la adresa 'Bdul Timisoara nr. 47 (Cladirea Nufarul, vis-a-vis de Mall Plaza), Sector 6 , Bucuresti'. Altfel, vei folosi numărul de telefon 0729672672."
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
        <div className="brand">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4RJeNrhQjyw2ulggAaqAh39bYNFvepGmtQw&s" />
          <h1>Servicii de urgență</h1>
          <div>
            <i class="fas fa-phone"></i> 0729 672 672
            <br />
            <i class="fas fa-map-marker-alt"></i> <a target="_blank" href="https://www.google.com/maps/dir//Bd.+Timi%C8%99oara+47,+Bucure%C8%99ti+061344,+Romania/@44.427222,25.9525225,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x40b201caa5993447:0xaa2b31e731e3a340!2m2!1d26.0349232!2d44.4272516!5m2!1e4!1e1?entry=ttu&g_ep=EgoyMDI0MDkyNS4wIKXMDSoASAFQAw%3D%3D0">Bdul Timișoara nr. 47 (Clădirea Nufărul, vis-a-vis de Mall Plaza), Sector 6, București</a>
          </div>
        </div>
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
