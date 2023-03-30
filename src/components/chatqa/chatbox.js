import React, { useEffect, useRef, useState } from "react";
import { Input, Button, List, Avatar, message } from "antd";
import { SendOutlined } from "@ant-design/icons";
import useWebSocket, { ReadyState } from "react-use-websocket";

import "./index.css";
import { useParams } from "react-router-dom";

const colorSet = [
  "#FDAC53",
  "#9BB7D4",
  "#B55A30",
  "#F5DF4D",
  "#0072B5",
  "#A0DAA9",
  "#E9897E",
  "#00A170",
  "#926AA6",
  "#D2386C",
  "#363945",
  "#939597",
  "#EFE1CE",
];

const ChatBox = () => {
  // Hooks
  const [history, setHistory] = useState([
    {
      type: "human",
      text: "Hello!",
    },
    {
      type: "bot",
      text: `Ask me any thing.`,
    },
  ]); // Chat History
  const [prompt, setPrompt] = useState(""); // Question
  const [isAnswered, setIsAnswered] = useState(true); // Answer state
  const params = useParams(); // Url Params
  const chatHistoryRef = useRef(null);
  const { sendMessage, lastMessage, readyState } = useWebSocket(
    `ws://localhost:9000/api/chat/${params.id}`
  ); // Websocket Hook

  // Receive Messages
  useEffect(() => {
    if (lastMessage !== null) {
      // Add History
      setHistory((prev) =>
        prev.concat({ type: "bot", text: lastMessage.data })
      );
      setTimeout(() => {
        chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
      }, 50);
      // Think Stop Flag
      setIsAnswered(true);
    }
  }, [lastMessage]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Before answer, make user not to ask questions
    if (!isAnswered) {
      message.warning("AI Bot is thinking! Please wait!");
      return;
    }

    setIsAnswered(false);
    history.push({ type: "human", text: prompt });
    setHistory([...history]);
    setTimeout(() => {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }, 100);
    sendMessage(prompt);
    setPrompt("");
  };

  const ChatItem = (type, message, index) => {
    return (
      <div
        key={index}
        style={
          type == "bot"
            ? { display: "flex", flexDirection: "row" }
            : { display: "flex", flexDirection: "row-reverse" }
        }
      >
        <img
          src={
            type == "bot" ? "/assets/images/bot.png" : "/assets/images/user.png"
          }
          width={35}
          height={35}
        />
        <div
          style={{ maxWidth: 400 }}
          className={type == "bot" ? "bot_item_content" : "user_item_content"}
        >
          {message}
        </div>
      </div>
    );
  };

  return (
    <div
      className="chat_container"
      style={{ backgroundColor: colorSet[params.id % colorSet.length] }}
    >
      <h1 style={{ color: "white" }}>Music Business Bot {params.id}</h1>
      <div className="chat_history" ref={chatHistoryRef}>
        {history.map((item, index) => ChatItem(item.type, item.text, index))}
      </div>
      <form className="message_box" onSubmit={handleSubmit}>
        <Input.Group compact>
          <Input
            style={{ width: "calc(100% - 100px)", textAlign: "left" }}
            onChange={(e) => setPrompt(e.target.value)}
            size="large"
            value={prompt}
            disabled={readyState !== ReadyState.OPEN}
          />
          <Button
            htmlType="submit"
            type="primary"
            shape="circle"
            icon={<SendOutlined />}
            size="large"
            style={{ marginLeft: 10 }}
            disabled={readyState !== ReadyState.OPEN}
          />
        </Input.Group>
      </form>
    </div>
  );
};

export default ChatBox;
