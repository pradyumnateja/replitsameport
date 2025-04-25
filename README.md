# Employee Management System

## Project Overview
A full-stack web application for managing employee information, built with Spring Boot backend and React frontend.

## Features
- View all employees with sorting and filtering
- Add new employees with validation
- Activate/deactivate employees
- View employee details and direct reports
- Search employees by hire date range
- Delete employees
- Modern, responsive UI

## Prerequisites
- Java 11 or higher
- Node.js 14 or higher
- npm or yarn

## Project Structure
```
flywire-exercise-main/
├── src/                  # Spring Boot backend
├── reactfrontend/        # React frontend
└── data/                 # Data storage
```

## Setup Instructions

### Backend Setup
1. Navigate to the root directory:
   ```bash
   cd flywire-exercise-main
   ```

2. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   The backend will start on http://localhost:8080

### Frontend Setup
1. Navigate to the React frontend directory:
   ```bash
   cd reactfrontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
   The frontend will start on http://localhost:3000

## Using the Application
1. Open http://localhost:3000 in your browser
2. Use the navigation buttons to:
   - View all employees
   - Add new employees
   - Search by hire date
   - Activate/deactivate employees
   - View employee details

## Data Storage
The application uses two JSON files for data storage:
- `src/main/resources/json/data.json`: Original employee data
- `data/new_employees.json`: New and modified employee data

## API Endpoints
- GET `/api/employees`: Get all active employees
- GET `/api/employees/all`: Get all employees
- GET `/api/employees/{id}`: Get employee details with direct reports
- GET `/api/employees/hired`: Get employees by hire date range
- POST `/api/employees`: Create new employee
- PUT `/api/employees/{id}/deactivate`: Deactivate employee
- PUT `/api/employees/{id}/reactivate`: Reactivate employee
- DELETE `/api/employees/{id}`: Delete employee

## Date Formats
- Frontend date inputs: YYYY-MM-DD
- Backend storage: MM/dd/yyyy
- All dates are handled in UTC timezone

