# 🏡 MeetOwner V2 - Real Estate Property Selling App

![Next.js](https://img.shields.io/badge/Next.js-15-black) ![React](https://img.shields.io/badge/React-19-blue) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC) ![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1)

Welcome to the **MeetOwner V2** codebase! This application connects property owners directly with buyers/renters, providing a seamless platform for real estate transactions.

## 🚀 Overview

MeetOwner is a full-stack web application built with **Next.js 15 (App Router)**. It leverages server-side rendering for SEO and performance, with a robust MySQL backend architecture handled via Next.js API routes.

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** JavaScript
- **Styling:** Tailwind CSS 4, Module CSS
- **Components:** Radix UI, Lucide React Icons
- **State Management:** Redux Toolkit, Redux Persist
- **Carousels:** Swiper, React-Slick

### Backend
- **Runtime:** Node.js (Next.js API Routes)
- **Database:** MySQL (accessed via `mysql2` connection pool)
- **Object Storage:** AWS S3 (for property images)
- **Authentication:** Cookie-based sessions

## 📂 Project Structure

```bash
meetowner-v2/
├── app/                  # Next.js App Router (Pages & API)
│   ├── api/              # Backend API endpoints (Serverless functions)
│   ├── components/       # Reusable UI Components
│   ├── globals.css       # Global styles (Tailwind directives)
│   ├── layout.jsx        # Root layout (Html, Body, Providers)
│   └── page.jsx          # Home / Landing Page (SSR)
├── components/           # Shared UI components (Dashboard, Headers, etc.)
├── lib/                  # Utility libraries
│   └── server/           # Server-side utils (Database connection)
├── public/               # Static assets (images, fonts)
└── scripts/              # Build/Sitemap scripts
```

## ⚡️ Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18 or higher)
- MySQL Server

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/meetowner2024/meetowner-v2.git
    cd meetowner-v2
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory with the following variables:

    ```env
    # Database Configuration
    DB_HOST=address
    DB_USER=dbUser
    DB_PASSWORD=yourpassword
    DB_NAME=databasename
    DB_PORT=dbport

    # API Configuration
    NEXT_PUBLIC_BASE_URL=http://localhost:3000
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🌟 Key Features

- **Property Listings:** Browse homes, apartments, and land with rich details.
- **Direct Contact:** Connect directly with owners/sellers.
- **Smart Filters:** Filter properties by location, price, and type.
- **User Dashboard:** Manage tailored listings and favorites.
- **Responsive Design:** Optimized for Mobile, Tablet, and Desktop.



---
© 2024 MeetOwner. All rights reserved.
