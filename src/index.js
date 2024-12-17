import dotenv from "dotenv";
import connectDB from "./db/db.js";
import { app } from "./app.js";
import { swaggerDocs } from "./utils/swagger.js";

dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is up and running at ${process.env.PORT}`);
    });
    swaggerDocs(app)
  })
  .catch((err) => {
    console.error("MONGODB connection failed: ", err);
  });
