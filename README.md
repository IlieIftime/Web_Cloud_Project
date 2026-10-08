# HomeDeco E-Commerce Platform

## Abstract
The HomeDeco project constitutes a comprehensive e-commerce web application developed as part of the Web and Cloud Computing course. Inspired by the retail model of IKEA, the platform facilitates the online browsing, selection, and purchase of furniture and home decor items. The system is built upon a modern, decoupled architecture, utilizing a React Single Page Application (SPA) for the frontend, a Flask RESTful API for the backend, and MongoDB for NoSQL data persistence. The application interface and data structures are natively implemented in Portuguese.

## Authors
*   Ilie Iftime (112779)
*   Inês Cruz (123557)
*   Sofia Quintino (123554)

## License
This project is licensed under the Apache License 2.0. See the LICENSE file for details.

## Technology Stack
The architecture is divided into three primary components:
*   **Frontend:** React (bundled with Vite). Responsible for rendering the user interface, managing client-side state, and handling routing.
*   **Backend:** Flask (Python). Provides a RESTful API to handle business logic, authentication, and data processing.
*   **Database:** MongoDB. A document-oriented NoSQL database used for storing user profiles, product catalogs, and order histories in JSON-like formats.

## Project Structure

```text
projeto-final-v5/
├── .vscode/
├── app_demo_images/
├── backend/
│   ├── __pycache__/
│   ├── venv/
│   ├── app.py
│   ├── produtos.json
│   ├── requirements.txt
│   └── users.json
├── novoprojeto/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Footer.css
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.css
│   │   │   └── Header.jsx
│   │   ├── context/
│   │   │   ├── CarrinhoContext.jsx
│   │   │   ├── EditarPerfilContext.jsx
│   │   │   ├── FavoritosContext.jsx
│   │   │   ├── HeaderContext.jsx
│   │   │   ├── HistoricoContext.jsx
│   │   │   ├── HomeContext.jsx
│   │   │   ├── LoginContext.jsx
│   │   │   ├── ProdutoContext.jsx
│   │   │   ├── ProdutosContext.jsx
│   │   │   └── RegisterContext.jsx
│   │   ├── pages/
│   │   │   ├── AvaliarPage.css
│   │   │   ├── AvaliarPage.jsx
│   │   │   ├── CarrinhoPage.css
│   │   │   ├── CarrinhoPage.jsx
│   │   │   ├── EditarPerfilPage.jsx
│   │   │   ├── FavoritosPage.css
│   │   │   ├── FavoritosPage.jsx
│   │   │   ├── LoginPage.css
│   │   │   ├── LoginPage.jsx
│   │   │   ├── PerfilPage.css
│   │   │   ├── PerfilPage.jsx
│   │   │   ├── ProdutoDetalhe.css
│   │   │   ├── ProdutoDetalhe.jsx
│   │   │   ├── ProdutosPage.css
│   │   │   ├── ProdutosPage.jsx
│   │   │   ├── RegisterPage.css
│   │   │   └── RegisterPage.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   └── vite.config.js
├── .gitignore
├── API Documentation.pdf
├── package-lock.json
├── package.json
└── README.md
```

## Key Features
Based on the implemented frontend and backend integration, the platform provides the following capabilities:

*   **User Management:** 
    *   Account registration with username, email, and password validation.
    *   Secure authentication and session management.
    *   User profile editing (updating username, email, and password).
*   **Product Catalog:**
    *   Comprehensive display of available products.
    *   Advanced filtering mechanisms (Division, Category, Color, Size).
    *   Sorting options and text-based search functionality.
*   **Shopping Cart:**
    *   Dynamic addition and removal of products.
    *   Quantity adjustment per item.
    *   Real-time calculation of subtotal and total values.
*   **Order Processing & History:**
    *   Checkout workflow.
    *   Persistent user purchase history detailing past orders, item quantities, and total expenditure.
*   **Product Reviews:**
    *   Functionality for users to leave reviews on previously purchased items.
    *   Star-based rating system accompanied by textual feedback.

## API Documentation and Testing
The backend API was rigorously tested to ensure reliability and performance. The testing phase encompassed over 100 endpoints, verifying CRUD operations, authentication flows, and data integrity.

Complete API documentation, including endpoint specifications, request payloads, and response formats, is available via Postman:
[Postman API Documentation](https://documenter.getpostman.com/view/44783512/2sB2qi9yZ1)

## Installation and Setup

### Prerequisites
*   Node.js and npm (Node Package Manager)
*   Python 3.x
*   MongoDB instance (Local or Atlas)
*   Visual Studio Code (Recommended IDE)

### Recommended VS Code Extensions
For an optimal development experience with React, CSS, JavaScript, and Vite, installing the following VS Code extensions is recommended:
*   **ESLint:** For identifying and reporting on patterns found in ECMAScript/JavaScript code.
*   **Prettier - Code formatter:** For consistent code formatting.
*   **Vite:** For Vite-specific tooling support.
*   **vscode-pdf:** As seen in the project environment, this extension is useful for viewing the included `API Documentation.pdf` directly within the editor.
*   **Python:** For Flask backend development support.

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a Python virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   *   **Windows (PowerShell):** `.\venv\Scripts\Activate.ps1`
   *   **macOS/Linux:** `source venv/bin/activate`
4. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
   *The `requirements.txt` includes: `Flask>=2.0`, `pymongo>=4.0`, and `Flask-Cors>=3.0`.*
5. Configure environment variables (e.g., MongoDB URI) if applicable.
6. Run the Flask application:
   ```bash
   flask run
   ```

### Frontend Setup
1. Navigate to the frontend directory (`novoprojeto`):
   ```bash
   cd novoprojeto
   ```
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the local development URL (typically `http://localhost:5173`) in your browser to view the application.
