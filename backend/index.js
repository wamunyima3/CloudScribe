require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter); // Apply rate limiting to API routes

// API Routes
const apiRouter = express.Router();

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Dictionary routes
apiRouter.get('/dictionary/search', async (req, res, next) => {
  try {
    const { language, difficulty, tag, word } = req.query;
    const words = await prisma.word.findMany({
      where: {
        AND: [
          language ? { languageId: language } : {},
          word ? { original: { contains: word } } : {},
          // Add more filters as needed
        ]
      },
      include: {
        translations: true,
        language: true
      }
    });
    res.json(words);
  } catch (error) {
    next(error);
  }
});

// Stories routes
apiRouter.get('/stories', async (req, res, next) => {
  try {
    const stories = await prisma.story.findMany({
      include: {
        language: true,
        user: {
          select: {
            username: true,
            id: true
          }
        }
      }
    });
    res.json(stories);
  } catch (error) {
    next(error);
  }
});

// Mount API routes
app.use('/api', apiRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM signal. Closing HTTP server...');
  await prisma.$disconnect();
  process.exit(0);
});