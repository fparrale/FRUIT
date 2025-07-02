import { Component, OnInit } from '@angular/core';
import { GameRoomsService } from '../game-rooms/services/game-rooms.service';
import { AlertService } from '../shared/alert.service';
import { LoadingService } from '../shared/loading.service';
import { CommonModule } from '@angular/common';
import { json } from 'node:stream/consumers';
import { TranslateModule } from '@ngx-translate/core';
import { StorageService } from '../shared/storage.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css'
})
export default class ReportComponent implements OnInit {
  gameRooms: any[] = [];
  paginatedData: any[] = [];
  currentPage = 1;
  itemsPerPage = 5;
  selectedFile: File | null = null;
  searchTerm: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  sortField: 'code' | 'createdAt' | 'expirationAt'= 'code';
  filteredGameRooms: any[] = [];

  constructor(
    private gameRoomsService: GameRoomsService,
    private alertService: AlertService, 
    private loadingService: LoadingService,
    private serviceStorage: StorageService
  ) {}

  ngOnInit(): void {
    this.getGameRooms();
  }

  getGameRooms() {
    this.loadingService.showLoading();
    this.gameRoomsService.getGameRooms().subscribe({
      next: (response) => {
        this.loadingService.hideLoading();
        this.gameRooms = response.data;
        this.filteredGameRooms = [...this.gameRooms];
        this.updatePagination();
      },
      error: (error) => {
        this.loadingService.hideLoading();
        this.alertService.showAlert(error.message, true);
      },
    });
  }

  onGenerateReportGameRoom(gameRooms: any) {
    this.loadingService.showLoading();
    this.gameRoomsService.generateReportGameRoom(gameRooms.id, this.serviceStorage.getItem() || 'es').subscribe({
      next: (response) => {
        const contentDisposition = response.headers.get('Content-Disposition');
        let fileName = 'reporte.pdf';
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="(.+)"/);
          if (match) {
            fileName = match[1];
          }
        }
        const blob = response.body as Blob;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
        this.loadingService.hideLoading();
      },
      error: (error) => {
        this.loadingService.hideLoading();
        this.alertService.showAlert(error.message, true);
      },
    });
  }

  updatePagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedData = this.filteredGameRooms.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }

  nextPage() {
    if (this.currentPage * this.itemsPerPage < this.gameRooms.length) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.filteredGameRooms.length / this.itemsPerPage);
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    return date.toLocaleDateString('es-ES', options).replace(',', '');
  }

  searchGameRooms(): void {
    this.filteredGameRooms = this.gameRooms.filter(room => 
      room.code.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.sortGameRooms();
    this.currentPage = 1;
    this.updatePagination();
  }

  // Add sort method
  sortGameRooms(): void {
    const DEFAULT_DATE = '1969-12-31T19:00:00';
    this.filteredGameRooms.sort((a, b) => {
      if (this.sortField === 'code') {
        const valueA = a.code.toLowerCase();
        const valueB = b.code.toLowerCase();
        return this.sortDirection === 'asc' ? 
          valueA.localeCompare(valueB) : 
          valueB.localeCompare(valueA);
      } else if (this.sortField === 'createdAt') {

        const dateStrA = a.created_at || a.createdAt || DEFAULT_DATE;
        const dateStrB = b.created_at || b.createdAt || DEFAULT_DATE;
        
        if (!dateStrA || !dateStrB) {
          console.warn('Using default date for missing field:', { a, b });
        }

        const dateA = new Date(dateStrA).getTime();
        const dateB = new Date(dateStrB).getTime();
        
        if (isNaN(dateA) || isNaN(dateB)) {
          console.error('Invalid date format, using default:', { dateA, dateB });
          return 0;
        }

        return this.sortDirection === 'asc' ? 
          dateA - dateB : 
          dateB - dateA;
        } else if (this.sortField === 'expirationAt') {
          const dateStrA = a.expiration_date || a.expirationAt || DEFAULT_DATE;
          const dateStrB = b.expiration_date || b.expirationAt || DEFAULT_DATE;
    
          if (!dateStrA || !dateStrB) {
            console.warn('Missing date field:', { a, b });
            return 0;
          }
    
          const dateA = new Date(dateStrA).getTime();
          const dateB = new Date(dateStrB).getTime();
    
          return this.sortDirection === 'asc' ? 
            dateA - dateB : 
            dateB - dateA;
      } 
    });
    this.updatePagination();
  }

  toggleSort(field: 'code' | 'createdAt' | 'expirationAt'): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    
    this.sortGameRooms();
    this.updatePagination();
  }
}
