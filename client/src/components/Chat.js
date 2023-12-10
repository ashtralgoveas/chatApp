import { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import SendButton from "./SendButton";
import EmojiPicker from "emoji-picker-react";

function Chats({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiClick = (event) => {
    setCurrentMessage((prevMessage) => prevMessage + event.emoji);
  };

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
      setShowEmojiPicker(false);
    }
  };

  useEffect(() => {
    const handleReceiveMessage = (data) => {
      setMessageList((list) => [...list, data]);
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>ChatNet</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent) => {
            const containsOnlyEmojis = /^[\p{Emoji}\s]*$/u.test(
              messageContent.message.trim()
            );
            return (
              <div
                className={`message  ${
                  containsOnlyEmojis ? "emoji-message" : ""
                }`}
                id={username === messageContent.author ? "you" : "other"}
              >
                <div>
                  <div className="message-content">
                    <p>{messageContent.message}</p>
                  </div>
                  <div className="message-meta">
                    <p id="time">{messageContent.time}</p>
                    <p id="author">
                      {username === messageContent.author
                        ? "You"
                        : messageContent.author}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Type a message..."
          className="input-styled"
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        {showEmojiPicker && (
          <EmojiPicker onEmojiClick={handleEmojiClick} disableSearchBar />
        )}
        <button
          className="emoji-picker-button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          style={{ fontSize: "24px" }}
        >
          😊
        </button>

        <button
          onClick={() => {
            sendMessage();
          }}
          className="button-styled"
        >
          <SendButton />
        </button>
      </div>
    </div>
  );
}
export default Chats;
