# 🚀 CV Builder API

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)

This is the robust **Backend REST API** for the CV Builder application. It handles secure user authentication, profile management, and persistent resume storage using the MERN stack architecture.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Security:** JWT (JSON Web Tokens) & bcryptjs
- **Development:** Nodemon

---

## 📁 Project Structure

```text
server/
├── config/             # Database connection (db.js)
├── controllers/        # Request handlers (auth, resume, user)
├── middleware/         # Auth guards & error handling
├── models/             # Mongoose schemas (User, Resume)
├── routes/             # API route definitions
├── server.js           # Entry point
└── .env                # Environment variables