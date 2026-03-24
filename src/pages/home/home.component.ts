import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  tours = [
    { name: 'My first Route', from: 'FH Technikum', to: 'Mt. Everest', distance: '8300km', time: '60d' },
    { name: 'Alpine Hike', from: 'Innsbruck', to: 'Zugspitze', distance: '45km', time: '12h' },
    { name: 'City Tour', from: 'Vienna', to: 'Bratislava', distance: '65km', time: '2d' },
    { name: 'Danube Bike Trail', from: 'Passau', to: 'Vienna', distance: '320km', time: '5d' }
  ];
}