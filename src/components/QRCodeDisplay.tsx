import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface QRCodeDisplayProps {
  value: string;
  guestName: string;
  tableName?: string;
}

const QRCodeDisplay = ({ value, guestName, tableName }: QRCodeDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: 300,
        margin: 2,
        color: {
          dark: "#70372c",
          light: "#ffffff",
        },
      }).catch(error => {
        console.error("Erreur lors de la génération du QR code:", error);
      });
    } else if (!value) {
      console.warn("La valeur du QR code est vide");
    }
  }, [value]);

  const downloadQR = () => {
    if (canvasRef.current) {
      const link = document.createElement("a");
      const fileName = tableName || guestName || "qr-code";
      link.download = `qr-${fileName.replace(/\s+/g, "-")}.png`;
      link.href = canvasRef.current.toDataURL("image/png");
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {tableName && (
        <div className="text-center font-semibold text-lg">
          {tableName}
        </div>
      )}
      <canvas ref={canvasRef} className="rounded-lg shadow-md" />
      <div className="text-xs text-gray-500 text-center break-all p-2 bg-gray-50 rounded">
        Code: {value}
      </div>
      <Button onClick={downloadQR} variant="outline" className="w-full">
        <Download className="h-4 w-4 mr-2" />
        Télécharger
      </Button>
    </div>
  );
};

export default QRCodeDisplay;
