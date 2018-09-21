import QRCode from 'qrcode';

(function() {
    QRCode.toCanvas(document.getElementById("qrCode"), "@Html.Raw(Model.AuthenticatorUri)");
})();
