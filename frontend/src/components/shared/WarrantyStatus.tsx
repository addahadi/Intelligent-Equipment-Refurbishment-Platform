import { Shield } from "lucide-react";

interface WarrantyStatusProps {
  dateFinGarantie: string;
  showIcon?: boolean;
}

export function WarrantyStatus({ dateFinGarantie, showIcon = true }: WarrantyStatusProps) {
  const now = new Date();
  const expiryDate = new Date(dateFinGarantie);
  const isActive = expiryDate > now;

  const color = isActive ? "#1C7A62" : "#6E7A80";

  let label: string;

  if (isActive) {
    const day = String(expiryDate.getDate()).padStart(2, "0");
    const month = String(expiryDate.getMonth() + 1).padStart(2, "0");
    const year = expiryDate.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    const monthsRemaining =
      (expiryDate.getFullYear() - now.getFullYear()) * 12 +
      (expiryDate.getMonth() - now.getMonth());

    label = `Sous garantie jusqu'au ${formattedDate} — ${monthsRemaining} mois restants`;
  } else {
    label = "Garantie expirée";
  }

  return (
    <span style={{ color, display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
      {showIcon && <Shield size={16} color={color} />}
      <span>{label}</span>
    </span>
  );
}
