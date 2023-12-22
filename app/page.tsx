// https://facets.caktus-built.com/
import FacetHandler from '@/components/FacetHandler';
import Pagination from '@/components/Pagination';
import Search from '@/components/Search';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import prisma from '@/lib/prisma';
import { Attribute, Prisma, Product } from '@prisma/client';

export type Facet = Record<string, { value: string; count: number; selected: boolean }[]>;
type SearchParamData = Record<string, string[] | string>;
type TSearchParamData = Record<string, string[]>;
export type ProductWithAttribute = (Product & {
	attributes: Attribute[];
})[];

function transformData(data: SearchParamData): TSearchParamData {
	const transformedParams: TSearchParamData = Object.entries(data).reduce(
		(acc: TSearchParamData, [key, value]) => {
			acc[key] = Array.isArray(value) ? value : [value];
			return acc;
		},
		{}
	);

	return transformedParams;
}

export default async function Home({ searchParams }: { searchParams?: SearchParamData }) {
	const params = transformData(searchParams!);
	const paramsExits = Boolean(Object.keys(params).length);
	const query = (searchParams?.query as string) || '';
	const page = searchParams?.page ? parseInt(searchParams.page as string) : 1;
	const pageSize = 3; // Number of items per page
	const skip = (page - 1) * pageSize;

	let productsWithAttributes: ProductWithAttribute = [];
	let facetData: Facet = {};
	let totalPages = 0;
	if (!paramsExits || (params.page && Object.keys(params).length == 1)) {
		// When there is not search filter
		productsWithAttributes = await prisma.product.findMany({
			take: pageSize,
			skip: skip,
			include: {
				attributes: true
			}
		});

		const totalProductsCount = await prisma.product.count();
		totalPages = Math.ceil(totalProductsCount / pageSize);

		const brandsCounts = await prisma.product.groupBy({
			by: ['brand'],
			_count: true
		});

		const brandFacets = brandsCounts.reduce((acc: Facet, data) => {
			const brand = data.brand;
			const count = data._count;
			acc['Brand'] = acc['Brand'] || [];
			acc['Brand'].push({ value: brand, count, selected: false });
			return acc;
		}, {});

		const categoryCounts = await prisma.product.groupBy({
			by: ['category'],
			_count: true
		});

		const categoryFacets = categoryCounts.reduce((acc: Facet, data) => {
			const category = data.category;
			const count = data._count;
			acc['Category'] = acc['Category'] || [];
			acc['Category'].push({ value: category, count, selected: false });
			return acc;
		}, {});

		// const attributeCounts = await prisma.attribute.groupBy({
		// 	by: ['name', 'value'],
		// 	_count: true
		// });
		// const attributeFacets = attributeCounts.reduce((acc: Facet, data) => {
		// 	const name = data.name;
		// 	const value = data.value;
		// 	const count = data._count;
		// 	acc[name] = acc[name] || [];
		// 	acc[name].push({ value, count, selected: false });
		// 	return acc;
		// }, {});

		const facetData_ = {
			...brandFacets,
			...categoryFacets
			// ...attributeFacets
		};

		facetData = facetData_;
		// facetData.Category = facetData.Category
	} else {
		// Get All attributes facet
		const attributeCounts = await prisma.attribute.groupBy({
			by: ['name', 'value']
		});
		const attributeFacets = attributeCounts.reduce((acc: Facet, data) => {
			const name = data.name;
			const value = data.value;
			acc[name] = acc[name] || [];
			acc[name].push({ value, count: 0, selected: false });
			return acc;
		}, {});

		// get all brand facet
		const allBrands = await prisma.product.groupBy({
			by: ['brand']
		});

		const brandFacets = allBrands.reduce((acc: Facet, data) => {
			const brand = data.brand;
			acc['Brand'] = acc['Brand'] || [];
			acc['Brand'].push({ value: brand, count: 0, selected: false });
			return acc;
		}, {});

		// get all category facet
		const allCategories = await prisma.product.groupBy({
			by: ['category']
		});

		const categoryFacets = allCategories.reduce((acc: Facet, data) => {
			const category = data.category;
			acc['Category'] = acc['Category'] || [];
			acc['Category'].push({ value: category, count: 0, selected: false });
			return acc;
		}, {});

		const AllFacet = {
			...brandFacets,
			...categoryFacets,
			...attributeFacets
		};

		// build prisma where
		let categoryWhere: Prisma.ProductWhereInput[] = [];
		if (params.Category) {
			categoryWhere = params.Category.map((category) => ({
				category: {
					equals: category
				}
			}));
		}

		let brandWhere: Prisma.ProductWhereInput[] = [];
		if (params.Brand) {
			brandWhere = params.Brand.map((brand) => ({
				brand: {
					equals: brand
				}
			}));
		}

		let attributeWhere: Prisma.ProductWhereInput[] = [];
		Object.entries(params).forEach(([key, values]) => {
			// if (key != 'Category' && key != 'Brand' && key != 'page' && key != 'query') {
			if (Object.keys(attributeFacets).includes(key)) {
				attributeWhere.push({
					attributes: {
						some: {
							name: key,
							value: {
								in: values
							}
						}
					}
				});
			}
		});

		let queryWhere: Prisma.ProductWhereInput[] = [];
		if (query) {
			queryWhere = [
				{
					title: {
						contains: query,
						mode: 'insensitive'
					}
				},
				{
					title: {
						search: query
							.replace(/[()|&:*!]/g, '')
							.trim()
							.split(/\s+/)
							.join(' | ')
					}
				},
				{
					attributes: {
						some: {
							value: {
								contains: query,
								mode: 'insensitive'
							}
						}
					}
				},
				{
					attributes: {
						some: {
							value: {
								search: query
									.replace(/[()|&:*!]/g, '')
									.trim()
									.split(/\s+/)
									.join(' | ')
							}
						}
					}
				}
			];
		}

		// Get n products with filter option satisfied
		productsWithAttributes = await prisma.product.findMany({
			take: pageSize,
			skip: skip,
			where: {
				AND: [...categoryWhere, ...brandWhere, ...attributeWhere],
				OR: [...queryWhere]
			},
			include: {
				attributes: true
			}
		});

		const totalProductsCount = await prisma.product.count({
			where: {
				AND: [...categoryWhere, ...brandWhere, ...attributeWhere],
				OR: [...queryWhere]
			}
		});
		totalPages = Math.ceil(totalProductsCount / pageSize);

		// Get facets count with filter option satisfied
		const FacetCounts = await prisma.product.findMany({
			where: {
				AND: [...categoryWhere, ...brandWhere, ...attributeWhere],
				OR: [...queryWhere]
			},
			select: {
				brand: true,
				category: true,
				attributes: {
					select: {
						name: true,
						value: true
					}
				}
			}
		});

		// Aggregate found facets
		const facetsFound = FacetCounts.reduce((acc: Facet, item) => {
			// Grouping by Brand
			acc['Brand'] = acc['Brand'] || [];
			const brandExists = acc['Brand'].find((el) => el.value === item.brand);
			if (brandExists) {
				brandExists.count++;
			} else {
				acc['Brand'].push({ value: item.brand, count: 1, selected: false });
			}

			// Grouping by Category
			acc['Category'] = acc['Category'] || [];
			const categoryExists = acc['Category'].find((el) => el.value === item.category);
			if (categoryExists) {
				categoryExists.count++;
			} else {
				acc['Category'].push({ value: item.category, count: 1, selected: false });
			}

			// Grouping by Attributes
			item.attributes.forEach((attr) => {
				acc[attr.name] = acc[attr.name] || [];
				const attrExists = acc[attr.name].find((el) => el.value === attr.value);

				if (attrExists) {
					attrExists.count++;
				} else {
					acc[attr.name].push({
						value: attr.value,
						count: 1,
						selected: false
					});
				}
			});

			return acc;
		}, {});

		const updateFacets = (AllFacet: Facet, facetsFound: Facet): Facet => {
			const updatedAllFacet: Facet = { ...AllFacet };
			// merge all faces with
			Object.keys(facetsFound).forEach((facetKey) => {
				const facetValues = facetsFound[facetKey];

				facetValues.forEach((selectedValue) => {
					const matchingValues = updatedAllFacet[facetKey];
					// update facets in all-facets with found facet info
					if (matchingValues) {
						matchingValues.forEach((value) => {
							if (value.value === selectedValue.value) {
								value.count = selectedValue.count;
							}
						});
					}
				});
			});
			// mark selected that are in params:
			Object.entries(params).forEach(([key, values]) => {
				updatedAllFacet[key] &&
					updatedAllFacet[key].forEach((value) => {
						if (values.includes(value.value)) {
							value.selected = true;
						}
					});
			});

			// delete unused facets
			if (productsWithAttributes.length) {
				for (const key in updatedAllFacet) {
					const counts = updatedAllFacet[key].map((item) => item.count);
					if (counts.every((count) => count === 0)) {
						delete updatedAllFacet[key];
					}
				}
			}
			return updatedAllFacet;
		};

		const updatedAllFacet = updateFacets(AllFacet, facetsFound);

		facetData = updatedAllFacet;
	}
	// console.log(facetData);
	const sortByCount = (data: Facet): Facet => {
		const sortedData: Facet = { ...data };

		Object.keys(sortedData).forEach((facetKey) => {
			sortedData[facetKey].sort((a, b) => b.count - a.count);
		});

		return sortedData;
	};

	facetData = sortByCount(facetData);

	return (
		<div className='min-h-screen flex items-start pt-8 space-x-4'>
			<div className='flex flex-col space-y-4'>
				<div>
					<Search />
				</div>
				{productsWithAttributes.map((product) => (
					<Card key={product.id}>
						<CardHeader className='py-1'>
							<CardTitle>{product.title}</CardTitle>
						</CardHeader>
						<CardContent className=' text-sm'>
							<p>Price: {product.price}</p>
							<p>Category: {product.category}</p>
							<p>Band: {product.brand}</p>
							{product.attributes.map((item) => (
								<p key={item.value}>
									{item.name} : {item.value}
								</p>
							))}
						</CardContent>
					</Card>
				))}
				<Pagination currentPage={page} totalPages={totalPages} />
			</div>
			<div className='flex flex-col space-y-4'>
				<FacetHandler facet={facetData} />
			</div>
		</div>
	);
}
