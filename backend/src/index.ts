import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import exampleRoute from './routes/exampleRoute';


// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


app.use('/api', exampleRoute);


// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript + Node.js backend 🚀');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
