import { Component, ElementRef, ViewChild } from '@angular/core';

import { ElectronService } from 'ngx-electronyzer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'electron-print';
  @ViewChild('invoice') invoice: ElementRef;

  constructor(private electronService: ElectronService) { }

  downloadPdf() {
    this.electronService.ipcRenderer.send('print', this.invoice.nativeElement.innerHTML);
  }
}
