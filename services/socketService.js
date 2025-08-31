// services/socketService.js
import axios from "axios";
import https from "https";

export function setupSocket(io) {
  io.on("connection", (socket) => {
    // get socket connection
    console.log(`🔗 New connection: `, socket.id);

    // get clientId from handshake
    const { clientId } = socket.handshake.auth;

    if (!clientId || clientId === "") {
      console.error("❌ No clientId provided in handshake");
      socket.disconnect();
      return;
    }

    // Handle incoming messages
    socket.on("chatMessage", async (message) => {
      try {
        console.log(`📩 Message received from ${socket.id}:`, message.text);

        // fallback to socket.id if sender not provided
        const sender = message.sender || socket.id;

        console.log(`Client ID: ${clientId}`);
        console.log(`Sender: ${sender}`);
        console.log(`Message text: ${message.text}`);

        // create agent that ignores self-signed certs
        const agent = new https.Agent({
          rejectUnauthorized: false,
        });

        // Call the rag API service to respond to the message
        if (!process.env.RAG_SERVICE_URL) {
          console.error("❌ RAG_SERVICE_URL environment variable is not set");
          return;
        }

        console.log("🔗 RAG Service URL:", process.env.RAG_SERVICE_URL);

        const ragServiceUrl = `${process.env.RAG_SERVICE_URL}/query`;
        console.log("\n✅ RAG Service URL:", ragServiceUrl);

        // Emit a test message back to the sender
        const testData = {
          text: "text as test",
          sender: "server",
          timestamp: new Date().toISOString(),
        };

        // io.to(socket.id).emit("chatMessage", testData);

        // Make a POST request to the RAG service
        let response;
        try {
          console.log("🔗 Constructing RAG service URL...");
          //
          //
          let config = {};
          if (ragServiceUrl.startsWith("https://")) {
            config.httpsAgent = agent;
          }
          response = await axios.post(
            ragServiceUrl,
            {
              query: message.text,
            },
            config
          );

          console.log("✅ RAG service response received");

          if (!response || !response.data) {
            console.error("❌ No response from RAG API");
          } else {
            console.log("ℹ️  RAG API response data:", response.data);
          }
        } catch (error) {
          // Extract the core error safely
          const coreError = error?.cause?.errors?.[0] || error;
          console.error("❌ Error constructing RAG service URL:", {
            message: coreError.message,
            code: coreError.code,
            errno: coreError.errno,
            syscall: coreError.syscall,
            address: coreError.address,
            port: coreError.port,
          });
        }

        const ragResponse = response.data.response.human_response.text;

        console.log("RAG API response:\n", ragResponse);

        const data = {
          text: ragResponse,
          sender: "server",
          timestamp: new Date().toISOString(),
        };

        // Emit message to sender
        io.to(socket.id).emit("chatMessage", data);
      } catch (error) {
        console.error("❌ Error handling chatMessage:", error);
        io.to(socket.id).emit("chatMessage", {
          text: "The server was unable to complete this request. Try again later or notify support.",
          sender: "server",
          timestamp: new Date().toISOString(),
        });
        return;
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.id} (clientId: ${clientId})`);
    });
  });
}
