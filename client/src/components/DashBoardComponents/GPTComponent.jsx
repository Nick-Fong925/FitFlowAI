import { useState } from 'react';
import axios from 'axios';

const ChatGPTComponent = () => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);

  const openaiApiKey = "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";
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  const model = "gpt-3.5-turbo";
  const temperature = 0.7;
  const maxTokens = 150;

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSubmit = async () => {
    if (!inputText.trim()) return;

    const userMessage = { role: 'user', content: inputText };
    setMessages([...messages, userMessage]);

    try {
      const response = await axios.post(apiUrl, {
        model,
        messages: [...messages, userMessage],
        max_tokens: maxTokens,
        temperature,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
      });

      const chatGPTMessage = response.data.choices[0].message;
      setMessages([...messages, chatGPTMessage]);
    } catch (error) {
      console.error("Error:", error.message);
    }

    setInputText('');
  };

  return (
    <div>
      <div>
        {messages.map((message, index) => (
          <div key={index} className={message.role === 'user' ? 'user-message' : 'chatgpt-message'}>
            {message.content}
          </div>
        ))}
      </div>
      <div>
        <input type="text" value={inputText} onChange={handleInputChange} />
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
};

export default ChatGPTComponent;