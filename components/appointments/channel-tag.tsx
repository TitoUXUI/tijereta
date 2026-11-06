import { Camera, Globe, MessageCircle, Phone, Footprints, type LucideIcon } from "lucide-react";
import type { Channel } from "@/types";

const CHANNEL: Record<Channel, { label: string; icon: LucideIcon }> = {
  link: { label: "Link", icon: Globe },
  whatsapp: { label: "WhatsApp", icon: MessageCircle },
  instagram: { label: "Instagram", icon: Camera },
  phone: { label: "Teléfono", icon: Phone },
  walk_in: { label: "En el local", icon: Footprints },
};

export function ChannelTag({ channel }: { channel: Channel }) {
  const { label, icon: Icon } = CHANNEL[channel];
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Icon className="size-3.5" aria-hidden />
      {label}
    </span>
  );
}
