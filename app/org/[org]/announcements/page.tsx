import EmployeeAnnouncements from '@/app/org/[org]/(employee)/announcements/EmployeeAnnouncements';
import ManagerAnnouncements from '@/app/org/[org]/(manager)/announcements/ManagerAnnouncements';
import { getSession } from '@/lib/auth';

export default async function AnnouncementsPage() {
	const session = await getSession();
	const roles = ((session as any)?.roles || []) as string[];
	const isManager = roles.some((r) =>
		['MANAGER', 'OWNER', 'ADMIN', 'SUPERADMIN'].includes(r)
	);
	return isManager ? <ManagerAnnouncements /> : <EmployeeAnnouncements />;
}
