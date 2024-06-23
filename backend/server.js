const express = require("express");
const cors = require('cors');
const mongoose = require("mongoose");
const port = 3001;
const routes = require("./routes");
const dotenv = require('dotenv');


dotenv.config();

main().catch((err) => console.log(err));

async function main() {
  const connectionString = process.env.COSMOS_DB_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error("COSMOS_DB_CONNECTION_STRING is not defined in the environment variables");
  }

  await mongoose.connect(connectionString, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api", routes);

  app.get('/health', async (req, res) => {
    const dbState = mongoose.connection.readyState;
    let dbStatus = 'disconnected';
    switch (dbState) {
      case 0:
        dbStatus = 'disconnected';
        break;
      case 1:
        dbStatus = 'connected';
        break;
      case 2:
        dbStatus = 'connecting';
        break;
      case 3:
        dbStatus = 'disconnecting';
        break;
      default:
        dbStatus = 'unknown';
    }
    res.status(200).json({
      status: 'UP',
      dbStatus: dbStatus
    });
  });

  app.listen(port, () => {
    console.log(`Server is listening on port: ${port}`);
  });
}