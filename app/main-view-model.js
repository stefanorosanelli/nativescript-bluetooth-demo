var observable = require("data/observable");
var observableArray = require("data/observable-array");
var frameModule = require("ui/frame");
var bluetooth = require("nativescript-bluetooth");
var dialogs = require("ui/dialogs");

var DemoAppModel = (function (_super) {
  __extends(DemoAppModel, _super);
  function DemoAppModel() {
    _super.call(this);
    this.set('isLoading', false);
  }
  
  DemoAppModel.prototype.doIsBluetoothEnabled = function () {
    bluetooth.isBluetoothEnabled().then(function(enabled) {
      dialogs.alert({
        title: "Enabled?",
        message: enabled ? "Yes" : "No",
        okButtonText: "OK, thanks"
      });
    });
  };

  DemoAppModel.prototype.isLoading = false;

  var observablePeripheralArray = new observableArray.ObservableArray();

  DemoAppModel.prototype.peripherals = observablePeripheralArray;
  
  DemoAppModel.prototype.onPeripheralTap = function (args) {
    var index = args.index;
    console.log('!!&&&&***** Clicked item with index ' + index);
    var peri = DemoAppModel.prototype.peripherals.getItem(index);
    console.log("--- peri selected: " + peri.UUID);

    var navigationEntry = {
      moduleName: "services-page",
      context: {
        info: "something you want to pass to your page",
        foo: 'bar',
        peripheral: peri
      },
      animated: true
    };
    var topmost = frameModule.topmost();
    topmost.navigate(navigationEntry);
  };

  DemoAppModel.prototype.doStartScanning = function () {
      var that = this;
      console.log('start scan requested');
/*
      that.set('isLoading', true);
     
      // reset the array
      observablePeripheralArray.splice(0, observablePeripheralArray.length); 
      setTimeout(function() {
            console.log('timeout 5 sec...')
            that.set('isLoading', false);
        },
        5000);
*/

      bluetooth.isBluetoothEnabled().then(function (enabled) {
          if (!enabled) {
              console.log('bluetooth not enabled');
              that.set('scanStatus', '');
              dialogs.alert({
                  title: "Bluetooth not enabled",
                  //message: enabled ? "Yes" : "No",
                  okButtonText: "Close"
              });
          }
          // On Android 6 we need this permission to be able to scan for peripherals in the background.
          bluetooth.hasCoarseLocationPermission().then(
              function (granted) {
                  if (!granted) {
                      bluetooth.requestCoarseLocationPermission();
                  } else {
                      that.set('isLoading', true);
                      // reset the array
                      observablePeripheralArray.splice(0, observablePeripheralArray.length);
                      bluetooth.startScanning(
                          {
                              serviceUUIDs: [], // pass an empty array to scan for all services
                              seconds: 60, // passing in seconds makes the plugin stop scanning after <seconds> seconds
                              onDiscovered: function (peripheral) {
                                  var obsp = new observable.Observable(peripheral);
                                  observablePeripheralArray.push(obsp);
                              }
                          }
                      ).then(function () {
                          that.set('isLoading', false);
                          console.log('scan terminated');
                      },
                          function (err) {
                              that.set('isLoading', false);
                              console.err('scan stopped on error ' + err);
                              dialogs.alert({
                                  title: "Whoops!",
                                  message: err,
                                  okButtonText: "OK, got it"
                              });
                          });
                  }
              }
          );
      });

  };

  DemoAppModel.prototype.doStopScanning = function () {
    var that = this;
    console.log('stop scan requested');
/*
    that.set('isLoading', false);
*/
    bluetooth.stopScanning().then(function() {
        that.set('isLoading', false);
    },
    function (err) {
      dialogs.alert({
        title: "Whoops!",
        message: err,
        okButtonText: "OK, so be it"
      });
    });
  };
  
  DemoAppModel.prototype.doClearList = function () {
    observablePeripheralArray.splice(0, observablePeripheralArray.length); 
  }
  return DemoAppModel;

})(observable.Observable);
exports.DemoAppModel = DemoAppModel;
exports.mainViewModel = new DemoAppModel();
