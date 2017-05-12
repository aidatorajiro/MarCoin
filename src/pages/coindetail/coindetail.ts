import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { MarCoinProvider } from "../../app/providers/MarCoinProvider";

@Component({
  selector: 'page-coindetail',
  templateUrl: 'coindetail.html',
})
export class Coindetail {

  constructor(public navCtrl: NavController, public params: NavParams) {
  }
}
