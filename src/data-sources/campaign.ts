import { Pool } from 'pg';
import { Campaign } from '../models/campain';
import { DataModel } from '../models/system/data-model';

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
});

const CAMPAIGN: DataModel = {
    tableName: 'campaigns',
    columns: ['name', 'start_date', 'end_date', 'budget'],
    primaryKey: 'id',
};

async function query(text: string, values?: any[]): Promise<any> {
    const client = await pool.connect();
    try {
        const result = await client.query(text, values);
        return result.rows;
    } finally {
        client.release();
    }
}

export const CampaignDataSource = {
    async getAll(): Promise<Campaign[]> {
        const data = await query(`SELECT * FROM ${CAMPAIGN.tableName}`);
        console.log(data)
        return data;
    },

    async getById(id: number): Promise<Campaign | undefined> {
        const data = await query(`SELECT * FROM ${CAMPAIGN.tableName} WHERE ${CAMPAIGN.primaryKey} = $1`, [id]);
        return data[0];
    },

    async create(campaign: Campaign): Promise<Campaign> {
        const { name, start_date, end_date, budget } = campaign;
        const data = await query(`INSERT INTO ${CAMPAIGN.tableName} (name, start_date, end_date, budget) VALUES ($1, $2, $3, $4) RETURNING *`, [name, start_date, end_date, budget]);
        return data[0];
    },
    async update(id: number, campaign: Campaign): Promise<Campaign | undefined> {
        const { name, start_date, end_date, budget } = campaign;
        const data = await query(`UPDATE ${CAMPAIGN.tableName} SET name = $1, start_date = $2, end_date = $3, budget = $4 WHERE ${CAMPAIGN.primaryKey} = $5 RETURNING *`, [name, start_date, end_date, budget, id]);
        return data[0];
    },

    async delete(id: number): Promise<void> {
        await query(`DELETE FROM ${CAMPAIGN.tableName} WHERE ${CAMPAIGN.primaryKey} = $1`, [id]);
    }
}