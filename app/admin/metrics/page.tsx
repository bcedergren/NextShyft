'use client';
import AppShell from '../../../components/AppShell';
import { useEffect, useState } from 'react';
import { Grid, Paper, Stack, Typography } from '@mui/material';
import {
	ResponsiveContainer,
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
} from 'recharts';

function Chart({ title, data }: { title: string; data: any[] }) {
	return (
		<Paper sx={{ p: 2 }}>
			<Typography variant='subtitle1'>{title}</Typography>
			<div style={{ height: 240 }}>
				<ResponsiveContainer
					width='100%'
					height='100%'
				>
					<LineChart data={data}>
						<CartesianGrid strokeDasharray='3 3' />
						<XAxis dataKey='date' />
						<YAxis allowDecimals={false} />
						<Tooltip />
						<Line
							type='monotone'
							dataKey='count'
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</Paper>
	);
}

export default function AdminMetrics() {
	const [data, setData] = useState<any>(null);
	useEffect(() => {
		fetch('/api/admin/metrics')
			.then((r) => r.json())
			.then(setData);
	}, []);
	if (!data) return null;
	const s = data.series || {};
	const t = data.totals || {};
	return (
		<AppShell>
			<Stack spacing={2}>
				<Typography variant='h5'>Super Admin Metrics</Typography>
				<Grid
					container
					spacing={2}
				>
					<Grid
						item
						xs={6}
						md={3}
					>
						<Paper sx={{ p: 2 }}>
							<Typography variant='h6'>{t.orgs}</Typography>
							<Typography variant='caption'>Organizations</Typography>
						</Paper>
					</Grid>
					<Grid
						item
						xs={6}
						md={3}
					>
						<Paper sx={{ p: 2 }}>
							<Typography variant='h6'>{t.users}</Typography>
							<Typography variant='caption'>Users</Typography>
						</Paper>
					</Grid>
					<Grid
						item
						xs={6}
						md={3}
					>
						<Paper sx={{ p: 2 }}>
							<Typography variant='h6'>{t.schedules}</Typography>
							<Typography variant='caption'>Schedules</Typography>
						</Paper>
					</Grid>
					<Grid
						item
						xs={6}
						md={3}
					>
						<Paper sx={{ p: 2 }}>
							<Typography variant='h6'>{t.notifications}</Typography>
							<Typography variant='caption'>Notifications</Typography>
						</Paper>
					</Grid>
				</Grid>
				<Chart
					title='Orgs created (30d)'
					data={s.orgs || []}
				/>
				<Chart
					title='Users created (30d)'
					data={s.users || []}
				/>
				<Chart
					title='Schedules created (30d)'
					data={s.schedules || []}
				/>
				<Chart
					title='Notifications created (30d)'
					data={s.notifications || []}
				/>
				<Chart
					title='Swaps created (30d)'
					data={s.swaps || []}
				/>
				<a
					href='/admin/metrics/drilldown'
					className='underline self-start'
				>
					Open Drilldowns
				</a>
			</Stack>
		</AppShell>
	);
}
