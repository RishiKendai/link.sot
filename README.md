# 🚀 LinkSot

## 1. Project Overview ✨

**LinkSot** is a modern, full-stack URL shortener and analytics platform. Instantly create custom short links and unlock powerful analytics to track every click—geo-location, device type, referrer, and more. Designed for security and ease of use, LinkSot offers password-protected links, expiry dates, and malicious URL scanning.

**Key Features:**
- 🔗 **Custom Short Links:** Create memorable URLs with customizable back-halves.
- 📊 **Comprehensive Analytics:** Visualize and track link performance with beautiful charts and dashboards.
- 🛡️ **Secure & Protected Links:** Password protection, expiry dates, and malicious URL scanning.
- 👤 **User Authentication:** Register, log in, and manage your links securely.
- 🛠️ **API Access:** RESTful API for programmatic link management and analytics.
- 💻 **Modern UI:** Clean, responsive dashboard for managing links and viewing analytics.

## 2. Installation & Local Development ⚡

### Prerequisites

- 🟢 **Node.js** (v18+ recommended) & **npm** (for frontend)
- 🟡 **Go** (v1.23+ for backend)
- 🗄️ **PostgreSQL**, **MongoDB**, and **Redis** running locally or accessible remotely

---

### Backend Setup 🧩

1. **Clone the repository:**
   ```sh
   git clone https://github.com/RishiKendai/link.sot.git
   cd link.sot/server
   ```

2. **Configure environment variables:**
   - Copy or create a `.env` file with your database and server settings.

3. **Install Go dependencies:**
   ```sh
   go mod tidy
   ```

4. **Run the backend server:**
   ```sh
   go run main.go
   ```
   The API will be available at `http://localhost:5673/api/v1` (or your configured port).

---

### Frontend Setup 🎨

1. **Navigate to the frontend directory:**
   ```sh
   cd ../frontend
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Start the development server:**
   ```sh
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

> **Note:** The frontend is configured to proxy API requests to the backend. Ensure both servers are running for full functionality.

---

### Additional Notes 📝

- 🚀 For production, build the frontend with `npm run build` and serve the static files.
- 🗄️ Make sure your databases (PostgreSQL, MongoDB, Redis) are running and accessible with the credentials provided in your `.env` file.
- 📚 API documentation is available via the backend routes.

---

Enjoy using LinkSot! If you have suggestions or want to contribute, feel free to open an issue or pull request. Happy shortening! 🎉