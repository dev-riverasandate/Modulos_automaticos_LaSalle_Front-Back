import { Component } from '@angular/core';
import { DatabaseViewerComponent } from './database-viewer/database-viewer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DatabaseViewerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-sql-explorer';
}