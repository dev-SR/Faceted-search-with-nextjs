'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
// Pagination.tsx

import React from 'react';

interface PaginationProps {
	currentPage: number;
	totalPages: number;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages }) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const onPageChange = (page: number) => {
		const params = new URLSearchParams(searchParams);
		params.delete('page');

		router.replace(`${pathname}?page=${page}&${params.toString()}`);
		router.refresh();
	};

	const getPageNumbers = () => {
		const pageSpread = 2; // Number of pages to show before and after the current page
		const pages = [];
		let startPage = Math.max(1, currentPage - pageSpread);
		let endPage = Math.min(totalPages, currentPage + pageSpread);

		if (currentPage - pageSpread > 1) {
			pages.push(1);
			if (currentPage - pageSpread > 2) {
				pages.push('...');
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			pages.push(i);
		}

		if (currentPage + pageSpread < totalPages) {
			if (currentPage + pageSpread < totalPages - 1) {
				pages.push('...');
			}
			pages.push(totalPages);
		}

		return pages;
	};

	return (
		<div className='pagination-container'>
			<ul className='flex space-x-2'>
				{getPageNumbers().map((page, index) => (
					<li key={index}>
						{page === '...' ? (
							<span className='px-2 py-1'>...</span>
						) : (
							<button
								onClick={() => onPageChange(page as number)}
								className={`px-2 py-1 rounded ${
									currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
								}`}>
								{page}
							</button>
						)}
					</li>
				))}
			</ul>
		</div>
	);
};

export default Pagination;
