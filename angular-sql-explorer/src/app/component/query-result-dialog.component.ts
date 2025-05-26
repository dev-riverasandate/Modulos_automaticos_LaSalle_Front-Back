import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-query-result-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './query-result-dialog.component.html'
})
export class QueryResultDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { columns: string[], rows: any[] },
    public dialogRef: MatDialogRef<QueryResultDialogComponent>
  ) {}
}