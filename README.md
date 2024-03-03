![Zaamin Logo](./Logo.png)

# Zaamin - A Secure and Compliant HR Portal
## Description

Zaamin, aptly named to signify those who safeguard for your security, aims to deliver a cutting-edge HR portal tailored specifically for Devsinc employees. Our primary objective is to provide a secure environment that safeguards sensitive employee data while upholding compliance with regulations like GDPR. Utilizing innovative technologies such as MERN stack, we are poised to introduce advanced security features including multi-factor authentication and encryption.


## Directory Structure
The folder "Zaamin" consists of two subfolders:

- **frontend/**: Contains the frontend code for the web application.
  - **src/**: Contains the source code for the frontend application.
    - **components/**: Contains the different web pages of the application.
      - `login.js`: Code for the login page.
      - `signuplanding.js`: Code for the signup landing page, where can choose between 3 actors: admin, employee and manager.
      - `editprofile.js`: Code for the edit profile page.
      - `header.js`: Code for the header component.
      - `sidebar.js`: Code for the sidebar component.
      - `profilehome.js`: Code for the profile home page.
      - `signup.js` : Code for the signup page where inputs will be required.

    - **styles/**: Contains CSS files corresponding to each webpage.
      - `login.css`: Styles for the login page.
      - `signuplanding.css`: Styles for the signup landing page.
      - `editprofile.css`: Styles for the edit profile page.
      - `header.css`: Styles for the header component.
      - `sidebar.css`: Styles for the sidebar component.
      - `profilehome.css`: Styles for the profile home page.
      - `signup.css` : Styles for signup page
    

- **backend/**: Contains the backend code for the web application.
  - `server.js`: Main server file for the Node.js backend.
  - **models/**: Contains MongoDB connected schemas for the application.
    - `admin.js`: Schema for admin data.
    - `employee.js`: Schema for employee data.
    - `manager.js`: Schema for manager data.
    - `userlogin.js`: Schema for userlogin data (ID, email, encrypted password).

## Setup Instructions

1. Use Github Desktop or the CLI (command given) to clone the repository:
   ```
   git clone https://github.com/MariaMalikP/Zaamin.git
   ```

2. Install dependencies for both frontend and backend (Node.js) as the packages are already in package.json file npm install or npm i installs all dependancies:
   ``` bash
   cd frontend
   npm install
   cd ../backend
   npm install
   ```
3. As we are currently utilizing `bcryptjs` as our encryption method for securely storing passwords (with the option to choose different encryption methods in future sprints), please ensure the bcryptjs package is installed. 
   ``` bash
   cd backend
   npm install bcryptjs
   ```

4. Start the frontend and backend servers (open 2 terminals):
   ``` bash
   cd frontend
   npm start
   ```
   ``` bash
   cd backend
   npm start
   ```
**Note:** In our current implementation, the backend **must** be started first and then the frontend must be started, with y being entered when asked to proceed on a different port. We aim to make the code more interoperable in future sprints. 

5. Your web application will now be hosted on port number you provided in your `.env` file (for this specific case it is port 3000).

## General Rules
1. The length of the password should be atleast 8 characters long and should be a mix of uppercase, lowercase and special characters.
2. The email will be authenticated and verified before the sign up is proceeded (will be checked using the `hunter` api).
3. Emails should be unique and not already taken by another user.
5. Your web application will now be hosted on port number you provided in your `.env` file (for this specific case it is port 3000).
