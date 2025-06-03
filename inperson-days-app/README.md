# In-Person Days App

This web application helps manage in-person workdays, specifically every Wednesday and Thursday, ensuring a total of 8 days per month. The application dynamically retrieves the current month and updates the days accordingly. Users can mark the days with checkboxes, and the selections are stored in the browser's cache for convenience.

## Features

- Dynamically retrieves the current month.
- Calculates and displays the required in-person workdays (Wednesdays and Thursdays).
- Automatically updates the displayed days when the month changes.
- Responsive design for mobile access.
- Allows users to mark days with checkboxes.
- Stores user selections in the browser's cache.

## Project Structure

```
inperson-days-app
├── src
│   ├── index.html        # Main HTML document
│   ├── styles
│   │   └── style.css     # CSS styles for the application
│   ├── scripts
│   │   └── app.js        # JavaScript code for functionality
│   └── assets            # Directory for additional assets
├── package.json          # npm configuration file
└── README.md             # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd inperson-days-app
   ```

3. Install dependencies (if any):
   ```
   npm install
   ```

## Usage

1. Open `src/index.html` in a web browser.
2. The application will display the current month's in-person workdays.
3. Use the checkboxes to mark the days you plan to work in person.
4. Your selections will be saved in the browser's cache and will persist across sessions.

## License

This project is licensed under the MIT License.