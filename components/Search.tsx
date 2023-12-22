'use client';
import { useDebouncedCallback } from 'use-debounce';

import { SearchIcon } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function Search() {
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const { replace } = useRouter();
	// ...

	// Inside the Search Component...
	const handleSearch = useDebouncedCallback((term) => {
		const params = new URLSearchParams(searchParams);
		params.delete('page');
		if (term) {
			params.set('query', term);
		} else {
			params.delete('query');
		}
		replace(`${pathname}?${params.toString()}`);
	}, 300);

	return (
		<div className='relative flex flex-1 flex-shrink-0'>
			<label htmlFor='search' className='sr-only'>
				Search
			</label>
			<input
				defaultValue={searchParams.get('query')?.toString()}
				className='peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500'
				placeholder='Search...'
				onChange={(e) => {
					handleSearch(e.target.value);
				}}
			/>
			<SearchIcon className='absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900' />
		</div>
	);
}
