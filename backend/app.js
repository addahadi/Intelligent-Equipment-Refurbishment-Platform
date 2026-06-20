import express from 'express';
import cors from 'cors';

import env from './config/env.js';
import routes from './routes/index.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(cors({ origin: env.corsOrigin }));
// Photos are uploaded via the multipart /uploads route, so JSON bodies only
// carry small payloads (offers reference image URLs). A modest bump over the
// 100 KB default leaves comfortable headroom.
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
