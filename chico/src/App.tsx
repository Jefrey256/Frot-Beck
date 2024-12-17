import React from "react";
import axios from "axios";

const App: React.FC = () => {
  const startBot = async () => {
    try {
      const response = await axios.get("http://localhost:3001/start-bot");
      alert(response.data.message);
    } catch (error) {
      console.error("Erro ao iniciar o bot:", error);
      alert("Falha ao iniciar o bot");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>WhatsApp Bot Controller</h1>
      <button
        onClick={startBot}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Iniciar Bot
      </button>
    </div>
  );
};

export default App;
