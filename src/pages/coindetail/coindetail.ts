import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { MarCoinProvider, Detail } from "../../app/providers/MarCoinProvider";

@Component({
  selector: 'page-coindetail',
  templateUrl: 'coindetail.html',
})
export class Coindetail {
  detail: Detail;
  coindetail: typeof Coindetail = Coindetail;

  constructor(public navCtrl: NavController, public params: NavParams, public marprov: MarCoinProvider, public loadingCtrl: LoadingController) {
    this.start();
  }

  async start() {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    loading.present();

    try {
      this.detail = await this.marprov.getDetailByID(this.params.data);
    } catch (e) {
      loading.setContent("ERROR! (" + e + ")");
      return;
    }

    loading.dismiss();
  }
}
