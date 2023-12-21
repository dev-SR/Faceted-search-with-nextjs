'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Input } from './ui/input';
import FilterClickable from './FilterClickable';
import { Facet } from '@/app/page';
import { Button } from './ui/button';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
type SearchRecord = Record<string, string>;

const FacetHandler = ({ facet }: { facet: Facet }) => {
	const pathname = usePathname();
	const router = useRouter();
	const [searchQueries, setSearchQueries] = React.useState<SearchRecord>(
		Object.keys(facet).reduce((acc: SearchRecord, attribute_name) => {
			acc[attribute_name] = '';
			return acc;
		}, {})
	);

	const handleSearchChange = (
		event: React.ChangeEvent<HTMLInputElement>,
		attribute_name: string
	) => {
		setSearchQueries({
			...searchQueries,
			[attribute_name]: event.target.value
		});
	};

	return (
		<div className='w-full flex flex-col space-y-4'>
			<Button
				className='w-full'
				onClick={() => {
					router.replace(pathname);
					router.refresh();
				}}>
				Reset
			</Button>
			{Object.entries(facet).map(([attribute_name, options]) => {
				const attributeSearchQuery = searchQueries[attribute_name] || '';
				return (
					<Card key={attribute_name}>
						<CardHeader>
							<CardTitle className='text-md'>{attribute_name}</CardTitle>
						</CardHeader>
						<CardContent className='flex flex-col items-start space-y-2'>
							{options
								.filter((option) =>
									option.value.toLowerCase().includes(attributeSearchQuery.toLowerCase())
								)
								.map((option, index) => {
									if (index > 4) {
										return null; // Returning null instead of undefined
									}
									return (
										<FilterClickable
											key={option.value}
											attribute_name={attribute_name}
											attribute_value={option.value}
											count={option.count}
											selected={option.selected}
										/>
									);
								})}
							{options.length > 5 && (
								<div className='py-2 flex flex-col space-y-4 w-full'>
									<div className='pl-4 text-sm font-bold'>More...</div>
									<div className='flex space-x-2 w-full grow-0'>
										<Input
											className='w-full flex-shrink'
											type='text'
											placeholder='Search Attributes...'
											value={attributeSearchQuery}
											onChange={(e) => handleSearchChange(e, attribute_name)}
										/>
										{searchQueries[attribute_name] && searchQueries[attribute_name].length > 0 && (
											<Button
												onClick={() => {
													setSearchQueries({
														...searchQueries,
														[attribute_name]: ''
													});
												}}>
												Clear
											</Button>
										)}
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
};
export default FacetHandler;

/*

'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Input } from './ui/input';
import FilterClickable from './FilterClickable';
import { Facet } from '@/app/page';

// ... (existing imports)

const FacetHandler = ({ facet }: { facet: Facet }) => {
	const [facetState, setFacetState] = React.useState(
		Object.entries(facet).map(([attribute_name, options]) => ({
			attribute_name,
			options,
			searchQuery: ''
		}))
	);

	const handleSearchChange = (index: number, value: string) => {
		setFacetState((prevState) => {
			const updatedState = [...prevState];
			updatedState[index].searchQuery = value;
			return updatedState;
		});
	};

	return facetState.map((facetItem, index) => (
		<Card key={facetItem.attribute_name}>
			<CardHeader className='py-1'>
				<CardTitle>{facetItem.attribute_name}</CardTitle>
			</CardHeader>
			<CardContent className='flex flex-col items-start'>
				{facetItem.options
					.filter((option) =>
						option.value.toLowerCase().includes(facetItem.searchQuery.toLowerCase())
					)
					.map((option, idx) => {
						if (idx > 5) {
							return null;
						}
						return (
							<FilterClickable
								key={option.value}
								attribute_name={facetItem.attribute_name}
								attribute_value={option.value}
								count={option.count}
							/>
						);
					})}
				{facetItem.options.length > 5 && (
					<div className='py-2 flex flex-col space-y-4'>
						<div className='pl-4 text-sm font-bold'>More...</div>
						<Input
							type='text'
							placeholder='Search Attributes...'
							value={facetItem.searchQuery}
							onChange={(e) => handleSearchChange(index, e.target.value)}
						/>
					</div>
				)}
			</CardContent>
		</Card>
	));
};
export default FacetHandler;

*/
