import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { MarCoinProvider, Detail } from "../../app/providers/MarCoinProvider";

@Component({
  selector: 'page-coindetail',
  templateUrl: 'coindetail.html',
})
export class Coindetail {
  coin_detail: Detail;

  constructor(public navCtrl: NavController, public params: NavParams, public marprov: MarCoinProvider, public loadingCtrl: LoadingController) {
    this.start();
  }

  async start() {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    loading.present();

    try {
      this.coin_detail = await this.marprov.getDetailByID(this.params.data.id);
    } catch (e) {
      loading.setContent("ERROR! (" + e + ")");
      return;
    }

    loading.dismiss();
  }
}
