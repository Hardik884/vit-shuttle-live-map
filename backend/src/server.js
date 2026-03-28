import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "vit-shuttle-backend" });
});

app.get("/api", (_req, res) => {
  res.json({ message: "Backend is running" });
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
