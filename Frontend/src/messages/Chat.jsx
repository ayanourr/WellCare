import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import axios from "axios";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { db } from "../firebase";
import "./Chat.css";
import { BsEmojiSmile } from "react-icons/bs";

const Chat = ({ selectedFriend }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesRef = collection(db, "messages");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const userData = JSON.parse(localStorage.getItem("user"));
  const dummy = useRef();
  const chatContainerRef = useRef(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);

  const scrollToBottom = () => {
    if (dummy.current) {
      dummy.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      const isAtBottom =
        chatContainer.scrollHeight - chatContainer.scrollTop ===
        chatContainer.clientHeight;
      setIsAutoScroll(isAtBottom);
    }
  };

  const addEmoji = (emoji) => {
    setNewMessage(newMessage + emoji.native);
    setShowEmojiPicker(false);
  };
  useEffect(() => {
    if (!selectedFriend) return;

    const q = query(
      messagesRef,
      orderBy("createdAt", "asc"),
      where("receiverUsername", "in", [
        userData.username,
        selectedFriend.username,
      ]),
      where("displayName", "in", [userData.username, selectedFriend.username])
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let messages = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (
          (data.displayName === userData.username &&
            data.receiverUsername === selectedFriend.username) ||
          (data.displayName === selectedFriend.username &&
            data.receiverUsername === userData.username)
        ) {
          messages.push({ ...data, id: doc.id });
        }
        if (data.displayName === selectedFriend.username && !data.read) {
          updateDoc(doc.ref, { read: true });
        }
      });

      setMessages(messages);
      setLoading(false);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [selectedFriend]);

  useEffect(() => {
    if (isAutoScroll) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    try {
      await addDoc(messagesRef, {
        text: newMessage,
        createdAt: serverTimestamp(),
        uid: userData.id,
        displayName: userData.username,
        receiverUsername: selectedFriend.username,
        read: false,
      });

      setNewMessage("");

      if (selectedFriend.username === "CareWizard") {
        const botResponse = await processMessageToChatGPT([
          {
            sender: userData.username,
            message: newMessage,
          },
        ]);
        if (botResponse) {
          await addDoc(messagesRef, {
            text: botResponse,
            createdAt: serverTimestamp(),
            uid: "CareWizard",
            displayName: "CareWizard",
            receiverUsername: userData.username,
            read: true,
          });
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((messageObject) => ({
      role: messageObject.sender === userData.username ? "user" : "assistant",
      content: messageObject.message,
    }));

    const apiRequestBody = {
      contents: apiMessages.map(({ content }) => ({
        parts: [{ text: content }],
      })),
    };

    try {
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyDudqhjWmCVTzCKsLWx2rSV9mMsnDvix30",
        apiRequestBody
      );
      const responseData = response.data;
      const generatedContent = responseData.candidates[0].content.parts
        .map((part) => part.text)
        .join("\n");

      return generatedContent;
    } catch (error) {
      console.error("Error processing message to ChatGPT:", error);
      return null;
    }
  }

  return (
    <div className="chat-container">
      <div className="chat-header">{selectedFriend.username}</div>
      <div
        className="chat-messages"
        ref={chatContainerRef}
        onScroll={handleScroll}
      >
        {loading ? (
          <div>Loading messages...</div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message ${
                message.uid === userData.id ? "sent" : "received"
              }`}
            >
              <div className="message-text">{message.text}</div>
            </div>
          ))
        )}
        <div ref={dummy}></div>
      </div>
      <form onSubmit={handleSend} className="chat-form">
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          style={{marginInline:"10px"}}
        >
          <BsEmojiSmile />
        </button>
        {showEmojiPicker && (
          <div className="emoji-picker">
            <Picker data={data} onEmojiSelect={addEmoji} />
          </div>
        )}
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="chat-input"
          placeholder="Type your message here..."
        />
        <button type="submit" className="chat-send">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
