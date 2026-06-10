import { Routes } from '@angular/router';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./shared/components/app-shell/app-shell.component').then((module) => module.AppShellComponent),
		children: [
			{ path: '', loadComponent: () => import('./features/dashboard/dashboard.page').then((module) => module.DashboardPage), canActivate: [roleGuard], data: { roles: ['READ'] } },
			{ path: 'events', loadComponent: () => import('./features/events/event-list/event-list.page').then((module) => module.EventListPage), canActivate: [roleGuard], data: { roles: ['READ'] } },
			{ path: 'events/new', loadComponent: () => import('./features/events/event-form/event-form.page').then((module) => module.EventFormPage), canActivate: [roleGuard], data: { roles: ['UPDATE'] } },
			{ path: 'events/:id', loadComponent: () => import('./features/events/event-detail/event-detail.page').then((module) => module.EventDetailPage), canActivate: [roleGuard], data: { roles: ['READ'] } },
			{ path: 'events/:id/edit', loadComponent: () => import('./features/events/event-form/event-form.page').then((module) => module.EventFormPage), canActivate: [roleGuard], data: { roles: ['UPDATE'] } },
			{ path: 'tasks', loadComponent: () => import('./features/tasks/task-list/task-list.page').then((module) => module.TaskListPage), canActivate: [roleGuard], data: { roles: ['READ'] } },
			{ path: 'tasks/new', loadComponent: () => import('./features/tasks/task-form/task-form.page').then((module) => module.TaskFormPage), canActivate: [roleGuard], data: { roles: ['UPDATE'] } },
			{ path: 'tasks/:id/edit', loadComponent: () => import('./features/tasks/task-form/task-form.page').then((module) => module.TaskFormPage), canActivate: [roleGuard], data: { roles: ['UPDATE'] } },
			{ path: 'forbidden', loadComponent: () => import('./features/auth/forbidden.page').then((module) => module.ForbiddenPage) },
		],
	},
	{ path: '**', redirectTo: '' },
];
