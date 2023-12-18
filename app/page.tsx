import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import prisma from '@/lib/prisma';

export default async function Home() {
	const posts = await prisma.post.findMany({
		include: {
			author: true
		}
	});
	return (
		<div className='min-h-screen flex flex-col items-center pt-8'>
			<ul className='flex flex-col space-y-4'>
				{posts.map((post) => (
					<Card key={post.id}>
						<CardHeader>
							<CardTitle>{post.title}</CardTitle>
						</CardHeader>
						<CardContent>
							<p>{post.content}</p>
						</CardContent>
						<CardFooter>
							<div className='flex justify-end w-full'>- {post.author?.name}</div>
						</CardFooter>
					</Card>
				))}
			</ul>
		</div>
	);
}
