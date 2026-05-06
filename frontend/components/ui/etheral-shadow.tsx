'use client';

import React, { useRef, useId, useEffect, CSSProperties } from 'react';
import { animate, useMotionValue, AnimationPlaybackControls } from 'framer-motion';

interface AnimationConfig { scale: number; speed: number; }
interface NoiseConfig { opacity: number; scale: number; }

interface ShadowOverlayProps {
    sizing?: 'fill' | 'stretch';
    color?: string;
    animation?: AnimationConfig;
    noise?: NoiseConfig;
    style?: CSSProperties;
    className?: string;
    children?: React.ReactNode; // Added children to wrap your UI
}

function mapRange(value: number, fromLow: number, fromHigh: number, toLow: number, toHigh: number): number {
    if (fromLow === fromHigh) return toLow;
    return toLow + ((value - fromLow) / (fromHigh - fromLow)) * (toHigh - toLow);
}

export function EtherealShadow({
    sizing = 'fill',
    color = 'rgba(0, 0, 0, 0.9)', // Default to deep black
    animation = { scale: 80, speed: 30 },
    noise = { opacity: 0.15, scale: 1 },
    style,
    className,
    children
}: ShadowOverlayProps) {
    const id = useId().replace(/:/g, "");
    const feColorMatrixRef = useRef<SVGFEColorMatrixElement>(null);
    const hueRotateMotionValue = useMotionValue(0);
    const hueRotateAnimation = useRef<AnimationPlaybackControls | null>(null);

    const displacementScale = mapRange(animation.scale, 1, 100, 20, 100);
    const animationDuration = mapRange(animation.speed, 1, 100, 1000, 50);

    useEffect(() => {
        hueRotateAnimation.current = animate(hueRotateMotionValue, 360, {
            duration: animationDuration / 10,
            repeat: Infinity,
            ease: "linear",
            onUpdate: (val) => feColorMatrixRef.current?.setAttribute("values", String(val))
        });
        return () => hueRotateAnimation.current?.stop();
    }, [animationDuration]);

    return (
        <div className={`relative w-full h-full min-h-screen overflow-hidden bg-black ${className}`} style={style}>
            {/* The Wavy Background Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none" style={{ filter: `url(#${id}) blur(8px)`, opacity: 0.7 }}>
                <svg className="absolute w-0 h-0">
                    <filter id={id}>
                        <feTurbulence type="turbulence" baseFrequency="0.005,0.01" numOctaves="2" seed="5" />
                        <feColorMatrix ref={feColorMatrixRef} type="hueRotate" values="0" />
                        <feDisplacementMap in="SourceGraphic" scale={displacementScale} />
                    </filter>
                </svg>
                <div 
                    className="w-full h-full"
                    style={{
                        backgroundColor: color,
                        maskImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')`, // Organic dark shape
                        maskSize: "cover",
                        maskPosition: "center",
                    }}
                />
            </div>

            {/* Grain/Noise Overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none opacity-20" 
                style={{ 
                    backgroundImage: `url("https://www.transparenttextures.com/patterns/stardust.png")`,
                    backgroundSize: `${noise.scale * 100}px` 
                }} 
            />

            {/* Your Content Layer */}
            <div className="relative z-20 w-full h-full">
                {children}
            </div>
        </div>
    );
}
