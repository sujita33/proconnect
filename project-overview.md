ProConnect/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── api/
│   │   │   └── api.js
│   │   └── pages/
│   │       ├── signup.jsx
│   │       └── login.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
│
├── backend/
│   ├── server.js
│   ├── routes/
│   │   └── auth.js
│   ├── models/
│   │   └── User.js
│   ├── package.json
│   └── .env        ← stays local (never pushed)
│
├── .gitignore
└── README.md



🖥️ FRONTEND (React + Vite + Tailwind)
📁 File/Folder	🧩 Purpose	🧠 Example / Notes
/frontend/	Root folder for your React app	Run frontend with npm run dev
package.json	Keeps track of React dependencies & scripts	Example: React, Vite, Axios, Tailwind
vite.config.js	Config for Vite (bundler)	Usually auto-generated
tailwind.config.js	Tailwind settings (colors, theme, etc.)	Added via npx tailwindcss init -p
postcss.config.js	Tells Vite how to process Tailwind CSS	Contains tailwindcss & autoprefixer
/src/	Main React code folder	Everything runs from here
├── main.jsx	React entry point	Renders your app into index.html
├── App.jsx	Root component that manages all routes	Example: <Route path="/login" element={<Login />}>
├── index.css	Global styles (Tailwind setup, default theme)	Contains @tailwind base; @tailwind components; @tailwind utilities;
├── /api/	Folder for API configuration	File: api.js connects frontend → backend
│ └── api.js	Axios setup with backend base URL	Example: axios.create({ baseURL: "http://localhost:5000" })
├── /pages/	Contains all main pages (Signup, Login, etc.)	Each page is a React component
│ ├── signup.jsx	Signup form & logic	Posts data to /api/auth/signup
│ └── login.jsx	Login form & logic	Posts data to /api/auth/login
├── /components/ (optional)	Reusable UI elements	e.g., Navbar, Footer, Button
└── /assets/ (optional)	Images, icons, logos	Example: logo.png

🟢 Frontend entry point:
main.jsx → App.jsx → pages → components



⚙️ BACKEND (Node.js + Express + MongoDB)
📁 File/Folder	🧩 Purpose	🧠 Example / Notes
/backend/	Root folder for backend	Run with npm run dev
package.json	Keeps track of backend dependencies	Example: Express, Mongoose, JWT, dotenv
.env	Private environment variables	Example:
MONGO_URI=...
JWT_SECRET=yourSecret
server.js	Starts the Express server	Connects to MongoDB, listens on port
/models/	Database schemas	Example: User.js defines user fields
│ └── User.js	Mongoose model for user data	name, email, password, etc.
/routes/	Handles API endpoints	Example: auth.js for signup/login
│ └── auth.js	Authentication routes	/api/auth/signup, /api/auth/login
/controllers/ (optional)	Logic separated from routes	Example: authController.js
/middleware/ (optional)	Middleware functions	Example: JWT auth check
/config/ (optional)	DB connection or constants	Example: db.js for connecting MongoDB

🟢 Backend flow:
server.js → routes → models → MongoDB


📁 Project File Overview
Part Location Purpose

| File       | Location        | Purpose                                                   |
| ---------- | --------------- | --------------------------------------------------------- |
| auth.js    | backend/routes/ | Handles signup/login API requests                         |
| User.js    | backend/models/ | Defines user database schema                              |
| signup.jsx | frontend/pages/ | UI for new users to register                              |
| login.jsx  | frontend/pages/ | UI for existing users to log in (you’ll create this next) |
| index.css	| Global styles (applied everywhere) | Tailwind setup + font + theme |
| main.jsx | App.jsx | pages | React entry point & Renders your app into index.html |

