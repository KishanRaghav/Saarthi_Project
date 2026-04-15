
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const errorHandler = require("./Middleware/errorHandler");

const app = express();

// Connect database
connectDB();

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['https://saarthi-project-389o.vercel.app', 'http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/doctors", require("./routes/doctor"));
app.use("/api/patients", require("./routes/patient"));

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Message is required" });
    }

    // System prompt for Saarthi healthcare assistant
    const systemPrompt = `You are Saarthi, a friendly and intelligent healthcare assistant for a medical appointment booking platform called Saarthi. Your role is to help patients with:

1. Booking, cancelling, or rescheduling appointments
2. Understanding which type of doctor/specialist to see based on their symptoms
3. General health tips and wellness advice
4. Navigating the Saarthi app (e.g., how to view appointments, update profile)
5. Answering common medical FAQs

Important rules:
- Always be warm, empathetic, and easy to understand.
- Never provide definitive diagnoses — always recommend consulting a qualified doctor.
- If someone describes a medical emergency (chest pain, trouble breathing, severe bleeding, etc.), immediately tell them to call emergency services (102 in India) and stop the conversation there.
- Keep responses concise (2-4 sentences for most replies, slightly longer if explaining a process).
- If asked something outside healthcare or app navigation, politely redirect to what you can help with.
- Use simple language — avoid heavy medical jargon unless the patient seems medically literate.`;

    const fullMessage = `${systemPrompt}\n\nConversation History:\n${message}`;

    console.log("Sending request to Gemini API...");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: fullMessage }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 512,
          },
        }),
      }
    );

    console.log("Gemini API Response Status:", response.status);

    const data = await response.json();
    console.log("Gemini API Response Data:", JSON.stringify(data, null, 2));

    // Check for errors in the response
    if (data.error) {
      console.error("Gemini API Error:", data.error);
      return res.status(500).json({ 
        reply: `AI service error: ${data.error.message || 'Unknown error'}` 
      });
    }

    // Extract the reply from the response
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm sorry, I couldn't process that request. Please try again.";

    console.log("Reply sent to client:", reply.substring(0, 100) + "...");

    res.json({ reply });
  } catch (error) {
    console.error("Chat error:", error.message);
    console.error("Full error:", error);
    res.status(500).json({ reply: "Server error. Please try again later." });
  }
});

// Test Route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// Health Check Route
app.get("/api/health", async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'Connected' : 'Disconnected';
    
    res.json({
      status: 'OK',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      database: 'Error checking status',
      error: error.message
    });
  }
});

// Error Handler (must be after routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Allowed Origins: ${allowedOrigins.join(', ')}`);
});
