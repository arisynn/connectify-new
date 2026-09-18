/**
 * BACKUP: Animasi Connect & Matching Game Onet
 * 
 * File ini berisi potongan lengkap algoritma dan render animasi koneksi (SVG Path Layer):
 * 1. getStartSide: Menentukan orientasi ring pembuka dari titik awal/akhir
 * 2. generateRingPath: Membuat outline ring kotak dengan sudut melengkung yang membungkus tile
 * 3. generateRoundedPath: Membuat jalur garis lengkung (smooth rounded corner) antar titik belokan
 * 4. Animasi Ring A & Ring B: Menggunakan framer-motion / motion (stroke draw + pulse scale + fade out)
 * 5. Animasi Main Line: Garis koneksi SVG yang meluncur dari tile A ke tile B
 * 6. Tile Match Animation: Animasi tile bergetar, membesar sedikit lalu menghilang (scale/opacity)
 */

import React from 'react';
import { motion } from 'motion/react';

// ==========================================
// 1. HELPER ORIENTASI DAN GEOMETRI SVG PATH
// ==========================================

export const getStartSide = (dx: number, dy: number): string => {
    if (dx > 0) return 'right';
    if (dx < 0) return 'left';
    if (dy > 0) return 'bottom';
    if (dy < 0) return 'top';
    return 'top';
};

export const generateRingPath = (size: number, r: number, startSide: string): string => {
    const half = size / 2;
    const top = -half;
    const bottom = half;
    const left = -half;
    const right = half;
    let d = '';
    
    if (startSide === 'top') {
        d += `M 0 ${top} `;
        d += `L ${right - r} ${top} `;
        d += `Q ${right} ${top} ${right} ${top + r} `;
        d += `L ${right} ${bottom - r} `;
        d += `Q ${right} ${bottom} ${right - r} ${bottom} `;
        d += `L ${left + r} ${bottom} `;
        d += `Q ${left} ${bottom} ${left} ${bottom - r} `;
        d += `L ${left} ${top + r} `;
        d += `Q ${left} ${top} ${left + r} ${top} `;
        d += `Z`;
    } else if (startSide === 'right') {
        d += `M ${right} 0 `;
        d += `L ${right} ${bottom - r} `;
        d += `Q ${right} ${bottom} ${right - r} ${bottom} `;
        d += `L ${left + r} ${bottom} `;
        d += `Q ${left} ${bottom} ${left} ${bottom - r} `;
        d += `L ${left} ${top + r} `;
        d += `Q ${left} ${top} ${left + r} ${top} `;
        d += `L ${right - r} ${top} `;
        d += `Q ${right} ${top} ${right} ${top + r} `;
        d += `Z`;
    } else if (startSide === 'bottom') {
        d += `M 0 ${bottom} `;
        d += `L ${left + r} ${bottom} `;
        d += `Q ${left} ${bottom} ${left} ${bottom - r} `;
        d += `L ${left} ${top + r} `;
        d += `Q ${left} ${top} ${left + r} ${top} `;
        d += `L ${right - r} ${top} `;
        d += `Q ${right} ${top} ${right} ${top + r} `;
        d += `L ${right} ${bottom - r} `;
        d += `Q ${right} ${bottom} ${right - r} ${bottom} `;
        d += `Z`;
    } else if (startSide === 'left') {
        d += `M ${left} 0 `;
        d += `L ${left} ${top + r} `;
        d += `Q ${left} ${top} ${left + r} ${top} `;
        d += `L ${right - r} ${top} `;
        d += `Q ${right} ${top} ${right} ${top + r} `;
        d += `L ${right} ${bottom - r} `;
        d += `Q ${right} ${bottom} ${right - r} ${bottom} `;
        d += `L ${left + r} ${bottom} `;
        d += `Q ${left} ${bottom} ${left} ${bottom - r} `;
        d += `Z`;
    } else {
        d += `M 0 ${top} `;
        d += `L ${right - r} ${top} `;
        d += `Q ${right} ${top} ${right} ${top + r} `;
        d += `L ${right} ${bottom - r} `;
        d += `Q ${right} ${bottom} ${right - r} ${bottom} `;
        d += `L ${left + r} ${bottom} `;
        d += `Q ${left} ${bottom} ${left} ${bottom - r} `;
        d += `L ${left} ${top + r} `;
        d += `Q ${left} ${top} ${left + r} ${top} `;
        d += `Z`;
    }
    return d;
};

export const generateRoundedPath = (points: {x: number, y: number}[], radius: number): string => {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y} `;
    
    for (let i = 1; i < points.length - 1; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const next = points[i + 1];
        
        const dx1 = curr.x - prev.x;
        const dy1 = curr.y - prev.y;
        const len1 = Math.hypot(dx1, dy1);
        
        const dx2 = next.x - curr.x;
        const dy2 = next.y - curr.y;
        const len2 = Math.hypot(dx2, dy2);
        
        const r = Math.min(radius, len1 / 2, len2 / 2);
        
        const p1x = curr.x - (dx1 / len1) * r;
        const p1y = curr.y - (dy1 / len1) * r;
        
        const p2x = curr.x + (dx2 / len2) * r;
        const p2y = curr.y + (dy2 / len2) * r;
        
        d += `L ${p1x} ${p1y} Q ${curr.x} ${curr.y} ${p2x} ${p2y} `;
    }
    
    const last = points[points.length - 1];
    d += `L ${last.x} ${last.y}`;
    return d;
};

// ==========================================
// 2. KOMPONEN LAYER SVG ANIMASI KONEKSI
// ==========================================

interface ConnectAnimationLayerProps {
    activePaths: { id: number, path: { r: number, c: number }[] }[];
    boardSize: { w: number, h: number };
    tileSize: number;
    gap: number;
    rows: number;
    cols: number;
}

export const ConnectAnimationLayer: React.FC<ConnectAnimationLayerProps> = ({
    activePaths,
    boardSize,
    tileSize,
    gap,
    rows,
    cols
}) => {
    if (!activePaths || activePaths.length === 0 || boardSize.w <= 0) return null;

    const lineWidth = Math.max(4, Math.min(7, tileSize * 0.10));
    const ringOffset = 2;
    const ringSize = tileSize + 2 * ringOffset;
    const cutDist = ringSize / 2;
    const ringRadius = Math.max(8, 3 + ringOffset);
    const offset = gap + lineWidth / 2 + 5;
    const cornerRadius = Math.max(10, lineWidth * 1.5);

    const getPoint = (r: number, c: number) => {
        let x = 0;
        let y = 0;
        if (c === 0) x = -offset;
        else if (c === cols + 1) x = boardSize.w + offset;
        else x = (c - 1) * (tileSize + gap) + tileSize / 2;

        if (r === 0) y = -offset;
        else if (r === rows + 1) y = boardSize.h + offset;
        else y = (r - 1) * (tileSize + gap) + tileSize / 2;

        return { x, y };
    };

    return (
        <svg 
            className="absolute pointer-events-none z-50 overflow-visible"
            style={{ top: 0, left: 0, width: '100%', height: '100%' }}
        >
            {activePaths.map(pathObj => {
                const pts = pathObj.path.map(p => getPoint(p.r, p.c));
                let drawLine = true;
                let lineD = '';
                let startSideA = 'top';
                let startSideB = 'top';
                
                if (pts.length >= 2) {
                    const P0 = pts[0];
                    const P1 = pts[1];
                    const dxA = P1.x - P0.x;
                    const dyA = P1.y - P0.y;
                    startSideA = getStartSide(dxA, dyA);
                    const ux = Math.sign(dxA);
                    const uy = Math.sign(dyA);
                    const P0_new = { x: P0.x + cutDist * ux, y: P0.y + cutDist * uy };
                    
                    const Pn = pts[pts.length - 1];
                    const Pn_prev = pts[pts.length - 2];
                    const dxB = Pn_prev.x - Pn.x;
                    const dyB = Pn_prev.y - Pn.y;
                    startSideB = getStartSide(dxB, dyB);
                    const vx = Math.sign(dxB);
                    const vy = Math.sign(dyB);
                    const Pn_new = { x: Pn.x + cutDist * vx, y: Pn.y + cutDist * vy };
                    
                    if (pts.length === 2) {
                        const dist = Math.hypot(P1.x - P0.x, P1.y - P0.y);
                        if (dist <= 2 * cutDist + 1) {
                            drawLine = false;
                        }
                    }
                    
                    if (drawLine) {
                        const linePts = [...pts];
                        linePts[0] = P0_new;
                        linePts[linePts.length - 1] = Pn_new;
                        lineD = generateRoundedPath(linePts, cornerRadius);
                    }
                }
                
                const ringA_D = generateRingPath(ringSize, ringRadius, startSideA);
                const ringB_D = generateRingPath(ringSize, ringRadius, startSideB);
                const P0 = pts[0];
                const Pn = pts[pts.length - 1];

                return (
                    <g key={pathObj.id}>
                        {/* Ring A (Kotak berputar/mengelilingi tile asal) */}
                        <motion.g
                            style={{ x: P0.x, y: P0.y }}
                            initial={{ scale: 1, opacity: 1 }}
                            animate={{ scale: [1, 1, 1.08], opacity: [1, 1, 0] }}
                            transition={{ 
                                scale: { times: [0, 0.655, 1], duration: 0.58, ease: "easeInOut" },
                                opacity: { times: [0, 0.655, 1], duration: 0.58, ease: "linear" }
                            }}
                        >
                            <motion.path
                                d={ringA_D}
                                fill="none"
                                stroke="rgba(255,255,255,0.85)"
                                strokeWidth={lineWidth + 4}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.1, ease: "linear" }}
                            />
                            <motion.path
                                d={ringA_D}
                                fill="none"
                                stroke="#1E88E5"
                                strokeWidth={lineWidth}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.1, ease: "linear" }}
                            />
                        </motion.g>

                        {/* Ring B (Kotak berputar/mengelilingi tile tujuan) */}
                        <motion.g
                            style={{ x: Pn.x, y: Pn.y }}
                            initial={{ scale: 1, opacity: 1 }}
                            animate={{ scale: [1, 1, 1.08], opacity: [1, 1, 0] }}
                            transition={{ 
                                scale: { times: [0, 0.655, 1], duration: 0.58, ease: "easeInOut" },
                                opacity: { times: [0, 0.655, 1], duration: 0.58, ease: "linear" }
                            }}
                        >
                            <motion.path
                                d={ringB_D}
                                fill="none"
                                stroke="rgba(255,255,255,0.85)"
                                strokeWidth={lineWidth + 4}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ delay: 0.28, duration: 0.1, ease: "linear" }}
                            />
                            <motion.path
                                d={ringB_D}
                                fill="none"
                                stroke="#1E88E5"
                                strokeWidth={lineWidth}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ delay: 0.28, duration: 0.1, ease: "linear" }}
                            />
                        </motion.g>

                        {/* Main Connection Line (Garis koneksi biru bertepi putih) */}
                        {drawLine && (
                            <motion.g
                                initial={{ opacity: 1 }}
                                animate={{ opacity: 0 }}
                                transition={{ delay: 0.38, duration: 0.2, ease: "linear" }}
                            >
                                <motion.path 
                                    d={lineD}
                                    fill="none"
                                    stroke="rgba(255,255,255,0.85)"
                                    strokeWidth={lineWidth + 4}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ delay: 0.1, duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                                />
                                <motion.path 
                                    d={lineD}
                                    fill="none"
                                    stroke="#1E88E5"
                                    strokeWidth={lineWidth}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ delay: 0.1, duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                                />
                            </motion.g>
                        )}
                    </g>
                );
            })}
        </svg>
    );
};

// ==========================================
// 3. PARAMETER MOTION UNTUK TILE MATCHING
// ==========================================
export const tileMatchingMotionConfig = {
    animate: (isMatching: boolean, isHinted: boolean, isError: boolean) => ({
        scale: isMatching ? [1, 1.15, 0] : 1,
        opacity: isHinted ? [1, 0.6, 1] : isMatching ? [1, 1, 0] : 1,
        rotate: isMatching ? [0, -5, 5, 0] : 0,
        y: isMatching ? -8 : 0,
        x: isError ? [0, -12, 12, -10, 10, -6, 6, 0] : 0
    }),
    transition: (isMatching: boolean, isHinted: boolean, isError: boolean) => (
        isMatching ? { delay: 0.38, duration: 0.2, ease: "easeInOut" } :
        isError ? { duration: 0.4, ease: "linear" } :
        isHinted ? { repeat: Infinity, duration: 1 } : 
        { type: 'spring', stiffness: 400, damping: 25 }
    )
};
