/* global $ */
import QRCode from 'qrcode';

(() => {
  const element = document.getElementById('qrCode');
  QRCode.toCanvas(document.getElementById('qrCode'), $(element).data('url'));
})();
