import {Constants} from "utils/Constants";

Array.prototype.max = function() {
      return this.reduce((pv, cv) => Math.max(pv,cv), Number.NEGATIVE_INFINITY);
    }
    
Array.prototype.sum = function() {
      return this.reduce((pv, cv) => pv+cv, 0);
    }
    
Array.prototype.mean = function() {
      return this.sum()/this.length;
    }
    
Array.prototype.std = function(mean) {
      const vari = this.reduce((pv, cv) => pv+Math.pow(cv - mean,2), 0);
      return Math.sqrt(vari);
    }
    
Array.prototype.meanNoOutlier = function() {
      const mean = this.mean();
      const std = this.std(mean)*Constants.OUTLIER_STD_FACTOR;
      const arr2 = this.slice();
      for(let i=arr2.length-1;i>=0;i--) {
        if(Math.pow(arr2[i]-mean, 2)>std) {
          arr2.splice(i,1);
        }
      }
      return arr2.mean();
    }
    
Array.prototype.equal = function(arr) {
      if (this === arr) { return true; }
      if (this == null || arr == null) { return false; }
      if (this.length !== arr.length) { return false; }
    
      // If you don't care about the order of the elements inside
      // the array, you should sort both arrays here.
    
      for (let i = 0; i < arr.length; ++i) {
        if (this[i] !== arr[i]) { return false; }
      }
      return true;
    }
