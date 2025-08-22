const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Setup before all tests
beforeAll(async () => {
  // Create in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Cleanup after each test
afterEach(async () => {
  // Clear all collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

// Cleanup after all tests
afterAll(async () => {
  // Disconnect from database and stop server
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Global test timeout
jest.setTimeout(30000);

// Mock nodemailer to prevent actual emails during testing
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  }),
}));

// Mock multer for file uploads - Fixed to include diskStorage
jest.mock('multer', () => {
  const multer = jest.fn().mockReturnValue({
    single: jest.fn().mockReturnValue((req, res, next) => {
      req.file = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 4,
        path: '/tmp/test.jpg'
      };
      next();
    }),
    array: jest.fn().mockReturnValue((req, res, next) => {
      req.files = [{
        fieldname: 'files',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 4,
        path: '/tmp/test.jpg'
      }];
      next();
    })
  });

  // Add diskStorage function to multer
  multer.diskStorage = jest.fn().mockReturnValue({
    destination: jest.fn(),
    filename: jest.fn()
  });

  // Add memoryStorage function to multer
  multer.memoryStorage = jest.fn().mockReturnValue({});

  return multer;
});

// Mock cloudinary
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn().mockResolvedValue({
        secure_url: 'https://res.cloudinary.com/test/image/upload/test.jpg',
        public_id: 'test'
      }),
      destroy: jest.fn().mockResolvedValue({ result: 'ok' })
    }
  }
}));

// Mock fs module for file operations
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  unlinkSync: jest.fn(),
  promises: {
    unlink: jest.fn().mockResolvedValue(true)
  }
}));

// Mock path module
jest.mock('path', () => ({
  join: jest.fn().mockReturnValue('/tmp/test.jpg'),
  extname: jest.fn().mockReturnValue('.jpg'),
  basename: jest.fn().mockReturnValue('test.jpg')
}));

// Suppress console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
