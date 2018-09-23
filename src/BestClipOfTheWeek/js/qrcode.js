import QRCode from 'qrcode';

(() => {
  QRCode.toCanvas(document.getElementById('qrCode'), '@Html.Raw(Model.AuthenticatorUri)');
})();
