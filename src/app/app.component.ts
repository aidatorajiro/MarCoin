import { Component } from '@angular/core';
import { Platform, LoadingController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TabsPage } from '../pages/tabs/tabs';

import { MarCoinProvider } from './providers/MarCoinProvider'

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = TabsPage;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, marprov:MarCoinProvider, loadingCtrl: LoadingController) {
    platform.ready().then(async () => {
      statusBar.styleDefault();
      splashScreen.hide();

      let loading = loadingCtrl.create({
        content: 'Please wait...'
      });

      loading.present();

      try {
        await marprov.start();
      } catch (e) {
        loading.setContent("ERROR! (" + e + ")");
        return;
      }

      loading.dismiss();
    });
  }
}
