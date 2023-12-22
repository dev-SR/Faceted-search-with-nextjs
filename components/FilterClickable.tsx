'use client';
import { cn } from '@/lib/utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Checkbox } from './ui/checkbox';

const FilterClickable = ({
	attribute_name,
	attribute_value,
	count,
	selected
}: {
	attribute_name: string;
	attribute_value: string;
	count: number;
	selected: boolean;
}) => {
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const router = useRouter();
	// console.log(selected);

	// console.log(attribute_value, Array.from(searchParams.values()));

	return (
		<div className='flex items-center space-x-4'>
			<Checkbox
				checked={selected}
				onClick={() => {
					const params = new URLSearchParams(searchParams);
					params.delete('page');
					if (params.has(attribute_name)) {
						// if the attribute is already in the search params, check if values is also in array,
						// if not then push value to search param, else ignore
						const values = params.getAll(attribute_name);
						if (!values.includes(attribute_value)) {
							params.append(attribute_name, attribute_value);
						} else {
							params.delete(attribute_name, attribute_value);
						}
					} else {
						params.append(attribute_name, attribute_value);
					}
					router.replace(`${pathname}?${params.toString()}`);
				}}
			/>
			<div className={cn('text-primary w-full', count == 0 && 'text-primary/30')}>
				{attribute_value} ({count})
			</div>
		</div>
	);
};

export default FilterClickable;
