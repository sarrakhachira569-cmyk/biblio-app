# 📚 BiblioNova – University Library Management System

A modern and responsive university library web application developed with **Angular 18** as a front-end academic mini-project at **ISET Médenine**.

BiblioNova provides a user-friendly platform for exploring the book catalogue, managing member activities, submitting borrowing requests, and monitoring library operations through a dedicated administration dashboard.

The application offers two separate user spaces: **Member Space** and **Administrator Space**.

---

## ✨ Features

### 🏠 Home Page
- Welcoming interface introducing the university library.
- Highlights of featured and popular books.
- Quick access to the book catalogue.
- Responsive navigation across the application.

### 📖 Book Catalogue
- Browse books through an organized catalogue.
- Search books by title or author.
- Filter books by category.
- View book information and availability.
- Display borrowing options only for available books.
- Book rating and review interface.

### 👤 Member Space
- Member registration and login.
- Dedicated member dashboard.
- View borrowing history.
- Submit book borrowing requests.
- Track borrowing activities.

### 🔐 Administrator Dashboard
- Separate administrator login.
- Dashboard overview and library statistics.
- Book management.
- Member management.
- Borrowing and loan management.
- Overview of library activities.

### 🛡️ Authentication and Navigation
- Angular routing for application navigation.
- Route guards protecting restricted areas.
- Role-based access for members and administrators.
- Separate access to member and administrator spaces.

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| Angular 18 | Front-end application development |
| TypeScript | Application logic and functionality |
| HTML5 | Structure of web pages |
| CSS3 | Custom interface styling |
| Bootstrap | Responsive design and UI components |

---

## 📁 Project Structure

```text
biblio-app/
│
├── public/
│   └── images/
│       └── covers/
│
├── src/
│   └── app/
│       ├── components/
│       │   ├── adherent-space/
│       │   ├── admin-dashboard/
│       │   │   ├── admin-books/
│       │   │   ├── admin-loans/
│       │   │   ├── admin-members/
│       │   │   └── admin-overview/
│       │   ├── catalogue/
│       │   ├── connexion/
│       │   ├── home/
│       │   ├── login/
│       │   ├── navbar/
│       │   └── register/
│       │
│       ├── data/
│       ├── guards/
│       ├── models/
│       ├── services/
│       ├── shared/
│       │   ├── bar-chart/
│       │   ├── book-card/
│       │   ├── password-field/
│       │   └── star-rating/
│       │
│       └── utils/
│
├── angular.json
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Installation and Setup

### Prerequisites

Make sure the following tools are installed:

- Node.js
- npm (Node Package Manager)
- Angular CLI
- Git

### 1. Clone the Repository

Clone the project from GitHub:

```bash
git clone https://github.com/sarrakhachira569-cmyk/biblio-app.git
```

Navigate to the project directory:

```bash
cd biblio-app
```

### 2. Install Dependencies

Install all required project dependencies:

```bash
# BiblioNova: University Library App

Angular 18 front-end mini-project for a university library: catalogue, member space and admin dashboard. Mini-project, ISET Médenine.

## Features

- Catalogue with filters by title, author or category (the Borrow button only appears if the book is available)

- Member login and registration, loan history and loan requests

- Admin dashboard with a separate admin login

- Route guard protecting the member and admin areas by role

## Tech stack

Angular 18, TypeScript, Bootstrap

## How to run

npm install
```

### 3. Run the Application

Start the Angular development server:

```bash
npm start
```

Open your browser and visit:

**http://localhost:4200**

---

## 🌐 GitHub Pages

The site is built and deployed automatically when changes are pushed to `main`. In the repository settings, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**.

The published site is available at [https://sarrakhachira569-cmyk.github.io/biblio-app/](https://sarrakhachira569-cmyk.github.io/biblio-app/).

---

## 🧩 Application Architecture

BiblioNova follows Angular's component-based architecture, organizing the application into separate and reusable elements.

- **Components:** Manage the different pages and interface elements.
- **Services:** Handle application logic and data operations.
- **Models:** Define the structure of application data.
- **Guards:** Protect restricted routes and control navigation according to user roles.
- **Data:** Contains demonstration data used by the application.
- **Shared Components:** Provide reusable interface elements such as book cards, charts, password fields, and star ratings.

---

## 📌 Project Scope

BiblioNova is a front-end academic project focused on developing an interactive university library management interface.

It demonstrates the practical use of Angular 18, TypeScript, component-based development, routing, services, authentication interfaces, and responsive web design.

The application uses local demonstration data to simulate library operations without requiring a separate backend server or database.

---

## 🎓 Academic Project

**Project:** BiblioNova – University Library Management System

**Institution:** ISET Médenine

**Department:** Information Technology

**Level:** L2 DSI

**Project Type:** Front-End Development Mini-Project

**Main Technologies:** Angular 18 · TypeScript · Bootstrap

---

**Developed as part of the Front-End Development course at ISET Médenine.**

npm start, then open http://localhost:4200
