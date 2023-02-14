import dotenv from 'dotenv';
dotenv.config();
import express, { Application, Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import path from 'path'
import YAML from 'yamljs';
import CampiagnRoutes from './routes/campain'

const app: Application = express();
// const swaggerDocument = require('./swagger.yaml');
const swaggerDocument = YAML.load(path.resolve('./src/swagger.yaml'));
app.use(express.json())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/campaign", CampiagnRoutes)

app.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.send('Hello, World!');
});

app.listen(process.env.PORT, () => {
    console.log('Server running on http://localhost:' + process.env.PORT);
});
