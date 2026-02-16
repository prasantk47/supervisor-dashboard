import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Events</h2>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'all'" (click)="activeTab = 'all'; loadEvents()">All Events</button>
        <button class="tab" [class.active]="activeTab === 'upcoming'" (click)="activeTab = 'upcoming'; loadUpcoming()">Upcoming</button>
      </div>

      <!-- ALL EVENTS TAB -->
      <div *ngIf="activeTab === 'all'">
        <div class="card form-card" *ngIf="showEventForm">
          <h3>{{ editingEventId ? 'Edit Event' : 'Create Event' }}</h3>
          <form (ngSubmit)="saveEvent()">
            <div class="form-grid">
              <div class="form-group"><label>Title *</label><input type="text" [(ngModel)]="eventForm.title" name="etitle" required placeholder="Event title"></div>
              <div class="form-group"><label>Event Date *</label><input type="date" [(ngModel)]="eventForm.eventDate" name="edate" required></div>
              <div class="form-group"><label>Start Time *</label><input type="time" [(ngModel)]="eventForm.startTime" name="estime" required></div>
              <div class="form-group"><label>End Time</label><input type="time" [(ngModel)]="eventForm.endTime" name="eetime"></div>
              <div class="form-group"><label>Location *</label><input type="text" [(ngModel)]="eventForm.location" name="eloc" required placeholder="Event location"></div>
              <div class="form-group"><label>Max Attendees</label><input type="number" [(ngModel)]="eventForm.maxAttendees" name="emax" placeholder="0 = unlimited"></div>
            </div>
            <div class="form-group" style="margin-top: 12px;">
              <label>Description</label>
              <textarea [(ngModel)]="eventForm.description" name="edesc" rows="3" placeholder="Event description"></textarea>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
              <button type="button" class="btn btn-secondary" (click)="cancelEventForm()">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <!-- Status Filter -->
        <div class="categories-bar">
          <span class="cat-chip" [class.active]="!statusFilter" (click)="statusFilter = ''; loadEvents()">All</span>
          <span class="cat-chip" [class.active]="statusFilter === 'upcoming'" (click)="statusFilter = 'upcoming'; loadEvents()">Upcoming</span>
          <span class="cat-chip" [class.active]="statusFilter === 'completed'" (click)="statusFilter = 'completed'; loadEvents()">Completed</span>
          <span class="cat-chip" [class.active]="statusFilter === 'cancelled'" (click)="statusFilter = 'cancelled'; loadEvents()">Cancelled</span>
        </div>

        <div class="card">
          <div class="card-header"><span>All Events</span><button class="btn btn-primary btn-sm" (click)="openEventForm()" *ngIf="!showEventForm">+ Create Event</button></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Title</th><th>Date</th><th>Time</th><th>Location</th><th>Organizer</th><th>RSVPs</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let e of events">
                <td class="name-cell">{{ e.title }}</td>
                <td>{{ e.eventDate | date:'mediumDate' }}</td>
                <td>{{ e.startTime }}{{ e.endTime ? ' - ' + e.endTime : '' }}</td>
                <td>{{ e.location || '-' }}</td>
                <td>{{ e.organizerName || e.organizer || '-' }}</td>
                <td>{{ e.rsvpCount || 0 }}</td>
                <td>
                  <span class="badge"
                    [class.badge-active]="e.status === 'upcoming'"
                    [class.badge-completed]="e.status === 'completed'"
                    [class.badge-inactive]="e.status === 'cancelled'">
                    {{ e.status || 'upcoming' }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-primary btn-sm" (click)="editEvent(e)">Edit</button>
                  <button class="btn btn-secondary btn-sm" (click)="toggleAttendees(e)">Attendees</button>
                  <button class="btn btn-danger btn-sm" *ngIf="e.status !== 'cancelled'" (click)="cancelEvent(e)">Cancel</button>
                  <button class="btn btn-danger btn-sm" (click)="deleteEvent(e)">Delete</button>
                </td>
              </tr>
              <tr *ngIf="events.length === 0"><td colspan="8" class="empty">No events found</td></tr>
            </tbody>
          </table>

          <!-- Attendees Expansion -->
          <div class="attendees-panel" *ngIf="showAttendeesForId">
            <div class="card" style="margin-top: 12px; background: #fafafa;">
              <div class="card-header"><span>Attendees for: {{ attendeesEventTitle }}</span><button class="btn btn-secondary btn-sm" (click)="showAttendeesForId = ''">Close</button></div>
              <div class="loading" *ngIf="loadingAttendees">Loading attendees...</div>
              <table *ngIf="!loadingAttendees && attendees.length > 0">
                <thead><tr><th>Name</th><th>Unit</th><th>RSVP Date</th><th>Status</th></tr></thead>
                <tbody>
                  <tr *ngFor="let a of attendees">
                    <td class="name-cell">{{ a.name || a.residentName || '-' }}</td>
                    <td>{{ a.unit || a.unitNumber || '-' }}</td>
                    <td>{{ a.rsvpDate ? (a.rsvpDate | date:'medium') : '-' }}</td>
                    <td><span class="badge badge-active">{{ a.status || 'confirmed' }}</span></td>
                  </tr>
                </tbody>
              </table>
              <div class="empty" *ngIf="!loadingAttendees && attendees.length === 0">No attendees yet</div>
            </div>
          </div>
        </div>
      </div>

      <!-- UPCOMING TAB -->
      <div *ngIf="activeTab === 'upcoming'">
        <div class="loading" *ngIf="loading">Loading...</div>
        <div class="events-grid" *ngIf="!loading">
          <div class="event-card" *ngFor="let e of upcomingEvents">
            <div class="event-card-header">
              <h4>{{ e.title }}</h4>
              <span class="badge badge-active">upcoming</span>
            </div>
            <div class="event-card-body">
              <div class="event-detail"><span class="detail-label">Date:</span> {{ e.eventDate | date:'mediumDate' }}</div>
              <div class="event-detail"><span class="detail-label">Time:</span> {{ e.startTime }}{{ e.endTime ? ' - ' + e.endTime : '' }}</div>
              <div class="event-detail"><span class="detail-label">Location:</span> {{ e.location || '-' }}</div>
              <div class="event-detail"><span class="detail-label">Organizer:</span> {{ e.organizerName || e.organizer || '-' }}</div>
              <div class="event-detail"><span class="detail-label">RSVPs:</span> {{ e.rsvpCount || 0 }}{{ e.maxAttendees ? ' / ' + e.maxAttendees : '' }}</div>
              <p class="event-desc" *ngIf="e.description">{{ e.description }}</p>
            </div>
            <div class="event-card-footer">
              <button class="btn btn-primary btn-sm" (click)="rsvpEvent(e)">RSVP</button>
              <button class="btn btn-secondary btn-sm" (click)="toggleAttendees(e)">View Attendees</button>
            </div>
          </div>
          <div class="empty" *ngIf="upcomingEvents.length === 0" style="grid-column: 1 / -1;">No upcoming events</div>
        </div>

        <!-- Attendees Expansion for Upcoming Tab -->
        <div class="attendees-panel" *ngIf="showAttendeesForId">
          <div class="card" style="margin-top: 12px; background: #fafafa;">
            <div class="card-header"><span>Attendees for: {{ attendeesEventTitle }}</span><button class="btn btn-secondary btn-sm" (click)="showAttendeesForId = ''">Close</button></div>
            <div class="loading" *ngIf="loadingAttendees">Loading attendees...</div>
            <table *ngIf="!loadingAttendees && attendees.length > 0">
              <thead><tr><th>Name</th><th>Unit</th><th>RSVP Date</th><th>Status</th></tr></thead>
              <tbody>
                <tr *ngFor="let a of attendees">
                  <td class="name-cell">{{ a.name || a.residentName || '-' }}</td>
                  <td>{{ a.unit || a.unitNumber || '-' }}</td>
                  <td>{{ a.rsvpDate ? (a.rsvpDate | date:'medium') : '-' }}</td>
                  <td><span class="badge badge-active">{{ a.status || 'confirmed' }}</span></td>
                </tr>
              </tbody>
            </table>
            <div class="empty" *ngIf="!loadingAttendees && attendees.length === 0">No attendees yet</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .page-header h2 { margin: 0; color: #333; }
    .tabs { display: flex; gap: 4px; margin-bottom: 16px; }
    .tab { padding: 8px 20px; border: 1px solid #ddd; border-radius: 6px; background: #fff; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s; }
    .tab:hover { background: #f5f5f5; }
    .tab.active { background: #1a1a2e; color: #fff; border-color: #1a1a2e; }
    .categories-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
    .cat-chip { padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 500; background: #f0f0f0; color: #555; cursor: pointer; transition: all 0.2s; }
    .cat-chip:hover { background: #e0e0e0; }
    .cat-chip.active { background: #1a1a2e; color: #fff; }
    .card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-weight: 600; color: #333; }
    .form-card { margin-bottom: 16px; }
    .form-card h3 { margin: 0 0 16px; color: #333; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    .form-group { display: flex; flex-direction: column; }
    .form-group label { font-size: 12px; font-weight: 600; color: #555; margin-bottom: 4px; }
    .form-group input, .form-group select, .form-group textarea { padding: 8px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; font-family: inherit; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #4fc3f7; }
    .form-group textarea { resize: vertical; }
    .form-actions { margin-top: 16px; display: flex; gap: 8px; }
    .error-msg { color: #f44336; font-size: 13px; margin-top: 8px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 13px; }
    th { font-weight: 600; color: #666; background: #fafafa; }
    .name-cell { font-weight: 600; }
    .badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge-active { background: #e8f5e9; color: #2e7d32; }
    .badge-completed { background: #e3f2fd; color: #1565c0; }
    .badge-inactive { background: #ffebee; color: #c62828; }
    .badge-pending { background: #fff3e0; color: #e65100; }
    .btn { padding: 6px 14px; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; font-weight: 500; }
    .btn-primary { background: #1a1a2e; color: #fff; }
    .btn-secondary { background: #eee; color: #333; }
    .btn-danger { background: #f44336; color: #fff; }
    .btn-sm { padding: 3px 8px; font-size: 11px; }
    .btn + .btn { margin-left: 4px; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .empty { text-align: center; color: #999; padding: 40px; }
    .loading { text-align: center; color: #999; padding: 40px; }
    .events-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
    .event-card { background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: hidden; display: flex; flex-direction: column; }
    .event-card-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px 0; }
    .event-card-header h4 { margin: 0; color: #333; font-size: 15px; }
    .event-card-body { padding: 12px 20px; flex: 1; }
    .event-detail { font-size: 13px; color: #555; margin-bottom: 4px; }
    .detail-label { font-weight: 600; color: #333; }
    .event-desc { font-size: 12px; color: #777; margin-top: 8px; margin-bottom: 0; }
    .event-card-footer { padding: 12px 20px; border-top: 1px solid #eee; display: flex; gap: 8px; }
  `]
})
export class EventsComponent implements OnInit {
  activeTab = 'all';
  loading = false;
  saving = false;
  formError = '';
  statusFilter = '';

  events: any[] = [];
  upcomingEvents: any[] = [];

  showEventForm = false;
  editingEventId = '';
  eventForm = { title: '', description: '', eventDate: '', startTime: '', endTime: '', location: '', maxAttendees: null as number | null };

  showAttendeesForId = '';
  attendeesEventTitle = '';
  attendees: any[] = [];
  loadingAttendees = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadEvents(); }

  loadEvents(): void {
    this.loading = true;
    const params: any = {};
    if (this.statusFilter) params.status = this.statusFilter;
    this.api.get<any>('/events', params).subscribe({
      next: (res) => { this.events = res.data?.events || res.data || []; this.loading = false; },
      error: () => { this.events = []; this.loading = false; }
    });
  }

  loadUpcoming(): void {
    this.loading = true;
    this.api.get<any>('/events/upcoming').subscribe({
      next: (res) => { this.upcomingEvents = res.data?.events || res.data || []; this.loading = false; },
      error: () => { this.upcomingEvents = []; this.loading = false; }
    });
  }

  openEventForm(): void {
    this.editingEventId = '';
    this.eventForm = { title: '', description: '', eventDate: '', startTime: '', endTime: '', location: '', maxAttendees: null };
    this.formError = '';
    this.showEventForm = true;
  }

  cancelEventForm(): void {
    this.showEventForm = false;
    this.editingEventId = '';
    this.formError = '';
  }

  saveEvent(): void {
    this.saving = true;
    this.formError = '';
    const payload = { ...this.eventForm };
    const req$ = this.editingEventId
      ? this.api.put<any>(`/events/${this.editingEventId}`, payload)
      : this.api.post<any>('/events', payload);
    req$.subscribe({
      next: () => { this.saving = false; this.showEventForm = false; this.editingEventId = ''; this.loadEvents(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to save event'; }
    });
  }

  editEvent(e: any): void {
    this.editingEventId = e.id || e._id;
    this.eventForm = {
      title: e.title || '',
      description: e.description || '',
      eventDate: e.eventDate ? e.eventDate.substring(0, 10) : '',
      startTime: e.startTime || '',
      endTime: e.endTime || '',
      location: e.location || '',
      maxAttendees: e.maxAttendees || null
    };
    this.formError = '';
    this.showEventForm = true;
  }

  cancelEvent(e: any): void {
    if (confirm(`Cancel event "${e.title}"? This action cannot be undone.`)) {
      this.api.put<any>(`/events/${e.id || e._id}/cancel`, {}).subscribe({
        next: () => this.loadEvents(),
        error: () => {}
      });
    }
  }

  deleteEvent(e: any): void {
    if (confirm(`Delete event "${e.title}"? This action cannot be undone.`)) {
      this.api.delete<any>(`/events/${e.id || e._id}`).subscribe({
        next: () => this.loadEvents(),
        error: () => {}
      });
    }
  }

  toggleAttendees(e: any): void {
    const eventId = e.id || e._id;
    if (this.showAttendeesForId === eventId) {
      this.showAttendeesForId = '';
      return;
    }
    this.showAttendeesForId = eventId;
    this.attendeesEventTitle = e.title;
    this.loadingAttendees = true;
    this.attendees = [];
    this.api.get<any>(`/events/${eventId}/attendees`).subscribe({
      next: (res) => { this.attendees = res.data?.attendees || res.data || []; this.loadingAttendees = false; },
      error: () => { this.attendees = []; this.loadingAttendees = false; }
    });
  }

  rsvpEvent(e: any): void {
    const eventId = e.id || e._id;
    this.api.post<any>(`/events/${eventId}/rsvp`, {}).subscribe({
      next: () => { this.loadUpcoming(); },
      error: () => {}
    });
  }
}
