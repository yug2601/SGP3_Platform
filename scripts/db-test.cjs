/* eslint-disable no-console */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') });
const mongoose = require('mongoose');

(async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI missing');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB,
      serverSelectionTimeoutMS: 8000,
    });

    console.log('MongoDB connection OK');
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    try { await mongoose.disconnect(); } catch {}
  }
})();