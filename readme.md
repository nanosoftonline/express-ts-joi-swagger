### Express Typescript and Joi

#### Setup
To scaffold a Node project for Express and TypeScript, you can follow these steps:

* Install Node.js and TypeScript if you haven't already.
* Create a new directory for your project and navigate to it in your terminal.
* Run npm init to create a new package.json file for your project.

Install the necessary dependencies by running the following command:
```bash
npm i express joi pg 
npm i -D @types/express typescript ts-node-dev @types/joi @types/pg

```

Create a src directory and a server.ts file inside it.


```TypeScript
import express, { Application, Request, Response, NextFunction } from 'express';

const app: Application = express();

app.use(express.json())

app.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.send('Hello, World!');
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

```



#### Scripts
In your package.json, add the following scripts:


```json
{
  "scripts": {
    "start": "ts-node-dev src/server.ts"
  }
}

```

Run `npm start` to start your server

#### Env Variables

To use dotenv in a TypeScript Node.js project, you can follow these steps:

Install dotenv and @types/dotenv as dev dependencies using the following command:

```bash
npm install dotenv @types/dotenv --save-dev

```

Create a .env file at the root of your project directory and add your environment variables:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=myusername
DB_PASSWORD=mypassword
DB_NAME=mydatabase

```


In your TypeScript file, import dotenv and call the config method to load the environment variables from the .env file:

```ts
import dotenv from 'dotenv';
dotenv.config();
```


Access the environment variables using process.env

```ts

import { Pool } from 'pg';

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
});

...

```

#### Routes
To create a campaign router file for an Express server, this router file will keep all our campaign routes:

*A campaign is a series of planned activities or efforts aimed at achieving a specific goal or objective, often used in the context of marketing.*

In your src directory, create a new folder called routes, and inside this folder create a campaign.ts file.

```TypeScript
import express, { Response, Request} from 'express';
const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const campaigns: Campaign[] = await CampaignDataSource.getAll();
  res.json(campaigns);
});

router.post('/', async (req: Request, res: Response) => {
  const { name, start_date, end_date, budget } = req.body;
  const campaign = await CampaignDataSource.create({ name, start_date, end_date, budget });
  res.json(campaign);
});

export default router;

```

To catch data-source errors in these routes, you can add a try-catch block around the data-source operations, and use the next() function to pass any errors to an error handler middleware. Here's an updated version of the router that includes error handling

```TypeScript
import express, { NextFunction, Response, Request, RequestHandler} from 'express';
const router = express.Router();

const handleErrors = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
};  

router.use(handleErrors)

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaigns: Campaign[] = await CampaignDataSource.getAll();
    res.json(campaigns);****
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  const { name, start_date, end_date, budget } = req.body;
  try {
    const campaign = await CampaignDataSource.create({ name, start_date, end_date, budget });
    res.json(campaign);
  } catch (err) {
    next(err);
  }
});

export default router;

```

A good idea would be to move the try-catch error handling logic into separate middleware functions to keep the router code cleaner:

```TypeScript
import express, { NextFunction, Response, Request, RequestHandler} from 'express';
const router = express.Router();


const catchAsync = (fn: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

router.get('/', catchAsync(async (req, res) => {
  const campaigns: Campaign[] = await CampaignDataSource.getAll();
  res.json(campaigns);
}));

router.post('/', catchAsync(async (req, res) => {
  const { name, start_date, end_date, budget } = req.body;
  const campaign = await CampaignDataSource.create({ name, start_date, end_date, budget });
  res.json(campaign);
}));

const handleErrors = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
};


router.use(handleErrors)



export default router;

```


#### Input Validation with Joi

Here's an updated version of the Express router that includes input validation using Joi:

```ts
import express, { NextFunction, Response, Request, RequestHandler} from 'express';
import Joi from 'joi';
const router = express.Router();

const campaignSchema = Joi.object({
  name: Joi.string().required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
  budget: Joi.number().required(),
});


const catchAsync = (fn: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

router.get('/', catchAsync(async (req, res) => {
  const campaigns: Campaign[] = await CampaignDataSource.getAll();
  res.json(campaigns);
}));

router.post('/', catchAsync(async (req, res) => {
  const { error, value } = campaignSchema.validate(req.body);
   if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  const { name, start_date, end_date, budget } = req.body;
  const campaign = await CampaignDataSource.create({ name, start_date, end_date, budget });
  res.json(campaign);
}));

const handleErrors = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
};


router.use(handleErrors)



export default router;

```

Refactoring the Joi validation code into middleware will help make the router code more concise and modular:


```ts
import express, { NextFunction, Response, Request, RequestHandler} from 'express';
import Joi from 'joi';
const router = express.Router();

const campaignSchema = Joi.object({
  name: Joi.string().required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
  budget: Joi.number().required(),
});

const validateCampaign = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = campaignSchema.validate(req.body);
  if (error) {
    res.status(400).json({ error: error.details[0].message });
  } else {
    req.body = value;
    next();
  }
};

const catchAsync = (fn: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

router.get('/', catchAsync(async (req, res) => {
  const campaigns: Campaign[] = await CampaignDataSource.getAll();
  res.json(campaigns);
}));

router.post('/', validateCampaign, catchAsync(async (req, res) => {
  const { name, start_date, end_date, budget } = req.body;
  const campaign = await CampaignDataSource.create({ name, start_date, end_date, budget });
  res.json(campaign);
}));

const handleErrors = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
};

router.use(handleErrors)

export default router;
```


#### Document API with Swagger
Swagger (now called OpenAPI) is used to describe and document APIs. It provides a standardized way to define the structure, endpoints, operations, and parameters of an API.

To add Swagger to this router, you can use a package like **swagger-ui-express** along with a Swagger specification file. Here are the basic steps:

Install swagger-ui-express and @types/swagger-ui-express using npm:

```bash
npm i swagger-ui-express 
npm i -D @types/swagger-ui-express 

```


create a swagger spec file in yaml as follows

```yaml
openapi: 3.0.0
info:
  title: Campaign Management API
  version: 1.0.0
paths:
  /campaigns:
    get:
      summary: Get all campaigns
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Campaign'
    post:
      summary: Create a new campaign
      tags: 
        - campaign
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CampaignInput'
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Campaign'
  /campaigns/{id}:
    parameters:
      - name: id
        in: path
        required: true
        description: ID of the campaign to retrieve or update
        schema:
          type: integer
    get:
      summary: Get a campaign by ID
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Campaign'
    put:
      summary: Update a campaign by ID
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CampaignInput'
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Campaign'
    delete:
      summary: Delete a campaign by ID
      responses:
        '204':
          description: No Content
components:
  schemas:
    Campaign:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        start_date:
          type: string
          format: date
        end_date:
          type: string
          format: date
        budget:
          type: number
      required:
        - name
        - start_date
        - end_date
        - budget
    CampaignInput:
      type: object
      properties:
        name:
          type: string
        start_date:
          type: string
          format: date
        end_date:
          type: string
          format: date
        budget:
          type: number
      required:
        - name
        - start_date
        - end_date
        - budget

```



#### Setup DB

```sql
CREATE TABLE campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

```











