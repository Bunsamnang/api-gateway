import express from "express";
import httpProxy from "http-proxy";
import { authRole, authToken } from "./auth.js";

const app = express();

const PORT = 4000;

//USE PROXY SERVER TO REDIRECT THE INCOMMING REQUEST
const proxy = httpProxy.createProxyServer();

//REDIRECT TO THE USER MICROSERVICE
// Apply authToken + authRole middleware BEFORE proxying, for only /user path
// app.use("/user");

app.use("/user", authToken, authRole("user"), (req, res) => {
  console.log("INSIDE API GATEWAY USER ROUTE");
  proxy.web(req, res, {
    target: "13.218.238.30:5001",
    headers: {
      ...req.headers, // Forward all original headers
      "x-user-id": req.user._id, // Explicitly add user ID
    },
  });
});

//REDIRECT TO THE ADMIN MICROSERVICE
app.use("/admin", authToken, authRole("admin"), (req, res) => {
  console.log("INSIDE API GATEWAY ADMIN ROUTE");
  proxy.web(req, res, { target: "13.218.238.30:5002" });
});

app.use("/blog", (req, res) => {
  console.log("INSIDE API GATEWAY BLOG ROUTE");
  proxy.web(req, res, { target: "3.83.112.120:5003" }); // or whatever port you use
});

//REDIRECT TO THE LOGIN(Authentication) MICROSERVICE
app.use("/auth", (req, res) => {
  console.log("INSIDE API GATEWAY AUTH ROUTE");

  proxy.web(req, res, { target: "54.89.139.190:5000" });
});

app.listen(PORT, () => {
  console.log(`API Gateway Service is running on PORT NO : ${PORT}`);
});
