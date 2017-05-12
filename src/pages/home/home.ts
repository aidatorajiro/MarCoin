import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { MarCoinProvider } from '../../app/providers/MarCoinProvider'
import { Coindetail } from '../coindetail/coindetail';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  coindetail = Coindetail;

  constructor(public navCtrl: NavController, public marprov: MarCoinProvider) {
    
  }

}
