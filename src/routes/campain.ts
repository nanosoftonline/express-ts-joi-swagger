import express, { NextFunction, Request, Response, RequestHandler } from 'express'
import { CampaignDataSource } from '../data-sources/campaign';
import Joi from 'joi';
import { Campaign } from '../models/campain';
const router = express.Router();



const validateCampaignCreate = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        start_date: Joi.date().required(),
        end_date: Joi.date().required(),
        budget: Joi.number().required(),
    });
    const { error, value } = schema.validate(req.body);

    if (error) {
        res.status(400).json({ error: error.details[0].message });
    } else {
        req.body = value;
        next();
    }
};


const validateCampaignUpdate = (req: Request, res: Response, next: NextFunction) => {
    const schemaBody = Joi.object({
        name: Joi.string().required(),
        start_date: Joi.date().required(),
        end_date: Joi.date().required(),
        budget: Joi.number().required(),
    });

    const schemaParams = Joi.object({
        id: Joi.string().required(),
    });
    const validBody = schemaBody.validate(req.body);
    const validParams = schemaParams.validate(req.params);

    if (validBody.error) {
        res.status(400).json({ error: validBody.error.details[0].message });
        return
    } else {
        req.body = validBody.value;
    }

    if (validParams.error) {
        res.status(400).json({ error: validParams.error.details[0].message });
        return
    } else {
        req.params = validParams.value;
    }
    next();

};


const catchAsync = (fn: RequestHandler) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};


router
    .get("/", catchAsync(async (req: Request, res: Response) => {
        const campaigns: Campaign[] = await CampaignDataSource.getAll();
        res.json(campaigns);
    }))
    .post("/", validateCampaignCreate, catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { name, start_date, end_date, budget } = req.body;
        const campaign = await CampaignDataSource.create({ name, start_date, end_date, budget });
        res.json(campaign);
    }))

router
    .get("/:id", catchAsync(async (req: Request, res: Response) => {
        const campaign: Campaign | undefined = await CampaignDataSource.getById(parseInt(req.params.id, 10));
        if (!campaign) {
            res.status(404).json({ message: "Campaign Not Found" })
            return;
        }
        res.json(campaign);
    }))
    .put("/:id", validateCampaignUpdate, catchAsync(async (req: Request, res: Response) => {
        const { name, start_date, end_date, budget } = req.body;
        console.log(req.body)
        const campaign: Campaign | undefined = await CampaignDataSource.update(parseInt(req.params.id, 10), { name, start_date, end_date, budget });
        if (!campaign) {
            res.status(404).json({ message: "Campaign Not Found" })
            return;
        }
        res.json(campaign);
    }))
    .delete("/:id", catchAsync(async (req: Request, res: Response) => {
        await CampaignDataSource.delete(parseInt(req.params.id, 10));
        res.json({ message: "Deleted" });
    }))

const handleErrors = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
};


router.use(handleErrors)



export default router