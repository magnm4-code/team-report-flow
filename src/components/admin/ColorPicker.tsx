import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ColorPickerProps {
  label: string;
  value: string; // HSL format: "204 66% 21%"
  onChange: (value: string) => void;
}

// Convert HSL string to hex for the color picker
const hslToHex = (hsl: string): string => {
  const parts = hsl.match(/(\d+\.?\d*)/g);
  if (!parts || parts.length < 3) return '#000000';
  
  const h = parseFloat(parts[0]) / 360;
  const s = parseFloat(parts[1]) / 100;
  const l = parseFloat(parts[2]) / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Convert hex to HSL string
const hexToHsl = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0 0% 0%';

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

const ColorPicker = ({ label, value, onChange }: ColorPickerProps) => {
  const [hexValue, setHexValue] = useState(() => hslToHex(value));

  useEffect(() => {
    setHexValue(hslToHex(value));
  }, [value]);

  const handleChange = (hex: string) => {
    setHexValue(hex);
    onChange(hexToHsl(hex));
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={hexValue}
          onChange={(e) => handleChange(e.target.value)}
          className="w-12 h-10 rounded cursor-pointer border border-border"
        />
        <Input
          value={hexValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 font-mono text-sm"
          dir="ltr"
        />
        <div 
          className="w-10 h-10 rounded border border-border"
          style={{ backgroundColor: hexValue }}
        />
      </div>
    </div>
  );
};

export default ColorPicker;
