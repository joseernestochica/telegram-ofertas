import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MenuItem } from 'primeng/api';
import { SharedModule } from '../../shared/shared.module';
import { TelegramWebappService } from '@zakarliuka/ng-telegram-webapp';
import { environment } from '../../../environments/environment';

@Component( {
    selector: 'app-main-layout',
    standalone: true,
    imports: [ CommonModule, RouterOutlet, SharedModule ],
    templateUrl: './main-layout.component.html',
    styleUrls: [ './main-layout.component.scss' ]
} )
export class MainLayoutComponent implements OnInit {
    items: MenuItem[] | undefined;
    activeItem: MenuItem | undefined;

    constructor ( private telegramService: TelegramWebappService ) { }

    ngOnInit (): void {
        this.items = [
            {
                label: 'Swipe',
                icon: 'assets/images/menu/swipe.svg',
                routerLink: [ '/app/home' ]
            },
            {
                label: 'Search',
                icon: 'assets/images/menu/receipt-search.svg'
            },
            {
                label: 'Photos',
                icon: 'assets/images/menu/heart-with-arrow.svg'
            },
            {
                label: 'profile',
                icon: 'assets/images/menu/identification.svg',
                routerLink: [ '/app/profile' ]
            }
        ];

        this.activeItem = this.items[ 0 ];
    }
} 