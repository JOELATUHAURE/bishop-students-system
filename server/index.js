const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { sequelize } = require('./models');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(express.json()); // Body parser
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/applications', require('./routes/application.routes'));
app.use('/api/documents', require('./routes/document.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// Handle production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error',
  });
});

// Define port
const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    // Sync database
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();