# LendSecure System

## Description
LendSecure is a secure peer-to-peer (P2P) lending platform designed to connect verified borrowers directly with investors. By eliminating traditional financial intermediaries, the system facilitates faster loan access for borrowers and transparent investment opportunities for lenders. The platform verifies users, manages loan requests, tracks repayments, and handles digital wallet transactions securely.

## Features
- **Secure Authentication**: Role-based access for Borrowers, Lenders, and Admins with secure login and registration.
- **Loan Management**: Borrowers can request loans and track payments; Lenders can fund loans and view returns.
- **Digital Wallet**: Integrated system for depositing funds, funding loans, and withdrawing earnings.
- **Interactive Dashboard**: Real-time overview of financial activities, active loans, and investment performance.
- **Admin Control**: Comprehensive user and transaction monitoring to ensure platform security.

## How to Run

### Backend
1.  Navigate to `Backend`: `cd Backend`
2.  Run the server: `dotnet watch`
    *   API runs at: `http://localhost:5200`

### Frontend
1.  Navigate to `Frontend`: `cd Frontend`
2.  Install dependencies (first time): `npm install`
3.  Start the app: `npm run dev`
    *   App runs at: `http://localhost:5173`
