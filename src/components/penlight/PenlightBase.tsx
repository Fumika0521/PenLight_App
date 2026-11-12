import React from 'react';
import { PenlightConfig } from '../../types';

interface PenlightBaseProps {
  config: PenlightConfig;
  className?: string;
  showInsidePhoto?: boolean;
  showGloss?: boolean;
}

// ドームヘッド部分の拡大率と変換基準点（首元 = コンテナ高さの45%）
export const HEAD_SCALE = 1.15;
const HEAD_ORIGIN = '50% 45%';

const BASE_IMAGES: Record<string, string> = {
  classic: '/assets/hires/penlight_empty.png',
  heart2: '/assets/hires/penlight_heart2_realistic.png',
  panel: '/assets/hires/penlight_panel_realistic.png',
  wand: '/assets/hires/penlight_wand.svg',
};

export const PenlightBase: React.FC<PenlightBaseProps> = ({
  config,
  className = 'w-full h-full',
  showInsidePhoto = true,
  showGloss = false,
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
  let headCutoff = '43%';
  let headFade = '46%';

  if (baseType === 'heart2') {
    headCutoff = '43%';
    headFade = '46%';
  } else if (baseType === 'panel') {
    headCutoff = '45%';
    headFade = '48%';
  } else if (baseType === 'wand') {
    headCutoff = '38%';
    headFade = '42%';
  }

  const headMask = `linear-gradient(to bottom, black 0%, black ${headCutoff}, transparent ${headFade})`;
  const headTransform = `scale(${HEAD_SCALE})`;

  return (
    <div
      className={`relative w-full h-full select-none pointer-events-none transition-all duration-300 ${className}`}
    >
      {/* 1. Main 3D Penlight — unscaled, handle only (inverse mask hides head to prevent seam) */}
      <img
        src={imageSrc}
        alt={`Penlight ${baseType}`}
        className="absolute inset-0 z-[5] w-full h-full object-contain pointer-events-none drop-shadow-[0_12px_22px_rgba(0,0,0,0.1)]"
        style={{
          WebkitMaskImage: `linear-gradient(to bottom, transparent 0%, transparent ${headCutoff}, black ${headFade})`,
          maskImage: `linear-gradient(to bottom, transparent 0%, transparent ${headCutoff}, black ${headFade})`,
        }}
      />

      {/* 2. Head Glow — scaled from neck origin */}
      {isLightOn && (
        <div
          className={`absolute inset-0 z-[10] pointer-events-none transition-all duration-300 ${
            glowMode === 'pulse' ? 'animate-pulse' : ''
          }`}
          style={{
            transform: headTransform,
            transformOrigin: HEAD_ORIGIN,
            filter: `drop-shadow(0 0 ${6 * glowIntensity}px ${glowColor}) drop-shadow(0 0 ${
              18 * glowIntensity
            }px ${glowColor}) drop-shadow(0 0 ${34 * glowIntensity}px ${glowColor}cc) drop-shadow(0 0 ${
              54 * glowIntensity
            }px ${glowColor}66) drop-shadow(0 0 ${
              76 * glowIntensity
            }px ${glowColor}25)`,
          }}
        >
          <div
            className="w-full h-full pointer-events-none"
            style={{
              WebkitMaskImage: headMask,
              maskImage: headMask,
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

      {/* 3. Scaled head image — covers unscaled head from layer 1, masked to head-only */}
      <div
        className="absolute inset-0 z-[20] pointer-events-none"
        style={{
          transform: headTransform,
          transformOrigin: HEAD_ORIGIN,
          WebkitMaskImage: headMask,
          maskImage: headMask,
        }}
      >
        <img
          src={imageSrc}
          alt=""
          className="w-full h-full object-contain pointer-events-none"
        />
      </div>

      {/* 4. Optional User Photo — scaled with head */}
      {showInsidePhoto && insidePhotoUrl && (
        <div
          className="absolute z-[25] pointer-events-none transition-all duration-300 overflow-hidden flex items-center justify-center shadow-sm"
          style={{
            top: baseType === 'wand' ? '20%' : '24%',
            left: '50%',
            transform: `translate(-50%, -50%) ${headTransform}`,
            transformOrigin: HEAD_ORIGIN,
            width: '28%',
            height: '28%',
            borderRadius: '50%',
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

      {/* 5. Optional Dome Gloss — scaled with head */}
      {showGloss && baseType === 'classic' && (
        <img
          src="/assets/hires/dome_gloss.png"
          alt="Glass Dome Gloss"
          className="absolute inset-0 z-[30] w-full h-full object-contain pointer-events-none select-none"
          style={{
            transform: headTransform,
            transformOrigin: HEAD_ORIGIN,
          }}
        />
      )}
    </div>
  );
};
