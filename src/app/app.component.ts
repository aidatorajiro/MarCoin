import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TabsPage } from '../pages/tabs/tabs';

import { MarCoinProvider } from './providers/MarCoinProvider'

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = TabsPage;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, marprov:MarCoinProvider) {
    platform.ready().then(() => {
      marprov.start();
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}
