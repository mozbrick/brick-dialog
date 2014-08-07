/* globals Platform */

(function () {

  var currentScript = document._currentScript || document.currentScript;

  var requestAnimationFrame = window.requestAnimationFrame ||
                              window.webkitRequestAnimationFrame ||
                              function (fn) { setTimeout(fn, 16); };

  var skipFrame = function(fn){
    requestAnimationFrame(function(){ requestAnimationFrame(fn); });
  };

  var BrickDialogElementPrototype = Object.create(HTMLElement.prototype);

  BrickDialogElementPrototype.attachedCallback = function() {

    var importDoc = currentScript.ownerDocument;
    var template = importDoc.querySelector('template');

    // fix styling for polyfill
    if (Platform.ShadowCSS) {
      var styles = template.content.querySelectorAll('style');
      for (var i = 0; i < styles.length; i++) {
        var style = styles[i];
        var cssText = Platform.ShadowCSS.shimStyle(style, 'brick-dialog');
        Platform.ShadowCSS.addCssToDocument(cssText);
        style.remove();
      }
    }

    // create shadowRoot and append template to it.
    var shadowRoot = this.createShadowRoot();
    shadowRoot.appendChild(template.content.cloneNode(true));

    
    this.addEventListener('click', this.close.bind(this));

  };

  BrickDialogElementPrototype.detachedCallback = function() {
    this.removeEventListener('click', this.close.bind(this));
  };



  BrickDialogElementPrototype.show = function() {
    var dialog = this;
    dialog.setAttribute('show','');

    skipFrame(function() {
      dialog.setAttribute('show', 'in');
    });
  };

  BrickDialogElementPrototype.close = function() {
    var dialog = this;
    dialog.setAttribute('show', 'out');

    var transitionendHandler = function() {
      dialog.removeAttribute('show')
      dialog.removeEventListener('animationend', transitionendHandler);
    };
    dialog.addEventListener('animationend', transitionendHandler);
  };

  // Register the element
  window.BrickDialogElement = document.registerElement('brick-dialog', {
    prototype: BrickDialogElementPrototype
  });

})();
