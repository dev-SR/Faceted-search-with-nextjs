import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises'; // Assuming Node.js v14+
import path from 'path';

const filePath = path.join(process.cwd(), 'prisma', 'data.json');
const prisma = new PrismaClient();

async function seedData() {
	try {
		const jsonData = await fs.readFile(filePath, 'utf-8');
		const data = JSON.parse(jsonData);
		console.log('✔ Deleting existing data ...');
		await prisma.attribute.deleteMany();
		await prisma.product.deleteMany();
		console.log(`Start seeding ...`);

		for (const item of data) {
			await prisma.product.create({
				data: {
					title: item.title,
					price: item.price,
					category: item.category,
					brand: item.brand,
					description: item.description,
					rating: item.rating ? item.rating : 0,
					attributes: {
						create: item.attributes.map((attribute: { name: string; value: string }) => ({
							name: attribute.name,
							value: attribute.value
						}))
					}
				}
			});
		}

		console.log('✔ Seeding completed successfully!');
	} catch (error) {
		console.error('Error seeding data:', error);
	} finally {
		await prisma.$disconnect();
	}
}

seedData();
