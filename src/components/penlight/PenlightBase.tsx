import React from 'react';
import { PenlightConfig } from '../../types';

interface PenlightBaseProps {
  config: PenlightConfig;
  className?: string;
  showInsidePhoto?: boolean;
}

const BASE_IMAGES: Record<string, string> = {
  classic: '/assets/hires/penlight_classic.png',
  heart: '/assets/hires/penlight_heart.png',
  star: '/assets/hires/penlight_star.png',
  diamond: '/assets/hires/penlight_diamond.png',
};

export const PenlightBase: React.FC<PenlightBaseProps> = ({
  config,
  className = 'w-full h-full',
  showInsidePhoto = true,
}) => {
  const {
    baseType,
    glowColor,
    glowIntensity,
    isLightOn,
    glowMode,
    insidePhotoUrl,
  } = config;

  const imageSrc = BASE_IMAGES[baseType] || BASE_IMAGES.classic;

  // Head mask cutoff percentage (stops exactly at the collar / neck)
  const headCutoff = baseType === 'star' ? '46%' : '42%';
  const headFade = baseType === 'star' ? '49%' : '45%';

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center select-none pointer-events-none transition-all duration-300 ${className}`}
    >
      {/* 1. Contour-Hugging Head Glow (Wraps ONLY around the heart/star/dome/diamond head shape) */}
      {isLightOn && (
        <div
          className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-300 ${
            glowMode === 'pulse' ? 'animate-pulse' : ''
          }`}
          style={{
            filter: `drop-shadow(0 0 ${6 * glowIntensity}px ${glowColor}) drop-shadow(0 0 ${
              18 * glowIntensity
            }px ${glowColor}) drop-shadow(0 0 ${34 * glowIntensity}px ${glowColor}cc) drop-shadow(0 0 ${
              54 * glowIntensity
            }px ${glowColor}66) drop-shadow(0 0 ${
              76 * glowIntensity
            }px ${glowColor}25)`,
          }}
        >
          {/* Masked Head Silhouette (Handle is 100% masked out, so handle receives ZERO glow) */}
          <div
            className="w-full h-full flex items-center justify-center pointer-events-none"
            style={{
              WebkitMaskImage: `linear-gradient(to bottom, black 0%, black ${headCutoff}, transparent ${headFade})`,
              maskImage: `linear-gradient(to bottom, black 0%, black ${headCutoff}, transparent ${headFade})`,
            }}
          >
            <img
              src={imageSrc}
              alt=""
              className="w-full h-full object-contain pointer-events-none"
            />
          </div>
        </div>
      )}

      {/* 2. Optional User Photo (only if explicitly uploaded by user) */}
      {showInsidePhoto && insidePhotoUrl && (
        <div
          className="absolute z-10 pointer-events-none transition-all duration-300 overflow-hidden flex items-center justify-center shadow-sm"
          style={{
            top: baseType === 'star' ? '26%' : '24%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '28%',
            height: '28%',
            borderRadius: baseType === 'heart' ? '35% 35% 45% 45%' : '50%',
            border: '2px solid rgba(255, 255, 255, 0.9)',
            boxShadow: `0 0 6px ${glowColor}88`,
          }}
        >
          <img
            src={insidePhotoUrl}
            alt="inside oshi avatar"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* 3. Main 3D Penlight (Pure crisp body with soft grounding shadow, handle does NOT glow) */}
      <img
        src={imageSrc}
        alt={`Penlight ${baseType}`}
        className="relative z-20 w-full h-full object-contain pointer-events-none drop-shadow-[0_12px_22px_rgba(0,0,0,0.1)]"
      />
    </div>
  );
};
