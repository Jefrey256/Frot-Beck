import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
} from "baileys";
import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { Boom } from "@hapi/boom";
import { question } from "./exports/index"; // Corrigido o import
import pino from "pino";
import dotenv from 'dotenv'

async function main() {
  // Estado de autenticação
  const { state, saveCreds } = await useMultiFileAuthState(
    path.resolve(__dirname, "../database/qr-code")
  );
  dotenv.config()
  const app = express();
  const PORT = process.env.PORT || 3001;

  app.use(cors());
  app.use(express.json());

  // Função principal do bot
  async function chico(): Promise<void> {
    const logger = pino({
      level: "info",})
    const pico = makeWASocket({
      logger,
      auth: state,
      browser: ["Ubuntu", "Chrome", "20.0.04"],
      markOnlineOnConnect: true,
      printQRInTerminal: false,
    });

    pico.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect } = update;
  
      if (connection === "close") {
        const shouldReconnect = (lastDisconnect?.error as any)?.statusCode !== DisconnectReason.loggedOut;
  
        console.log("Conexão fechada devido ao erro:", lastDisconnect?.error, "Tentando reconectar...", shouldReconnect);
  
        if (shouldReconnect) {
          chico(); // Reconecta
        }
      } else if (connection === "open") {
        console.log("Conexão aberta com sucesso!");
      }
    });

    // Verifica se o dispositivo está registrado, caso contrário, inicia o processo de pareamento
    if (!state.creds?.registered) {
      let phoneNumber: string = await question("Digite o número de telefone: ");
      phoneNumber = phoneNumber.replace(/[^0-9]/g, "");

      if (!phoneNumber) {
          throw new Error("Número de telefone inválido");
      }

      const code: string = await pico.requestPairingCode(phoneNumber);
      console.log(`Código de pareamento: ${code}`);
  }

  


    // Escuta atualizações das credenciais
    pico.ev.on("creds.update", saveCreds);

    // Evento que recebe mensagens
    pico.ev.on("messages.upsert", async (bru) => {
      const msg = bru.messages[0];

      if (msg.message && !msg.key.fromMe) {
        const remoteJid = msg.key.remoteJid; // ID do remetente
        await pico.sendMessage(remoteJid!, { text: "Olá Mundo" });
      }
    });

    console.log("Bot rodando...");
  }

  // Inicia o bot na inicialização
  chico();

  // Endpoint para reiniciar o bot
  app.get("/start-bot", async (req: Request, res: Response) => {
    try {
      await chico();
      res.json({ message: "Bot iniciado com sucesso!" });
    } catch (error) {
      console.error("Erro ao reiniciar o bot:", error);
      res.status(500).json({ message: "Falha ao iniciar o bot." });
    }
  });

  // Inicia o servidor Express
  app.listen(PORT, () => {
    console.log(`Backend rodando em http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Erro ao iniciar o bot:", err);
});
