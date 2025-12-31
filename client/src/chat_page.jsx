import { useState } from "react";
import ChatList from "./components/messaging_components/list/chat_list";
import Chat from "./components/messaging_components/chat/chat";
import ChatDetail from "./components/messaging_components/detail/chat_detail";

function ChatPage() {
  const [activeUser, setActiveUser] = useState(null);

  const currentUser = { id: "student1", name: "Alice" };

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">
        <div className="col-3 border-end p-0">
          <ChatList setActiveUser={setActiveUser} />
        </div>

        <div className="col-6 p-0">
          {activeUser ? (
            <Chat activeUser={activeUser} currentUser={currentUser} />
          ) : (
            <div className="d-flex justify-content-center align-items-center h-100">
              <p>Select a user to start chatting</p>
            </div>
          )}
        </div>

        <div className="col-3 border-start p-0">
          {activeUser && <ChatDetail activeUser={activeUser} />}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
