import React from 'react';
import StudentDashboardLayout from '../../components/layout/StudentDashboardLayout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<StudentDashboardLayout>
			{children}
		</StudentDashboardLayout>
	);
}
