import React from "react";
import "./App.css";
import ChatBot from "./ChatBot/ChatBot";
import HeaderNavBar from "./ChatBot/HeaderNavBar";

function App() {
  console.log = function () {};

  return (
    <>
      <div>
        <HeaderNavBar />
        <div style={{ paddingTop: "60px" }}>
          <ChatBot />
        </div>
      </div>
    </>
  );
}

export default App;
