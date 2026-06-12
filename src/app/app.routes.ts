import { Routes } from '@angular/router';
import { roleGuard } from './core/keycloak/role.guard';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./shared/components/app-shell/app-shell.component').then((module) => module.AppShellComponent),
		children: [
			{ path: '', loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard.page').then((module) => module.DashboardPage), canActivate: [roleGuard], data: { roles: ['READ'] } },
			{ path: 'events', loadComponent: () => import('./features/events/pages/event-list/event-list.page').then((module) => module.EventListPage), canActivate: [roleGuard], data: { roles: ['READ'] } },
			{ path: 'events/new', loadComponent: () => import('./features/events/pages/event-form/event-form.page').then((module) => module.EventFormPage), canActivate: [roleGuard], data: { roles: ['READ'] } },
			{ path: 'events/:id', loadComponent: () => import('./features/events/pages/event-detail/event-detail.page').then((module) => module.EventDetailPage), canActivate: [roleGuard], data: { roles: ['READ'] } },
			{ path: 'events/:id/edit', loadComponent: () => import('./features/events/pages/event-form/event-form.page').then((module) => module.EventFormPage), canActivate: [roleGuard], data: { roles: ['UPDATE'] } },
			{ path: 'forbidden', loadComponent: () => import('./features/auth/pages/forbidden/forbidden.page').then((module) => module.ForbiddenPage) },
		],
	},
	{ path: '**', redirectTo: '' },
];
