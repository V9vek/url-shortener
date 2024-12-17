import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "URL Shortener API Docs",
      version: "1.0.0",
      description: "Custom URL Shortener API Documentation",
    },
    servers: [
      {
        url: "http://localhost:8000", // Update this for production later
        description: "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        sessionCookie: {
          type: "apiKey",
          in: "cookie",
          name: "connect.sid",
          description:
            "Session-based authentication using cookies. The cookie `connect.sid` should be automatically included in requests.",
        },
      },
    },
    security: [
      {
        sessionCookie: [], // This tells Swagger that all endpoints require the session cookie
      },
    ],
  },
  apis: ["./src/routes/**/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export const swaggerDocs = (app) => {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("Swagger documentation available at /docs");
};
