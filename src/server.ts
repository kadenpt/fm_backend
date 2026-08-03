import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import health from "./routes/health";

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());

app.use("/health", health);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
