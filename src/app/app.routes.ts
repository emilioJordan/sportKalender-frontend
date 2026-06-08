import { Routes } from '@angular/router';
import { roleGuard } from './core/auth/role.guard';
import { DashboardPage } from './features/dashboard/dashboard.page';
import { EventDetailPage } from './features/events/event-detail/event-detail.page';
import { EventFormPage } from './features/events/event-form/event-form.page';
import { EventListPage } from './features/events/event-list/event-list.page';
import { ForbiddenPage } from './features/auth/forbidden.page';
import { TaskFormPage } from './features/tasks/task-form/task-form.page';
import { TaskListPage } from './features/tasks/task-list/task-list.page';
import { AppShellComponent } from './shared/components/app-shell/app-shell.component';

export const routes: Routes = [
	{
		path: '',
		component: AppShellComponent,
		children: [
			{ path: '', component: DashboardPage, canActivate: [roleGuard], data: { roles: ['READ'] } },
			{ path: 'events', component: EventListPage, canActivate: [roleGuard], data: { roles: ['READ'] } },
			{ path: 'events/new', component: EventFormPage, canActivate: [roleGuard], data: { roles: ['UPDATE'] } },
			{ path: 'events/:id', component: EventDetailPage, canActivate: [roleGuard], data: { roles: ['READ'] } },
			{ path: 'events/:id/edit', component: EventFormPage, canActivate: [roleGuard], data: { roles: ['UPDATE'] } },
			{ path: 'tasks', component: TaskListPage, canActivate: [roleGuard], data: { roles: ['READ'] } },
			{ path: 'tasks/new', component: TaskFormPage, canActivate: [roleGuard], data: { roles: ['UPDATE'] } },
			{ path: 'tasks/:id/edit', component: TaskFormPage, canActivate: [roleGuard], data: { roles: ['UPDATE'] } },
			{ path: 'forbidden', component: ForbiddenPage },
		],
	},
	{ path: '**', redirectTo: '' },
];
