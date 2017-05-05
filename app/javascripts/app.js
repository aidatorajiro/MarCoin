// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";
import MarCoinController from "./controller"
import angular from 'angular';

var angApp = angular.module("MarCoinApp", []);
angApp.controller('MarCoinController', MarCoinController);